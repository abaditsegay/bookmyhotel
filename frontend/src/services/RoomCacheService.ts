import { offlineStorage, CachedRoom } from './OfflineStorageService';
import { buildApiUrl } from '../config/apiConfig';

interface ApiRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  description?: string;
  isAvailable: boolean;
  hotelId: number;
}

export class RoomCacheService {
  private offlineStorage = offlineStorage; // Use singleton instance
  private readonly CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  private refreshInterval: NodeJS.Timeout | null = null;

  async fetchAndCacheRooms(hotelId: number): Promise<CachedRoom[]> {
    try {
      // Ensure database is initialized first
      await this.offlineStorage.init();
      
      // console.log(`🏨 RoomCacheService: Fetching rooms for hotel ${hotelId} from API...`);
      // console.log(`🔍 RoomCacheService: Database initialized, checking authentication...`);
      
      const token = localStorage.getItem('auth_token');
      let tenantId = null;
      let userHotelId = null;
      
      // console.log(`🔑 RoomCacheService: Token exists: ${!!token}`);
      
      // Get tenant ID and hotel ID from user data stored by TokenManager
      try {
        const userData = localStorage.getItem('auth_user');
        // console.log(`👤 RoomCacheService: User data exists: ${!!userData}`);
        if (userData) {
          const user = JSON.parse(userData);
          tenantId = user.tenantId;
          userHotelId = user.hotelId ? parseInt(user.hotelId) : null;
          // console.log(`🏢 RoomCacheService: Extracted tenant ID: ${tenantId}`);
          // console.log(`🏨 RoomCacheService: User hotel ID: ${userHotelId}`);
          
          // Use user's hotel ID if no specific hotel ID provided
          if (!hotelId && userHotelId) {
            hotelId = userHotelId;
            // console.log(`🔧 RoomCacheService: Using user's hotel ID: ${hotelId}`);
          }
        }
      } catch (error) {
        // console.warn('RoomCacheService: Failed to parse user data for tenant ID:', error);
      }
      
      if (!token) {
        // console.error('❌ RoomCacheService: No authentication token found!');
        throw new Error('No authentication token available');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
      
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      
      // console.log(`🔧 RoomCacheService: Headers prepared:`, Object.keys(headers));
      
      // Use bulk rooms endpoint specifically designed for offline caching
      const endpoint = buildApiUrl('rooms/all'); // Get all rooms from bulk endpoint
      
      // console.log(`🌐 RoomCacheService: Making API call to ${endpoint}`);
      // console.log(`🔑 RoomCacheService: Using headers:`, headers);
      
      const response = await fetch(endpoint, { headers });

      // console.log(`📡 RoomCacheService: API response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // console.error(`❌ RoomCacheService: API call failed with status ${response.status}`);
        throw new Error(`Failed to fetch rooms: ${response.status}`);
      }

      const data = await response.json();
      // console.log(`📊 RoomCacheService: Raw API response data:`, data);
      const apiRooms: ApiRoom[] = Array.isArray(data) ? data : (data.content || []); // Handle list vs paginated response
      const cachedRooms: CachedRoom[] = apiRooms.map(room => ({
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        description: room.description || '',
        hotelId: room.hotelId,
        isAvailable: room.isAvailable,
        lastUpdated: new Date().toISOString()
      }));

      // console.log(`💾 RoomCacheService: Saving ${cachedRooms.length} cached rooms to IndexedDB...`);
      await this.offlineStorage.saveRooms(cachedRooms);
      // console.log(`✅ RoomCacheService: Successfully cached ${cachedRooms.length} rooms for hotel ${hotelId}`);
      
      // Verify the data was actually saved
      // console.log(`🔍 RoomCacheService: Verification - found ${savedRooms.length} saved rooms in IndexedDB`);
      
      return cachedRooms;
    } catch (error) {
      // console.error('Failed to fetch and cache rooms:', error);
      throw error;
    }
  }

