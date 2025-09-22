import { API_CONFIG } from '../config/apiConfig';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onProgress?: (progress: number) => void;
  onUploadProgress?: (progress: number) => void;
  loadingKey?: string;
}

interface LoadingState {
  [key: string]: boolean;
}

/**
 * Enhanced API service with integrated loading states and progress tracking
 */
class EnhancedApiService {
  private baseUrl: string;
  private defaultTimeout: number = 30000;
  private loadingStates: LoadingState = {};
  private loadingCallbacks: { [key: string]: ((loading: boolean) => void)[] } = {};

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Subscribe to loading state changes for a specific key
   */
  subscribeToLoading(key: string, callback: (loading: boolean) => void): () => void {
    if (!this.loadingCallbacks[key]) {
      this.loadingCallbacks[key] = [];
    }
    this.loadingCallbacks[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.loadingCallbacks[key] = this.loadingCallbacks[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Set loading state and notify subscribers
   */
  private setLoading(key: string, loading: boolean) {
    this.loadingStates[key] = loading;
    this.loadingCallbacks[key]?.forEach(callback => callback(loading));
  }

  /**
   * Get current loading state
   */
  isLoading(key: string): boolean {
    return this.loadingStates[key] || false;
  }

  /**
   * Get authentication headers
   * Fixed to check for both 'auth_token' and 'token' keys for compatibility
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Check both token keys - 'auth_token' is used by TokenManager, 'token' for backward compatibility
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || 
                  sessionStorage.getItem('auth_token') || sessionStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Check both tenant ID keys for compatibility
    const tenantId = localStorage.getItem('tenant_id') || localStorage.getItem('tenantId') || 
                     sessionStorage.getItem('tenant_id') || sessionStorage.getItem('tenantId');
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    return headers;
  }

  /**
   * Enhanced fetch with loading states, retries, and progress tracking
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = 3,
      retryDelay = 1000,
      onProgress,
      onUploadProgress,
      loadingKey = endpoint,
      ...fetchOptions
    } = options;

    const url = `${this.baseUrl}/${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Set loading state
    this.setLoading(loadingKey, true);

    try {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...fetchOptions.headers,
              ...this.getAuthHeaders(),
            },
          });

          clearTimeout(timeoutId);

          // Handle progress for downloads
          if (onProgress && response.body) {
            return this.handleStreamResponse<T>(response, onProgress);
          }

          // Handle regular response
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          
          // Complete upload progress if applicable
          if (onUploadProgress) {
            onUploadProgress(100);
          }

          return {
            data: result.data || result,
            success: true,
            message: result.message,
            errors: result.errors,
          };

        } catch (error: any) {
          lastError = error;
          
          // Don't retry if request was aborted or if it's the last attempt
          if (error.name === 'AbortError' || attempt === retries) {
            throw error;
          }
          
          // Wait before retrying
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }

      throw lastError || new Error('Request failed after retries');

    } finally {
      clearTimeout(timeoutId);
      this.setLoading(loadingKey, false);
    }
  }

  /**
   * Handle streaming response with progress tracking
   */
  private async handleStreamResponse<T>(
    response: Response,
    onProgress: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    let loaded = 0;

    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0) {
          const progress = (loaded / total) * 100;
          onProgress(progress);
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Combine chunks and parse JSON
    const concatenated = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      concatenated.set(chunk, offset);
      offset += chunk.length;
    }

    const text = new TextDecoder().decode(concatenated);
    const result = JSON.parse(text);

    return {
      data: result.data || result,
      success: true,
      message: result.message,
      errors: result.errors,
    };
  }

  /**
   * Estimate FormData size for progress tracking
   */
  private estimateFormDataSize(formData: FormData): number {
    let size = 0;
    // Use Array.from to handle FormData iteration compatibility
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value instanceof File) {
        size += value.size;
      } else {
        size += new Blob([String(value)]).size;
      }
      size += new Blob([key]).size;
    });
    return size;
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convenience methods for common HTTP operations
   */
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    options?: ApiRequestOptions & {
      fieldName?: string;
      additionalFields?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const { fieldName = 'file', additionalFields = {}, ...requestOptions } = options || {};
    
    const formData = new FormData();
    formData.append(fieldName, file);
    
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.request<T>(endpoint, {
      ...requestOptions,
      method: 'POST',
      body: formData,
      headers: {
        ...requestOptions.headers,
        // Remove Content-Type to let browser set boundary for multipart/form-data
      },
    });
  }

  /**
   * Batch multiple requests with optional concurrency control
   */
  async batch<T>(
    requests: Array<{ endpoint: string; options?: ApiRequestOptions }>,
    options: { concurrency?: number; loadingKey?: string } = {}
  ): Promise<Array<ApiResponse<T> | Error>> {
    const { concurrency = 5, loadingKey = 'batch' } = options;
    
    this.setLoading(loadingKey, true);
    
    try {
      const results: Array<ApiResponse<T> | Error> = [];
      
      for (let i = 0; i < requests.length; i += concurrency) {
        const batch = requests.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(
          batch.map(({ endpoint, options }) =>
            this.request<T>(endpoint, { ...options, loadingKey: `${loadingKey}-${endpoint}` })
          )
        );
        
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : result.reason
        ));
      }
      
      return results;
    } finally {
      this.setLoading(loadingKey, false);
    }
  }
}

// Create and export default instance
const enhancedApi = new EnhancedApiService();
export default enhancedApi;