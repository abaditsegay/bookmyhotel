const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  description?: string;
  isActive: boolean;
}

class TenantApiService {
  /**
   * Get current user's tenant information
   * This endpoint should be accessible to any authenticated user
   */
  async getCurrentTenant(token: string): Promise<{ success: boolean; data?: TenantInfo; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tenant/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('Error fetching current tenant:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to fetch tenant information',
      };
    }
  }

  /**
   * Get tenant by ID - for system admins
   */
  async getTenantById(tenantId: string, token: string): Promise<{ success: boolean; data?: TenantInfo; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/system/tenants/${tenantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('Error fetching tenant by ID:', error);
      
      return {
        success: false,
        message: error.message || 'Failed to fetch tenant information',
      };
    }
  }
}

export const tenantApiService = new TenantApiService();
