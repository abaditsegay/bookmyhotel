package com.bookmyhotel.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.bookmyhotel.tenant.TenantFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Interceptor that enables tenant filtering for each request
 */
@Component
public class TenantFilterInterceptor implements HandlerInterceptor {
    
    @Autowired
    private TenantFilter tenantFilter;
    
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String requestPath = request.getRequestURI();
        
        // Skip tenant filtering for public hotel search endpoints
        if (requestPath.startsWith("/api/hotels/")) {
            // Don't enable tenant filter for public hotel endpoints
            return true;
        }
        
        // Enable tenant filter for this request
        tenantFilter.enableFilter();
        return true;
    }
    
    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, @Nullable Exception ex) {
        // Clean up by disabling filter
        tenantFilter.disableFilter();
    }
}
