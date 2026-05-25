package com.bookmyhotel.tenant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

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

        String authenticatedTenantId = resolveAuthenticatedTenantId();
        if (authenticatedTenantId != null) {
            validateIdentifierMatchesAuthenticatedTenant(request.getHeader(TENANT_HEADER), authenticatedTenantId);
            validateIdentifierMatchesAuthenticatedTenant(extractSubdomainIdentifier(request), authenticatedTenantId);
            return authenticatedTenantId;
        }

        // Then try header
        String tenantFromHeader = request.getHeader(TENANT_HEADER);
        if (tenantFromHeader != null && !tenantFromHeader.trim().isEmpty()) {
            return resolveKnownTenantId(tenantFromHeader.trim());
        }

        // Then try subdomain
        String subdomainIdentifier = extractSubdomainIdentifier(request);
        if (subdomainIdentifier != null) {
            return resolveKnownTenantId(subdomainIdentifier);
        }

        return null;
    }

    private String resolveAuthenticatedTenantId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            String username = authentication.getName();
            if (username != null && !username.isBlank()) {
                return userRepository.findByEmailWithHotel(username)
                        .map(user -> user.getTenantId())
                        .filter(tenantId -> tenantId != null && !tenantId.isBlank())
                        .flatMap(tenantService::findActiveTenantByIdentifier)
                        .map(Tenant::getTenantId)
                        .orElse(null);
            }
        }

        return null;
    }

    private void validateIdentifierMatchesAuthenticatedTenant(String identifier, String authenticatedTenantId) {
        if (identifier == null || identifier.isBlank()) {
            return;
        }

        String resolvedTenantId = resolveKnownTenantId(identifier.trim());
        if (!authenticatedTenantId.equals(resolvedTenantId)) {
            throw new IllegalStateException("Tenant identifier does not match authenticated user context");
        }
    }

    private String extractSubdomainIdentifier(HttpServletRequest request) {
        String serverName = request.getServerName();
        if (serverName != null && serverName.contains(".")) {
            String[] parts = serverName.split("\\.");
            if (parts.length > 2) {
                return parts[0];
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
