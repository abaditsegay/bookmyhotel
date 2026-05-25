package com.bookmyhotel.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import com.bookmyhotel.tenant.TenantContext;

class ContextPropagatingTaskDecoratorTest {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        MDC.clear();
    }

    @Test
    void shouldPropagateTenantAndRequestContextIntoDecoratedTask() {
        ContextPropagatingTaskDecorator decorator = new ContextPropagatingTaskDecorator();
        TenantContext.setTenantId("tenant-123");
        MDC.put(RequestCorrelationFilter.REQUEST_ID_KEY, "request-123");

        Runnable decorated = decorator.decorate(() -> {
            assertEquals("tenant-123", TenantContext.getTenantId());
            assertEquals("request-123", MDC.get(RequestCorrelationFilter.REQUEST_ID_KEY));
        });

        TenantContext.clear();
        MDC.clear();
        decorated.run();

        assertNull(TenantContext.getTenantId());
        assertNull(MDC.get(RequestCorrelationFilter.REQUEST_ID_KEY));
    }
}