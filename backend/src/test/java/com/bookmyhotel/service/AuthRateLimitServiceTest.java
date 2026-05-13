package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.exception.RateLimitExceededException;

class AuthRateLimitServiceTest {

    private AuthRateLimitService authRateLimitService;

    @BeforeEach
    void setUp() {
        authRateLimitService = new AuthRateLimitService();
        ReflectionTestUtils.setField(authRateLimitService, "maxLoginFailures", 3);
        ReflectionTestUtils.setField(authRateLimitService, "loginFailureWindowMinutes", 15L);
        ReflectionTestUtils.setField(authRateLimitService, "loginLockoutMinutes", 15L);
        ReflectionTestUtils.setField(authRateLimitService, "maxPasswordResetRequests", 2);
        ReflectionTestUtils.setField(authRateLimitService, "passwordResetWindowMinutes", 15L);
        ReflectionTestUtils.setField(authRateLimitService, "maxResetTokenAttempts", 2);
        ReflectionTestUtils.setField(authRateLimitService, "resetTokenWindowMinutes", 15L);
    }

    @Test
    void shouldTemporarilyLockLoginAfterConfiguredFailures() {
        String email = "guest@example.com";
        String ip = "203.0.113.1";

        authRateLimitService.recordFailedLogin(email, ip);
        authRateLimitService.recordFailedLogin(email, ip);
        authRateLimitService.recordFailedLogin(email, ip);

        RateLimitExceededException exception = assertThrows(
                RateLimitExceededException.class,
                () -> authRateLimitService.assertLoginAllowed(email, ip));

        assertEquals("Too many login attempts. Please try again later.", exception.getMessage());
    }

    @Test
    void shouldClearLoginLockStateAfterSuccessfulLogin() {
        String email = "guest@example.com";
        String ip = "203.0.113.1";

        authRateLimitService.recordFailedLogin(email, ip);
        authRateLimitService.recordFailedLogin(email, ip);
        authRateLimitService.recordSuccessfulLogin(email, ip);

        assertDoesNotThrow(() -> authRateLimitService.assertLoginAllowed(email, ip));
    }

    @Test
    void shouldThrottlePasswordResetRequestsWithinWindow() {
        String email = "guest@example.com";
        String ip = "203.0.113.1";

        authRateLimitService.checkPasswordResetRequestAllowed(email, ip);
        authRateLimitService.checkPasswordResetRequestAllowed(email, ip);

        RateLimitExceededException exception = assertThrows(
                RateLimitExceededException.class,
                () -> authRateLimitService.checkPasswordResetRequestAllowed(email, ip));

        assertEquals("Too many password reset requests. Please try again later.", exception.getMessage());
    }
}