package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class TokenBlacklistServiceTest {

    private TokenBlacklistService tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistService();
    }

    @Test
    void blacklistTokenShouldIgnoreNullInputs() {
        tokenBlacklistService.blacklistToken(null, new Date(System.currentTimeMillis() + 60_000));
        tokenBlacklistService.blacklistToken("token-1", null);

        assertEquals(0, tokenBlacklistService.getBlacklistSize());
    }

    @Test
    void isTokenBlacklistedShouldTreatNullTokensAsBlacklisted() {
        assertTrue(tokenBlacklistService.isTokenBlacklisted(null));
    }

    @Test
    void isTokenBlacklistedShouldReturnTrueForStoredUnexpiredToken() {
        tokenBlacklistService.blacklistToken("token-1", new Date(System.currentTimeMillis() + 60_000));

        assertTrue(tokenBlacklistService.isTokenBlacklisted("token-1"));
        assertEquals(1, tokenBlacklistService.getBlacklistSize());
    }

    @Test
    void isTokenBlacklistedShouldDropExpiredTokensOnRead() {
        tokenBlacklistService.blacklistToken("token-expired", new Date(System.currentTimeMillis() - 60_000));

        assertFalse(tokenBlacklistService.isTokenBlacklisted("token-expired"));
        assertEquals(0, tokenBlacklistService.getBlacklistSize());
    }

    @Test
    void cleanupExpiredTokensShouldRemoveOnlyExpiredEntries() {
        tokenBlacklistService.blacklistToken("token-active", new Date(System.currentTimeMillis() + 60_000));
        tokenBlacklistService.blacklistToken("token-expired", new Date(System.currentTimeMillis() - 60_000));

        ReflectionTestUtils.invokeMethod(tokenBlacklistService, "cleanupExpiredTokens");

        assertEquals(1, tokenBlacklistService.getBlacklistSize());
        assertTrue(tokenBlacklistService.isTokenBlacklisted("token-active"));
        assertFalse(tokenBlacklistService.isTokenBlacklisted("token-expired"));
    }

    @Test
    void clearBlacklistShouldRemoveAllEntries() {
        tokenBlacklistService.blacklistToken("token-1", new Date(System.currentTimeMillis() + 60_000));
        tokenBlacklistService.blacklistToken("token-2", new Date(System.currentTimeMillis() + 120_000));

        tokenBlacklistService.clearBlacklist();

        assertEquals(0, tokenBlacklistService.getBlacklistSize());
        assertFalse(tokenBlacklistService.isTokenBlacklisted("token-1"));
        assertFalse(tokenBlacklistService.isTokenBlacklisted("token-2"));
    }
}