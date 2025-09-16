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
import com.bookmyhotel.service.SessionManagementService;
import com.bookmyhotel.tenant.TenantContext;
import com.bookmyhotel.tenant.HotelContext;
import com.bookmyhotel.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter to validate tokens and set authentication in
 * SecurityContext
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private SessionManagementService sessionManagementService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;
        String tenantId = null;
        Long hotelId = null;
        String hotelName = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                tenantId = jwtUtil.extractTenantId(jwt); // Extract tenant ID from JWT
                hotelId = jwtUtil.extractHotelId(jwt); // Extract hotel ID from JWT
                hotelName = jwtUtil.extractClaim(jwt, claims -> (String) claims.get("hotelName"));
                logger.debug("🔑 JWT extracted - username: " + username + ", tenantId: " + tenantId + ", hotelId: " + hotelId);
            } catch (Exception e) {
                logger.warn("JWT token extraction failed: " + e.getMessage());
            }
        } else {
            logger.debug("❌ No valid Authorization header found: " + authorizationHeader);
        }

        // Handle tenant context for authenticated users
        if (username != null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // Validate JWT token and check session
            if (jwtUtil.validateToken(jwt, userDetails) && sessionManagementService.isSessionValid(jwt)) {
                logger.debug("✅ JWT validation successful for user: " + username);
                // Update session activity
                sessionManagementService.updateSessionActivity(jwt);
                // Check if user is system-wide (GUEST or ADMIN with null tenant_id)
                User user = (User) userDetails;
                boolean isSystemWideUser = user.isSystemWideUser();

                if (isSystemWideUser) {
                    // System-wide users don't need tenant or hotel context
                    logger.debug(
                            "🌐 System-wide user detected: " + user.getEmail() + " - skipping tenant/hotel context");
                    // Don't set tenant or hotel context for system-wide users
                } else {
                    // Hotel staff - set both tenant and hotel context from JWT
                    if (tenantId != null && !tenantId.trim().isEmpty()) {
                        logger.debug(
                                "🏢 Setting tenant context for hotel staff: " + user.getEmail() + " -> " + tenantId);
                        TenantContext.setTenantId(tenantId);
                    }

                    if (hotelId != null) {
                        logger.debug("🏨 Setting hotel context for hotel staff: " + user.getEmail() + " -> Hotel ID: "
                                + hotelId);
                        HotelContext.setHotelId(hotelId);
                        if (hotelName != null) {
                            HotelContext.setHotelName(hotelName);
                        }
                    } else {
                        logger.warn("⚠️ Hotel staff user " + user.getEmail() + " has no hotel ID in JWT");
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
