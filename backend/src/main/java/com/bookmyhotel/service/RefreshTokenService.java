package com.bookmyhotel.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.util.JwtUtil;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * Service to manage refresh tokens for seamless token renewal
 */
@Service
public class RefreshTokenService {

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenService.class);

    // Refresh token storage (refreshToken -> RefreshTokenInfo)
    private final ConcurrentHashMap<String, RefreshTokenInfo> refreshTokens = new ConcurrentHashMap<>();

    // User to refresh token mapping (userId -> refreshToken) for quick lookups
    private final ConcurrentHashMap<Long, String> userToRefreshToken = new ConcurrentHashMap<>();

    // Scheduled executor for cleanup
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh.expiration.time:604800000}")
    private Long refreshTokenExpirationTime; // 7 days in milliseconds

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SessionManagementService sessionManagementService;

    @PostConstruct
    public void init() {
        // Schedule cleanup task to run every hour
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredTokens, 1, 1, TimeUnit.HOURS);
        logger.info("RefreshTokenService initialized - Refresh token expiration: {} ms", refreshTokenExpirationTime);
    }

    @PreDestroy
    public void destroy() {
        cleanupExecutor.shutdown();
        try {
            if (!cleanupExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                cleanupExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        logger.info("RefreshTokenService shutdown completed");
    }

    /**
     * Generate a new refresh token for a user
     * 
     * @param userId The user ID
     * @return The generated refresh token
     */
    public String generateRefreshToken(Long userId) {
        // Invalidate any existing refresh token for this user
        String existingToken = userToRefreshToken.get(userId);
        if (existingToken != null) {
            refreshTokens.remove(existingToken);
        }

        // Generate secure random refresh token
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        // Create refresh token info
        RefreshTokenInfo tokenInfo = new RefreshTokenInfo(
                refreshToken,
                userId,
                LocalDateTime.now(),
                LocalDateTime.now().plusSeconds(refreshTokenExpirationTime / 1000));

        // Store the refresh token
        refreshTokens.put(refreshToken, tokenInfo);
        userToRefreshToken.put(userId, refreshToken);

        logger.debug("Generated refresh token for user {}", userId);
        return refreshToken;
    }

    /**
     * Validate and use a refresh token to generate new access token
     * 
     * @param refreshToken The refresh token
     * @param userAgent    User agent for session management
     * @param ipAddress    IP address for session management
     * @return New access token if refresh token is valid, null otherwise
     */
    public String refreshAccessToken(String refreshToken, String userAgent, String ipAddress) {
        RefreshTokenInfo tokenInfo = refreshTokens.get(refreshToken);

        if (tokenInfo == null) {
            logger.debug("Refresh token not found");
            return null;
        }

        // Check if refresh token has expired
        if (tokenInfo.getExpiresAt().isBefore(LocalDateTime.now())) {
            logger.debug("Refresh token expired for user {}", tokenInfo.getUserId());
            revokeRefreshToken(refreshToken);
            return null;
        }

        // Get user from database
        User user = userRepository.findById(tokenInfo.getUserId()).orElse(null);
        if (user == null || !user.getIsActive()) {
            logger.debug("User not found or inactive for refresh token");
            revokeRefreshToken(refreshToken);
            return null;
        }

        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(user);

        // Create new session
        sessionManagementService.createSession(user.getId(), newAccessToken, userAgent, ipAddress);

        // Update refresh token last used time
        tokenInfo.setLastUsed(LocalDateTime.now());

        logger.debug("Refreshed access token for user {}", user.getId());
        return newAccessToken;
    }

    /**
     * Revoke a refresh token
     * 
     * @param refreshToken The refresh token to revoke
     */
    public void revokeRefreshToken(String refreshToken) {
        RefreshTokenInfo tokenInfo = refreshTokens.remove(refreshToken);
        if (tokenInfo != null) {
            userToRefreshToken.remove(tokenInfo.getUserId());
            logger.debug("Revoked refresh token for user {}", tokenInfo.getUserId());
        }
    }

    /**
     * Revoke all refresh tokens for a user
     * 
     * @param userId The user ID
     */
    public void revokeAllUserRefreshTokens(Long userId) {
        String refreshToken = userToRefreshToken.remove(userId);
        if (refreshToken != null) {
            refreshTokens.remove(refreshToken);
            logger.debug("Revoked all refresh tokens for user {}", userId);
        }
    }

    /**
     * Check if a refresh token is valid
     * 
     * @param refreshToken The refresh token to validate
     * @return true if valid, false otherwise
     */
    public boolean isRefreshTokenValid(String refreshToken) {
        RefreshTokenInfo tokenInfo = refreshTokens.get(refreshToken);
        if (tokenInfo == null) {
            return false;
        }

        // Check expiration
        if (tokenInfo.getExpiresAt().isBefore(LocalDateTime.now())) {
            revokeRefreshToken(refreshToken);
            return false;
        }

        return true;
    }

    /**
     * Get refresh token info
     * 
     * @param refreshToken The refresh token
     * @return RefreshTokenInfo or null if not found
     */
    public RefreshTokenInfo getRefreshTokenInfo(String refreshToken) {
        return refreshTokens.get(refreshToken);
    }

    /**
     * Clean up expired refresh tokens
     */
    private void cleanupExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int initialSize = refreshTokens.size();

        refreshTokens.entrySet().removeIf(entry -> {
            RefreshTokenInfo tokenInfo = entry.getValue();
            if (tokenInfo.getExpiresAt().isBefore(now)) {
                userToRefreshToken.remove(tokenInfo.getUserId());
                return true;
            }
            return false;
        });

        int removedCount = initialSize - refreshTokens.size();
        if (removedCount > 0) {
            logger.debug("Cleaned up {} expired refresh tokens. Active tokens: {}", removedCount, refreshTokens.size());
        }
    }

    /**
     * Get current refresh token count
     * 
     * @return Number of active refresh tokens
     */
    public int getActiveRefreshTokenCount() {
        return refreshTokens.size();
    }

    /**
     * Refresh token information holder
     */
    public static class RefreshTokenInfo {
        private final String token;
        private final Long userId;
        private final LocalDateTime createdAt;
        private LocalDateTime lastUsed;
        private final LocalDateTime expiresAt;

        public RefreshTokenInfo(String token, Long userId, LocalDateTime createdAt, LocalDateTime expiresAt) {
            this.token = token;
            this.userId = userId;
            this.createdAt = createdAt;
            this.lastUsed = createdAt;
            this.expiresAt = expiresAt;
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

        public LocalDateTime getLastUsed() {
            return lastUsed;
        }

        public void setLastUsed(LocalDateTime lastUsed) {
            this.lastUsed = lastUsed;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }
    }
}