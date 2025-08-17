import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface TenantContextType {
  tenantId: string;
  tenant: Tenant | null;
  setTenantId: (tenantId: string) => void;
  availableTenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string>('default');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  
  // Mock available tenants - in real app, this would come from an API
  const availableTenants: Tenant[] = useMemo(() => [
    { id: 'default', name: 'Default Tenant', subdomain: 'default' },
    { id: 'hotel-chain-1', name: 'Luxury Hotels Inc.', subdomain: 'luxury' },
    { id: 'hotel-chain-2', name: 'Budget Stay Corp.', subdomain: 'budget' },
  ], []);

  const setTenantId = (newTenantId: string) => {
    setTenantIdState(newTenantId);
    const foundTenant = availableTenants.find(t => t.id === newTenantId);
    setTenant(foundTenant || null);
  };

  // Initialize tenant on mount
  useEffect(() => {
    // In a real app, you'd detect tenant from subdomain or header
    const currentTenant = availableTenants.find(t => t.id === tenantId);
    setTenant(currentTenant || null);
  }, [tenantId, availableTenants]);

  const value: TenantContextType = {
    tenantId,
    tenant,
    setTenantId,
    availableTenants,
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
