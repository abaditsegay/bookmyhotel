package com.bookmyhotel.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.service.TokenBlacklistService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * JWT utility class for token generation and validation
 */
@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret.key}")
    private String secret;

    @Value("${jwt.expiration.time}")
    private Long expiration;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    /**
     * Generate JWT token for user
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("email", user.getEmail());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        claims.put("roles", user.getRoles());

        // For hotel-bound users, include hotelId; for system-wide users, include
        // tenantId (null)
        if (user.getHotel() != null) {
            claims.put("hotelId", user.getHotel().getId());
            claims.put("hotelName", user.getHotel().getName());
            // Tenant ID derived from hotel for hotel staff
            claims.put("tenantId", user.getHotel().getTenantId());
        } else {
            // System-wide users (GUEST, CUSTOMER, ADMIN) have no hotel or tenant
            claims.put("hotelId", null);
            claims.put("tenantId", null);
        }

        return createToken(claims, user.getEmail());
    }

    /**
     * Create JWT token with claims
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Extract email from token
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract username from token (alias for extractEmail)
     */
    public String extractUsername(String token) {
        return extractEmail(token);
    }

    /**
     * Extract tenant ID from token
     */
    public String extractTenantId(String token) {
        return extractClaim(token, claims -> (String) claims.get("tenantId"));
    }

    /**
     * Extract hotel ID from token (for hotel staff)
     */
    public Long extractHotelId(String token) {
        return extractClaim(token, claims -> {
            Object hotelId = claims.get("hotelId");
            if (hotelId instanceof Integer) {
                return ((Integer) hotelId).longValue();
            } else if (hotelId instanceof Long) {
                return (Long) hotelId;
            }
            return null;
        });
    }

    /**
     * Extract expiration date from token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract specific claim from token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if token is expired
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate token (checks expiration and blacklist)
     */
    public Boolean isTokenValid(String token) {
        try {
            // Check if token is blacklisted first
            if (tokenBlacklistService.isTokenBlacklisted(token)) {
                logger.debug("Token validation failed: token is blacklisted");
                return false;
            }

            // Check if token is expired
            if (isTokenExpired(token)) {
                logger.debug("Token validation failed: token is expired");
                return false;
            }

            return true;
        } catch (Exception e) {
            logger.warn("Token validation failed with exception: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate token against user details (checks expiration, blacklist, and user
     * match)
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);

            // Check username match first
            if (!username.equals(userDetails.getUsername())) {
                logger.debug("Token validation failed: username mismatch");
                return false;
            }

            // Use the comprehensive isTokenValid method
            return isTokenValid(token);
        } catch (Exception e) {
            logger.warn("Token validation against user details failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Blacklist a token (for logout functionality)
     */
    public void blacklistToken(String token) {
        try {
            Date expirationDate = extractExpiration(token);
            tokenBlacklistService.blacklistToken(token, expirationDate);
            logger.debug("Token successfully blacklisted");
        } catch (Exception e) {
            logger.warn("Failed to blacklist token: {}", e.getMessage());
        }
    }

    /**
     * Get signing key
     */
    private SecretKey getSignInKey() {
        // Use the secret directly as bytes since it's already a long string
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
