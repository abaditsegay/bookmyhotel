package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class SessionManagementServiceTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    private SessionManagementService sessionManagementService;

    @BeforeEach
    void setUp() {
        sessionManagementService = new SessionManagementService();
        ReflectionTestUtils.setField(sessionManagementService, "jwtUtil", jwtUtil);
        ReflectionTestUtils.setField(sessionManagementService, "tokenBlacklistService", tokenBlacklistService);
        ReflectionTestUtils.setField(sessionManagementService, "sessionTimeoutMinutes", 30L);
        ReflectionTestUtils.setField(sessionManagementService, "maxConcurrentSessions", 1);
    }

    @Test
    void createSessionShouldStoreSessionMetadata() {
        boolean created = sessionManagementService.createSession(11L, "token-1", "UA", "127.0.0.1");

        SessionManagementService.SessionInfo sessionInfo = sessionManagementService.getSessionInfo("token-1");

        assertTrue(created);
        assertNotNull(sessionInfo);
        assertEquals(11L, sessionInfo.getUserId());
        assertEquals("token-1", sessionInfo.getToken());
        assertEquals("UA", sessionInfo.getUserAgent());
        assertEquals("127.0.0.1", sessionInfo.getIpAddress());
        assertEquals(1, sessionManagementService.getActiveSessionCount());
        assertEquals(1, sessionManagementService.getUserActiveSessionCount(11L));
    }

    @Test
    void createSessionShouldInvalidateExistingSessionWhenOnlyOneConcurrentSessionAllowed() {
        Date oldTokenExpiration = new Date(System.currentTimeMillis() + 60_000);
        when(jwtUtil.extractExpiration("token-old")).thenReturn(oldTokenExpiration);

        sessionManagementService.createSession(11L, "token-old", "UA-1", "127.0.0.1");
        sessionManagementService.createSession(11L, "token-new", "UA-2", "127.0.0.2");

        assertNull(sessionManagementService.getSessionInfo("token-old"));
        assertNotNull(sessionManagementService.getSessionInfo("token-new"));
        verify(tokenBlacklistService).blacklistToken("token-old", oldTokenExpiration);
    }

    @Test
    void updateSessionActivityShouldExtendExistingSessionExpiry() {
        sessionManagementService.createSession(11L, "token-1", "UA", "127.0.0.1");
        SessionManagementService.SessionInfo before = sessionManagementService.getSessionInfo("token-1");
        LocalDateTime originalExpiry = before.getExpiresAt();

        sessionManagementService.updateSessionActivity("token-1");

        SessionManagementService.SessionInfo after = sessionManagementService.getSessionInfo("token-1");
        assertTrue(after.getLastActivity().isAfter(before.getCreatedAt()) || after.getLastActivity().isEqual(before.getCreatedAt()));
        assertTrue(after.getExpiresAt().isAfter(originalExpiry) || after.getExpiresAt().isEqual(originalExpiry));
    }

    @Test
    void isSessionValidShouldInvalidateExpiredSessionAndBlacklistToken() {
        Date tokenExpiration = new Date(System.currentTimeMillis() + 60_000);
        when(jwtUtil.extractExpiration("token-expired")).thenReturn(tokenExpiration);

        sessionManagementService.createSession(22L, "token-expired", "UA", "127.0.0.1");
        SessionManagementService.SessionInfo sessionInfo = sessionManagementService.getSessionInfo("token-expired");
        sessionInfo.setExpiresAt(LocalDateTime.now().minusMinutes(1));

        boolean valid = sessionManagementService.isSessionValid("token-expired");

        assertFalse(valid);
        assertNull(sessionManagementService.getSessionInfo("token-expired"));
        verify(tokenBlacklistService).blacklistToken("token-expired", tokenExpiration);
    }

    @Test
    void isSessionValidShouldClearStaleTokenMappingWhenStoredSessionDoesNotMatchToken() {
        sessionManagementService.createSession(33L, "token-current", "UA", "127.0.0.1");

        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Long> tokenToUser = (ConcurrentHashMap<String, Long>) ReflectionTestUtils
                .getField(sessionManagementService, "tokenToUser");
        assertNotNull(tokenToUser);
        tokenToUser.put("token-stale", 33L);

        boolean valid = sessionManagementService.isSessionValid("token-stale");

        assertFalse(valid);
        assertFalse(tokenToUser.containsKey("token-stale"));
        verify(tokenBlacklistService, never()).blacklistToken("token-stale", null);
    }

    @Test
    void invalidateAllUserSessionsShouldRemoveSessionAndBlacklistToken() {
        Date tokenExpiration = new Date(System.currentTimeMillis() + 60_000);
        when(jwtUtil.extractExpiration("token-1")).thenReturn(tokenExpiration);
        sessionManagementService.createSession(44L, "token-1", "UA", "127.0.0.1");

        sessionManagementService.invalidateAllUserSessions(44L);

        assertEquals(0, sessionManagementService.getActiveSessionCount());
        assertEquals(0, sessionManagementService.getUserActiveSessionCount(44L));
        assertNull(sessionManagementService.getSessionInfo("token-1"));
        verify(tokenBlacklistService).blacklistToken("token-1", tokenExpiration);
    }
}