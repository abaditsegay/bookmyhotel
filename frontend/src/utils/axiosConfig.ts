import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG } from '../config/apiConfig';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_CONFIG.SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle HTML error responses (502 Bad Gateway, 503 Service Unavailable, etc.)
    // These occur when backend is down and nginx returns HTML error pages
    const contentType = error.response?.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      // Backend is down or unreachable
      const statusCode = error.response?.status;
      let userMessage = 'Service temporarily unavailable. Please try again in a few moments.';
      
      if (statusCode === 502) {
        userMessage = 'Server is currently unavailable. Our team has been notified and is working to resolve this issue.';
      } else if (statusCode === 503) {
        userMessage = 'Server is under maintenance. Please try again shortly.';
      } else if (statusCode === 504) {
        userMessage = 'Server request timeout. Please check your connection and try again.';
      }
      
      // Replace the error with a user-friendly message
      const friendlyError = new Error(userMessage);
      (friendlyError as any).isServiceError = true;
      (friendlyError as any).statusCode = statusCode;
      return Promise.reject(friendlyError);
    }

    // Handle network errors (no response from server)
    if (!error.response) {
      const networkError = new Error(
        error.code === 'ECONNABORTED' 
          ? 'Request timeout. Please check your connection and try again.'
          : 'Unable to connect to server. Please check your internet connection.'
      );
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // For other errors, return as-is
    return Promise.reject(error);
  }
);

export default axiosInstance;
