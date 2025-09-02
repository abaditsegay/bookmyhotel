import Constants from 'expo-constants';

// API Configuration
export const API_BASE_URL = 'http://192.168.1.230:8080/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'BookMyHotel Mobile',
  VERSION: Constants.expoConfig?.version || '1.0.0',
  BUILD_NUMBER: Constants.expoConfig?.android?.versionCode || 1,
};

// Storage Keys
export const STORAGE_KEYS = {
  RECENT_SEARCHES: '@recent_searches',
  SAVED_BOOKINGS: '@saved_bookings',
  USER_PREFERENCES: '@user_preferences',
};

// Default values
export const DEFAULTS = {
  GUESTS: 2,
  ROOMS: 1,
  SEARCH_RADIUS: 50, // km
  CURRENCY: 'USD',
};
