package com.bookmyhotel.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.bookmyhotel.dto.auth.LoginResponse;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.AuthRateLimitService;
import com.bookmyhotel.service.AuthService;
import com.bookmyhotel.service.PasswordResetService;
import com.bookmyhotel.service.PasswordSecurityService;
import com.bookmyhotel.service.RefreshTokenService;
import com.bookmyhotel.service.SessionManagementService;
import com.bookmyhotel.service.SystemAuditService;
import com.bookmyhotel.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class AuthControllerWebMvcIntegrationTest {

    @Mock
    private AuthService authService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private SessionManagementService sessionManagementService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordSecurityService passwordSecurityService;

    @Mock
    private PasswordResetService passwordResetService;

    @Mock
    private SystemAuditService systemAuditService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthRateLimitService authRateLimitService;

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        AuthController controller = new AuthController();
        ReflectionTestUtils.setField(controller, "authService", authService);
        ReflectionTestUtils.setField(controller, "jwtUtil", jwtUtil);
        ReflectionTestUtils.setField(controller, "sessionManagementService", sessionManagementService);
        ReflectionTestUtils.setField(controller, "refreshTokenService", refreshTokenService);
        ReflectionTestUtils.setField(controller, "passwordSecurityService", passwordSecurityService);
        ReflectionTestUtils.setField(controller, "passwordResetService", passwordResetService);
        ReflectionTestUtils.setField(controller, "systemAuditService", systemAuditService);
        ReflectionTestUtils.setField(controller, "userRepository", userRepository);
        ReflectionTestUtils.setField(controller, "authRateLimitService", authRateLimitService);

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void loginShouldUseForwardedIpAndUserAgent() throws Exception {
        LoginResponse response = new LoginResponse(
                "access-token",
                "refresh-token",
                12L,
                "guest@example.com",
                "Guest",
                "User",
                Set.of(UserRole.CUSTOMER),
                null,
                null,
                null);

        when(authService.login(any(), eq("Mozilla/5.0"), eq("203.0.113.10"))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("User-Agent", "Mozilla/5.0")
                        .header("X-Forwarded-For", "203.0.113.10, 10.0.0.7")
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", "guest@example.com",
                                "password", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("access-token"))
                .andExpect(jsonPath("$.refreshToken").value("refresh-token"))
                .andExpect(jsonPath("$.email").value("guest@example.com"))
                .andExpect(jsonPath("$.roles[0]").value("CUSTOMER"));
    }

    @Test
    void loginShouldReturnUnauthorizedForBadCredentials() throws Exception {
        when(authService.login(any(), any(), any())).thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of(
                                "email", "guest@example.com",
                                "password", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Authentication Failed"))
                .andExpect(jsonPath("$.details").value("Invalid email or password"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

            @Test
            void loginShouldReturnTooManyRequestsWhenRateLimitExceeded() throws Exception {
            doThrow(new com.bookmyhotel.exception.RateLimitExceededException(
                "Too many login attempts. Please try again later.",
                60)).when(authRateLimitService).assertLoginAllowed(any(), any());

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(java.util.Map.of(
                        "email", "guest@example.com",
                        "password", "wrong"))))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Too Many Requests"))
                .andExpect(jsonPath("$.details").value("Too many login attempts. Please try again later."));
            }

    @Test
    void refreshShouldRejectMissingRefreshToken() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Missing Refresh Token"))
                .andExpect(jsonPath("$.details").value("Refresh token is required"))
                .andExpect(jsonPath("$.path").value("/api/auth/refresh"));
    }

    @Test
    void logoutShouldRejectMalformedAuthorizationHeader() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Token not-a-bearer"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid Authorization Header"))
                .andExpect(jsonPath("$.details").value("Missing or invalid Authorization header"))
                .andExpect(jsonPath("$.path").value("/api/auth/logout"));
    }

    @Test
    void forgotPasswordShouldReturnStructuredErrorWhenEmailMissing() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Missing Email"))
                .andExpect(jsonPath("$.details").value("Email is required"))
                .andExpect(jsonPath("$.path").value("/api/auth/forgot-password"));
    }
}
