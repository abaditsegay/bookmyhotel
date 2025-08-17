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
            } else {
                logger.warn("No tenant resolved for request: {}", request.getRequestURI());
            }
            return true;
        } catch (Exception e) {
            logger.error("Error resolving tenant", e);
            return false;
        }
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        TenantContext.clear();
    }
}
