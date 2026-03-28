/**
 * Error handling utilities for API errors
 * Provides consistent user-friendly error messages across the application
 */

/**
 * Extract user-friendly error message from any error type
 * Handles HTML error responses, network errors, and API errors
 */
export function getErrorMessage(error: any, fallbackMessage = 'An unexpected error occurred. Please try again.'): string {
  if (!error) {
    return fallbackMessage;
  }

  // Handle our custom service/network errors from axios interceptor
  if (error.isServiceError || error.isNetworkError) {
    return error.message;
  }

  if (typeof Response !== 'undefined' && error instanceof Response) {
    return getErrorMessage({ response: { status: error.status, headers: { 'content-type': error.headers.get('content-type') || '' } } }, fallbackMessage);
  }

  // Handle axios error with response
  if (error.response) {
    const status = error.response.status;
    
    // Check if response is HTML (backend down scenarios)
    const contentType = error.response.headers?.['content-type'];
    if (contentType && contentType.includes('text/html')) {
      switch (status) {
        case 502:
          return 'Server is currently unavailable. Our team has been notified and is working to resolve this issue.';
        case 503:
          return 'Server is under maintenance. Please try again shortly.';
        case 504:
          return 'Server request timeout. Please check your connection and try again.';
        default:
          return 'Service temporarily unavailable. Please try again in a few moments.';
      }
    }

    // Handle JSON error responses
    if (error.response.data) {
      // Try to extract message from various API response formats
      const data = error.response.data;
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.join(', ');
      }
    }

    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. Please check your input and try again.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Our service is temporarily unavailable. Please try again shortly.';
      default:
        return status >= 500
          ? 'Our service is temporarily unavailable. Please try again shortly.'
          : fallbackMessage;
    }
  }

  // Handle network errors (no response)
  if (error.request && !error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection and try again.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }
    return 'Unable to connect to server. Please check your internet connection.';
  }

  // Handle Error objects
  if (error instanceof Error) {
    const normalizedMessage = error.message.toLowerCase();

    if (
      normalizedMessage.includes('failed to fetch') ||
      normalizedMessage.includes('networkerror') ||
      normalizedMessage.includes('load failed') ||
      normalizedMessage.includes('network request failed')
    ) {
      return 'Unable to reach the server. Please check your internet connection or try again in a moment.';
    }

    if (normalizedMessage.includes('timeout')) {
      return 'The request took too long. Please try again.';
    }

    // Don't show generic JS error messages to users
    if (error.message.includes('JSON')) {
      return 'Server returned an invalid response. Please try again.';
    }

    if (error.message.startsWith('HTTP ')) {
      return fallbackMessage;
    }

    return error.message || fallbackMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (/^http\s+\d+/i.test(error)) {
      return fallbackMessage;
    }

    if (error.toLowerCase().includes('failed to fetch')) {
      return 'Unable to reach the server. Please check your internet connection or try again in a moment.';
    }

    return error;
  }

  // Default fallback
  return fallbackMessage;
}

/**
 * Check if error indicates backend is down
 */
export function isBackendDownError(error: any): boolean {
  if (error.isServiceError) return true;
  
  const status = error.response?.status;
  if (status === 502 || status === 503 || status === 504) return true;
  
  const contentType = error.response?.headers?.['content-type'];
  if (contentType && contentType.includes('text/html') && status >= 500) return true;
  
  return false;
}

/**
 * Check if error is a network/connectivity issue
 */
export function isNetworkError(error: any): boolean {
  if (error.isNetworkError) return true;
  if (error.code === 'ERR_NETWORK') return true;
  if (error.code === 'ECONNABORTED') return true;
  if (error.request && !error.response) return true;
  return false;
}

/**
 * Get appropriate alert severity based on error type
 */
export function getErrorSeverity(error: any): 'error' | 'warning' | 'info' {
  if (isBackendDownError(error)) return 'warning';
  if (isNetworkError(error)) return 'warning';
  return 'error';
}

export function getErrorTitle(error: any): string | undefined {
  if (isBackendDownError(error)) {
    return 'Service temporarily unavailable';
  }

  if (isNetworkError(error)) {
    return 'Connection issue';
  }

  if (error?.response?.status === 401) {
    return 'Authentication required';
  }

  if (error?.response?.status === 403) {
    return 'Access denied';
  }

  return undefined;
}

export async function createErrorFromResponse(response: Response, fallbackMessage: string): Promise<Error> {
  const contentType = response.headers.get('content-type') || '';
  let message = getErrorMessage({ response: { status: response.status, headers: { 'content-type': contentType } } }, fallbackMessage);

  try {
    if (contentType.includes('application/json')) {
      const data = await response.json();
      message = getErrorMessage({ response: { status: response.status, headers: { 'content-type': contentType }, data } }, fallbackMessage);
    } else {
      const text = await response.text();
      if (text && !text.trim().startsWith('<')) {
        message = getErrorMessage(text, fallbackMessage);
      }
    }
  } catch {
    message = getErrorMessage({ response: { status: response.status, headers: { 'content-type': contentType } } }, fallbackMessage);
  }

  const error = new Error(message);
  (error as Error & { status?: number; isServiceError?: boolean }).status = response.status;
  if (response.status >= 500) {
    (error as Error & { isServiceError?: boolean }).isServiceError = true;
  }
  return error;
}
