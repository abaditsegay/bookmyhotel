package com.bookmyhotel.tenant;

import org.hibernate.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.UserRepository;

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

    @Autowired
    private UserRepository userRepository;

    public static final String TENANT_FILTER_NAME = "tenantFilter";
    public static final String TENANT_PARAMETER_NAME = "tenantId";

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
        // Check if current user is system-wide
        if (isCurrentUserSystemWide()) {
            logger.debug("🌐 System-wide user detected - bypassing tenant filter");
            return;
        }

        String tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            try {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter(TENANT_FILTER_NAME)
                        .setParameter(TENANT_PARAMETER_NAME, tenantId);
                logger.debug("🏢 Tenant filter enabled for tenant: {}", tenantId);
            } catch (Exception e) {
                // With hotel-scoped entities, the tenantFilter may not exist
                // This is expected and entities use hotel relationships for isolation
                logger.debug("📋 Tenant filter not available (using hotel-scoped relationships): {}", e.getMessage());
            }
        }
    }

    /**
     * Disable tenant filter for current session
     * Gracefully handles cases where filter doesn't exist
     */
    public void disableFilter() {
        try {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter(TENANT_FILTER_NAME);
        } catch (Exception e) {
            // With hotel-scoped entities, the tenantFilter may not exist
            // This is expected and can be safely ignored
            logger.debug("📋 Tenant filter not available for disabling: {}", e.getMessage());
        }
    }

    /**
     * Check if the current authenticated user is system-wide
     */
    private boolean isCurrentUserSystemWide() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() &&
                    !authentication.getPrincipal().equals("anonymousUser")) {

                String email = authentication.getName();
                return userRepository.findByEmail(email)
                        .map(User::isSystemWideUser)
                        .orElse(false);
            }
        } catch (Exception e) {
            logger.warn("Error checking if user is system-wide: {}", e.getMessage());
        }

        return false;
    }
}
