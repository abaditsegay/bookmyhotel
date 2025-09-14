package com.bookmyhotel.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookmyhotel.util.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * Service for generating and validating booking management tokens
 * These tokens allow anonymous guests to manage their specific reservations
 */
@Service
public class BookingTokenService {

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${jwt.secret.key}")
    private String jwtSecret;

    // Token validity: 365 days (1 year)
    private static final long BOOKING_TOKEN_VALIDITY = 365 * 24 * 60 * 60 * 1000L;

    /**
     * Generate a booking management token for a specific reservation
     * This token allows the guest to view and manage only this specific booking
     */
    public String generateBookingManagementToken(Long reservationId, String guestEmail) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + BOOKING_TOKEN_VALIDITY);

        return Jwts.builder()
                .subject("booking:" + reservationId)
                .claim("reservationId", reservationId)
                .claim("guestEmail", guestEmail)
                .claim("type", "booking_management")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(new javax.crypto.spec.SecretKeySpec(jwtSecret.getBytes(), "HmacSHA512"))
                .compact();
    }

    /**
     * Validate booking management token and extract reservation ID
     */
    public Long validateBookingToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(javax.crypto.spec.SecretKeySpec.class.cast(new javax.crypto.spec.SecretKeySpec(jwtSecret.getBytes(), "HmacSHA512")))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String type = claims.get("type", String.class);
            if (!"booking_management".equals(type)) {
                return null;
            }

            return claims.get("reservationId", Long.class);
        } catch (Exception e) {
            System.err.println("JWT validation error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Extract guest email from booking token
     */
    public String getGuestEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(javax.crypto.spec.SecretKeySpec.class.cast(new javax.crypto.spec.SecretKeySpec(jwtSecret.getBytes(), "HmacSHA512")))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.get("guestEmail", String.class);
        } catch (Exception e) {
            System.err.println("JWT email extraction error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Generate management URL for booking
     */
    public String generateManagementUrl(Long reservationId, String guestEmail, String baseUrl) {
        String token = generateBookingManagementToken(reservationId, guestEmail);
        return baseUrl + "/guest-booking-management?token=" + token;
    }
}
