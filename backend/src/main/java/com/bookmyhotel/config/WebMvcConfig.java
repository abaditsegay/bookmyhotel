package com.bookmyhotel.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.bookmyhotel.tenant.TenantInterceptor;

/**
 * Web MVC configuration for the BookMyHotel application
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private TenantInterceptor tenantInterceptor;
    
    @Autowired
    private TenantFilterInterceptor tenantFilterInterceptor;

    @Override
    public void addInterceptors(@org.springframework.lang.NonNull InterceptorRegistry registry) {
        // Add tenant context resolution interceptor (runs first)
        registry.addInterceptor(tenantInterceptor)
                .addPathPatterns("/**") // Apply to all paths
                .order(1);
        
        // Add tenant filter interceptor (runs after tenant context is set)
        registry.addInterceptor(tenantFilterInterceptor)
                .addPathPatterns("/**") // Apply to all paths
                .order(2);
    }
}
