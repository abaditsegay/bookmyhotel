import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { hotelApiService } from '../services/hotelApi';
import { adminApiService } from '../services/adminApi';

/**
 * Hook to automatically set the authentication token in API services
 * when the auth context changes. Also handles system-wide vs tenant-bound contexts.
 */
export const useAuthenticatedApi = () => {
  const { token, user } = useAuth();
  const { tenantId, isSystemWideContext } = useTenant();

  useEffect(() => {
    // Update the token in the API services whenever it changes
    hotelApiService.setToken(token);
    adminApiService.setToken(token);
    
    if (!token || !user) {
      // Anonymous user
      console.log('👤 Anonymous user - API configured for public access');
    } else if (user?.isSystemWide || isSystemWideContext) {
      // System-wide authenticated user
      console.log('🌐 System-wide user detected - API configured for global access');
    } else if (tenantId) {
      // Tenant-bound authenticated user
      console.log('🏢 Tenant-bound user - API configured for tenant:', tenantId);
    } else {
      // Authenticated user but no tenant context
      console.log('⚠️ Authenticated user but no tenant context available');
    }
    
    // frontDeskApiService doesn't have a setToken method - it uses token as parameter
  }, [token, user, tenantId, isSystemWideContext]);

  return { 
    hotelApiService, 
    adminApiService,
    isSystemWideUser: user?.isSystemWide || false,
    tenantId
  };
};
