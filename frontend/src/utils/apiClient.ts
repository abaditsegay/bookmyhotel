/**
 * Centralized API Client Utility
 * This utility provides a consistent way to make API calls across the application.
 * It includes automatic token handling, error handling, and consistent headers.
 */

import { API_CONFIG, buildApiUrl } from '../config/apiConfig';

export interface ApiRequestOptions extends RequestInit {
  // Additional options specific to our API client
  skipAuth?: boolean;
  tenantId?: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

class ApiClient {
  private token: string | null = null;
  private defaultTenantId: string | null = null;
  private onSessionExpired: (() => void) | null = null;

  /**
   * Set the authentication token for all requests
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Set session expiration callback
   */
  setSessionExpiredCallback(callback: (() => void) | null): void {
    this.onSessionExpired = callback;
  }

  /**
   * Set the default tenant ID for all requests
   */
  setTenantId(tenantId: string | null): void {
    this.defaultTenantId = tenantId;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get current tenant ID
   */
  getTenantId(): string | null {
    return this.defaultTenantId;
  }

  /**
   * Check if the current JWT token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.token) return true;

    try {
      // Decode JWT payload (without verification - just to check expiration)
      const base64Url = this.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token has expired (exp is in seconds)
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.warn('Failed to decode JWT token:', error);
      return true; // Assume expired if we can't decode
    }
  }

  /**
   * Build headers for API requests
   */
  private buildHeaders(options: ApiRequestOptions = {}): Headers {
    const headers = new Headers(API_CONFIG.DEFAULT_HEADERS);

    // Add custom headers from options
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => headers.set(key, value));
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => headers.set(key, value));
      } else {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (value) headers.set(key, value);
        });
      }
    }

    // Add authentication token if available and not skipped
    if (!options.skipAuth && this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    // Add tenant ID if available
    const tenantId = options.tenantId || this.defaultTenantId;
    if (tenantId) {
      headers.set('X-Tenant-ID', tenantId);
    }

    return headers;
  }

  /**
   * Handle API response and extract data
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    
    try {
      if (response.ok) {
        // Handle different successful response types
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          // No content response (e.g., DELETE operations)
          return {
            data: undefined as T,
            status: response.status,
            success: true,
          };
        } else if (isJson) {
          const data = await response.json();
          return {
            data: data as T,
            status: response.status,
            success: true,
          };
        } else {
          const text = await response.text();
          return {
            data: text as T,
            status: response.status,
            success: true,
          };
        }
      } else {
        // Try to extract error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use text response or default message
            try {
              const textResponse = await response.text();
              if (textResponse) {
                errorMessage = textResponse;
              }
            } catch (textError) {
              // Use default error message
            }
          }
        } else {
          // Try to get error message from text response
          try {
            const textResponse = await response.text();
            if (textResponse) {
              errorMessage = textResponse;
            }
          } catch (textError) {
            // Use default error message
          }
        }

        // Handle different types of authentication/authorization errors
        if (response.status === 401) {
          // 401 = Session expired or invalid token
          const hasToken = this.getToken() !== null;
          console.log('Authentication failed (401) - session expired, triggering logout...', { hasToken });
          
          // Only trigger session expiration for users who actually have tokens/sessions
          if (hasToken && this.onSessionExpired) {
            setTimeout(() => this.onSessionExpired?.(), 100); // Delay to avoid state conflicts
          }
        } else if (response.status === 403) {
          // 403 = Authorization failed
          // For notification endpoints or other authenticated endpoints, treat 403 as session issue
          // since these endpoints should work for authenticated users with proper roles
          const isAuthenticatedEndpoint = (endpoint: string): boolean => {
            return endpoint.includes('/notifications') || 
                   endpoint.includes('/dashboard') ||
                   endpoint.includes('/users/current') ||
                   // Only treat user-specific booking endpoints as authenticated (not guest booking endpoints)
                   (endpoint.includes('/bookings') && !endpoint.includes('/bookings/search') && !endpoint.includes('/bookings/cancel') && !endpoint.includes('/bookings/modify'));
          };
          
          const requestUrl = response.url || '';
          const tokenExpired = this.isTokenExpired();
          const isAuthEndpoint = isAuthenticatedEndpoint(requestUrl);
          const hasToken = this.getToken() !== null;
          
          console.log('403 Error Analysis:', {
            url: requestUrl,
            tokenExpired,
            isAuthEndpoint,
            hasToken,
            willTriggerLogout: hasToken && (tokenExpired || isAuthEndpoint)
          });
          
          // Only trigger session expiration for users who actually have tokens/sessions
          if (hasToken && (tokenExpired || isAuthEndpoint)) {
            console.log('Session validation failed (403) - treating as session expiration, triggering logout...');
            if (this.onSessionExpired) {
              setTimeout(() => this.onSessionExpired?.(), 100);
            }
          } else {
            console.log('Authorization failed (403) - insufficient permissions for:', requestUrl);
            // Don't auto-logout for permission issues on non-core endpoints or guest users
          }
        }

        return {
          error: errorMessage,
          status: response.status,
          success: false,
        };
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: response.status,
        success: false,
      };
    }
  }

  /**
   * Make an API request with timeout support
   */
  private async requestWithTimeout(
    url: string, 
    options: ApiRequestOptions
  ): Promise<Response> {
    const timeout = options.timeout || API_CONFIG.REQUEST_TIMEOUT;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: this.buildHeaders(options),
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Generic API request method
   */
  async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check if we're making an authenticated request without a token
      if (!options.skipAuth && !this.token) {
        console.warn('API request attempted without token - likely race condition during initialization');
        return {
          error: 'Authentication token not available - request aborted to prevent 403',
          status: 401,
          success: false,
        };
      }

      const url = buildApiUrl(endpoint);
      const response = await this.requestWithTimeout(url, options);
      return await this.handleResponse<T>(response);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Request failed',
        status: 0,
        success: false,
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string, 
    data?: any, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string, 
    data?: any, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string, 
    data?: any, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for creating new instances if needed
export default ApiClient;
