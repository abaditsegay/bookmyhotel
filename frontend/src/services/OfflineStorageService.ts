/**
 * Offline Storage Service using IndexedDB for persistent storage for offline walk-in bookings and related data
 */

export interface CachedRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description: string;
  hotelId: number;
  isAvailable: boolean;
  lastUpdated: string;
  // Enhanced offline tracking
  occupiedBy?: string; // Booking ID if occupied offline
  occupiedFrom?: string; // Check-in date for offline booking
  occupiedTo?: string; // Check-out date for offline booking
  offlineStatus?: 'available' | 'occupied' | 'reserved';
}

export interface CachedBooking {
  id: string;
  hotelId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: number;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  pricePerNight: number;
  paymentMethod: 'CASH' | 'CARD' | 'PENDING';
  specialRequests?: string;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  source: 'ONLINE' | 'OFFLINE';
  syncStatus?: 'SYNCED' | 'PENDING_SYNC' | 'SYNC_FAILED';
  createdAt: string;
  createdBy: number;
}

export interface StaffSession {
  id: string;
  userId: number;
  username: string;
  email: string;
  role: string;
  roles: string[];
  hotelId?: number;
  hotelName?: string;
  tenantId?: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  lastActivity: string;
  isActive: boolean;
  passwordHash?: string; // Simple hash for offline password validation
}

interface OfflineBooking {
  id: string;
  hotelId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  roomId?: number;
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalAmount: number;
  pricePerNight: number;
  paymentMethod: 'CASH' | 'CARD' | 'PENDING';
  specialRequests?: string;
  status: 'PENDING_SYNC' | 'SYNC_FAILED' | 'SYNCED';
  createdAt: string;
  createdBy: number;
  syncAttempts: number;
  errorMessage?: string;
}

interface RoomAvailability {
  roomType: string;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  lastUpdated: string;
}

interface GuestInfo {
  email: string;
  name: string;
  phone: string;
  lastStay?: string;
  preferences?: string;
}



export class OfflineStorageService {
  private dbName = 'BookMyHotelOffline';
  private version = 3; // Increment version to force schema recreation with proper room ID support
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  // Method to force database recreation (for debugging/migration issues)
  async recreateDatabase(): Promise<void> {
    console.log('🔄 Forcing database recreation...');
    
    // Close current database connection
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    
    this.isInitialized = false;
    this.initPromise = null;
    
    // Delete the existing database
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);
      
      deleteRequest.onsuccess = () => {
        console.log('✅ Database deleted successfully');
        // Reinitialize
        this.init().then(resolve).catch(reject);
      };
      
      deleteRequest.onerror = () => {
        console.error('❌ Failed to delete database:', deleteRequest.error);
        reject(deleteRequest.error);
      };
      
