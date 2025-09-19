package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.auth.LoginRequest;
import com.bookmyhotel.dto.auth.LoginResponse;
import com.bookmyhotel.dto.auth.RegisterRequest;
import com.bookmyhotel.exception.ResourceAlreadyExistsException;
import com.bookmyhotel.service.AuthService;
import com.bookmyhotel.service.PasswordSecurityService;
import com.bookmyhotel.service.RefreshTokenService;
import com.bookmyhotel.service.SessionManagementService;
import com.bookmyhotel.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

/**
 * Authentication controller for login and token management
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SessionManagementService sessionManagementService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordSecurityService passwordSecurityService;

    /**
     * User registration endpoint for guest users
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            LoginResponse response = authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ResourceAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("User with this email already exists");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Registration failed: " + e.getMessage());
        }
    }

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        try {
            // Extract user agent and IP address for session management
            String userAgent = request.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(request);

            LoginResponse response = authService.login(loginRequest, userAgent, ipAddress);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            // Check if it's an account deactivation error
            if (e.getMessage().contains("Account is deactivated")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("This account is not active");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }

    /**
     * Helper method to extract client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * User logout endpoint - blacklists the JWT token
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Extract token from Authorization header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body("Missing or invalid Authorization header");
            }

            String token = authorizationHeader.substring(7); // Remove "Bearer " prefix

            // Validate token format before blacklisting
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.badRequest()
                        .body("Invalid or expired token");
            }

            // Invalidate the session (this also blacklists the token)
            sessionManagementService.invalidateSession(token);

            return ResponseEntity.ok()
                    .body("Successfully logged out");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Logout failed: " + e.getMessage());
        }
    }

    /**
     * Check session status endpoint - helps frontend determine if session is still
     * valid
     */
    @PostMapping("/session-status")
    public ResponseEntity<?> checkSessionStatus(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Extract token from Authorization header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body("Missing or invalid Authorization header");
            }

            String token = authorizationHeader.substring(7); // Remove "Bearer " prefix

            // Check if session is valid
            boolean isValid = sessionManagementService.isSessionValid(token);

            if (isValid) {
                // Get session info
                SessionManagementService.SessionInfo sessionInfo = sessionManagementService.getSessionInfo(token);
                if (sessionInfo != null) {
                    return ResponseEntity.ok()
                            .body(java.util.Map.of(
                                    "valid", true,
                                    "expiresAt", sessionInfo.getExpiresAt(),
                                    "lastActivity", sessionInfo.getLastActivity()));
                }
            }

            return ResponseEntity.ok()
                    .body(java.util.Map.of("valid", false));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Session status check failed: " + e.getMessage());
        }
    }

    /**
     * Refresh access token using refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody java.util.Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String refreshToken = request.get("refreshToken");

            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Refresh token is required");
            }

            // Extract user agent and IP address
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(httpRequest);

            // Refresh the access token
            String newAccessToken = refreshTokenService.refreshAccessToken(refreshToken, userAgent, ipAddress);

            if (newAccessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid or expired refresh token");
            }

            return ResponseEntity.ok(java.util.Map.of(
                    "token", newAccessToken,
                    "type", "Bearer",
                    "message", "Token refreshed successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Token refresh failed: " + e.getMessage());
        }
    }

    /**
     * Check password strength and validation
     */
    @PostMapping("/password/validate")
    public ResponseEntity<?> validatePassword(@RequestBody java.util.Map<String, String> request) {
        try {
            String password = request.get("password");

            if (password == null) {
                return ResponseEntity.badRequest()
                        .body("Password is required");
            }

            // Validate password
            PasswordSecurityService.PasswordValidationResult validation = passwordSecurityService
                    .validatePassword(password);

            // Calculate strength
            int strengthScore = passwordSecurityService.calculatePasswordStrength(password);
            String strengthDescription = passwordSecurityService.getPasswordStrengthDescription(strengthScore);

            return ResponseEntity.ok(java.util.Map.of(
                    "valid", validation.isValid(),
                    "errors", validation.getErrors(),
                    "strengthScore", strengthScore,
                    "strengthDescription", strengthDescription));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Password validation failed: " + e.getMessage());
        }
    }

    /**
     * Debug endpoint to check current user's authorities and roles
     */
    @PostMapping("/debug/authorities")
    public ResponseEntity<?> debugUserAuthorities(org.springframework.security.core.Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Not authenticated");
            }

            java.util.Map<String, Object> debugInfo = new java.util.HashMap<>();
            debugInfo.put("username", auth.getName());
            debugInfo.put("authenticated", auth.isAuthenticated());
            debugInfo.put("authorities", auth.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .collect(java.util.stream.Collectors.toList()));
            debugInfo.put("principal", auth.getPrincipal().getClass().getSimpleName());

            if (auth.getPrincipal() instanceof com.bookmyhotel.entity.User) {
                com.bookmyhotel.entity.User user = (com.bookmyhotel.entity.User) auth.getPrincipal();
                debugInfo.put("userRoles", user.getRoles().stream()
                        .map(role -> role.name())
                        .collect(java.util.stream.Collectors.toList()));
                debugInfo.put("hotelId", user.getHotel() != null ? user.getHotel().getId() : null);
                debugInfo.put("tenantId", user.getTenantId());
            }

            return ResponseEntity.ok(debugInfo);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Debug failed: " + e.getMessage());
        }
    }
}
