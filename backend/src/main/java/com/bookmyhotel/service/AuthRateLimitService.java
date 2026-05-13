package com.bookmyhotel.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookmyhotel.exception.RateLimitExceededException;

/**
 * In-memory throttling and temporary lockout service for public auth endpoints.
 */
@Service
public class AuthRateLimitService {

    @Value("${security.auth.login.max-failures:5}")
    private int maxLoginFailures;

    @Value("${security.auth.login.failure-window-minutes:15}")
    private long loginFailureWindowMinutes;

    @Value("${security.auth.login.lockout-minutes:15}")
    private long loginLockoutMinutes;

    @Value("${security.auth.password-reset.max-attempts:3}")
    private int maxPasswordResetRequests;

    @Value("${security.auth.password-reset.window-minutes:15}")
    private long passwordResetWindowMinutes;

    @Value("${security.auth.reset-token.max-attempts:10}")
    private int maxResetTokenAttempts;

    @Value("${security.auth.reset-token.window-minutes:15}")
    private long resetTokenWindowMinutes;

    private final ConcurrentMap<String, LoginAttemptState> loginAttempts = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, WindowState> endpointAttempts = new ConcurrentHashMap<>();

    public void assertLoginAllowed(String email, String ipAddress) {
        assertNotLocked(loginKey(email));
        assertNotLocked(loginIpKey(ipAddress));
    }

    public void recordFailedLogin(String email, String ipAddress) {
        recordLoginFailure(loginKey(email));
        recordLoginFailure(loginIpKey(ipAddress));
    }

    public void recordSuccessfulLogin(String email, String ipAddress) {
        loginAttempts.remove(loginKey(email));
        loginAttempts.remove(loginIpKey(ipAddress));
    }

    public void checkPasswordResetRequestAllowed(String email, String ipAddress) {
        checkAndRecordWindow(
                "password-reset-email:" + normalizeEmail(email),
                maxPasswordResetRequests,
                passwordResetWindowMinutes,
                "Too many password reset requests. Please try again later.");
        checkAndRecordWindow(
                "password-reset-ip:" + normalizeIp(ipAddress),
                maxPasswordResetRequests,
                passwordResetWindowMinutes,
                "Too many password reset requests. Please try again later.");
    }

    public void checkResetTokenValidationAllowed(String ipAddress) {
        checkAndRecordWindow(
                "validate-reset-token-ip:" + normalizeIp(ipAddress),
                maxResetTokenAttempts,
                resetTokenWindowMinutes,
                "Too many reset token validation attempts. Please try again later.");
    }

    public void checkPasswordResetAllowed(String ipAddress) {
        checkAndRecordWindow(
                "reset-password-ip:" + normalizeIp(ipAddress),
                maxResetTokenAttempts,
                resetTokenWindowMinutes,
                "Too many password reset attempts. Please try again later.");
    }

    private void assertNotLocked(String key) {
        LoginAttemptState state = loginAttempts.get(key);
        if (state == null) {
            return;
        }

        synchronized (state) {
            Instant now = Instant.now();
            prune(state.attempts, now, loginFailureWindowMinutes);
            if (state.lockedUntil != null && state.lockedUntil.isAfter(now)) {
                throw new RateLimitExceededException(
                        "Too many login attempts. Please try again later.",
                        Duration.between(now, state.lockedUntil).getSeconds());
            }

            if (state.lockedUntil != null && !state.lockedUntil.isAfter(now)) {
                state.lockedUntil = null;
                state.attempts.clear();
            }
        }
    }

    private void recordLoginFailure(String key) {
        LoginAttemptState state = loginAttempts.computeIfAbsent(key, ignored -> new LoginAttemptState());
        synchronized (state) {
            Instant now = Instant.now();
            prune(state.attempts, now, loginFailureWindowMinutes);

            if (state.lockedUntil != null && state.lockedUntil.isAfter(now)) {
                return;
            }

            state.attempts.addLast(now);
            if (state.attempts.size() >= maxLoginFailures) {
                state.lockedUntil = now.plus(Duration.ofMinutes(loginLockoutMinutes));
                state.attempts.clear();
            }
        }
    }

    private void checkAndRecordWindow(String key, int maxAttempts, long windowMinutes, String message) {
        WindowState state = endpointAttempts.computeIfAbsent(key, ignored -> new WindowState());
        synchronized (state) {
            Instant now = Instant.now();
            prune(state.attempts, now, windowMinutes);
            if (state.attempts.size() >= maxAttempts) {
                Instant oldest = state.attempts.peekFirst();
                long retryAfterSeconds = oldest == null
                        ? Duration.ofMinutes(windowMinutes).getSeconds()
                        : Math.max(1, Duration.between(now, oldest.plus(Duration.ofMinutes(windowMinutes))).getSeconds());
                throw new RateLimitExceededException(message, retryAfterSeconds);
            }
            state.attempts.addLast(now);
        }
    }

    private void prune(Deque<Instant> attempts, Instant now, long windowMinutes) {
        Instant threshold = now.minus(Duration.ofMinutes(windowMinutes));
        while (!attempts.isEmpty() && attempts.peekFirst().isBefore(threshold)) {
            attempts.removeFirst();
        }
    }

    private String loginKey(String email) {
        return "login-email:" + normalizeEmail(email);
    }

    private String loginIpKey(String ipAddress) {
        return "login-ip:" + normalizeIp(ipAddress);
    }

    private String normalizeEmail(String email) {
        return email == null ? "unknown" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeIp(String ipAddress) {
        return ipAddress == null || ipAddress.isBlank() ? "unknown" : ipAddress.trim();
    }

    private static final class LoginAttemptState {
        private final Deque<Instant> attempts = new ArrayDeque<>();
        private Instant lockedUntil;
    }

    private static final class WindowState {
        private final Deque<Instant> attempts = new ArrayDeque<>();
    }
}
