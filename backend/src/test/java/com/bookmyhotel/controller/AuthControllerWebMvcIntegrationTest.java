package com.bookmyhotel.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
                .andExpect(jsonPath("$").value("Invalid email or password"));
    }

    @Test
    void refreshShouldRejectMissingRefreshToken() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$").value("Refresh token is required"));
    }

    @Test
    void logoutShouldRejectMalformedAuthorizationHeader() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Token not-a-bearer"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$").value("Missing or invalid Authorization header"));
    }
}
