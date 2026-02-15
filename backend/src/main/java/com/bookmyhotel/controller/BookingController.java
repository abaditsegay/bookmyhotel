package com.bookmyhotel.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingCancellationRequest;
import com.bookmyhotel.dto.BookingModificationRequest;
import com.bookmyhotel.dto.BookingModificationResponse;
import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.BookingService;

import jakarta.validation.Valid;

/**
 * Booking controller
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new booking by room type (the only booking method)
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request,
            Authentication auth) {
        String userEmail = (auth != null) ? auth.getName() : null;

        BookingResponse response = bookingService.createBooking(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * @deprecated Legacy endpoint - use main POST endpoint instead
     *             Kept for API compatibility but delegates to room type booking
     */
    @PostMapping("/room-type")
    @Deprecated
    public ResponseEntity<BookingResponse> createBookingByRoomType(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {

        logger.info("Received booking request at /room-type endpoint:");
        logger.info("Hotel ID: {}", request.getHotelId());
        logger.info("Room Type: {}", request.getRoomType());
        logger.info("Room ID: {}", request.getRoomId());
        logger.info("Check-in: {}, Check-out: {}", request.getCheckInDate(), request.getCheckOutDate());
        logger.info("Guests: {}", request.getGuests());
        logger.info("Guest Name: {}, Email: {}, Phone: {}", request.getGuestName(), request.getGuestEmail(),
                request.getGuestPhone());

        try {
            // Delegate to main endpoint
            return createBooking(request, auth);
        } catch (Exception e) {
            logger.error("Error processing booking request: ", e);
            throw e;
        }
    }

    /**
     * Get booking details
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long reservationId) {
        BookingResponse response = bookingService.getBooking(reservationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel a booking
     */
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long reservationId) {
        BookingResponse response = bookingService.cancelBooking(reservationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user bookings (authenticated users can only access their own bookings
     * unless they're admin)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getUserBookings(
            @PathVariable Long userId,
            Authentication authentication) {

        // Security check: users can only access their own bookings unless they're
        // admin/hotel admin
        if (authentication != null) {
            String username = authentication.getName();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN") ||
                            auth.getAuthority().equals("ROLE_SYSTEM_ADMIN") ||
                            auth.getAuthority().equals("ROLE_HOTEL_ADMIN"));

            // If not admin, verify they're requesting their own bookings
            if (!isAdmin) {
                // Get the user from the authentication to compare with the requested userId
                // The username is the email, so we need to verify this matches the user
                try {
                    User authenticatedUser = userRepository.findByEmail(username)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + username));
                    if (!authenticatedUser.getId().equals(userId)) {
                        logger.warn("User {} attempted to access bookings for user {}", authenticatedUser.getId(),
                                userId);
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                    }
                } catch (Exception e) {
                    logger.error("Error verifying user authorization: {}", e.getMessage());
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
            }
        }

        List<BookingResponse> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Search booking by confirmation number and email (both required for security)
     */
    @GetMapping("/search")
    public ResponseEntity<BookingResponse> searchBooking(
            @RequestParam(required = false) String confirmationNumber,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String lastName) {

        BookingResponse response;

        // Primary search: confirmation number AND email (both required for enhanced
        // security)
        if (confirmationNumber != null && !confirmationNumber.trim().isEmpty() &&
                email != null && !email.trim().isEmpty()) {
            // Use public search with both confirmation number and email for verification
            response = bookingService.findByConfirmationNumberAndEmailPublic(confirmationNumber.trim(), email.trim());
        }
        // Fallback search methods for backward compatibility
        else if (confirmationNumber != null && !confirmationNumber.trim().isEmpty()) {
            // Use public search to find bookings across all tenants
            response = bookingService.findByConfirmationNumberPublic(confirmationNumber.trim());
        } else if (email != null && lastName != null &&
                !email.trim().isEmpty() && !lastName.trim().isEmpty()) {
            // Use public search for email/lastName to find bookings across all tenants
            response = bookingService.findByEmailAndLastNamePublic(email.trim(), lastName.trim());
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Send booking confirmation email
     */
    @PostMapping("/{reservationId}/email")
    public ResponseEntity<Map<String, String>> sendBookingEmail(
            @PathVariable Long reservationId,
            @RequestBody Map<String, Object> emailRequest) {

        String emailAddress = (String) emailRequest.get("emailAddress");
        Boolean includeItinerary = (Boolean) emailRequest.getOrDefault("includeItinerary", true);

        try {
            bookingService.sendBookingConfirmationEmail(reservationId, emailAddress, includeItinerary);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Booking confirmation email sent successfully");
            response.put("emailAddress", emailAddress);

            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            // Handle case when email service is not configured
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Email service is currently unavailable");
            errorResponse.put("details", "Microsoft Graph OAuth2 configuration is required");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to send email: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Download booking confirmation PDF
     */
    @GetMapping("/{reservationId}/pdf")
    public ResponseEntity<?> downloadBookingPdf(@PathVariable Long reservationId) {
        try {
            byte[] pdfContent = bookingService.generateBookingConfirmationPdf(reservationId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    String.format("booking-confirmation-%d.pdf", reservationId));
            headers.setContentLength(pdfContent.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);

        } catch (ResourceNotFoundException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Booking not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            logger.error("Error generating PDF for reservation {}: {}", reservationId, e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate PDF: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Modify an existing booking (for guests without authentication)
     * Requires both confirmation number and guest email for security
     */
    @PutMapping("/modify")
    public ResponseEntity<BookingModificationResponse> modifyBooking(
            @Valid @RequestBody BookingModificationRequest request) {

        // Validate required fields for guest modification
        if (request.getConfirmationNumber() == null || request.getConfirmationNumber().trim().isEmpty()) {
            BookingModificationResponse errorResponse = new BookingModificationResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Confirmation number is required for guest booking modifications");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        if (request.getGuestEmail() == null || request.getGuestEmail().trim().isEmpty()) {
            BookingModificationResponse errorResponse = new BookingModificationResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Guest email is required for guest booking modifications");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        BookingModificationResponse response = bookingService.modifyBooking(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Cancel a booking (for guests)
     */
    @PostMapping("/cancel")
    public ResponseEntity<BookingModificationResponse> cancelBooking(
            @Valid @RequestBody BookingCancellationRequest request) {

        BookingModificationResponse response = bookingService.cancelBooking(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Modify an existing booking (for authenticated customers)
     */
    @PutMapping("/{reservationId}/modify")
    public ResponseEntity<BookingModificationResponse> modifyCustomerBooking(
            @PathVariable Long reservationId,
            @Valid @RequestBody BookingModificationRequest request,
            Authentication auth) {

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = auth.getName();
        BookingModificationResponse response = bookingService.modifyCustomerBooking(reservationId, request, userEmail);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Find booking by payment reference (useful for payment verification)
     */
    @GetMapping("/search/payment-reference/{paymentReference}")
    public ResponseEntity<BookingResponse> findByPaymentReference(@PathVariable String paymentReference) {
        try {
            BookingResponse booking = bookingService.findByPaymentReferencePublic(paymentReference);
            return ResponseEntity.ok(booking);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Cancel a booking (for authenticated customers)
     */
    @PutMapping("/{reservationId}/cancel")
    public ResponseEntity<BookingModificationResponse> cancelCustomerBooking(
            @PathVariable Long reservationId,
            @RequestBody(required = false) Map<String, String> requestBody,
            Authentication auth) {

        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userEmail = auth.getName();
        String cancellationReason = requestBody != null ? requestBody.get("cancellationReason") : null;
        BookingModificationResponse response = bookingService.cancelCustomerBooking(reservationId, cancellationReason,
                userEmail);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Send authentication email for booking management
     */
    @PostMapping("/authenticate")
    public ResponseEntity<?> authenticateBookingAccess(@RequestBody Map<String, String> request) {
        try {
            String confirmationNumber = request.get("confirmationNumber");
            String email = request.get("email");
            String action = request.get("action"); // "modify" or "cancel"

            if (confirmationNumber == null || confirmationNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Confirmation number is required"));
            }

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
            }

            // Verify the booking exists and email matches
            try {
                BookingResponse booking = bookingService.findByConfirmationNumberPublic(confirmationNumber);

                if (!booking.getGuestEmail().equalsIgnoreCase(email.trim())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "Email does not match the booking record"));
                }

                // Send authentication email with secure token
                bookingService.sendBookingAuthenticationEmail(confirmationNumber, email.trim(), action);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message",
                        "Authentication email sent successfully. Please check your email and click the link to manage your booking."));

            } catch (ResourceNotFoundException e) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Booking not found with the provided confirmation number"));
            }

        } catch (Exception e) {
            logger.error("Error sending booking authentication email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message",
                            "Failed to send authentication email. Please try again."));
        }
    }
}
