import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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

  // Load authentication state from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        console.log('Restored auth state from localStorage');
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } else {
      // For development/testing: auto-login as hotel admin
      const devToken = "eyJhbGciOiJIUzUxMiJ9.eyJmaXJzdE5hbWUiOiJTYXJhaCIsImxhc3ROYW1lIjoiV2lsc29uIiwicm9sZXMiOlsiSE9URUxfQURNSU4iXSwidGVuYW50SWQiOiJkZWZhdWx0IiwidXNlcklkIjo5LCJlbWFpbCI6ImhvdGVsYWRtaW5AYm9va215aG90ZWwuY29tIiwic3ViIjoiaG90ZWxhZG1pbkBib29rbXlob3RlbC5jb20iLCJpYXQiOjE3NTU0NzMzOTUsImV4cCI6MTc1NTU1OTc5NX0.cdZOeZlEFBijavweCpnYZ4npvn7Zlxoqc8W-jbA8f8oPdh_lKi3H9f-QQ_4YUOBODhXSIc8c35mrMVxMW796NA";
      const devUser: User = {
        id: "9",
        email: "hoteladmin@bookmyhotel.com",
        firstName: "Sarah",
        lastName: "Wilson",
        phone: "",
        role: "HOTEL_ADMIN",
        roles: ["HOTEL_ADMIN"],
        hotelId: "1",
        hotelName: "Grand Plaza Hotel",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      
      setToken(devToken);
      setUser(devUser);
      localStorage.setItem('auth_token', devToken);
      localStorage.setItem('auth_user', JSON.stringify(devUser));
      console.log('Auto-logged in as hotel admin for development');
    }
  }, []);

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
      
      // Persist to localStorage
      localStorage.setItem('auth_token', loginData.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
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
