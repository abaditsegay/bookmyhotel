package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.auth.RegistrationResponse;
import com.bookmyhotel.audit.AuditTaxonomy;
import com.bookmyhotel.dto.auth.LoginRequest;
import com.bookmyhotel.dto.auth.LoginResponse;
import com.bookmyhotel.dto.auth.RegisterRequest;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ErrorResponse;
import com.bookmyhotel.exception.RateLimitExceededException;
import com.bookmyhotel.exception.ResourceAlreadyExistsException;
import com.bookmyhotel.service.AuthRateLimitService;
import com.bookmyhotel.service.AuthService;
import com.bookmyhotel.service.EmailVerificationService;
import com.bookmyhotel.service.PasswordResetService;
import com.bookmyhotel.service.PasswordSecurityService;
import com.bookmyhotel.service.RefreshTokenService;
import com.bookmyhotel.service.SessionManagementService;
import com.bookmyhotel.service.SystemAuditService;
import com.bookmyhotel.repository.UserRepository;
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

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private SystemAuditService systemAuditService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthRateLimitService authRateLimitService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    /**
     * User registration endpoint for guest users
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        try {
            RegistrationResponse response = authService.register(registerRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (ResourceAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(buildErrorResponse(
                            HttpStatus.CONFLICT,
                            "Resource Already Exists",
                            "Registration could not be completed",
                            "User with this email already exists",
                            "An account with this email already exists.",
                            request.getRequestURI()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(buildErrorResponse(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "Registration Error",
                            "Registration could not be completed",
                            e.getMessage(),
                            e.getMessage(),
                            request.getRequestURI()));
        } catch (IllegalArgumentException e) {
            String userFriendlyMessage = e.getMessage() != null
                && e.getMessage().startsWith("Password does not meet security requirements:")
                    ? "Use at least 6 characters and only letters or numbers."
                    : "Please review your registration details and try again.";

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(
                    HttpStatus.BAD_REQUEST,
                    "Registration Error",
                    "Registration could not be completed",
                    e.getMessage(),
                    userFriendlyMessage,
                    request.getRequestURI()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Registration Error",
                            "Registration failed",
                            e.getMessage(),
                            "We could not complete registration right now. Please try again later.",
                            request.getRequestURI()));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam("token") String token) {
        try {
            emailVerificationService.verifyEmail(token);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", appUrl + "/login?verified=success")
                    .build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", appUrl + "/login?verified=invalid")
                    .build();
        }
    }

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        String ipAddress = getClientIpAddress(request);

        try {
            // Extract user agent and IP address for session management
            String userAgent = request.getHeader("User-Agent");

            authRateLimitService.assertLoginAllowed(loginRequest.getEmail(), ipAddress);
            LoginResponse response = authService.login(loginRequest, userAgent, ipAddress);
            authRateLimitService.recordSuccessfulLogin(loginRequest.getEmail(), ipAddress);
                    logAuthEvent(AuditTaxonomy.Action.LOGIN, response.getId(), response.getEmail(), response.getFirstName(), response.getLastName(),
                    response.getRoles() != null && !response.getRoles().isEmpty() ? response.getRoles().iterator().next().name() : null,
                    request,
                    true,
                    null);
            return ResponseEntity.ok(response);
        } catch (RateLimitExceededException e) {
            logAuthEvent(AuditTaxonomy.Action.LOGIN_FAILED, null, loginRequest.getEmail(), null, null, null, request, false,
                    e.getMessage());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(Math.max(1, e.getRetryAfterSeconds())))
                    .body(buildErrorResponse(HttpStatus.TOO_MANY_REQUESTS,
                            "Too Many Requests",
                            "Request rate limit exceeded",
                            e.getMessage(),
                            e.getMessage(),
                            request.getRequestURI()));
        } catch (BadCredentialsException e) {
            authRateLimitService.recordFailedLogin(loginRequest.getEmail(), ipAddress);
                logAuthEvent(AuditTaxonomy.Action.LOGIN_FAILED, null, loginRequest.getEmail(), null, null, null, request, false,
                    "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication Failed",
                    "Login failed",
                    "Invalid email or password",
                    "The email or password you entered is incorrect. Please try again.",
                    request.getRequestURI()));
        } catch (IllegalStateException e) {
            logAuthEvent(AuditTaxonomy.Action.LOGIN_FAILED, null, loginRequest.getEmail(), null, null, null, request, false,
                    e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildErrorResponse(
                    HttpStatus.FORBIDDEN,
                    "Email Verification Required",
                    "Login failed",
                    e.getMessage(),
                    "Please verify your email before signing in. Check your inbox for the verification link.",
                    request.getRequestURI()));
        } catch (Exception e) {
                logAuthEvent(AuditTaxonomy.Action.LOGIN_FAILED, null, loginRequest.getEmail(), null, null, null, request, false,
                    e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Authentication Error",
                    "Login failed",
                    e.getMessage(),
                    "We could not sign you in right now. Please try again later.",
                    request.getRequestURI()));
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
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authorizationHeader, HttpServletRequest request) {
        try {
            // Extract token from Authorization header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Invalid Authorization Header",
                                "Logout request is missing a valid bearer token",
                                "Missing or invalid Authorization header",
                                "Provide a valid bearer token to log out.",
                                request.getRequestURI()));
            }

            String token = authorizationHeader.substring(7); // Remove "Bearer " prefix

            // Validate token format before blacklisting
            if (!jwtUtil.isTokenValid(token)) {
                return ResponseEntity.badRequest()
                    .body(buildErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Invalid Token",
                        "Logout request contains an invalid or expired token",
                        "Invalid or expired token",
                        "Your session token is no longer valid. Please sign in again.",
                        request.getRequestURI()));
            }

            // Invalidate the session (this also blacklists the token)
                String email = jwtUtil.extractEmail(token);
            sessionManagementService.invalidateSession(token);

                User user = email != null ? userRepository.findByEmail(email).orElse(null) : null;
                logAuthEvent(
                    AuditTaxonomy.Action.LOGOUT,
                    user != null ? user.getId() : null,
                    email,
                    user != null ? user.getFirstName() : null,
                    user != null ? user.getLastName() : null,
                    user != null && user.getRoles() != null && !user.getRoles().isEmpty() ? user.getRoles().iterator().next().name() : null,
                    request,
                    true,
                    null);

            return ResponseEntity.ok()
                    .body("Successfully logged out");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Logout Error",
                            "Logout failed",
                            e.getMessage(),
                            "We could not complete logout right now. Please try again later.",
                            request.getRequestURI()));
        }
    }

    private void logAuthEvent(String action,
            Long userId,
            String email,
            String firstName,
            String lastName,
            String role,
            HttpServletRequest request,
            boolean success,
            String errorMessage) {
        String name = email;
        if (firstName != null || lastName != null) {
            name = ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        }

        systemAuditService.log(
            AuditTaxonomy.EntityType.AUTH,
                userId,
                action,
                "Authentication event: " + action,
                userId,
                name,
                email,
                role,
                getClientIpAddress(request),
                request.getHeader("User-Agent"),
                request.getRequestURI(),
                request.getMethod(),
                success,
                errorMessage);
    }

    /**
     * Check session status endpoint - helps frontend determine if session is still
     * valid
     */
    @PostMapping("/session-status")
    public ResponseEntity<?> checkSessionStatus(@RequestHeader("Authorization") String authorizationHeader,
            HttpServletRequest request) {
        try {
            // Extract token from Authorization header
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest()
                        .body(buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Invalid Authorization Header",
                                "Session status request is missing a valid bearer token",
                                "Missing or invalid Authorization header",
                                "Provide a valid bearer token to check session status.",
                                request.getRequestURI()));
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
                    .body(buildErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Session Error",
                            "Session status check failed",
                            e.getMessage(),
                            "We could not verify your session right now. Please try again later.",
                            request.getRequestURI()));
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
                    .body(buildErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Missing Refresh Token",
                        "Refresh token is required",
                        "Refresh token is required",
                        "Provide a refresh token to request a new access token.",
                        httpRequest.getRequestURI()));
            }

            // Extract user agent and IP address
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(httpRequest);

            // Refresh the access token
            String newAccessToken = refreshTokenService.refreshAccessToken(refreshToken, userAgent, ipAddress);

            if (newAccessToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(buildErrorResponse(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid Refresh Token",
                        "Refresh token is invalid or expired",
                        "Invalid or expired refresh token",
                        "Your refresh token is no longer valid. Please sign in again.",
                        httpRequest.getRequestURI()));
            }

            return ResponseEntity.ok(java.util.Map.of(
                    "token", newAccessToken,
                    "type", "Bearer",
                    "message", "Token refreshed successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Token Refresh Error",
                            "Token refresh failed",
                            e.getMessage(),
                            "We could not refresh your session right now. Please try again later.",
                            httpRequest.getRequestURI()));
        }
    }

    /**
     * Check password strength and validation
     */
    @PostMapping("/password/validate")
    public ResponseEntity<?> validatePassword(@RequestBody java.util.Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String password = request.get("password");

            if (password == null) {
                return ResponseEntity.badRequest()
                        .body(buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Missing Password",
                                "Password is required",
                                "Password is required",
                                "Provide a password to validate its strength.",
                                httpRequest.getRequestURI()));
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
                    .body(buildErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Password Validation Error",
                            "Password validation failed",
                            e.getMessage(),
                            "We could not validate the password right now. Please try again later.",
                            httpRequest.getRequestURI()));
        }
    }

    /**
     * Request a password reset email
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(buildErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Missing Email",
                        "Email is required",
                        "Email is required",
                        "Provide an email address to request a password reset.",
                        httpRequest.getRequestURI()));
            }

            authRateLimitService.checkPasswordResetRequestAllowed(email, getClientIpAddress(httpRequest));

            passwordResetService.requestPasswordReset(email.trim().toLowerCase());

            // Always return success to prevent email enumeration
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "If an account with that email exists, a password reset link has been sent."));
            } catch (RateLimitExceededException e) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(Math.max(1, e.getRetryAfterSeconds())))
                    .body(buildErrorResponse(
                        HttpStatus.TOO_MANY_REQUESTS,
                        "Too Many Requests",
                        "Password reset request limit exceeded",
                        e.getMessage(),
                        e.getMessage(),
                        httpRequest.getRequestURI()));
        } catch (IllegalStateException e) {
            // Email service not configured
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Password Reset Error",
                        "Password reset email service is unavailable",
                        e.getMessage(),
                        "Email service is currently unavailable. Please contact support.",
                        httpRequest.getRequestURI()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(buildErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Password Reset Error",
                        "Password reset request failed",
                        e.getMessage(),
                        "An error occurred. Please try again later.",
                        httpRequest.getRequestURI()));
        }
    }

    /**
     * Validate a password reset token
     */
    @PostMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestBody java.util.Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String token = request.get("token");
            if (token == null || token.isBlank()) {
                return ResponseEntity.badRequest().body(buildErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Missing Reset Token",
                        "Reset token is required",
                        "Reset token is required",
                        "Provide a reset token to validate it.",
                        httpRequest.getRequestURI()));
            }

            authRateLimitService.checkResetTokenValidationAllowed(getClientIpAddress(httpRequest));

            boolean valid = passwordResetService.validateToken(token);
            return ResponseEntity.ok(java.util.Map.of("valid", valid));
        } catch (RateLimitExceededException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(Math.max(1, e.getRetryAfterSeconds())))
                    .body(buildErrorResponse(
                            HttpStatus.TOO_MANY_REQUESTS,
                            "Too Many Requests",
                            "Reset token validation limit exceeded",
                            e.getMessage(),
                            e.getMessage(),
                            httpRequest.getRequestURI()));
        }
    }

    /**
     * Reset password using a valid token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request,
            HttpServletRequest httpRequest) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");

            if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest()
                    .body(buildErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Missing Reset Data",
                        "Token and new password are required",
                        "Token and new password are required",
                        "Provide both the reset token and a new password.",
                        httpRequest.getRequestURI()));
            }

            authRateLimitService.checkPasswordResetAllowed(getClientIpAddress(httpRequest));

            PasswordResetService.ResetResult result = passwordResetService.resetPassword(token, newPassword);

            if (result.isSuccessful()) {
                return ResponseEntity.ok(java.util.Map.of(
                        "message", "Password has been reset successfully. You can now sign in with your new password."));
            } else {
                return ResponseEntity.badRequest()
                        .body(buildErrorResponse(
                                HttpStatus.BAD_REQUEST,
                                "Password Reset Failed",
                                "Password reset could not be completed",
                                result.getMessage(),
                                result.getMessage(),
                                httpRequest.getRequestURI()));
            }
        } catch (RateLimitExceededException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(Math.max(1, e.getRetryAfterSeconds())))
                    .body(buildErrorResponse(
                            HttpStatus.TOO_MANY_REQUESTS,
                            "Too Many Requests",
                            "Password reset limit exceeded",
                            e.getMessage(),
                            e.getMessage(),
                            httpRequest.getRequestURI()));
        }
    }

    /**
     * Debug endpoint to check current user's authorities and roles
     */
    @PostMapping("/debug/authorities")
    public ResponseEntity<?> debugUserAuthorities(org.springframework.security.core.Authentication auth,
            HttpServletRequest request) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(buildErrorResponse(
                                HttpStatus.UNAUTHORIZED,
                                "Authentication Required",
                                "Authentication is required",
                                "Not authenticated",
                                "Sign in before accessing this debug endpoint.",
                                request.getRequestURI()));
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
                    .body(buildErrorResponse(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Debug Error",
                            "Debug request failed",
                            e.getMessage(),
                            "We could not complete the debug request right now.",
                            request.getRequestURI()));
        }
    }

    private ErrorResponse buildErrorResponse(HttpStatus status,
            String error,
            String message,
            String details,
            String userFriendlyMessage,
            String path) {
        return ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .details(details)
                .path(path)
                .userFriendlyMessage(userFriendlyMessage)
                .build();
    }
}
