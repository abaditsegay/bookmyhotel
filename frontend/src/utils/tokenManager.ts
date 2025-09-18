/**
 * Centralized token management utility
 * Single source of truth for authentication tokens and user data
 */

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  roles: string[];
  tenantId?: string | null;
  hotelId?: string;
  hotelName?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  isSystemWide?: boolean;
  isTenantBound?: boolean;
}

class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'auth_user';
  private static readonly LEGACY_TOKEN_KEY = 'token'; // For cleanup

  /**
   * Get the current authentication token
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the current user data
   */
  static getUser(): AuthUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      this.clearUser(); // Clear corrupted data
      return null;
    }
  }

  /**
   * Set authentication token and user data
   */
  static setAuth(token: string, user: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Clean up legacy token storage
    this.clearLegacyTokens();
  }

  /**
   * Update user data only (keep token unchanged)
   */
  static updateUser(user: AuthUser): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all authentication data
   */
  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.clearLegacyTokens();
  }

  /**
   * Clear the user data only (keep token)
   */
  static clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!(this.getToken() && this.getUser());
  }

  /**
   * Get headers for authenticated API requests
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      return now >= exp;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true;
    }
  }

  /**
   * Check if token needs refresh (within 5 minutes of expiry)
   */
  static shouldRefreshToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const refreshThreshold = 5 * 60 * 1000; // 5 minutes
      
      // Refresh if token expires within the threshold
      return (exp - now) <= refreshThreshold;
    } catch (error) {
      console.error('Failed to decode token for refresh check:', error);
      return false;
    }
  }

  /**
   * Refresh the authentication token
   */
  static async refreshToken(): Promise<boolean> {
    const currentToken = this.getToken();
    if (!currentToken) {
      console.warn('No token available for refresh');
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          // Update only the token, keep existing user data
          localStorage.setItem(this.TOKEN_KEY, data.token);
          console.log('Token refreshed successfully');
          return true;
        }
      } else {
        console.error('Token refresh failed:', response.status);
        // If refresh fails, clear auth data
        this.clearAuth();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear auth data
      this.clearAuth();
    }

    return false;
  }

  /**
   * Validate token and refresh if needed
   * Returns true if token is valid or successfully refreshed
   */
  static async validateAndRefreshToken(): Promise<boolean> {
    if (this.isTokenExpired()) {
      console.log('Token is expired, clearing auth');
      this.clearAuth();
      return false;
    }

    if (this.shouldRefreshToken()) {
      console.log('Token needs refresh, attempting refresh');
      return await this.refreshToken();
    }

    return true; // Token is valid and doesn't need refresh
  }  /**
   * Clean up legacy token keys that may exist from old implementations
   */
  private static clearLegacyTokens(): void {
    // Remove old token keys that might be causing conflicts
    localStorage.removeItem(this.LEGACY_TOKEN_KEY);
    localStorage.removeItem('authToken');
  }

  /**
   * Migration helper: Move data from legacy keys to standard keys
   */
  static migrateLegacyTokens(): void {
    // Check for legacy token storage and migrate
    const legacyToken = localStorage.getItem(this.LEGACY_TOKEN_KEY);
    const currentToken = this.getToken();
    
    if (legacyToken && !currentToken) {
      console.log('Migrating legacy token to standard storage');
      localStorage.setItem(this.TOKEN_KEY, legacyToken);
    }
    
    // Clean up after migration
    this.clearLegacyTokens();
  }

  /**
   * Debug helper: Log current token state
   */
  static debugTokenState(): void {
    console.log('🔍 Token Manager Debug:');
    console.log('- auth_token:', !!this.getToken());
    console.log('- auth_user:', !!this.getUser());
    console.log('- legacy token:', !!localStorage.getItem(this.LEGACY_TOKEN_KEY));
    console.log('- authToken:', !!localStorage.getItem('authToken'));
    
    const user = this.getUser();
    if (user) {
      console.log('- User email:', user.email);
      console.log('- Hotel ID:', user.hotelId);
      console.log('- Tenant ID:', user.tenantId);
    }
  }
}

export default TokenManager;
