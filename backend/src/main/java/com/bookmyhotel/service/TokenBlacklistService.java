package com.bookmyhotel.service;

import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * Service to manage JWT token blacklisting for logout and security purposes
 * Uses in-memory storage with automatic cleanup of expired tokens
 */
@Service
public class TokenBlacklistService {

    private static final Logger logger = LoggerFactory.getLogger(TokenBlacklistService.class);

    // In-memory blacklist storage (token -> expiration time)
    private final ConcurrentHashMap<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    // Scheduled executor for cleanup task
    private final ScheduledExecutorService cleanupExecutor = Executors.newSingleThreadScheduledExecutor();

    @Value("${jwt.expiration.time:86400000}")
    private Long jwtExpirationTime;

    @PostConstruct
    public void init() {
        // Schedule cleanup task to run every hour
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredTokens, 1, 1, TimeUnit.HOURS);
        logger.info("TokenBlacklistService initialized with automatic cleanup");
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
        logger.info("TokenBlacklistService shutdown completed");
    }

    /**
     * Add a token to the blacklist
     * 
     * @param token          The JWT token to blacklist
     * @param expirationTime When the token expires
     */
    public void blacklistToken(String token, Date expirationTime) {
        if (token != null && expirationTime != null) {
            blacklistedTokens.put(token, expirationTime);
            logger.debug("Token blacklisted, expires at: {}", expirationTime);
        }
    }

    /**
     * Check if a token is blacklisted
     * 
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        if (token == null) {
            return true;
        }

        Date expirationTime = blacklistedTokens.get(token);
        if (expirationTime == null) {
            return false;
        }

        // Check if the blacklisted token has expired
        if (expirationTime.before(new Date())) {
            blacklistedTokens.remove(token);
            return false;
        }

        return true;
    }

    /**
     * Remove expired tokens from the blacklist
     * This method is called periodically to clean up memory
     */
    private void cleanupExpiredTokens() {
        Date now = new Date();
        int initialSize = blacklistedTokens.size();

        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));

        int removedCount = initialSize - blacklistedTokens.size();
        if (removedCount > 0) {
            logger.debug("Cleaned up {} expired tokens from blacklist. Current size: {}",
                    removedCount, blacklistedTokens.size());
        }
    }

    /**
     * Get the current size of the blacklist (for monitoring purposes)
     * 
     * @return The number of blacklisted tokens
     */
    public int getBlacklistSize() {
        return blacklistedTokens.size();
    }

    /**
     * Clear all blacklisted tokens (for testing purposes)
     */
    public void clearBlacklist() {
        blacklistedTokens.clear();
        logger.warn("Token blacklist cleared - this should only be used for testing");
    }
}
