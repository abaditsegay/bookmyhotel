package com.bookmyhotel.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.tenant.TenantContext;
import com.bookmyhotel.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter to validate tokens and set authentication in SecurityContext
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String tenantId = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                tenantId = jwtUtil.extractTenantId(jwt); // Extract tenant ID from JWT
            } catch (Exception e) {
                logger.warn("JWT token extraction failed: " + e.getMessage());
            }
        }

        // Handle tenant context for authenticated users
        if (username != null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtUtil.validateToken(jwt, userDetails)) {
                // Check if user is system-wide (GUEST or ADMIN with null tenant_id)
                User user = (User) userDetails;
                boolean isSystemWideUser = user.isSystemWideUser();
                
                if (isSystemWideUser) {
                    // System-wide users don't need tenant context
                    logger.debug("🌐 System-wide user detected: " + user.getEmail() + " - skipping tenant context");
                    // Don't set tenant context for system-wide users
                } else {
                    // Tenant-bound user - set tenant context from JWT
                    if (tenantId != null && !tenantId.trim().isEmpty()) {
                        logger.debug("🏢 Setting tenant context for tenant-bound user: " + user.getEmail() + " -> " + tenantId);
                        TenantContext.setTenantId(tenantId);
                    } else {
                        logger.warn("⚠️ Tenant-bound user " + user.getEmail() + " has no tenant ID in JWT");
                    }
                }
                
                // Set authentication in security context
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } else {
            // No authentication - tenant context might be needed for public endpoints
            if (tenantId != null && !tenantId.trim().isEmpty()) {
                logger.debug("🔍 Setting tenant context for unauthenticated request: " + tenantId);
                TenantContext.setTenantId(tenantId);
            }
        }

        filterChain.doFilter(request, response);
    }
}
