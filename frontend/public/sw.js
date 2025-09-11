/* eslint-disable no-restricted-globals */
// Service Worker Disabled - Cleanup and Unregister
console.log('Service Worker: Disabled - cleaning up and unregistering...');

// Clean up all existing caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Cleaning up all caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: All caches cleared');
      // Unregister this service worker
      return self.registration.unregister();
    }).then(() => {
      console.log('Service Worker: Unregistered successfully');
    })
  );
});

// Install event - immediately skip waiting to activate cleanup
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing cleanup worker...');
  event.waitUntil(self.skipWaiting());
});

// Don't intercept any fetch requests
self.addEventListener('fetch', (event) => {
  // Let all requests go through normally
  return;
});
