import React, { createContext, useContext, ReactNode, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_MANAGER' | 'FRONTDESK' | 'HOUSEKEEPING' | 'GUEST';
  roles: string[]; // Support multiple roles
  hotelId?: string;
  hotelName?: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
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
        hotelId: loginData.hotelId?.toString(),
        hotelName: loginData.hotelName,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      setUser(user);
      setToken(loginData.token);
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
    // Clear any stored tokens, etc.
    console.log('User logged out');
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // In a real application, this would make an API call to update the user profile
      console.log('Updating profile with:', updates);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user state with the new information
      if (user) {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
      }
      
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    token,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
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
