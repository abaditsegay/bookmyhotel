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

  /**
   * Set the authentication token for all requests
   */
  setToken(token: string | null): void {
    this.token = token;
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
        const data = isJson ? await response.json() : await response.text();
        return {
          data: data as T,
          status: response.status,
          success: true,
        };
      } else {
        // Try to extract error message from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (e) {
            // If JSON parsing fails, use default error message
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
