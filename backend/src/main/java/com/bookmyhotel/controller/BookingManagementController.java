package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.service.BookingService;
import com.bookmyhotel.service.BookingTokenService;

/**
 * Controller for handling booking management via tokens
 * Allows guest users to access their bookings without authentication
 */
@RestController
@RequestMapping("/api/booking-management")
@CrossOrigin(origins = "*")
public class BookingManagementController {

    @Autowired
    private BookingTokenService bookingTokenService;
    
    @Autowired
    private BookingService bookingService;

    /**
     * Get booking details using a booking token
     */
    @GetMapping
    public ResponseEntity<?> getBookingByToken(@RequestParam(required = false) String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Token parameter is required");
            }
            
            Long reservationId = bookingTokenService.validateBookingToken(token);
            
            if (reservationId == null) {
                return ResponseEntity.badRequest().body("Invalid or expired booking token");
            }

            String guestEmail = bookingTokenService.getGuestEmailFromToken(token);
            if (guestEmail == null) {
                return ResponseEntity.badRequest().body("Invalid token format");
            }

            // Get booking details
            BookingResponse booking = bookingService.getBooking(reservationId);
            
            // Verify the email matches the booking
            if (!guestEmail.equals(booking.getGuestEmail())) {
                return ResponseEntity.badRequest().body("Token does not match booking guest");
            }

            return ResponseEntity.ok(booking);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error accessing booking: " + e.getMessage());
        }
    }

    /**
     * Update booking details using a booking token
     * Note: For now, this returns a message that updates are not supported
     */
    @PutMapping
    public ResponseEntity<?> updateBookingByToken(@RequestParam(required = false) String token, @RequestBody BookingResponse updatedBooking) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Token parameter is required");
            }
            
            Long reservationId = bookingTokenService.validateBookingToken(token);
            
            if (reservationId == null) {
                return ResponseEntity.badRequest().body("Invalid or expired booking token");
            }

            // For now, booking updates are not supported via token access
            return ResponseEntity.badRequest().body("Booking updates are not currently supported. Please contact customer service for assistance.");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating booking: " + e.getMessage());
        }
    }

    /**
     * Cancel booking using a booking token
     */
    @DeleteMapping
    public ResponseEntity<?> cancelBookingByToken(@RequestParam(required = false) String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Token parameter is required");
            }
            
            Long reservationId = bookingTokenService.validateBookingToken(token);
            
            if (reservationId == null) {
                return ResponseEntity.badRequest().body("Invalid or expired booking token");
            }

            String guestEmail = bookingTokenService.getGuestEmailFromToken(token);
            if (guestEmail == null) {
                return ResponseEntity.badRequest().body("Invalid token format");
            }

            // Get current booking to verify guest email
            BookingResponse currentBooking = bookingService.getBooking(reservationId);
            if (!guestEmail.equals(currentBooking.getGuestEmail())) {
                return ResponseEntity.badRequest().body("Token does not match booking guest");
            }

            // Cancel the booking
            bookingService.cancelBooking(reservationId);
            return ResponseEntity.ok("Booking cancelled successfully");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error cancelling booking: " + e.getMessage());
        }
    }

    /**
     * Validate a booking token
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam(required = false) String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Token parameter is required");
            }
            
            Long reservationId = bookingTokenService.validateBookingToken(token);
            String guestEmail = bookingTokenService.getGuestEmailFromToken(token);
            
            if (reservationId == null || guestEmail == null) {
                return ResponseEntity.badRequest().body("Invalid or expired token");
            }

            return ResponseEntity.ok(java.util.Map.of(
                "valid", true,
                "reservationId", reservationId,
                "guestEmail", guestEmail
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }
}
