import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { updateUserProfile, changeUserPassword } from '../services/userApi';
import TokenManager, { type AuthUser } from '../utils/tokenManager';

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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
  onTokenChange?: (token: string) => void;
  clearError: () => void;
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

  const clearError = () => setError(null);

  // Load authentication state from localStorage on startup
  useEffect(() => {
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
  }, [onTokenChange]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with:', email, password);
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed:', errorText);
        setError(errorText);
        return false;
      }

      const loginData = await response.json();
      console.log('Login successful:', loginData);

      // Map backend response to frontend User interface
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

      setUser(user);
      setToken(loginData.token);
      
      // Persist to localStorage using TokenManager
      TokenManager.setAuth(loginData.token, user as AuthUser);
      
      // Notify parent component of token change
      onTokenChange?.(loginData.token);
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage using TokenManager
    TokenManager.clearAuth();
    
    // Clear tenant context
    onLogout?.();
    
    console.log('User logged out');
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
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    onTokenChange,
    clearError,
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
