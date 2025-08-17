package com.bookmyhotel.tenant;

import org.hibernate.Session;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Manages Hibernate tenant filters
 */
@Component
public class TenantFilter {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public static final String TENANT_FILTER_NAME = "tenantFilter";
    public static final String TENANT_PARAMETER_NAME = "tenantId";
    
    /**
     * Enable tenant filter for current session
     */
    public void enableFilter() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.enableFilter(TENANT_FILTER_NAME)
                   .setParameter(TENANT_PARAMETER_NAME, tenantId);
        }
    }
    
    /**
     * Disable tenant filter for current session
     */
    public void disableFilter() {
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter(TENANT_FILTER_NAME);
    }
}