      deleteRequest.onblocked = () => {
        console.warn('⚠️ Database deletion blocked. Close all tabs and try again.');
        reject(new Error('Database deletion blocked'));
      };
    });
  }

  async init(): Promise<void> {
    // Return existing promise if initialization is in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized && this.db) {
      return Promise.resolve();
    }

    // Create new initialization promise
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        this.initPromise = null; // Reset on error
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        
        // Add error handler for the database connection
        this.db.onerror = (event) => {
          console.error('IndexedDB connection error:', event);
        };
        
        // Verify that all required object stores exist
        const requiredStores = ['offlineBookings', 'roomAvailability', 'guestInfo', 'cachedRooms', 'appData', 'cachedBookings', 'staffSessions'];
        const missingStores = requiredStores.filter(store => !this.db!.objectStoreNames.contains(store));
        
        if (missingStores.length > 0) {
          console.error('❌ Missing object stores:', missingStores);
          console.log('🔄 Attempting database recreation...');
          this.db.close();
          this.db = null;
          this.isInitialized = false;
          this.initPromise = null;
          
          // Force recreation
          this.recreateDatabase().then(resolve).catch(reject);
          return;
        }
        
        this.isInitialized = true;
        console.log('✅ IndexedDB initialized successfully with all required stores');
        console.log('📋 Available object stores:', Array.from(this.db.objectStoreNames));
        
        // Small delay to ensure connection is fully established
        setTimeout(() => {
          this.initPromise = null; // Reset after success
          resolve();
        }, 10);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion || 2;

        console.log(`🔄 Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`);
        
        // Create object stores for version 1
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('offlineBookings')) {
            const bookingStore = db.createObjectStore('offlineBookings', { keyPath: 'id' });
            bookingStore.createIndex('hotelId', 'hotelId', { unique: false });
            bookingStore.createIndex('status', 'status', { unique: false });
            bookingStore.createIndex('createdAt', 'createdAt', { unique: false });
          }

          if (!db.objectStoreNames.contains('roomAvailability')) {
            const roomStore = db.createObjectStore('roomAvailability', { keyPath: 'roomType' });
            roomStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          }

          if (!db.objectStoreNames.contains('guestInfo')) {
            const guestStore = db.createObjectStore('guestInfo', { keyPath: 'email' });
            guestStore.createIndex('name', 'name', { unique: false });
            guestStore.createIndex('lastStay', 'lastStay', { unique: false });
          }

          if (!db.objectStoreNames.contains('cachedRooms')) {
            const roomStore = db.createObjectStore('cachedRooms', { keyPath: 'id' });
            roomStore.createIndex('hotelId', 'hotelId', { unique: false });
            roomStore.createIndex('roomType', 'roomType', { unique: false });
            roomStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
            roomStore.createIndex('roomNumber', 'roomNumber', { unique: false });
          }

          if (!db.objectStoreNames.contains('appData')) {
            db.createObjectStore('appData', { keyPath: 'key' });
          }
        }

        // Add new stores for version 2 (enhanced offline support)
        if (oldVersion < 2) {
          // Enhanced bookings store for preloaded booking data
          if (!db.objectStoreNames.contains('cachedBookings')) {
            const cachedBookingStore = db.createObjectStore('cachedBookings', { keyPath: 'id' });
            cachedBookingStore.createIndex('hotelId', 'hotelId', { unique: false });
            cachedBookingStore.createIndex('roomId', 'roomId', { unique: false });
            cachedBookingStore.createIndex('checkInDate', 'checkInDate', { unique: false });
            cachedBookingStore.createIndex('checkOutDate', 'checkOutDate', { unique: false });
            cachedBookingStore.createIndex('status', 'status', { unique: false });
            cachedBookingStore.createIndex('source', 'source', { unique: false });
          }

          // Staff sessions for offline authentication
          if (!db.objectStoreNames.contains('staffSessions')) {
            const staffStore = db.createObjectStore('staffSessions', { keyPath: 'id' });
            staffStore.createIndex('userId', 'userId', { unique: false });
            staffStore.createIndex('hotelId', 'hotelId', { unique: false });
            staffStore.createIndex('isActive', 'isActive', { unique: false });
            staffStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          }

          // Update existing cachedRooms store with new indexes if needed
          if (db.objectStoreNames.contains('cachedRooms')) {
            const roomStore = transaction.objectStore('cachedRooms');
            
            if (!roomStore.indexNames.contains('isAvailable')) {
              roomStore.createIndex('isAvailable', 'isAvailable', { unique: false });
            }
            if (!roomStore.indexNames.contains('offlineStatus')) {
              roomStore.createIndex('offlineStatus', 'offlineStatus', { unique: false });
            }
            if (!roomStore.indexNames.contains('occupiedBy')) {
              roomStore.createIndex('occupiedBy', 'occupiedBy', { unique: false });
            }
          }
        }

        // Add improvements for version 3 (room ID caching fixes)
        if (oldVersion < 3) {
          console.log('⬆️ Upgrading database to version 3 - ensuring proper room ID support');
          
          // Clear and recreate cachedRooms to ensure proper room ID indexing
          if (db.objectStoreNames.contains('cachedRooms')) {
            console.log('🔄 Recreating cachedRooms store for proper room ID support');
            
            // Note: We can't delete and recreate stores in the same transaction
            // But we can clear the data to ensure fresh room caching
            const roomStore = transaction.objectStore('cachedRooms');
            roomStore.clear();
            console.log('✅ Cleared existing room cache - will be repopulated on next login');
          }
        }

        console.log('✅ IndexedDB object stores created/verified for enhanced offline support');
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    
    try {
      // Check if the object store exists before creating transaction
      if (!this.db.objectStoreNames.contains(storeName)) {
        console.error(`Object store '${storeName}' not found. Available stores:`, Array.from(this.db.objectStoreNames));
        throw new Error(`Object store '${storeName}' not found. Database schema may need to be updated.`);
      }
      
      const transaction = this.db.transaction([storeName], mode);
      return transaction.objectStore(storeName);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw new Error('Database transaction failed. Database may not be ready.');
    }
  }

  // Offline Booking Methods
  async saveOfflineBooking(booking: Omit<OfflineBooking, 'id' | 'createdAt' | 'syncAttempts'>): Promise<string> {
    const bookingId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const completeBooking: OfflineBooking = {
      ...booking,
      id: bookingId,
      createdAt: new Date().toISOString(),
      syncAttempts: 0
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('offlineBookings', 'readwrite');
      const request = store.add(completeBooking);

      request.onsuccess = () => {
        console.log('💾 Offline booking saved:', bookingId);
        resolve(bookingId);
      };

      request.onerror = () => {
        console.error('Failed to save offline booking:', request.error);
        reject(request.error);
      };
    });
  }

  async getOfflineBookings(hotelId?: number): Promise<OfflineBooking[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('offlineBookings');
      const request = hotelId 
        ? store.index('hotelId').getAll(hotelId)
        : store.getAll();

      request.onsuccess = () => {
        const bookings = request.result || [];
        resolve(bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      };

      request.onerror = () => {
        console.error('Failed to get offline bookings:', request.error);
        reject(request.error);
      };
    });
  }

  async getPendingSyncBookings(): Promise<OfflineBooking[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('offlineBookings');
      const request = store.index('status').getAll('PENDING_SYNC');

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get pending sync bookings:', request.error);
        reject(request.error);
      };
    });
  }

  async getFailedSyncBookings(): Promise<OfflineBooking[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('offlineBookings');
      const request = store.index('status').getAll('SYNC_FAILED');

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get failed sync bookings:', request.error);
        reject(request.error);
      };
    });
  }

  async updateBookingStatus(bookingId: string, status: OfflineBooking['status'], errorMessage?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('offlineBookings', 'readwrite');
      const getRequest = store.get(bookingId);

      getRequest.onsuccess = () => {
        const booking = getRequest.result;
        if (booking) {
          booking.status = status;
          booking.syncAttempts += 1;
          if (errorMessage) {
            booking.errorMessage = errorMessage;
          }

          const updateRequest = store.put(booking);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Booking not found'));
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteOfflineBooking(bookingId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('offlineBookings', 'readwrite');
      const request = store.delete(bookingId);

      request.onsuccess = () => {
        console.log('🗑️ Offline booking deleted:', bookingId);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete offline booking:', request.error);
        reject(request.error);
      };
    });
  }

  // Room Availability Methods
  async updateRoomAvailability(roomType: string, availability: Omit<RoomAvailability, 'roomType'>): Promise<void> {
    const roomData: RoomAvailability = {
      roomType,
      ...availability,
      lastUpdated: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('roomAvailability', 'readwrite');
      const request = store.put(roomData);

      request.onsuccess = () => {
        console.log('🏨 Room availability updated:', roomType);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to update room availability:', request.error);
        reject(request.error);
      };
    });
  }

  async getRoomAvailability(): Promise<RoomAvailability[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('roomAvailability');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get room availability:', request.error);
        reject(request.error);
      };
    });
  }

  // Guest Information Methods
  async saveGuestInfo(guest: GuestInfo): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('guestInfo', 'readwrite');
      const request = store.put(guest);

      request.onsuccess = () => {
        console.log('👤 Guest info saved:', guest.email);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save guest info:', request.error);
        reject(request.error);
      };
    });
  }

  async searchGuests(query: string): Promise<GuestInfo[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('guestInfo');
      const request = store.getAll();

      request.onsuccess = () => {
        const guests = request.result || [];
        const filtered = guests.filter(guest => 
          guest.name.toLowerCase().includes(query.toLowerCase()) ||
          guest.email.toLowerCase().includes(query.toLowerCase()) ||
          guest.phone.includes(query)
        );
        resolve(filtered);
      };

      request.onerror = () => {
        console.error('Failed to search guests:', request.error);
        reject(request.error);
      };
    });
  }

  async cleanupOrphanedGuests(): Promise<number> {
    try {
      // Get all guest info and all bookings
      const [guests, bookings] = await Promise.all([
        this.getAllGuests(),
        this.getOfflineBookings()
      ]);

      // Find guest emails that are still referenced by existing bookings
      const referencedEmails = new Set(bookings.map(booking => booking.guestEmail));
      
      // Find orphaned guests (not referenced by any booking)
      const orphanedGuests = guests.filter(guest => !referencedEmails.has(guest.email));
      
      // Delete orphaned guests
      let deletedCount = 0;
      for (const guest of orphanedGuests) {
        await this.deleteGuestInfo(guest.email);
        deletedCount++;
      }

      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} orphaned guest records`);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup orphaned guests:', error);
      return 0;
    }
  }

  private async getAllGuests(): Promise<GuestInfo[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('guestInfo');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteGuestInfo(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('guestInfo', 'readwrite');
      const request = store.delete(email);

      request.onsuccess = () => {
        console.log('🗑️ Guest info deleted:', email);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete guest info:', request.error);
        reject(request.error);
      };
    });
  }

  // App Data Methods (for caching API responses)
  async setAppData(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('appData', 'readwrite');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAppData(key: string, maxAge?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('appData');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        if (maxAge && Date.now() - result.timestamp > maxAge) {
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  isReady(): boolean {
    return this.isInitialized && this.db !== null && !this.initPromise;
  }

  // Debug method to inspect database contents
  async debugDatabase(): Promise<void> {
    try {
      console.log('🔍 DEBUG: Database state check');
      console.log('🔍 DEBUG: Database initialized:', this.isInitialized);
      console.log('🔍 DEBUG: Database ready:', this.isReady());
      
      if (this.isReady()) {
        const allBookings = await this.getOfflineBookings();
        console.log('🔍 DEBUG: Total bookings in DB:', allBookings.length);
        
        const pendingBookings = await this.getPendingSyncBookings();
        console.log('🔍 DEBUG: Pending sync bookings:', pendingBookings.length);
        
        const stats = await this.getStorageStats();
        console.log('🔍 DEBUG: Storage stats:', stats);
        
        // Log individual booking details
        allBookings.forEach((booking, index) => {
          console.log(`🔍 DEBUG: Booking ${index + 1}:`, {
            id: booking.id,
            status: booking.status,
            guestName: booking.guestName,
            createdAt: booking.createdAt
          });
        });
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error inspecting database:', error);
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const storeNames = ['offlineBookings', 'roomAvailability', 'guestInfo', 'appData'];
    
    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    console.log('🧹 All offline data cleared');
  }

  async getStorageStats(): Promise<{
    bookings: number;
    rooms: number;
    guests: number;
    pendingSync: number;
    failedSync: number;
  }> {
    try {
      // Ensure database is initialized
      if (!this.isReady()) {
        await this.init();
      }

      const [bookings, rooms, guests, pendingSync, failedSync] = await Promise.all([
        this.getOfflineBookings(),
        this.getRoomAvailability(),
        new Promise<GuestInfo[]>((resolve, reject) => {
          const store = this.getStore('guestInfo');
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        }),
        this.getPendingSyncBookings(),
        this.getFailedSyncBookings()
      ]);

      return {
        bookings: bookings.length,
        rooms: rooms.length,
        guests: guests.length,
        pendingSync: pendingSync.length,
        failedSync: failedSync.length
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      // Return default stats if database access fails
      return {
        bookings: 0,
        rooms: 0,
        guests: 0,
        pendingSync: 0,
        failedSync: 0
      };
    }
  }

  /**
   * Complete database reset - deletes the entire IndexedDB database
   * WARNING: This will remove ALL offline data permanently
   */
  async resetDatabase(): Promise<void> {
    try {
      console.log('🗑️  Deleting entire IndexedDB database...');
      
      // Close current connection
      if (this.db) {
        this.db.close();
        this.db = null;
        this.isInitialized = false;
        this.initPromise = null;
      }

      // Delete the entire database
      await new Promise<void>((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(this.dbName);
        
        deleteRequest.onsuccess = () => {
          console.log('✅ IndexedDB database deleted successfully');
          resolve();
        };
        
        deleteRequest.onerror = () => {
          console.error('❌ Failed to delete IndexedDB database:', deleteRequest.error);
          reject(deleteRequest.error);
        };
        
        deleteRequest.onblocked = () => {
          console.warn('⚠️  Database deletion blocked - close all app tabs and try again');
          reject(new Error('Database deletion blocked'));
        };
      });
      
      console.log('🧹 Database reset complete - will reinitialize on next use');
    } catch (error) {
      console.error('Failed to reset database:', error);
      throw error;
    }
  }

  // Room Management Methods
  async saveRooms(rooms: CachedRoom[]): Promise<void> {
    await this.init();
    console.log(`💾 OfflineStorageService.saveRooms: Starting to save ${rooms.length} rooms`);
    console.log(`💾 OfflineStorageService.saveRooms: Sample room:`, rooms[0]);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRooms'], 'readwrite');
      const store = transaction.objectStore('cachedRooms');
      
      transaction.oncomplete = () => {
        console.log(`✅ OfflineStorageService.saveRooms: Transaction completed successfully`);
        resolve();
      };
      transaction.onerror = () => {
        console.error(`❌ OfflineStorageService.saveRooms: Transaction failed:`, transaction.error);
        reject(transaction.error);
      };
      
      // Clear existing rooms for this hotel and add new ones
      const hotelId = rooms[0]?.hotelId;
      console.log(`🧹 OfflineStorageService.saveRooms: Clearing existing rooms for hotel ${hotelId}`);
      
      if (hotelId) {
        const index = store.index('hotelId');
        const range = IDBKeyRange.only(hotelId);
        const clearRequest = index.openCursor(range);
        
        clearRequest.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            console.log(`➕ OfflineStorageService.saveRooms: Adding ${rooms.length} new rooms`);
            // Add new rooms
            rooms.forEach((room, index) => {
              const roomToAdd = {
                ...room,
                lastUpdated: new Date().toISOString()
              };
              const addRequest = store.add(roomToAdd);
              
              addRequest.onsuccess = () => {
                if (index === 0) {
                  console.log(`✅ OfflineStorageService.saveRooms: First room added successfully:`, roomToAdd);
                }
              };
              
              addRequest.onerror = () => {
                console.error(`❌ OfflineStorageService.saveRooms: Failed to add room ${index}:`, addRequest.error);
              };
            });
          }
        };
      } else {
        console.log(`➕ OfflineStorageService.saveRooms: No hotel ID found, adding ${rooms.length} rooms without clearing`);
        rooms.forEach((room, index) => {
          const roomToAdd = {
            ...room,
            lastUpdated: new Date().toISOString()
          };
          const addRequest = store.add(roomToAdd);
          
          addRequest.onsuccess = () => {
            if (index === 0) {
              console.log(`✅ OfflineStorageService.saveRooms: First room added successfully:`, roomToAdd);
            }
          };
          
          addRequest.onerror = () => {
            console.error(`❌ OfflineStorageService.saveRooms: Failed to add room ${index}:`, addRequest.error);
          };
        });
      }
    });
  }

  async getCachedRooms(hotelId?: number): Promise<CachedRoom[]> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const store = this.getStore('cachedRooms');
      
      if (hotelId) {
        const index = store.index('hotelId');
        const request = index.getAll(hotelId);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      } else {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      }
    });
  }

  async getRoomsCacheAge(hotelId: number): Promise<number> {
    const rooms = await this.getCachedRooms(hotelId);
    if (rooms.length === 0) return Infinity;
    
    const oldestRoom = rooms.reduce((oldest, room) => {
      const roomAge = Date.now() - new Date(room.lastUpdated).getTime();
      return roomAge > oldest ? roomAge : oldest;
    }, 0);
    
    return oldestRoom;
  }

  async clearCachedRooms(hotelId?: number): Promise<void> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRooms'], 'readwrite');
      const store = transaction.objectStore('cachedRooms');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      
      if (hotelId) {
        const index = store.index('hotelId');
        const range = IDBKeyRange.only(hotelId);
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } else {
        store.clear();
      }
    });
  }

  // ===== ENHANCED ROOM AVAILABILITY MANAGEMENT =====

  /**
   * Mark room as occupied by offline booking
   */
  async markRoomOccupied(roomId: number, bookingId: string, checkInDate: string, checkOutDate: string): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRooms'], 'readwrite');
      const store = transaction.objectStore('cachedRooms');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      const getRequest = store.get(roomId);
      getRequest.onsuccess = () => {
        const room = getRequest.result as CachedRoom;
        if (room) {
          const updatedRoom: CachedRoom = {
            ...room,
            isAvailable: false,
            offlineStatus: 'occupied',
            occupiedBy: bookingId,
            occupiedFrom: checkInDate,
            occupiedTo: checkOutDate,
            lastUpdated: new Date().toISOString()
          };
          store.put(updatedRoom);
        }
      };
    });
  }

  /**
   * Mark room as available (remove offline occupation)
   */
  async markRoomAvailable(roomId: number): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRooms'], 'readwrite');
      const store = transaction.objectStore('cachedRooms');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      const getRequest = store.get(roomId);
      getRequest.onsuccess = () => {
        const room = getRequest.result as CachedRoom;
        if (room) {
          const updatedRoom: CachedRoom = {
            ...room,
            isAvailable: true,
            offlineStatus: 'available',
            occupiedBy: undefined,
            occupiedFrom: undefined,
            occupiedTo: undefined,
            lastUpdated: new Date().toISOString()
          };
          store.put(updatedRoom);
        }
      };
    });
  }

  /**
   * Get available rooms for date range considering offline bookings
   */
  async getAvailableRoomsForDateRange(
    hotelId: number, 
    checkInDate: string, 
    checkOutDate: string, 
    guestCount: number
  ): Promise<CachedRoom[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedRooms', 'cachedBookings'], 'readonly');
      const roomStore = transaction.objectStore('cachedRooms');
      const bookingStore = transaction.objectStore('cachedBookings');
      
      transaction.oncomplete = () => resolve(availableRooms);
      transaction.onerror = () => reject(transaction.error);

      let availableRooms: CachedRoom[] = [];
      const occupiedRoomIds = new Set<number>();

      // First, get all bookings that overlap with the requested date range
      const bookingIndex = bookingStore.index('hotelId');
      const bookingRequest = bookingIndex.getAll(hotelId);

      bookingRequest.onsuccess = () => {
        const bookings = bookingRequest.result as CachedBooking[];
        
        // Find rooms occupied during the requested date range
        bookings.forEach(booking => {
          if (booking.status !== 'CANCELLED' && 
              this.datesOverlap(booking.checkInDate, booking.checkOutDate, checkInDate, checkOutDate)) {
            occupiedRoomIds.add(booking.roomId);
          }
        });

        // Now get all rooms for the hotel
        const roomIndex = roomStore.index('hotelId');
        const roomRequest = roomIndex.getAll(hotelId);

        roomRequest.onsuccess = () => {
          const allRooms = roomRequest.result as CachedRoom[];
          
          availableRooms = allRooms.filter(room => {
            // Room must have sufficient capacity
            if (room.capacity < guestCount) return false;
            
            // Room must not be occupied by cached bookings
            if (occupiedRoomIds.has(room.id)) return false;
            
            // Room must not be marked as offline occupied for overlapping dates
            if (room.offlineStatus === 'occupied' && room.occupiedFrom && room.occupiedTo) {
              if (this.datesOverlap(room.occupiedFrom, room.occupiedTo, checkInDate, checkOutDate)) {
                return false;
              }
            }
            
            return room.isAvailable;
          });
        };
      };
    });
  }

  /**
   * Helper method to check if date ranges overlap
   */
  private datesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);
    
    return s1 < e2 && s2 < e1;
  }

  // ===== CACHED BOOKING MANAGEMENT =====

  /**
   * Save preloaded booking data
   */
  async saveCachedBookings(bookings: CachedBooking[]): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedBookings'], 'readwrite');
      const store = transaction.objectStore('cachedBookings');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      bookings.forEach(booking => {
        store.put(booking);
      });
    });
  }

  /**
   * Get cached bookings for hotel within date range
   */
  async getCachedBookingsForDateRange(
    hotelId: number, 
    startDate: string, 
    endDate: string
  ): Promise<CachedBooking[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedBookings'], 'readonly');
      const store = transaction.objectStore('cachedBookings');
      
      transaction.oncomplete = () => resolve(matchingBookings);
      transaction.onerror = () => reject(transaction.error);

      let matchingBookings: CachedBooking[] = [];
      
      const index = store.index('hotelId');
      const request = index.getAll(hotelId);

      request.onsuccess = () => {
        const allBookings = request.result as CachedBooking[];
        matchingBookings = allBookings.filter(booking => 
          this.datesOverlap(booking.checkInDate, booking.checkOutDate, startDate, endDate)
        );
      };
    });
  }

  // ===== STAFF SESSION MANAGEMENT =====

  /**
   * Simple hash function for password validation (client-side only)
   * Note: This is not cryptographically secure, just for basic offline validation
   */
  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Save staff session for offline authentication
   */
  async saveStaffSession(session: StaffSession, password?: string): Promise<void> {
    console.log(`👤 OfflineStorageService.saveStaffSession: Starting session save process...`);
    
    try {
      await this.init();
      console.log(`✅ OfflineStorageService.saveStaffSession: Database initialized`);
    } catch (initError) {
      console.error(`❌ OfflineStorageService.saveStaffSession: Database initialization failed:`, initError);
      throw initError;
    }

    // Ensure database is fully initialized before cleanup operations
    if (!this.isInitialized || !this.db) {
      console.warn(`⚠️ OfflineStorageService.saveStaffSession: Database not fully initialized, initializing now...`);
      await this.init();
    }

    // First, clean up any existing sessions for this user to prevent duplicates
    await this.cleanupExistingUserSessions(session.email, session.userId);
    console.log(`🧹 OfflineStorageService.saveStaffSession: Cleaned up existing sessions for user`);

    // Also clean up any expired sessions to prevent database bloat
    await this.cleanupExpiredSessions();
    console.log(`🧹 OfflineStorageService.saveStaffSession: Cleaned up expired sessions`);
    
    console.log(`👤 OfflineStorageService.saveStaffSession: Saving staff session:`, session);
    console.log(`🔍 OfflineStorageService.saveStaffSession: Database state:`, {
      isInitialized: this.isInitialized,
      dbExists: !!this.db,
      dbName: this.db?.name,
      version: this.db?.version,
      objectStoreNames: this.db ? Array.from(this.db.objectStoreNames) : []
    });

    // Double-check that database is properly initialized
    if (!this.isInitialized || !this.db) {
      console.error(`❌ OfflineStorageService.saveStaffSession: Database not initialized after init()`);
      console.error(`❌ Debug: isInitialized=${this.isInitialized}, db=${!!this.db}`);
      throw new Error('Database not initialized after init()');
    }

    // Create a copy of the session to avoid modifying the original
    const sessionToSave = { ...session };
    
    // Add password hash if password is provided
    if (password) {
      sessionToSave.passwordHash = this.simpleHash(password + session.email); // Salt with email
      console.log(`🔐 OfflineStorageService.saveStaffSession: Password hash added for offline validation`);
    }

    return new Promise((resolve, reject) => {
      try {
        console.log(`🔄 OfflineStorageService.saveStaffSession: Creating transaction...`);
        const transaction = this.db!.transaction(['staffSessions'], 'readwrite');
        const store = transaction.objectStore('staffSessions');
        console.log(`✅ OfflineStorageService.saveStaffSession: Transaction and store created`);
        
        transaction.oncomplete = () => {
          console.log(`✅ OfflineStorageService.saveStaffSession: Transaction completed successfully`);
          resolve();
        };
        
        transaction.onerror = (event) => {
          console.error(`❌ OfflineStorageService.saveStaffSession: Transaction failed:`, {
            error: transaction.error,
            event: event,
            target: event.target
          });
          reject(transaction.error || new Error('Transaction failed'));
        };

        transaction.onabort = (event) => {
          console.error(`❌ OfflineStorageService.saveStaffSession: Transaction aborted:`, event);
          reject(new Error('Transaction aborted'));
        };

        console.log(`💾 OfflineStorageService.saveStaffSession: Attempting to put session:`, sessionToSave);
        const putRequest = store.put(sessionToSave);
        
        putRequest.onsuccess = () => {
          console.log(`💾 OfflineStorageService.saveStaffSession: Put request successful`);
        };
        
        putRequest.onerror = () => {
          console.error(`❌ OfflineStorageService.saveStaffSession: Put request failed:`, putRequest.error);
          reject(putRequest.error || new Error('Put request failed'));
        };
        
      } catch (error) {
        console.error(`❌ OfflineStorageService.saveStaffSession: Exception during transaction creation:`, error);
        reject(error);
      }
    });
  }

  /**
   * Validate password against stored hash
   */
  validatePassword(password: string, email: string, storedHash: string): boolean {
    const inputHash = this.simpleHash(password + email);
    return inputHash === storedHash;
  }

  /**
   * Get active staff session
   */
  async getActiveStaffSession(): Promise<StaffSession | null> {
    await this.init();

    // Double-check that database is properly initialized
    if (!this.db) {
      console.error(`❌ OfflineStorageService.getActiveStaffSession: Database not initialized`);
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['staffSessions'], 'readonly');
      const store = transaction.objectStore('staffSessions');
      
      transaction.onerror = () => reject(transaction.error);

      const index = store.index('isActive');
      const request = index.get(1); // 1 represents true in IndexedDB

      request.onsuccess = () => {
        const session = request.result as StaffSession | undefined;
        
        if (session && new Date(session.expiresAt) > new Date()) {
          resolve(session);
        } else {
          resolve(null);
        }
      };
    });
  }

  /**
   * Get staff session for offline authentication (includes inactive sessions)
   */
  async getStaffSessionForOfflineAuth(email: string): Promise<StaffSession | null> {
    // Ensure database is properly initialized
    try {
      await this.init();
      
      // Wait a moment to ensure initialization is complete
      if (!this.isInitialized || !this.db) {
        console.warn(`⚠️ OfflineStorageService.getStaffSessionForOfflineAuth: Database still not ready, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief wait
        await this.init(); // Try again
      }

      if (!this.isInitialized || !this.db) {
        console.error(`❌ OfflineStorageService.getStaffSessionForOfflineAuth: Database initialization failed`);
        console.error(`❌ Debug info: isInitialized=${this.isInitialized}, db=${!!this.db}`);
        return null;
      }
      
      console.log(`✅ OfflineStorageService.getStaffSessionForOfflineAuth: Database ready for offline auth`);
    } catch (initError) {
      console.error(`❌ OfflineStorageService.getStaffSessionForOfflineAuth: Initialization error:`, initError);
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['staffSessions'], 'readonly');
      const store = transaction.objectStore('staffSessions');
      
      transaction.onerror = () => reject(transaction.error);

      // Get all sessions and find the matching email (regardless of isActive status)
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const sessions = getAllRequest.result as StaffSession[];
        
        // Find session by email (most recent one if multiple exist)
        const matchingSession = sessions
          .filter(session => session.email === email)
          .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())[0];
        
        if (matchingSession && new Date(matchingSession.expiresAt) > new Date()) {
          console.log(`🔍 OfflineStorageService: Found cached session for offline auth: ${email}`);
          resolve(matchingSession);
        } else {
          console.log(`❌ OfflineStorageService: No valid cached session found for: ${email}`);
          resolve(null);
        }
      };
    });
  }

  /**
   * Clean up existing sessions for a specific user to prevent duplicates
   */
  private async cleanupExistingUserSessions(email: string, userId: number): Promise<void> {
    if (!this.isInitialized || !this.db) {
      console.error(`❌ OfflineStorageService.cleanupExistingUserSessions: Database not initialized properly`);
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['staffSessions'], 'readwrite');
      const store = transaction.objectStore('staffSessions');
      
      transaction.oncomplete = () => {
        console.log(`✅ OfflineStorageService: Cleaned up existing sessions for user ${email}`);
        resolve();
      };
      
      transaction.onerror = () => {
        console.error(`❌ OfflineStorageService: Failed to cleanup existing sessions:`, transaction.error);
        reject(transaction.error);
      };

      // Get all sessions and remove ones matching this user
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const sessions = getAllRequest.result as StaffSession[];
        
        // Find sessions to delete (matching email or userId)
        const sessionsToDelete = sessions.filter(s => 
          s.email === email || s.userId === userId
        );
        
        console.log(`🧹 OfflineStorageService: Found ${sessionsToDelete.length} existing sessions to cleanup for user ${email}`);
        
        // Delete each matching session
        sessionsToDelete.forEach(sessionToDelete => {
          store.delete(sessionToDelete.id);
        });
      };
    });
  }

  /**
   * Deactivate staff sessions (logout) - preserves sessions for offline authentication
   */
  async deactivateStaffSessions(): Promise<void> {
    await this.init();

    if (!this.db) {
      console.error(`❌ OfflineStorageService.deactivateStaffSessions: Database not initialized`);
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['staffSessions'], 'readwrite');
      const store = transaction.objectStore('staffSessions');
      
      transaction.oncomplete = () => {
        console.log('✅ OfflineStorageService: Staff sessions deactivated (preserved for offline auth)');
        resolve();
      };
      transaction.onerror = () => {
        console.error('❌ OfflineStorageService: Failed to deactivate staff sessions:', transaction.error);
        reject(transaction.error);
      };

      // Get all sessions and mark them as inactive
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const sessions = getAllRequest.result as StaffSession[];
        
        // Update each session to mark as inactive
        sessions.forEach(session => {
          session.isActive = false;
          session.lastActivity = new Date().toISOString();
          store.put(session);
        });
      };
    });
  }

  /**
   * Clean up expired sessions to prevent database bloat
   */
  async cleanupExpiredSessions(): Promise<void> {
    await this.init();

    if (!this.db) {
      console.error(`❌ OfflineStorageService.cleanupExpiredSessions: Database not initialized`);
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['staffSessions'], 'readwrite');
      const store = transaction.objectStore('staffSessions');
      
      transaction.oncomplete = () => {
        console.log('✅ OfflineStorageService: Expired sessions cleaned up');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('❌ OfflineStorageService: Failed to cleanup expired sessions:', transaction.error);
        reject(transaction.error);
      };

      // Get all sessions and remove expired ones
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = () => {
        const sessions = getAllRequest.result as StaffSession[];
        const now = new Date();
        
        // Find expired sessions
        const expiredSessions = sessions.filter(session => 
          new Date(session.expiresAt) <= now
        );
        
        console.log(`🧹 OfflineStorageService: Found ${expiredSessions.length} expired sessions to cleanup`);
        
        // Delete each expired session
        expiredSessions.forEach(expiredSession => {
          store.delete(expiredSession.id);
        });
      };
    });
  }

  /**
   * Clear staff sessions completely (use sparingly - prevents offline auth)
   */
  async clearStaffSessions(): Promise<void> {
    await this.init();

    if (!this.db) {
      console.error(`❌ OfflineStorageService.clearStaffSessions: Database not initialized`);
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['staffSessions'], 'readwrite');
      const store = transaction.objectStore('staffSessions');
      
      transaction.oncomplete = () => {
        console.log('✅ OfflineStorageService: Staff sessions cleared completely');
        resolve();
      };
      transaction.onerror = () => {
        console.error('❌ OfflineStorageService: Failed to clear staff sessions:', transaction.error);
        reject(transaction.error);
      };

      store.clear();
    });
  }

  // ===== DEBUGGING & UTILITY METHODS =====

  /**
   * Get database health status for debugging
   */
  async getDatabaseHealth(): Promise<{
    isInitialized: boolean;
    version: number;
    objectStores: string[];
    missingStores: string[];
    isHealthy: boolean;
  }> {
    await this.init();

    const requiredStores = ['offlineBookings', 'roomAvailability', 'guestInfo', 'cachedRooms', 'appData', 'cachedBookings', 'staffSessions'];
    const existingStores = this.db ? Array.from(this.db.objectStoreNames) : [];
    const missingStores = requiredStores.filter(store => !existingStores.includes(store));

    return {
      isInitialized: this.isInitialized,
      version: this.db?.version || 0,
      objectStores: existingStores,
      missingStores,
      isHealthy: this.isInitialized && missingStores.length === 0
    };
  }

  /**
   * Get comprehensive database status including data counts - useful for debugging
   */
  async getDatabaseStatus(): Promise<{
    health: any;
    dataCounts: {
      cachedRooms: number;
      staffSessions: number;
      offlineBookings: number;
      cachedBookings: number;
      guestInfo: number;
    };
    sampleData: {
      cachedRooms: CachedRoom[];
      staffSessions: StaffSession[];
    };
  }> {
    await this.init();

    const health = await this.getDatabaseHealth();
    
    // Count records in each store
    const counts = {
      cachedRooms: 0,
      staffSessions: 0,
      offlineBookings: 0,
      cachedBookings: 0,
      guestInfo: 0
    };

    const sampleData = {
      cachedRooms: [] as CachedRoom[],
      staffSessions: [] as StaffSession[]
    };

    try {
      // Get cached rooms count and sample
      const cachedRooms = await this.getCachedRooms();
      counts.cachedRooms = cachedRooms.length;
      sampleData.cachedRooms = cachedRooms.slice(0, 3); // First 3 as sample

      // Get staff sessions count and sample
      const activeSession = await this.getActiveStaffSession();
      if (activeSession) {
        counts.staffSessions = 1;
        sampleData.staffSessions = [activeSession];
      }

      // Get offline bookings count
      const offlineBookings = await this.getOfflineBookings();
      counts.offlineBookings = offlineBookings.length;

    } catch (error) {
      console.error('Error getting data counts:', error);
    }

    return {
      health,
      dataCounts: counts,
      sampleData
    };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorageService();

// Export types
export type { OfflineBooking, RoomAvailability, GuestInfo };

// Global debugging functions for browser console
(window as any).debugOfflineStorage = async () => {
  console.log('🔍 Offline Storage Debug Information:');
  try {
    const status = await offlineStorage.getDatabaseStatus();
    console.log('📊 Database Status:', status);
    
    console.log('\n🏥 Health Check:', status.health);
    console.log('\n📈 Data Counts:', status.dataCounts); 
    console.log('\n🎯 Sample Data:', status.sampleData);
    
    return status;
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return { error };
  }
};

// Global room caching debug function
(window as any).debugRoomCaching = async () => {
  console.log('🏨 Room Caching Debug Information:');
  
  // Check authentication
  const authToken = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');
  
  console.log('🔑 Authentication Status:');
  console.log('- auth_token exists:', !!authToken);
  console.log('- auth_user exists:', !!authUser);
  
  if (authUser) {
    try {
      const user = JSON.parse(authUser);
      console.log('- Hotel ID:', user.hotelId);
      console.log('- Tenant ID:', user.tenantId);
      console.log('- Email:', user.email);
    } catch (e) {
      console.error('Failed to parse auth_user:', e);
    }
  }
  
  // Check cached rooms
  try {
    const allRooms = await offlineStorage.getCachedRooms();
    console.log(`\n🏠 Cached Rooms: ${allRooms.length} total`);
    
    if (allRooms.length > 0) {
      console.log('Sample rooms:');
      allRooms.slice(0, 3).forEach((room, index) => {
        console.log(`Room ${index + 1}:`, {
          id: room.id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          hotelId: room.hotelId,
          isAvailable: room.isAvailable
        });
      });
    } else {
      console.log('⚠️ No rooms in cache. Try logging out and back in.');
    }
    
    return { rooms: allRooms.length };
  } catch (error) {
    console.error('❌ Room debug failed:', error);
    return { error };
  }
};

// Global staff sessions debug function
(window as any).debugStaffSessions = async () => {
  console.log('👤 Staff Sessions Debug Information:');
  
  try {
    const activeSession = await offlineStorage.getActiveStaffSession();
    
    if (activeSession) {
      console.log('✅ Active Staff Session Found:');
      console.log('🔍 Session Details:', {
        id: activeSession.id,
        email: activeSession.email,
        username: activeSession.username,
        role: activeSession.role,
        roles: activeSession.roles,
        hotelId: activeSession.hotelId,
        hotelName: activeSession.hotelName,
        tenantId: activeSession.tenantId,
        hasPasswordHash: !!activeSession.passwordHash,
        expiresAt: activeSession.expiresAt,
        lastActivity: activeSession.lastActivity,
        isExpired: new Date(activeSession.expiresAt) <= new Date(),
        timeUntilExpiry: new Date(activeSession.expiresAt).getTime() - new Date().getTime(),
        isActive: activeSession.isActive
      });
      
      return activeSession;
    } else {
      console.log('❌ No active staff session found');
      return null;
    }
  } catch (error) {
    console.error('❌ Staff sessions debug failed:', error);
    return { error };
  }
};

// Global function to test offline authentication
(window as any).testOfflineAuth = async (email: string, password: string) => {
  console.log('🧪 Testing Offline Authentication:');
  console.log('📧 Email:', email);
  console.log('🔐 Password length:', password.length);
  
  try {
    const cachedSession = await offlineStorage.getStaffSessionForOfflineAuth(email);
    
    if (!cachedSession) {
      console.log('❌ No cached session found');
      return { success: false, reason: 'No cached session' };
    }
    
    console.log('✅ Cached session found for:', cachedSession.email);
    
    // Check email match
    if (cachedSession.email !== email) {
      console.log('❌ Email mismatch');
      return { success: false, reason: 'Email mismatch' };
    }
    
    // Check expiry
    const isExpired = new Date(cachedSession.expiresAt) <= new Date();
    if (isExpired) {
      console.log('❌ Session expired');
      return { success: false, reason: 'Session expired' };
    }
    
    // Check password if hash available
    if (cachedSession.passwordHash) {
      const isPasswordValid = offlineStorage.validatePassword(password, email, cachedSession.passwordHash);
      if (!isPasswordValid) {
        console.log('❌ Password validation failed');
        return { success: false, reason: 'Invalid password' };
      }
      console.log('✅ Password validated successfully');
    } else {
      console.log('⚠️ No password hash available');
    }
    
    // Check role
    const isHotelStaff = cachedSession.roles?.some(role => 
      ['HOTEL_ADMIN', 'FRONTDESK'].includes(role)
    ) || ['HOTEL_ADMIN', 'FRONTDESK'].includes(cachedSession.role);
    
    if (!isHotelStaff) {
      console.log('❌ Not hotel staff');
      return { success: false, reason: 'Not hotel staff' };
    }
    
    console.log('✅ All offline authentication checks passed!');
    return { 
      success: true, 
      session: {
        email: cachedSession.email,
        role: cachedSession.role,
        hotelId: cachedSession.hotelId,
        hotelName: cachedSession.hotelName
      }
    };
    
  } catch (error) {
    console.error('❌ Offline auth test failed:', error);
    return { success: false, error };
  }
};

// Global function to completely clear staff sessions (for testing)
(window as any).clearAllStaffSessions = async () => {
  console.log('🧹 Clearing all staff sessions completely...');
  try {
    await offlineStorage.clearStaffSessions();
    console.log('✅ All staff sessions cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear staff sessions:', error);
    return { success: false, error };
  }
};

// Global function to clean up expired sessions
(window as any).cleanupExpiredSessions = async () => {
  console.log('🧹 Cleaning up expired staff sessions...');
  try {
    await offlineStorage.cleanupExpiredSessions();
    console.log('✅ Expired staff sessions cleaned up');
    
    // Show remaining sessions count
    console.log('🔍 Checking remaining sessions...');
    const activeSession = await offlineStorage.getActiveStaffSession();
    console.log('📊 Active sessions remaining:', activeSession ? 1 : 0);
    return { success: true, activeSession };
  } catch (error) {
    console.error('❌ Failed to cleanup expired sessions:', error);
    return { success: false, error };
  }
};

// Global function to test database initialization
(window as any).testDatabaseInit = async () => {
  console.log('🔬 Testing database initialization...');
  try {
    await offlineStorage.init();
    console.log('✅ Database initialization successful');
    
    // Test a simple write operation
    const testSession: StaffSession = {
      id: 'test-session-' + Date.now(),
      userId: 999,
      username: 'Test User',
      email: 'test@example.com',
      role: 'HOTEL_ADMIN',
      roles: ['HOTEL_ADMIN'],
      hotelId: undefined, // Should be set from actual user data
      hotelName: 'Test Hotel',
      tenantId: 'test',
      token: 'test-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      passwordHash: 'test-hash'
    };
    
    console.log('🔬 Testing staff session save...');
    await offlineStorage.saveStaffSession(testSession);
    console.log('✅ Test session saved successfully');
    
    console.log('🔬 Testing staff session retrieval...');
    const retrievedSession = await offlineStorage.getActiveStaffSession();
    console.log('📄 Retrieved session:', retrievedSession);
    
    return { success: true, session: retrievedSession };
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return { success: false, error };
  }
};