  async getRooms(hotelId: number, forceRefresh = false): Promise<CachedRoom[]> {
    try {
      // Ensure database is initialized first
      await this.offlineStorage.init();
      
      // Get cached rooms first
      const cachedRooms = await this.offlineStorage.getCachedRooms(hotelId);
      
      // If no cached rooms exist or force refresh is requested, try to fetch from API
      if (cachedRooms.length === 0 || forceRefresh) {
        if (navigator.onLine) {
          try {
            // console.log('🔄 Fetching fresh room data from API...');
            return await this.fetchAndCacheRooms(hotelId);
          } catch (error) {
            // console.warn('Failed to fetch room data from API, using cached data if available:', error);
            if (cachedRooms.length > 0) {
              return cachedRooms;
            }
            return [];
          }
        } else {
          // console.log('📶 Offline - using cached rooms or empty array');
          return cachedRooms;
        }
      }
      
      // Check if we need to refresh the cache based on age
      const cacheAge = await this.offlineStorage.getRoomsCacheAge(hotelId);
      const needsRefresh = cacheAge > this.CACHE_EXPIRY_MS;

      if (needsRefresh && navigator.onLine) {
        try {
          // console.log('⏰ Cache expired, refreshing room data...');
          return await this.fetchAndCacheRooms(hotelId);
        } catch (error) {
          // console.warn('Failed to refresh expired cache, using cached data:', error);
        }
      }

      // Return cached rooms
      // console.log(`📦 Using cached rooms for hotel ${hotelId}: ${cachedRooms.length} rooms`);
      return cachedRooms;
    } catch (error) {
      // console.error('Failed to get rooms:', error);
      return [];
    }
  }

  async getAllCachedRooms(): Promise<CachedRoom[]> {
    // Ensure database is initialized first
    await this.offlineStorage.init();
    return await this.offlineStorage.getCachedRooms();
  }

  startPeriodicRefresh(hotelId: number): void {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Set up periodic refresh every 15 minutes
    this.refreshInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          // console.log('🔄 Performing periodic room cache refresh...');
          // Ensure database is initialized first
          await this.offlineStorage.init();
          await this.fetchAndCacheRooms(hotelId);
        } catch (error) {
          // console.warn('Periodic room refresh failed:', error);
        }
      }
    }, 15 * 60 * 1000); // 15 minutes

    // console.log(`⏰ Started periodic room refresh for hotel ${hotelId}`);
  }

  stopPeriodicRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      // console.log('⏹️ Stopped periodic room refresh');
    }
  }

  async clearCache(hotelId?: number): Promise<void> {
    // Ensure database is initialized first
    await this.offlineStorage.init();
    await this.offlineStorage.clearCachedRooms(hotelId);
    // console.log(`🗑️ Cleared room cache${hotelId ? ` for hotel ${hotelId}` : ''}`);
  }

  /**
   * Invalidate cache and force refresh for a specific hotel
   * Use this when rooms are modified to ensure consistency
   */
  async invalidateAndRefresh(hotelId: number): Promise<CachedRoom[]> {
    try {
      // console.log(`🔄 Invalidating and refreshing cache for hotel ${hotelId}`);
      await this.clearCache(hotelId);
      
      if (navigator.onLine) {
        const freshRooms = await this.fetchAndCacheRooms(hotelId);
        // console.log(`✅ Cache refreshed: ${freshRooms.length} rooms loaded`);
        return freshRooms;
      } else {
        // console.log('📶 Offline - cache cleared but cannot refresh');
        return [];
      }
    } catch (error) {
      // console.error('Failed to invalidate and refresh cache:', error);
      return [];
    }
  }

  // Utility method to get available room types for a hotel
  async getAvailableRoomTypes(hotelId: number): Promise<string[]> {
    // Ensure database is initialized first
    await this.offlineStorage.init();
    const rooms = await this.getRooms(hotelId);
    const roomTypeSet = new Set(rooms.map(room => room.roomType));
    const roomTypes = Array.from(roomTypeSet);
    return roomTypes.sort();
  }

  // Utility method to get rooms by type
  async getRoomsByType(hotelId: number, roomType: string): Promise<CachedRoom[]> {
    // Ensure database is initialized first
    await this.offlineStorage.init();
    const rooms = await this.getRooms(hotelId);
    return rooms.filter(room => room.roomType === roomType);
  }
}

// Export singleton instance
export const roomCacheService = new RoomCacheService();