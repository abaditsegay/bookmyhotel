import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { updateUserProfile, changeUserPassword } from '../services/userApi';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_MANAGER' | 'FRONTDESK' | 'HOUSEKEEPING' | 'OPERATIONS_SUPERVISOR' | 'MAINTENANCE' | 'CUSTOMER' | 'GUEST';
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
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        console.log('Restored auth state from localStorage');
        
        // Notify parent component of token change
        onTokenChange?.(savedToken);
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
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
        isSystemWide: !loginData.tenantId, // true if tenantId is null/undefined
        isTenantBound: !!loginData.tenantId, // true if tenantId exists
      };

      setUser(user);
      setToken(loginData.token);
      
      // Persist to localStorage
      localStorage.setItem('auth_token', loginData.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
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
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
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
        
        // Update localStorage
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        
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
