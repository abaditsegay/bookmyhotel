package com.bookmyhotel.tenant;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

/**
 * Resolves tenant from request (subdomain or header)
 */
@Service
public class TenantResolver {
    
    private static final String TENANT_HEADER = "X-Tenant-Id";
    
    /**
     * Resolve tenant from subdomain or header
     * Priority: Header > Subdomain
     */
    public String resolveTenant(HttpServletRequest request) {
        // First try header
        String tenantFromHeader = request.getHeader(TENANT_HEADER);
        if (tenantFromHeader != null && !tenantFromHeader.trim().isEmpty()) {
            return tenantFromHeader.trim();
        }
        
        // Then try subdomain
        String serverName = request.getServerName();
        if (serverName != null && serverName.contains(".")) {
            String[] parts = serverName.split("\\.");
            if (parts.length > 2) {
                // Extract subdomain (assuming format: subdomain.domain.com)
                return parts[0];
            }
        }
        
        // Default tenant for development
        return "default";
    }
}
