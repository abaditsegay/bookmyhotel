package com.bookmyhotel.config;

import java.util.Map;

import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;
import org.springframework.lang.NonNull;

import com.bookmyhotel.tenant.TenantContext;

/**
 * Propagates MDC and tenant context into async tasks.
 */
public class ContextPropagatingTaskDecorator implements TaskDecorator {

    @Override
    public @NonNull Runnable decorate(@NonNull Runnable runnable) {
        Map<String, String> callerMdcContext = MDC.getCopyOfContextMap();
        String callerTenantId = TenantContext.getTenantId();

        return () -> {
            Map<String, String> previousMdcContext = MDC.getCopyOfContextMap();
            String previousTenantId = TenantContext.getTenantId();

            try {
                if (callerTenantId != null && !callerTenantId.isBlank()) {
                    TenantContext.setTenantId(callerTenantId);
                } else {
                    TenantContext.clear();
                }

                if (callerMdcContext != null) {
                    MDC.setContextMap(callerMdcContext);
                } else {
                    MDC.clear();
                }

                runnable.run();
            } finally {
                if (previousTenantId != null && !previousTenantId.isBlank()) {
                    TenantContext.setTenantId(previousTenantId);
                } else {
                    TenantContext.clear();
                }

                if (previousMdcContext != null) {
                    MDC.setContextMap(previousMdcContext);
                } else {
                    MDC.clear();
                }
            }
        };
    }
}
