package com.bookmyhotel.service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookmyhotel.util.JwtUtil;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * Service to manage user sessions, session timeouts, and concurrent session
 * control
 */
@Service
public class SessionManagementService {

    private static final Logger logger = LoggerFactory.getLogger(SessionManagementService.class);

    // Session storage (userId -> SessionInfo)
    private final ConcurrentHashMap<Long, SessionInfo> activeSessions = new ConcurrentHashMap<>();

    // Token to user mapping (token -> userId) for quick lookups
    private final ConcurrentHashMap<String, Long> tokenToUser = new ConcurrentHashMap<>();

    // Scheduled executor for session cleanup
    private final ScheduledExecutorService sessionCleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    @Value("${jwt.expiration.time:86400000}")
    private Long jwtExpirationTime;

    @Value("${security.session.timeout.minutes:30}")
    private Long sessionTimeoutMinutes;

    @Value("${security.session.max-concurrent:1}")
    private Integer maxConcurrentSessions;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @PostConstruct
    public void init() {
        // Schedule session cleanup task to run every 5 minutes
        sessionCleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredSessions, 5, 5, TimeUnit.MINUTES);
        logger.info("SessionManagementService initialized - Session timeout: {} minutes, Max concurrent: {}",
                sessionTimeoutMinutes, maxConcurrentSessions);
    }

    @PreDestroy
    public void destroy() {
        sessionCleanupExecutor.shutdown();
        try {
            if (!sessionCleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                sessionCleanupExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            sessionCleanupExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        logger.info("SessionManagementService shutdown completed");
    }

    /**
     * Create a new session for a user
     * 
     * @param userId    The user ID
     * @param token     The JWT token
     * @param userAgent User agent string for identification
     * @param ipAddress IP address of the user
     * @return true if session was created successfully, false if max concurrent
     *         sessions exceeded
     */
    public boolean createSession(Long userId, String token, String userAgent, String ipAddress) {
        SessionInfo existingSession = activeSessions.get(userId);

        // Check concurrent session limit
        if (existingSession != null && maxConcurrentSessions <= 1) {
            // Invalidate existing session if only one session allowed
            logger.warn(
                    "🚨 POTENTIAL ISSUE: Invalidating existing session for user {} due to concurrent session limit. " +
                            "Old token: {}..., New token: {}..., UserAgent: {}",
                    userId,
                    existingSession.getToken().substring(0, Math.min(20, existingSession.getToken().length())),
                    token.substring(0, Math.min(20, token.length())),
                    userAgent);
            invalidateSession(existingSession.getToken());
        }

        // Create new session
        SessionInfo newSession = new SessionInfo(
                token,
                userId,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(sessionTimeoutMinutes),
                userAgent,
                ipAddress);

        activeSessions.put(userId, newSession);
        tokenToUser.put(token, userId);

        logger.info("✅ Created new session for user {} from IP {} (Token: {}...)",
                userId, ipAddress, token.substring(0, Math.min(20, token.length())));
        return true;
    }

    /**
     * Update session activity (extend timeout)
     * 
     * @param token The JWT token
     */
    public void updateSessionActivity(String token) {
        Long userId = tokenToUser.get(token);
        if (userId != null) {
            SessionInfo session = activeSessions.get(userId);
            if (session != null && session.getToken().equals(token)) {
                session.setLastActivity(LocalDateTime.now());
                session.setExpiresAt(LocalDateTime.now().plusMinutes(sessionTimeoutMinutes));
                logger.debug("Updated session activity for user {}", userId);
            }
        }
    }

    /**
     * Check if a session is valid and active
     * 
     * @param token The JWT token
     * @return true if session is valid and active
     */
    public boolean isSessionValid(String token) {
        Long userId = tokenToUser.get(token);
        if (userId == null) {
            return false;
        }

        SessionInfo session = activeSessions.get(userId);
        if (session == null || !session.getToken().equals(token)) {
            tokenToUser.remove(token);
            return false;
        }

        // Check if session has expired
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.debug("Session expired for user {}", userId);
            invalidateSession(token);
            return false;
        }

        return true;
    }

    /**
     * Invalidate a session
     * 
     * @param token The JWT token to invalidate
     */
    public void invalidateSession(String token) {
        Long userId = tokenToUser.remove(token);
        if (userId != null) {
            SessionInfo session = activeSessions.remove(userId);
            if (session != null) {
                // Blacklist the token
                try {
                    Date tokenExpiration = jwtUtil.extractExpiration(token);
                    tokenBlacklistService.blacklistToken(token, tokenExpiration);
                } catch (Exception e) {
                    logger.warn("Failed to blacklist token during session invalidation: {}", e.getMessage());
                }

                logger.debug("Invalidated session for user {}", userId);
            }
        }
    }

    /**
     * Invalidate all sessions for a user
     * 
     * @param userId The user ID
     */
    public void invalidateAllUserSessions(Long userId) {
        SessionInfo session = activeSessions.remove(userId);
        if (session != null) {
            tokenToUser.remove(session.getToken());

            // Blacklist the token
            try {
                Date tokenExpiration = jwtUtil.extractExpiration(session.getToken());
                tokenBlacklistService.blacklistToken(session.getToken(), tokenExpiration);
            } catch (Exception e) {
                logger.warn("Failed to blacklist token during user session invalidation: {}", e.getMessage());
            }

            logger.info("Invalidated all sessions for user {}", userId);
        }
    }

    /**
     * Get session information for a token
     * 
     * @param token The JWT token
     * @return SessionInfo or null if not found
     */
    public SessionInfo getSessionInfo(String token) {
        Long userId = tokenToUser.get(token);
        if (userId != null) {
            SessionInfo session = activeSessions.get(userId);
            if (session != null && session.getToken().equals(token)) {
                return session;
            }
        }
        return null;
    }

    /**
     * Clean up expired sessions
     */
    private void cleanupExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        int initialSize = activeSessions.size();

        activeSessions.entrySet().removeIf(entry -> {
            SessionInfo session = entry.getValue();
            if (session.getExpiresAt().isBefore(now)) {
                tokenToUser.remove(session.getToken());

                // Blacklist expired tokens
                try {
                    Date tokenExpiration = jwtUtil.extractExpiration(session.getToken());
                    tokenBlacklistService.blacklistToken(session.getToken(), tokenExpiration);
                } catch (Exception e) {
                    logger.warn("Failed to blacklist expired session token: {}", e.getMessage());
                }

                return true;
            }
            return false;
        });

        int removedCount = initialSize - activeSessions.size();
        if (removedCount > 0) {
            logger.debug("Cleaned up {} expired sessions. Active sessions: {}", removedCount, activeSessions.size());
        }
    }

    /**
     * Get current active session count
     * 
     * @return Number of active sessions
     */
    public int getActiveSessionCount() {
        return activeSessions.size();
    }

    /**
     * Get active session count for a specific user
     * 
     * @param userId The user ID
     * @return Number of active sessions for the user
     */
    public int getUserActiveSessionCount(Long userId) {
        return activeSessions.containsKey(userId) ? 1 : 0;
    }

    /**
     * Session information holder
     */
    public static class SessionInfo {
        private final String token;
        private final Long userId;
        private final LocalDateTime createdAt;
        private LocalDateTime lastActivity;
        private LocalDateTime expiresAt;
        private final String userAgent;
        private final String ipAddress;

        public SessionInfo(String token, Long userId, LocalDateTime createdAt, LocalDateTime expiresAt,
                String userAgent, String ipAddress) {
            this.token = token;
            this.userId = userId;
            this.createdAt = createdAt;
            this.lastActivity = createdAt;
            this.expiresAt = expiresAt;
            this.userAgent = userAgent;
            this.ipAddress = ipAddress;
        }

        // Getters and setters
        public String getToken() {
            return token;
        }

        public Long getUserId() {
            return userId;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public LocalDateTime getLastActivity() {
            return lastActivity;
        }

        public void setLastActivity(LocalDateTime lastActivity) {
            this.lastActivity = lastActivity;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }

        public void setExpiresAt(LocalDateTime expiresAt) {
            this.expiresAt = expiresAt;
        }

        public String getUserAgent() {
            return userAgent;
        }

        public String getIpAddress() {
            return ipAddress;
        }
    }
}
