package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private SessionManagementService sessionManagementService;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService();
        ReflectionTestUtils.setField(refreshTokenService, "userRepository", userRepository);
        ReflectionTestUtils.setField(refreshTokenService, "jwtUtil", jwtUtil);
        ReflectionTestUtils.setField(refreshTokenService, "sessionManagementService", sessionManagementService);
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpirationTime", 60_000L);
    }

    @AfterEach
    void tearDown() {
        refreshTokenService.destroy();
    }

    @Test
    void generateRefreshTokenShouldReplaceExistingUserToken() {
        String firstToken = refreshTokenService.generateRefreshToken(10L);
        String secondToken = refreshTokenService.generateRefreshToken(10L);

        assertNotEquals(firstToken, secondToken);
        assertFalse(refreshTokenService.isRefreshTokenValid(firstToken));
        assertTrue(refreshTokenService.isRefreshTokenValid(secondToken));
        assertEquals(1, refreshTokenService.getActiveRefreshTokenCount());
    }

    @Test
    void refreshAccessTokenShouldCreateSessionForActiveUser() {
        User user = activeUser(12L);
        String refreshToken = refreshTokenService.generateRefreshToken(12L);
        RefreshTokenService.RefreshTokenInfo info = refreshTokenService.getRefreshTokenInfo(refreshToken);
        LocalDateTime originalLastUsed = info.getLastUsed();

        when(userRepository.findById(12L)).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user)).thenReturn("new-access-token");

        String accessToken = refreshTokenService.refreshAccessToken(refreshToken, "Mozilla/5.0", "127.0.0.1");

        assertEquals("new-access-token", accessToken);
        assertNotNull(refreshTokenService.getRefreshTokenInfo(refreshToken));
        assertTrue(refreshTokenService.getRefreshTokenInfo(refreshToken).getLastUsed().isAfter(originalLastUsed)
                || refreshTokenService.getRefreshTokenInfo(refreshToken).getLastUsed().isEqual(originalLastUsed));
        verify(sessionManagementService).createSession(12L, "new-access-token", "Mozilla/5.0", "127.0.0.1");
    }

    @Test
    void refreshAccessTokenShouldReturnNullAndRevokeExpiredToken() {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpirationTime", -1_000L);
        String refreshToken = refreshTokenService.generateRefreshToken(21L);

        assertNull(refreshTokenService.refreshAccessToken(refreshToken, "agent", "ip"));
        assertFalse(refreshTokenService.isRefreshTokenValid(refreshToken));
        assertEquals(0, refreshTokenService.getActiveRefreshTokenCount());
    }

    @Test
    void refreshAccessTokenShouldReturnNullForInactiveUser() {
        User user = activeUser(31L);
        user.setIsActive(false);
        String refreshToken = refreshTokenService.generateRefreshToken(31L);

        when(userRepository.findById(31L)).thenReturn(Optional.of(user));

        assertNull(refreshTokenService.refreshAccessToken(refreshToken, null, null));
        assertFalse(refreshTokenService.isRefreshTokenValid(refreshToken));
    }

    @Test
    void revokeAllUserRefreshTokensShouldClearTrackedToken() {
        String refreshToken = refreshTokenService.generateRefreshToken(41L);
        assertTrue(refreshTokenService.isRefreshTokenValid(refreshToken));

        refreshTokenService.revokeAllUserRefreshTokens(41L);

        assertFalse(refreshTokenService.isRefreshTokenValid(refreshToken));
        assertEquals(0, refreshTokenService.getActiveRefreshTokenCount());
    }

    private User activeUser(Long userId) {
        User user = new User();
        user.setId(userId);
        user.setEmail("user" + userId + "@example.com");
        user.setPassword("encoded");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRoles(Set.of(UserRole.CUSTOMER));
        user.setIsActive(true);
        return user;
    }
}