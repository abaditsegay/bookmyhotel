package com.bookmyhotel.tenant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

class TenantContextTest {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void setTenantIdShouldPopulateThreadLocalAndMdc() {
        TenantContext.setTenantId("tenant-123");

        assertEquals("tenant-123", TenantContext.getTenantId());
        assertEquals("tenant-123", MDC.get("tenantId"));
    }

    @Test
    void clearShouldRemoveThreadLocalAndMdc() {
        TenantContext.setTenantId("tenant-456");

        TenantContext.clear();

        assertNull(TenantContext.getTenantId());
        assertNull(MDC.get("tenantId"));
    }
}