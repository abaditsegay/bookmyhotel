package com.bookmyhotel.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingModificationRequest;
import com.bookmyhotel.dto.BookingModificationResponse;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.service.BookingService;
import com.bookmyhotel.service.BookingTokenService;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Controller for handling booking management via tokens
 * Allows guest users to access their bookings without authentication
 */
@RestController
@RequestMapping("/api/booking-management")
@CrossOrigin(origins = "*")
public class BookingManagementController {

    private static final Logger logger = LoggerFactory.getLogger(BookingManagementController.class);

    @Autowired
    private BookingTokenService bookingTokenService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ReservationRepository reservationRepository;

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
     */
    @PutMapping
    public ResponseEntity<?> updateBookingByToken(@RequestParam(required = false) String token,
            @RequestBody BookingModificationRequest modificationRequest) {
        logger.info("=== BOOKING MODIFICATION REQUEST START ===");
        logger.info("Token received: {}",
                token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "NULL");
        logger.info("Request body received: {}", modificationRequest);

        try {
            if (token == null || token.trim().isEmpty()) {
                logger.error("Token validation failed: Token is null or empty");
                return ResponseEntity.badRequest().body("Token parameter is required");
            }

            logger.info("Validating booking token...");
            Long reservationId = bookingTokenService.validateBookingToken(token);
            logger.info("Token validation result - Reservation ID: {}", reservationId);

            if (reservationId == null) {
                logger.error("Token validation failed: Invalid or expired booking token");
                return ResponseEntity.badRequest().body("Invalid or expired booking token");
            }

            logger.info("Extracting guest email from token...");
            String guestEmail = bookingTokenService.getGuestEmailFromToken(token);
            logger.info("Guest email extracted: {}", guestEmail);
            if (guestEmail == null) {
                logger.error("Token format error: Cannot extract guest email");
                return ResponseEntity.badRequest().body("Invalid token format");
            }

            logger.info("Getting current booking for reservation ID: {}", reservationId);
            // Get current booking to extract confirmation number and verify guest email
            // This call uses public search (no tenant context needed)
            BookingResponse currentBooking = bookingService.getBooking(reservationId);
            logger.info("Retrieved booking - Confirmation: {}, Guest Email: {}",
                    currentBooking.getConfirmationNumber(), currentBooking.getGuestEmail());

            if (!guestEmail.equals(currentBooking.getGuestEmail())) {
                logger.error("Guest email mismatch - Token email: {}, Booking email: {}",
                        guestEmail, currentBooking.getGuestEmail());
                return ResponseEntity.badRequest().body("Token does not match booking guest");
            }
            logger.info("Guest email validation passed");

            // Get the reservation entity to access tenant information
            // Use public search to get the reservation without tenant context
            String confirmationNumber = currentBooking.getConfirmationNumber();
            logger.info("Looking up reservation by confirmation number: {}", confirmationNumber);
            var reservation = reservationRepository.findByConfirmationNumberPublic(confirmationNumber);
            if (reservation.isEmpty()) {
                logger.error("Reservation not found for confirmation number: {}", confirmationNumber);
                return ResponseEntity.badRequest().body("Reservation not found");
            }

            // Set tenant context based on the reservation's tenant ID
            // This is crucial for the room availability queries to work correctly
            String tenantId = reservation.get().getTenantId();
            logger.info("Found reservation with tenant ID: {}", tenantId);
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
                logger.info("Set tenant context to: {}", tenantId);
            } else {
                logger.warn("Reservation has null tenant ID");
            }

            // Set the confirmation number and guest email from the token/booking data
            // BEFORE calling the service, as the service needs these fields to validate the
            // request
            modificationRequest.setConfirmationNumber(currentBooking.getConfirmationNumber());
            modificationRequest.setGuestEmail(guestEmail);
            logger.info(
                    "Populated modification request - Confirmation: {}, Guest Email: {}, New Check-in: {}, New Check-out: {}, Room Type: {}",
                    modificationRequest.getConfirmationNumber(),
                    modificationRequest.getGuestEmail(),
                    modificationRequest.getNewCheckInDate(),
                    modificationRequest.getNewCheckOutDate(),
                    modificationRequest.getNewRoomType());

            // Call the existing modify booking service
            logger.info("Calling bookingService.modifyBooking...");
            try {
                BookingModificationResponse response = bookingService.modifyBooking(modificationRequest);
                logger.info("Service call completed successfully");

                if (response.isSuccess()) {
                    logger.info("Booking modification successful: {}", response.getMessage());
                    return ResponseEntity.ok(response);
                } else {
                    logger.error("Booking modification failed: {}", response.getMessage());
                    return ResponseEntity.badRequest().body(response.getMessage());
                }
            } catch (Exception e) {
                logger.error("Exception during booking modification: {}", e.getMessage(), e);
                return ResponseEntity.badRequest().body("Booking modification failed: " + e.getMessage());
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating booking: " + e.getMessage());
        } finally {
            // Clear tenant context to avoid leaking to other requests
            TenantContext.clear();
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

            // Get the reservation entity to access tenant information
            String confirmationNumber = currentBooking.getConfirmationNumber();
            var reservation = reservationRepository.findByConfirmationNumberPublic(confirmationNumber);
            if (reservation.isEmpty()) {
                return ResponseEntity.badRequest().body("Reservation not found");
            }

            // Set tenant context based on the reservation's tenant ID
            String tenantId = reservation.get().getTenantId();
            if (tenantId != null) {
                TenantContext.setTenantId(tenantId);
            }

            // Cancel the booking and get updated booking data
            BookingResponse cancelledBooking = bookingService.cancelBooking(reservationId);
            return ResponseEntity.ok(cancelledBooking);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error cancelling booking: " + e.getMessage());
        } finally {
            // Clear tenant context to avoid leaking to other requests
            TenantContext.clear();
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
                    "guestEmail", guestEmail));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    /**
     * Generate a fresh booking management token for a reservation
     * Requires confirmation number and guest email for security
     */
    @PostMapping("/regenerate-token")
    public ResponseEntity<?> regenerateToken(@RequestBody java.util.Map<String, String> request) {
        try {
            String confirmationNumber = request.get("confirmationNumber");
            String guestEmail = request.get("guestEmail");

            if (confirmationNumber == null || confirmationNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Confirmation number is required");
            }

            if (guestEmail == null || guestEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Guest email is required");
            }

            logger.info("Regenerating token for confirmation: {}, email: {}", confirmationNumber, guestEmail);

            // Find the reservation using public search (cross-tenant)
            var reservationOpt = reservationRepository.findByConfirmationNumberPublic(confirmationNumber);
            if (reservationOpt.isEmpty()) {
                logger.error("Reservation not found for confirmation: {}", confirmationNumber);
                return ResponseEntity.badRequest().body("Reservation not found");
            }

            var reservation = reservationOpt.get();

            // Verify guest email matches
            String reservationEmail = reservation.getGuestInfo() != null ? reservation.getGuestInfo().getEmail() : null;
            if (!guestEmail.equalsIgnoreCase(reservationEmail)) {
                logger.error("Guest email mismatch for confirmation: {}", confirmationNumber);
                return ResponseEntity.badRequest().body("Invalid guest email for this reservation");
            }

            // Generate new token
            String newToken = bookingTokenService.generateBookingManagementToken(
                    reservation.getId(),
                    reservationEmail);

            // Generate management URL
            String baseUrl = "https://www.shegeroom.com";
            String managementUrl = baseUrl + "/guest-booking-management?token=" + newToken;

            logger.info("Successfully generated new token for reservation: {}", reservation.getId());

            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "message", "New booking management token generated successfully",
                    "token", newToken,
                    "managementUrl", managementUrl,
                    "reservationId", reservation.getId(),
                    "confirmationNumber", confirmationNumber));

        } catch (Exception e) {
            logger.error("Error regenerating token: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to generate new token: " + e.getMessage());
        }
    }
}
