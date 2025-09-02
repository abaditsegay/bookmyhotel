import { api } from './api';
import { API_CONFIG } from '../constants/config';
import axios from 'axios';

/**
 * Hotel Service - Handles all hotel-related API calls
 */
export const hotelService = {
  /**
   * Search hotels based on criteria
   * @param {Object} searchParams - Search parameters
   * @param {string} searchParams.destination - Destination city/location
   * @param {string} searchParams.checkInDate - Check-in date (YYYY-MM-DD)
   * @param {string} searchParams.checkOutDate - Check-out date (YYYY-MM-DD)
   * @param {number} searchParams.guests - Number of guests
   * @param {number} searchParams.rooms - Number of rooms
   * @returns {Promise} API response with hotel list
   */
  searchHotels: async (searchParams) => {
    try {
      const { destination, checkInDate, checkOutDate, guests = 2, rooms = 1 } = searchParams;
      
      // Backend expects POST request with JSON body
      const requestBody = {
        location: destination, // Backend expects 'location' not 'destination'
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        guests: guests,
        // Note: rooms parameter is not used by backend, it uses guests count
      };

      console.log('🚀 API Request: POST /hotels/search');
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      console.log('🌐 API object:', api);
      console.log('🔗 API base URL from config:', API_CONFIG.BASE_URL);

      let response;
      
      // Use direct axios call as fallback if api object is undefined
      if (!api || typeof api.post !== 'function') {
        console.log('⚠️ Using direct axios call as fallback');
        response = await axios.post(
          `${API_CONFIG.BASE_URL}/hotels/search`, 
          requestBody,
          {
            headers: API_CONFIG.HEADERS,
            timeout: API_CONFIG.TIMEOUT
          }
        );
      } else {
        response = await api.post('/hotels/search', requestBody);
      }

      console.log('✅ API Response Status:', response.status);
      console.log('📥 Response data length:', response.data?.length || 0);

      // If search returns empty results, try fallback to random hotels
      if (response.data && response.data.length === 0) {
        console.log('🔍 Search returned empty results, trying random hotels as fallback');
        try {
          const randomHotelsResponse = await api.get('/hotels/random');
          console.log('🎲 Random hotels fallback response length:', randomHotelsResponse.data?.length || 0);
          
          if (randomHotelsResponse.data && randomHotelsResponse.data.length > 0) {
            return {
              success: true,
              data: randomHotelsResponse.data,
              fallback: true, // Indicate this is fallback data
              message: `No hotels found for "${destination}". Showing available hotels.`
            };
          }
        } catch (fallbackError) {
          console.error('❌ Random hotels fallback failed:', fallbackError);
        }
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ API Response Error:', error.response?.status, error.message);
      console.error('🔍 Error details:', error.response?.data);
      console.error('📡 Request that failed:', error.config);
      console.error('Hotel search error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search hotels',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Get hotel details by ID
   * @param {number} hotelId - Hotel ID
   * @param {Object} params - Optional search parameters for room availability
   * @returns {Promise} API response with hotel details
   */
  getHotelDetails: async (hotelId, params = {}) => {
    try {
      const { checkInDate, checkOutDate, guests = 2 } = params;
      
      const queryParams = {};
      if (checkInDate) queryParams.checkInDate = checkInDate;
      if (checkOutDate) queryParams.checkOutDate = checkOutDate;
      if (guests) queryParams.guests = guests;
      
      const response = await api.get(`/hotels/${hotelId}`, {
        params: queryParams
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch hotel details',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Get available rooms for a hotel
   * @param {Object} params - Search parameters including hotel ID
   * @param {number} params.hotelId - Hotel ID
   * @param {string} params.checkInDate - Check-in date
   * @param {string} params.checkOutDate - Check-out date
   * @param {number} params.guests - Number of guests
   * @returns {Promise} API response with available rooms
   */
  getHotelRooms: async (params) => {
    try {
      const { hotelId, checkInDate, checkOutDate, guests } = params;
      
      const response = await api.get(`/hotels/${hotelId}/rooms`, {
        params: {
          checkInDate: checkInDate,   // Backend expects checkInDate
          checkOutDate: checkOutDate, // Backend expects checkOutDate
          guests,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch hotel rooms',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Get random hotels for advertisement display
   * @returns {Promise} API response with hotel list
   */
  getRandomHotels: async () => {
    try {
      const response = await api.get('/hotels/random');
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch hotels',
        statusCode: error.response?.status,
      };
    }
  },

  /**
   * Get destinations for autocomplete
   * @param {string} query - Search query
   * @returns {Promise} API response with destination suggestions
   */
  getDestinationSuggestions: async (query) => {
    try {
      // Note: This endpoint might need to be created in backend if not exists
      const response = await api.get('/hotels/destinations/autocomplete', {
        params: { query },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Fallback to empty array if endpoint doesn't exist
      return {
        success: true,
        data: [],
      };
    }
  },

  /**
   * Get popular destinations
   * @returns {Promise} API response with destination list
   */
  getDestinations: async () => {
    try {
      // Return a fallback list of popular destinations since the backend doesn't have this endpoint
      const destinations = [
        { id: 1, name: 'Addis Ababa', country: 'Ethiopia', image: 'https://example.com/addis.jpg' },
        { id: 2, name: 'Lalibela', country: 'Ethiopia', image: 'https://example.com/lalibela.jpg' },
        { id: 3, name: 'Bahir Dar', country: 'Ethiopia', image: 'https://example.com/bahirdar.jpg' },
        { id: 4, name: 'Gondar', country: 'Ethiopia', image: 'https://example.com/gondar.jpg' },
        { id: 5, name: 'Axum', country: 'Ethiopia', image: 'https://example.com/axum.jpg' },
        { id: 6, name: 'Harar', country: 'Ethiopia', image: 'https://example.com/harar.jpg' },
      ];

      return {
        success: true,
        data: destinations,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch destinations',
        statusCode: 500,
      };
    }
  },

  /**
   * Get hotel amenities/filters
   * @returns {Promise} API response with available filters
   */
  getHotelFilters: async () => {
    try {
      // Note: This endpoint might need to be created in backend if not exists
      const response = await api.get('/hotels/filters');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      // Fallback to default filters
      return {
        success: true,
        data: {
          priceRange: { min: 0, max: 1000 },
          ratings: [1, 2, 3, 4, 5],
          amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Parking'],
        },
      };
    }
  },
};
