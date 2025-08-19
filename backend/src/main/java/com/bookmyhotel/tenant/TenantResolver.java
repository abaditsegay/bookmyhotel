package com.bookmyhotel.tenant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.service.TenantService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Resolves tenant from request (subdomain or header) and creates tenants with
 * GUIDs
 */
@Service
public class TenantResolver {

    private static final String TENANT_HEADER = "X-Tenant-Id";

    @Autowired
    private TenantService tenantService;

    /**
     * Resolve tenant from JWT (if already set), header, subdomain, or default
     * Priority: JWT (already in context) > Header > Subdomain > Default
     */
    public String resolveTenant(HttpServletRequest request) {
        // First check if tenant is already set from JWT authentication
        String existingTenantId = TenantContext.getTenantId();
        System.out.println("DEBUG: TenantResolver - Existing tenant ID from context: " + existingTenantId);
        if (existingTenantId != null && !existingTenantId.trim().isEmpty()) {
            System.out.println("DEBUG: TenantResolver - Using existing tenant ID: " + existingTenantId);
            return existingTenantId;
        }

        String tenantIdentifier = null;

        // Then try header
        String tenantFromHeader = request.getHeader(TENANT_HEADER);
        if (tenantFromHeader != null && !tenantFromHeader.trim().isEmpty()) {
            tenantIdentifier = tenantFromHeader.trim();
        } else {
            // Then try subdomain
            String serverName = request.getServerName();
            if (serverName != null && serverName.contains(".")) {
                String[] parts = serverName.split("\\.");
                if (parts.length > 2) {
                    // Extract subdomain (assuming format: subdomain.domain.com)
                    tenantIdentifier = parts[0];
                } else {
                    // Default tenant identifier for development
                    tenantIdentifier = "development";
                }
            } else {
                // Default tenant identifier for localhost/development
                tenantIdentifier = "development";
            }
        }

        // Get or create tenant with GUID
        try {
            Tenant tenant = tenantService.getOrCreateTenant(tenantIdentifier);
            return tenant.getTenantId(); // Return the GUID-based tenant ID
        } catch (Exception e) {
            // Fallback to identifier if tenant service fails
            return tenantIdentifier;
        }
    }
}
