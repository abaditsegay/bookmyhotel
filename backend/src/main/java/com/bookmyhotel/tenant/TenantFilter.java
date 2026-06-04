package com.bookmyhotel.tenant;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Manages Hibernate tenant filters with support for system-wide users
 */
@Component
public class TenantFilter {

    private static final Logger logger = LoggerFactory.getLogger(TenantFilter.class);

    @PersistenceContext
    private EntityManager entityManager;

    public static final String TENANT_FILTER_NAME = "tenantFilter";
    public static final String TENANT_PARAMETER_NAME = "tenantId";

    /** Tracks whether the filter was actually enabled for the current request thread. */
    private static final ThreadLocal<Boolean> filterEnabled = ThreadLocal.withInitial(() -> false);

    /**
     * Enable tenant filter for current session
     * System-wide users (GUEST/ADMIN) bypass tenant filtering
     * 
     * NOTE: With the new hotel-scoped architecture, entities extend
     * HotelScopedEntity
     * and use @ManyToOne Hotel relationships instead of Hibernate filters.
     * This method now gracefully handles the absence of filter definitions.
     */
    public void enableFilter() {
        if (isCurrentUserSystemWide()) {
            logger.debug("🌐 System-wide user detected - bypassing tenant filter");
            return;
        }

        String tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter(TENANT_FILTER_NAME)
                    .setParameter(TENANT_PARAMETER_NAME, tenantId);
            filterEnabled.set(true);
            logger.debug("🏢 Tenant filter enabled for tenant: {}", tenantId);
        }
    }

    public void disableFilter() {
        if (Boolean.TRUE.equals(filterEnabled.get())) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter(TENANT_FILTER_NAME);
        }
        filterEnabled.remove();
    }

    /**
     * Check if the current authenticated user is system-wide.
     * Uses the already-loaded principal instead of issuing a DB query on every request.
     */
    private boolean isCurrentUserSystemWide() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() &&
                    !authentication.getPrincipal().equals("anonymousUser")) {

                Object principal = authentication.getPrincipal();
                if (principal instanceof User) {
                    return ((User) principal).isSystemWideUser();
                }
            }
        } catch (Exception e) {
            logger.warn("Error checking if user is system-wide: {}", e.getMessage());
        }

        return false;
    }
}
