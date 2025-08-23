import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { getTenantIdFromToken } from '../utils/jwtUtils';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface TenantContextType {
  tenantId: string | null; // Can be null for system-wide users
  tenant: Tenant | null;
  setTenantId: (tenantId: string | null) => void;
  availableTenants: Tenant[];
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
  
  // Mock available tenants - in real app, this would come from an API
  const availableTenants: Tenant[] = useMemo(() => [
    { id: 'd7b7e673-6788-45b2-8dad-4d48944a144e', name: 'Grand Plaza Hotel', subdomain: 'grandplaza' },
    { id: 'ed55191d-36e0-4cd4-8b53-0aa6306b802b', name: 'The Maritime Grand Hotel', subdomain: 'maritimegrand' },
    { id: 'f60a5bc4-7c91-11f0-8a72-6abc1ea96c43', name: 'Downtown Business Hotel', subdomain: 'downtown' },
    { id: 'f60a5c04-7c91-11f0-8a72-6abc1ea96c43', name: 'Seaside Resort', subdomain: 'seaside' },
    { id: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6', name: 'Luxury Hotel Group', subdomain: 'luxury' },
  ], []);

  const setTenantId = useCallback((newTenantId: string | null) => {
    setTenantIdState(newTenantId);
    if (newTenantId) {
      const foundTenant = availableTenants.find(t => t.id === newTenantId);
      setTenant(foundTenant || null);
    } else {
      // System-wide user - no tenant context
      setTenant(null);
    }
  }, [availableTenants]);

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
    const savedToken = localStorage.getItem('auth_token');
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
    availableTenants,
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
