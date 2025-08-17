import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hotelApiService } from '../services/hotelApi';
import { adminApiService } from '../services/adminApi';

/**
 * Hook to automatically set the authentication token in API services
 * when the auth context changes
 */
export const useAuthenticatedApi = () => {
  const { token } = useAuth();

  useEffect(() => {
    // Update the token in the API services whenever it changes
    hotelApiService.setToken(token);
    adminApiService.setToken(token);
  }, [token]);

  return { hotelApiService, adminApiService };
};
