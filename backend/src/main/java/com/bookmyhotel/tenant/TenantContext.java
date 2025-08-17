package com.bookmyhotel.tenant;

import org.slf4j.MDC;

/**
 * Thread-local storage for tenant context
 */
public class TenantContext {
    
    private static final String TENANT_ID_KEY = "tenantId";
    private static final ThreadLocal<String> CONTEXT = new ThreadLocal<>();
    
    public static void setTenantId(String tenantId) {
        CONTEXT.set(tenantId);
        MDC.put(TENANT_ID_KEY, tenantId);
    }
    
    public static String getTenantId() {
        return CONTEXT.get();
    }
    
    public static void clear() {
        CONTEXT.remove();
        MDC.remove(TENANT_ID_KEY);
    }
}
