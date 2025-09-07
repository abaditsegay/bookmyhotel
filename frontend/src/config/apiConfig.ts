/**
 * Centralized API Configuration
 * This file contains all API-related configuration for the frontend application.
 */

// Environment variables with fallback to relative paths for nginx proxy
export const API_CONFIG = {
  // Main API base URL - used for all backend API calls
  // Including the Spring Boot context path /managemyhotel
  BASE_URL: process.env.REACT_APP_API_URL || '/managemyhotel/api',
  
  // Backend server URL (without /api suffix) - for direct server calls if needed
  SERVER_URL: process.env.REACT_APP_SERVER_URL || '',
  
  // Timeout for API calls (in milliseconds)
  REQUEST_TIMEOUT: 30000,
  
  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * API Endpoints - centralized endpoint definitions
 * Use these constants instead of hardcoding endpoint paths
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // System Admin
  SYSTEM: {
    HOTELS: '/system/hotels',
    USERS: '/system/users', 
    TENANTS: '/system/tenants',
  },
  
  // Hotel Management
  HOTELS: {
    LIST: '/hotels',
    BY_ID: (id: string | number) => `/hotels/${id}`,
    SEARCH: '/hotels/search',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    BY_ID: (id: string | number) => `/bookings/${id}`,
    SEARCH: '/bookings/search',
    CANCEL: '/bookings/cancel',
    MODIFY: '/bookings/modify',
  },
  
  // Rooms
  ROOMS: {
    LIST: (hotelId: string | number) => `/hotels/${hotelId}/rooms`,
    BY_ID: (hotelId: string | number, roomId: string | number) => `/hotels/${hotelId}/rooms/${roomId}`,
  },
  
  // Staff
  STAFF: {
    LIST: (hotelId: string | number) => `/hotels/${hotelId}/staff`,
    BY_ID: (hotelId: string | number, staffId: string | number) => `/hotels/${hotelId}/staff/${staffId}`,
    SCHEDULES: (hotelId: string | number) => `/hotels/${hotelId}/staff-schedules`,
  },
  
  // Shop/Products
  SHOP: {
    PRODUCTS: (hotelId: string | number) => `/hotels/${hotelId}/shop/products`,
    PRODUCT_BY_ID: (hotelId: string | number, productId: string | number) => `/hotels/${hotelId}/shop/products/${productId}`,
    INVENTORY: (hotelId: string | number) => `/hotels/${hotelId}/shop/inventory`,
  },
  
  // Todos
  TODOS: {
    LIST: '/todos',
    BY_ID: (id: string | number) => `/todos/${id}`,
    TOGGLE: (id: string | number) => `/todos/${id}/toggle`,
    FILTERED: '/todos/filtered',
    PENDING_COUNT: '/todos/pending/count',
    OVERDUE: '/todos/overdue',
  },
  
  // Operations
  OPERATIONS: {
    DASHBOARD: (hotelId: string | number) => `/hotels/${hotelId}/operations`,
    TASKS: (hotelId: string | number) => `/hotels/${hotelId}/operations/tasks`,
  },
} as const;

/**
 * Build complete API URL
 * @param endpoint - The endpoint path (use API_ENDPOINTS constants)
 * @returns Complete URL for API call
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Get API configuration for environment
 * @returns Current API configuration
 */
export const getApiConfig = () => API_CONFIG;

/**
 * Check if we're in development mode
 * @returns true if running in development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || API_CONFIG.BASE_URL.includes('localhost');
};

// Backward compatibility - export the base URL for existing code
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Export default for convenience
export default API_CONFIG;
