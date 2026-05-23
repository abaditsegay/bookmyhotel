package com.bookmyhotel.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor to resolve and set tenant context for each request
 */
@Component
public class TenantInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(TenantInterceptor.class);
    
    @Autowired
    private TenantResolver tenantResolver;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        try {
            String tenantId = tenantResolver.resolveTenant(request);
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
                logger.debug("Set tenant context: {}", tenantId);
                return true;
            }

            if (isTenantOptionalRequest(request)) {
                logger.debug("No tenant required for request: {}", request.getRequestURI());
                return true;
            }

            logger.warn("Missing tenant context for request: {}", request.getRequestURI());
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Tenant context is required for this request");
            return false;
        } catch (IllegalStateException e) {
            logger.warn("Rejected request due to tenant resolution failure: {}", e.getMessage());
            try {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            } catch (Exception sendErrorFailure) {
                logger.error("Failed to send tenant resolution error response", sendErrorFailure);
            }
            return false;
        } catch (Exception e) {
            logger.error("Error resolving tenant", e);
            try {
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to resolve tenant context");
            } catch (Exception sendErrorFailure) {
                logger.error("Failed to send tenant error response", sendErrorFailure);
            }
            return false;
        }
    }

    private boolean isTenantOptionalRequest(HttpServletRequest request) {
        String requestPath = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        return requestPath.startsWith("/api/hotels") ||
                requestPath.startsWith("/api/auth") ||
                requestPath.startsWith("/api/public/") ||
                requestPath.startsWith("/api/bookings") ||
                requestPath.startsWith("/api/booking/") ||
                requestPath.startsWith("/api/booking-management/") ||
                requestPath.startsWith("/actuator/") ||
                requestPath.startsWith("/swagger-ui") ||
                requestPath.startsWith("/v3/api-docs") ||
                "/error".equals(requestPath);
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
