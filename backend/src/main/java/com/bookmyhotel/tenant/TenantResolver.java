package com.bookmyhotel.tenant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.service.TenantService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Resolves tenant from request using known tenant identifiers only.
 */
@Service
public class TenantResolver {

    private static final String TENANT_HEADER = "X-Tenant-Id";

    @Autowired
    private TenantService tenantService;

    /**
     * Resolve tenant from JWT (if already set), header, or subdomain.
     *
     * Public endpoints may legitimately run without a tenant. All other routes
     * should reject missing tenant context in the interceptor.
     */
    public String resolveTenant(HttpServletRequest request) {
        // First check if tenant is already set from JWT authentication
        String existingTenantId = TenantContext.getTenantId();
        if (existingTenantId != null && !existingTenantId.trim().isEmpty()) {
            return existingTenantId;
        }

        // Then try header
        String tenantFromHeader = request.getHeader(TENANT_HEADER);
        if (tenantFromHeader != null && !tenantFromHeader.trim().isEmpty()) {
            return resolveKnownTenantId(tenantFromHeader.trim());
        }

        // Then try subdomain
        String serverName = request.getServerName();
        if (serverName != null && serverName.contains(".")) {
            String[] parts = serverName.split("\\.");
            if (parts.length > 2) {
                return resolveKnownTenantId(parts[0]);
            }
        }

        return null;
    }

    private String resolveKnownTenantId(String identifier) {
        Tenant tenant = tenantService.findActiveTenantByIdentifier(identifier)
                .orElseThrow(() -> new IllegalStateException("Unknown or inactive tenant identifier: " + identifier));
        return tenant.getTenantId();
    }
}
