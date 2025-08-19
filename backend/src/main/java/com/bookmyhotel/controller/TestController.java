package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.service.BookingTokenService;

/**
 * Temporary test controller for generating booking tokens
 * This should be removed in production
 */
@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private BookingTokenService bookingTokenService;

    /**
     * Generate a test booking token
     */
    @GetMapping("/generate-token")
    public ResponseEntity<?> generateTestToken(
            @RequestParam Long reservationId,
            @RequestParam String guestEmail) {
        try {
            String token = bookingTokenService.generateBookingManagementToken(reservationId, guestEmail);
            return ResponseEntity.ok(java.util.Map.of(
                "token", token,
                "reservationId", reservationId,
                "guestEmail", guestEmail
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating token: " + e.getMessage());
        }
    }
}
