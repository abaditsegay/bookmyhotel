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
            logger.debug("🏢 Tenant filter enabled for tenant: {}", tenantId);
        }
    }

    public void disableFilter() {
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter(TENANT_FILTER_NAME);
    }
