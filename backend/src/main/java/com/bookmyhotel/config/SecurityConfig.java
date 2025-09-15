package com.bookmyhotel.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security configuration for the BookMyHotel application
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("#{'${app.cors.allowed-origins:http://localhost:3000,https://yourdomain.com}'.split(',')}")
    private List<String> allowedOrigins;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Security Headers
                .headers(headers -> headers
                        .frameOptions(frameOptions -> frameOptions.deny())
                        .contentTypeOptions(contentTypeOptions -> {
                            // Enable X-Content-Type-Options: nosniff
                        })
                        .httpStrictTransportSecurity(hstsConfig -> hstsConfig
                                .maxAgeInSeconds(31536000)
                                .includeSubDomains(true))
                        .referrerPolicy(referrerPolicy -> referrerPolicy
                                .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/public/**",
                                "/api/hotels/search",
                                "/api/hotels/{id}",
                                "/api/hotels/{id}/rooms",
                                "/api/hotels/*/availability",
                                "/api/hotels/random",
                                "/api/hotels",
                                "/api/bookings",
                                "/api/bookings/room-type",
                                "/api/bookings/search",
                                "/api/bookings/{id}/email",
                                "/api/booking/guest/**",
                                "/api/booking-management/**",
                                "/actuator/health",
                                "/error")
                        .permitAll()

                        // Auth endpoints that require authentication
                        .requestMatchers("/api/auth/logout").authenticated()

                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "SYSTEM_ADMIN")

                        // Hotel admin endpoints
                        .requestMatchers("/api/hotel-admin/**").hasAnyRole("HOTEL_ADMIN", "ADMIN")

                        // Supervisor endpoints
                        .requestMatchers("/api/supervisor/**")
                        .hasAnyRole("OPERATIONS_SUPERVISOR", "HOTEL_ADMIN", "ADMIN")

                        // User endpoints (authenticated users only)
                        .requestMatchers("/api/users/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated())

                // JWT Authentication Filter
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Production-ready CORS configuration - Use allowedOriginPatterns for
        // flexibility with credentials
        configuration.setAllowedOriginPatterns(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Tenant-ID",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Cache-Control"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-Tenant-ID", "Content-Type"));
        configuration.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new com.bookmyhotel.service.CustomUserDetailsService();
    }
}
