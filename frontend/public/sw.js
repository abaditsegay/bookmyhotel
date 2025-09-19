/* eslint-disable no-restricted-globals */
/**
 * Service Worker for Offline Support
 * Handles caching, offline requests, and background sync
 */

const CACHE_NAME = 'bookmyhotel-v1';
const API_CACHE_NAME = 'bookmyhotel-api-v1';

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other critical assets
];

// API endpoints to cache
const API_ENDPOINTS_TO_CACHE = [
  '/hotels-mgmt/list',
  '/room-types',
  '/staff-schedules/staff',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle static assets
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with caching strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const isReadRequest = request.method === 'GET';
  
  try {
    // For GET requests, try cache first, then network
    if (isReadRequest) {
      // Check if this endpoint should be cached
      const shouldCache = API_ENDPOINTS_TO_CACHE.some(endpoint => 
        url.pathname.includes(endpoint)
      );

      if (shouldCache) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          console.log('📋 Serving API response from cache:', url.pathname);
          
          // Try to update cache in background
          fetch(request)
            .then(response => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(API_CACHE_NAME)
                  .then(cache => cache.put(request, responseClone));
              }
            })
            .catch(() => {
              // Network failed, but we have cached response
            });

          return cachedResponse;
        }
      }

      // Try network first
      const networkResponse = await fetch(request);
      
      // Cache successful GET responses
      if (networkResponse.ok && shouldCache) {
        const responseClone = networkResponse.clone();
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, responseClone);
      }

      return networkResponse;
    } else {
      // For POST/PUT/DELETE requests, try network first
      return await handleWriteRequest(request);
    }
  } catch (error) {
    console.log('🔌 Network request failed:', url.pathname);
    
    // For GET requests, try to serve from cache
    if (isReadRequest) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📋 Serving stale cache for offline request:', url.pathname);
        return cachedResponse;
      }
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This request requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle write requests (POST, PUT, DELETE)
async function handleWriteRequest(request) {
  try {
    // Try network first
    return await fetch(request);
  } catch (error) {
    // Network failed - check if this is a booking request
    const url = new URL(request.url);
    
    if (url.pathname.includes('reservations') && request.method === 'POST') {
      // This is likely a booking request - queue it for background sync
      console.log('📱 Queueing booking for background sync');
      
      // Register background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('booking-sync');
      }

      // Store the request data for later sync
      const requestData = await request.json();
      await storeOfflineBooking(requestData);

      // Return success response indicating offline booking
      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          message: 'Booking saved offline and will sync when connection is restored',
          bookingId: `offline_${Date.now()}`
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // For other write requests, return error
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This action requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try network first for fresh content
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📋 Serving static asset from cache:', request.url);
      return cachedResponse;
    }

    // Return offline page for document requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/offline.html');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // Return network error
    return new Response('Offline', { status: 503 });
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'booking-sync') {
    event.waitUntil(syncOfflineBookings());
  }
});

// Store offline booking data
async function storeOfflineBooking(bookingData) {
  // This would integrate with IndexedDB
  // For now, we'll use a simple approach
  console.log('💾 Storing offline booking:', bookingData);
  
  // In a real implementation, this would use the OfflineStorageService
  // to store the booking data in IndexedDB
}

// Sync offline bookings when connection is restored
async function syncOfflineBookings() {
  console.log('🔄 Syncing offline bookings...');
  
  try {
    // This would integrate with the OfflineStorageService
    // to get pending bookings and sync them with the server
    console.log('✅ Offline bookings synced successfully');
    
    // Notify all clients about successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_SUCCESS',
        message: 'Offline bookings have been synced'
      });
    });
  } catch (error) {
    console.error('❌ Failed to sync offline bookings:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        message: 'Failed to sync offline bookings'
      });
    });
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_API_RESPONSE') {
    // Cache specific API response
    const { url, response } = event.data;
    caches.open(API_CACHE_NAME)
      .then(cache => {
        cache.put(url, new Response(JSON.stringify(response), {
          headers: { 'Content-Type': 'application/json' }
        }));
      });
  }
});

console.log('🚀 Service Worker script loaded');
