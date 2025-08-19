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
    
    @Value("${app.jwt.secret}")
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
            .setSubject("booking:" + reservationId)
            .claim("reservationId", reservationId)
            .claim("guestEmail", guestEmail)
            .claim("type", "booking_management")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    /**
     * Validate booking management token and extract reservation ID
     */
    public Long validateBookingToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody();
                
            String type = claims.get("type", String.class);
            if (!"booking_management".equals(type)) {
                return null;
            }
            
            return claims.get("reservationId", Long.class);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Extract guest email from booking token
     */
    public String getGuestEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .build()
                .parseClaimsJws(token)
                .getBody();
                
            return claims.get("guestEmail", String.class);
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Generate management URL for booking
     */
    public String generateManagementUrl(Long reservationId, String guestEmail, String baseUrl) {
        String token = generateBookingManagementToken(reservationId, guestEmail);
        return baseUrl + "/booking-management?token=" + token;
    }
}
