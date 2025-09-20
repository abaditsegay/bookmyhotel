import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { API_CONFIG } from '../config/apiConfig';
import { updateUserProfile, changeUserPassword } from '../services/userApi';
import TokenManager, { type AuthUser } from '../utils/tokenManager';
import { apiClient } from '../utils/apiClient';
import { offlineStorage, type StaffSession } from '../services/OfflineStorageService';
import { roomCacheService } from '../services/RoomCacheService';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_MANAGER' | 'FRONTDESK' | 'HOUSEKEEPING' | 'OPERATIONS_SUPERVISOR' | 'MAINTENANCE' | 'CUSTOMER' | 'GUEST' | 'SYSTEM_ADMIN';
  roles: string[]; // Support multiple roles
  tenantId?: string | null; // null for system-wide users
  hotelId?: string;
  hotelName?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
  // Helper properties
  isSystemWide?: boolean; // true if tenantId is null
  isTenantBound?: boolean; // true if tenantId is not null
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  error: string | null;
  isInitializing: boolean; // Add to interface
  sessionExpired: boolean; // Add session expired state
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  handleSessionExpired: () => void; // Add session expiration handler
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
  onTokenChange?: (token: string) => void;
  clearError: () => void;
  clearSessionExpired: () => void; // Add method to clear session expired state
  // Helper functions for role checking
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isFrontDesk: () => boolean;
  isHotelAdmin: () => boolean;
  canAccessCheckout: () => boolean;
  canEditBookings: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onTokenChange?: (token: string) => void;
  onLogout?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onTokenChange, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true); // Add initialization state
  const [sessionExpired, setSessionExpired] = useState(false); // Add session expired state

  const clearError = () => setError(null);
  const clearSessionExpired = () => setSessionExpired(false);

  // Load authentication state from localStorage on startup
  useEffect(() => {
    // Initialize OfflineStorageService early
    const initOfflineStorage = async () => {
      try {
        console.log('🔄 AuthContext: Initializing OfflineStorageService...');
        await offlineStorage.init();
        console.log('✅ AuthContext: OfflineStorageService initialized successfully');
      } catch (error) {
        console.error('❌ AuthContext: Failed to initialize OfflineStorageService:', error);
      }
    };
    
    initOfflineStorage();
    
    // Set up API client session expiration callback
    apiClient.setSessionExpiredCallback(() => {
      console.log('Session expired - logging out user');
      setSessionExpired(true);
      setUser(null);
      setToken(null);
      setError('Your session has expired. Please log in again.');
      
      // Stop room cache periodic refresh
      roomCacheService.stopPeriodicRefresh();
      
      // Clear localStorage using TokenManager
      TokenManager.clearAuth();
      
      // Clear tenant context
      onLogout?.();
    });
    
    // Migrate any legacy tokens
    TokenManager.migrateLegacyTokens();
    
    const savedToken = TokenManager.getToken();
    const savedUser = TokenManager.getUser();
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(savedUser as User);
        console.log('Restored auth state from TokenManager');
        
        // Notify parent component of token change
        onTokenChange?.(savedToken);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        TokenManager.clearAuth();
      }
    }
    
    // Set initialization complete after checking localStorage
    setIsInitializing(false);
  }, [onTokenChange, onLogout]);

  const attemptOfflineLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔄 Mobile AuthContext: Attempting offline authentication for:', email);
      
      // Ensure OfflineStorageService is initialized
      try {
        await offlineStorage.init();
        console.log('✅ Mobile AuthContext: OfflineStorageService ready for offline login');
      } catch (initError) {
        console.error('❌ Mobile AuthContext: Failed to initialize OfflineStorageService for offline login:', initError);
        return false;
      }
      
      // Get cached staff session for offline authentication (includes inactive sessions)
      const cachedSession = await offlineStorage.getStaffSessionForOfflineAuth(email);
      if (!cachedSession) {
        console.log('❌ Mobile AuthContext: No cached session found for offline login');
        return false;
      }

      // Check if cached session matches login credentials
      if (cachedSession.email !== email) {
        console.log('❌ Mobile AuthContext: Cached session email does not match login email');
        return false;
      }

      // Validate password if hash is available
      if (cachedSession.passwordHash) {
        const isPasswordValid = offlineStorage.validatePassword(password, email, cachedSession.passwordHash);
        if (!isPasswordValid) {
          console.log('❌ Mobile AuthContext: Password validation failed for offline login');
          return false;
        }
        console.log('✅ Mobile AuthContext: Password validated successfully for offline login');
      } else {
        console.log('⚠️ Mobile AuthContext: No password hash available for validation - proceeding with email-only validation');
      }

      // Check if session is not expired
      if (new Date(cachedSession.expiresAt) <= new Date()) {
        console.log('❌ Mobile AuthContext: Cached session has expired');
        return false;
      }

      // Check if it's a hotel staff role (HOTEL_ADMIN or FRONTDESK)
      const isHotelStaff = cachedSession.roles?.some(role => 
        ['HOTEL_ADMIN', 'FRONTDESK'].includes(role)
      ) || ['HOTEL_ADMIN', 'FRONTDESK'].includes(cachedSession.role);

      if (!isHotelStaff) {
        console.log('❌ Mobile AuthContext: Cached session is not for hotel staff');
        return false;
      }

      console.log('✅ Mobile AuthContext: Offline authentication successful');
      
      // Map cached session to user format
      const offlineUser: User = {
        id: cachedSession.userId.toString(),
        email: cachedSession.email,
        firstName: cachedSession.username.split(' ')[0] || cachedSession.username,
        lastName: cachedSession.username.split(' ').slice(1).join(' ') || '',
        phone: '', // Not available in cached session
        role: cachedSession.role as User['role'],
        roles: cachedSession.roles || [cachedSession.role],
        hotelId: cachedSession.hotelId?.toString(),
        hotelName: cachedSession.hotelName,
        tenantId: cachedSession.tenantId || 'development',
        isActive: true,
        createdAt: '',
        lastLogin: cachedSession.lastActivity
      };

      // Set user state
      setUser(offlineUser);
      setToken(cachedSession.token);
      
      // Update session as active and update last activity
      cachedSession.isActive = true;
      cachedSession.lastActivity = new Date().toISOString();
      await offlineStorage.saveStaffSession(cachedSession);

      // Notify parent component of token change
      onTokenChange?.(cachedSession.token);

      console.log('🏨 Mobile AuthContext: Offline login completed for hotel staff');
      return true;

    } catch (error) {
      console.error('❌ Mobile AuthContext: Offline authentication failed:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Mobile AuthContext: Starting login process');
      console.log('Mobile AuthContext: API URL:', API_CONFIG.BASE_URL);
      console.log('Mobile AuthContext: User Agent:', navigator.userAgent);
      
      const requestBody = { email, password };
      console.log('Mobile AuthContext: Request body prepared');
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Mobile AuthContext: Response received:', response.status, response.statusText);
      console.log('Mobile AuthContext: Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mobile AuthContext: Online login failed with status:', response.status, errorText);
        
        // Attempt offline authentication for hotel staff when server responds with error
        console.log('🔄 Mobile AuthContext: Server error - attempting offline login fallback...');
        const offlineSuccess = await attemptOfflineLogin(email, password);
        
        if (offlineSuccess) {
          console.log('✅ Mobile AuthContext: Offline login successful after server error');
          return true;
        }
        
        console.error('❌ Mobile AuthContext: Both server and offline login failed');
        setError(errorText || 'Login failed');
        return false;
      }

      const loginData = await response.json();
      console.log('Mobile AuthContext: Login successful, parsing data...');
      console.log('Mobile AuthContext: Login data keys:', Object.keys(loginData));

      // Map backend response to frontend User interface
      console.log('Mobile AuthContext: Mapping user data...');
      const user: User = {
        id: loginData.id.toString(),
        email: loginData.email,
        firstName: loginData.firstName || '',
        lastName: loginData.lastName || '',
        phone: '', // Backend doesn't provide phone in login response
        role: Array.isArray(loginData.roles) ? loginData.roles[0] : loginData.roles, // Take first role if multiple
        roles: Array.isArray(loginData.roles) ? loginData.roles : [loginData.roles], // Store all roles
        tenantId: loginData.tenantId || null, // Support null for system-wide users
        hotelId: loginData.hotelId?.toString(),
        hotelName: loginData.hotelName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        // Helper properties
        isSystemWide: (loginData.tenantId === null || loginData.tenantId === undefined) && 
                      (Array.isArray(loginData.roles) ? loginData.roles : [loginData.roles])
                      .some((role: string) => ['SYSTEM_ADMIN', 'ADMIN', 'GUEST', 'CUSTOMER'].includes(role)), // true if no tenant AND has system-wide role
        isTenantBound: (loginData.tenantId !== null && loginData.tenantId !== undefined), // true if user has a tenant assignment
      };

      console.log('Mobile AuthContext: Setting user state...');
      setUser(user);
      setToken(loginData.token);
      
      // Persist to localStorage using TokenManager
      console.log('Mobile AuthContext: Persisting to localStorage...');
      try {
        TokenManager.setAuth(loginData.token, user as AuthUser);
        console.log('Mobile AuthContext: localStorage save successful');
      } catch (storageError) {
        console.error('Mobile AuthContext: localStorage save failed:', storageError);
      }
      
      // Save staff session for offline use
      console.log('Mobile AuthContext: Saving staff session for offline use...');
      try {
        // Ensure OfflineStorageService is initialized before saving session
        try {
          await offlineStorage.init(); // This will be a no-op if already initialized
          console.log('✅ Mobile AuthContext: OfflineStorageService is ready');
        } catch (initError) {
          console.error('❌ Mobile AuthContext: Failed to initialize OfflineStorageService:', initError);
          throw initError;
        }
        
        const staffSession: StaffSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: parseInt(loginData.id.toString()),
          username: `${loginData.firstName || ''} ${loginData.lastName || ''}`.trim(),
          email: loginData.email,
          role: Array.isArray(loginData.roles) ? loginData.roles[0] : loginData.roles,
          roles: Array.isArray(loginData.roles) ? loginData.roles : [loginData.roles],
          hotelId: loginData.hotelId ? parseInt(loginData.hotelId.toString()) : undefined,
          hotelName: loginData.hotelName,
          tenantId: loginData.tenantId || undefined,
          token: loginData.token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          lastActivity: new Date().toISOString(),
          isActive: true
        };
        
        console.log('🔍 Mobile AuthContext: Staff session object:', staffSession);
        await offlineStorage.saveStaffSession(staffSession, password);
        console.log('✅ Mobile AuthContext: Staff session saved successfully');
        
        // Verify session was saved
        const savedSession = await offlineStorage.getActiveStaffSession();
        console.log('🔍 Mobile AuthContext: Verification - saved session:', savedSession);
        
        // Cache room data immediately after successful login for hotel staff
        const userRoles = Array.isArray(loginData.roles) ? loginData.roles : [loginData.roles];
        const isHotelStaff = userRoles.some((role: string) => ['HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONS_SUPERVISOR'].includes(role));
        
        console.log('🔍 Mobile AuthContext: Checking room caching conditions...');
        console.log('🔍 Mobile AuthContext: loginData.hotelId:', loginData.hotelId);
        console.log('🔍 Mobile AuthContext: userRoles:', userRoles);
        console.log('🔍 Mobile AuthContext: isHotelStaff:', isHotelStaff);
        
        if (loginData.hotelId && isHotelStaff) {
          console.log('🏨 Mobile AuthContext: Triggering room data cache for hotel staff...');
          try {
            const hotelId = parseInt(loginData.hotelId.toString());
            console.log('🏨 Mobile AuthContext: Parsed hotel ID:', hotelId);
            // Start room caching in background - don't wait for it to complete
            roomCacheService.fetchAndCacheRooms(hotelId).then((cachedRooms) => {
              console.log(`✅ Mobile AuthContext: Successfully cached ${cachedRooms.length} rooms for hotel ${hotelId}`);
              // Start periodic refresh for cached rooms
              roomCacheService.startPeriodicRefresh(hotelId);
            }).catch((cacheError) => {
              console.warn('⚠️ Mobile AuthContext: Room caching failed, but login continues:', cacheError);
              console.error('⚠️ Mobile AuthContext: Room caching error details:', cacheError);
            });
          } catch (cacheError) {
            console.warn('⚠️ Mobile AuthContext: Failed to start room caching:', cacheError);
          }
        } else {
          console.log('❌ Mobile AuthContext: Room caching skipped - conditions not met');
          console.log('❌ Mobile AuthContext: hotelId exists:', !!loginData.hotelId);
          console.log('❌ Mobile AuthContext: isHotelStaff:', isHotelStaff);
        }
      } catch (sessionError) {
        console.error('❌ Mobile AuthContext: Failed to save staff session:', sessionError);
        console.error('❌ Mobile AuthContext: Session error stack:', sessionError instanceof Error ? sessionError.stack : 'No stack');
        // Don't fail login if offline storage fails
      }
      
      // Notify parent component of token change
      console.log('Mobile AuthContext: Notifying token change...');
      onTokenChange?.(loginData.token);
      
      console.log('Mobile AuthContext: Login process completed successfully');
      return true;
    } catch (error) {
      console.error('Mobile AuthContext: Online login failed with error:', error);
      console.error('Mobile AuthContext: Error stack:', (error as Error).stack);
      
      // Attempt offline authentication for hotel staff
      console.log('🔄 Mobile AuthContext: Attempting offline login fallback...');
      const offlineSuccess = await attemptOfflineLogin(email, password);
      
      if (offlineSuccess) {
        console.log('✅ Mobile AuthContext: Offline login successful');
        return true;
      }
      
      console.error('❌ Mobile AuthContext: Both online and offline login failed');
      setError((error as Error).message || 'Login failed - no network connection and no cached credentials');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSessionExpired(false); // Clear session expired state on manual logout
    
    // Stop room cache periodic refresh
    roomCacheService.stopPeriodicRefresh();
    
    // Deactivate staff sessions (preserve for offline authentication)
    offlineStorage.deactivateStaffSessions().catch(error => {
      console.error('Failed to deactivate staff sessions:', error);
    });
    
    // Clear localStorage using TokenManager
    TokenManager.clearAuth();
    
    // Clear tenant context
    onLogout?.();
    
    console.log('User logged out');
  };

  const handleSessionExpired = () => {
    console.log('Session expired - logging out user');
    setSessionExpired(true);
    setUser(null);
    setToken(null);
    setError('Your session has expired. Please log in again.');
    
    // Stop room cache periodic refresh
    roomCacheService.stopPeriodicRefresh();
    
    // Clear localStorage using TokenManager
    TokenManager.clearAuth();
    
    // Clear tenant context
    onLogout?.();
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user || !token) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call the API to update profile
      const result = await updateUserProfile(user.id, updates, token);
      
      if (result.success) {
        // Update the user state with the new information
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        
        // Update localStorage using TokenManager
        TokenManager.setAuth(token, updatedUser as AuthUser);
        
        return true;
      } else {
        setError(result.message || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setError('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user || !token) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call the API to change password
      const result = await changeUserPassword(user.id, { currentPassword, newPassword }, token);
      
      if (result.success) {
        return true;
      } else {
        setError(result.message || 'Failed to change password');
        return false;
      }
    } catch (error) {
      console.error('Password change failed:', error);
      setError('Failed to change password. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for role checking
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : (user.role ? [user.role] : []);
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : (user.role ? [user.role] : []);
    return roles.some(role => userRoles.includes(role));
  };

  const isFrontDesk = (): boolean => {
    return hasRole('FRONTDESK');
  };

  const isHotelAdmin = (): boolean => {
    return hasRole('HOTEL_ADMIN');
  };

  const canAccessCheckout = (): boolean => {
    return hasAnyRole(['FRONTDESK', 'HOTEL_ADMIN', 'ADMIN']);
  };

  const canEditBookings = (): boolean => {
    return hasAnyRole(['FRONTDESK', 'HOTEL_ADMIN', 'ADMIN']);
  };

  const value: AuthContextType = {
    user,
    loading,
    token,
    error,
    isInitializing,
    sessionExpired,
    login,
    logout,
    handleSessionExpired,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    onTokenChange,
    clearError,
    clearSessionExpired,
    hasRole,
    hasAnyRole,
    isFrontDesk,
    isHotelAdmin,
    canAccessCheckout,
    canEditBookings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
