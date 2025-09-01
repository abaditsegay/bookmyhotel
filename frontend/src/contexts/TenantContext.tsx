import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { getTenantIdFromToken } from '../utils/jwtUtils';
import TokenManager from '../utils/tokenManager';

/**
 * TenantContext - Manages tenant information for multi-tenant application
 * 
 * Architecture:
 * - Tenants are top-level organizations (e.g., hotel chains)
 * - Users belong to specific tenants (extracted from JWT token)
 * - System admins can be tenant-less (system-wide access)
 * 
 * The context extracts tenantId from JWT tokens and creates a basic tenant object.
 * Detailed tenant information (name, settings) can be fetched via API when needed.
 * 
 * This approach eliminates the need for hardcoded tenant lists while maintaining
 * proper tenant isolation and validation.
 */

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface TenantContextType {
  tenantId: string | null; // Can be null for system-wide users
  tenant: Tenant | null;
  setTenantId: (tenantId: string | null) => void;
  updateTenantFromToken: (token: string) => void;
  clearTenant: () => void; // Add method to clear tenant context
  isSystemWideContext: boolean; // True when no tenant is set (system-wide user)
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(null); // Start with null for anonymous users
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  const setTenantId = useCallback((newTenantId: string | null) => {
    setTenantIdState(newTenantId);
    if (newTenantId) {
      // Create a tenant object with the available information
      // In a production app, you might want to fetch additional tenant details from an API
      // but for validation purposes, having the tenantId is sufficient
      setTenant({
        id: newTenantId,
        name: `Tenant ${newTenantId.substring(0, 8)}...`, // Fallback display name
        subdomain: 'current' // Placeholder - would come from API if needed
      });
    } else {
      // System-wide user - no tenant context
      setTenant(null);
    }
  }, []);

  const updateTenantFromToken = useCallback((token: string) => {
    const extractedTenantId = getTenantIdFromToken(token);
    console.log('Extracted tenant ID from JWT:', extractedTenantId);
    
    // For system-wide users, extractedTenantId will be null
    setTenantId(extractedTenantId);
    
    if (extractedTenantId === null) {
      console.log('System-wide user detected - no tenant context');
    }
  }, [setTenantId]);

  const clearTenant = useCallback(() => {
    console.log('Clearing tenant context on logout');
    setTenantId(null);
  }, [setTenantId]);

  // Initialize tenant on mount
  useEffect(() => {
    // Check if there's a saved token in localStorage and extract tenant from it
    const savedToken = TokenManager.getToken();
    if (savedToken) {
      const extractedTenantId = getTenantIdFromToken(savedToken);
      console.log('Extracted tenant ID from JWT during initialization:', extractedTenantId);
      setTenantId(extractedTenantId); // This can be null for system-wide users
    }
  }, [setTenantId]);

  const value: TenantContextType = {
    tenantId,
    tenant,
    setTenantId,
    updateTenantFromToken,
    clearTenant,
    isSystemWideContext: tenantId === null,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
