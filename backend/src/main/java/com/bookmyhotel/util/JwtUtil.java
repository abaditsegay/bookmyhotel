package com.bookmyhotel.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * JWT utility class for token generation and validation
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private Long expiration;

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
     * Validate token
     */
    public Boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Validate token against user details
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
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
