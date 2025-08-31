import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Storage utility functions using AsyncStorage
 */
export const storage = {
  /**
   * Store data in AsyncStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {Promise<boolean>} Success status
   */
  setItem: async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  },

  /**
   * Retrieve data from AsyncStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {Promise<any>} Retrieved value or default
   */
  getItem: async (key, defaultValue = null) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return defaultValue;
    }
  },

  /**
   * Remove item from AsyncStorage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  },

  /**
   * Clear all AsyncStorage data
   * @returns {Promise<boolean>} Success status
   */
  clear: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  /**
   * Get all keys from AsyncStorage
   * @returns {Promise<string[]>} Array of keys
   */
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  },
};

/**
 * Specific storage functions for app data
 */
export const appStorage = {
  /**
   * Save recent search to storage
   * @param {Object} searchData - Search parameters
   */
  saveRecentSearch: async (searchData) => {
    try {
      const recentSearches = await storage.getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
      
      // Remove duplicate if exists
      const filteredSearches = recentSearches.filter(
        search => search.destination !== searchData.destination
      );
      
      // Add new search to beginning of array
      const updatedSearches = [searchData, ...filteredSearches].slice(0, 10); // Keep only 10 recent searches
      
      return await storage.setItem(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches);
    } catch (error) {
      console.error('Error saving recent search:', error);
      return false;
    }
  },

  /**
   * Get recent searches from storage
   * @returns {Promise<Array>} Array of recent searches
   */
  getRecentSearches: async () => {
    return await storage.getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
  },

  /**
   * Save booking confirmation to storage
   * @param {Object} bookingData - Booking confirmation data
   */
  saveBooking: async (bookingData) => {
    try {
      const savedBookings = await storage.getItem(STORAGE_KEYS.SAVED_BOOKINGS, []);
      
      // Add new booking to beginning of array
      const updatedBookings = [bookingData, ...savedBookings].slice(0, 20); // Keep only 20 bookings
      
      return await storage.setItem(STORAGE_KEYS.SAVED_BOOKINGS, updatedBookings);
    } catch (error) {
      console.error('Error saving booking:', error);
      return false;
    }
  },

  /**
   * Get saved bookings from storage
   * @returns {Promise<Array>} Array of saved bookings
   */
  getSavedBookings: async () => {
    return await storage.getItem(STORAGE_KEYS.SAVED_BOOKINGS, []);
  },

  /**
   * Save user preferences
   * @param {Object} preferences - User preferences
   */
  saveUserPreferences: async (preferences) => {
    const currentPreferences = await storage.getItem(STORAGE_KEYS.USER_PREFERENCES, {});
    const updatedPreferences = { ...currentPreferences, ...preferences };
    return await storage.setItem(STORAGE_KEYS.USER_PREFERENCES, updatedPreferences);
  },

  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences
   */
  getUserPreferences: async () => {
    return await storage.getItem(STORAGE_KEYS.USER_PREFERENCES, {
      currency: 'USD',
      notifications: true,
      darkMode: false,
    });
  },
};
