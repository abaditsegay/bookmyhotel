package com.bookmyhotel.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
import com.bookmyhotel.service.BookingService;

import jakarta.validation.Valid;

/**
 * Booking controller
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Create a new booking by room type (the only booking method)
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request, Authentication auth) {
        String userEmail = (auth != null) ? auth.getName() : null;
        
        BookingResponse response = bookingService.createBooking(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * @deprecated Legacy endpoint - use main POST endpoint instead
     * Kept for API compatibility but delegates to room type booking
     */
    @PostMapping("/room-type")
    @Deprecated
    public ResponseEntity<BookingResponse> createBookingByRoomType(
            @Valid @RequestBody BookingRequest request, 
            Authentication auth) {
        // Delegate to main endpoint
        return createBooking(request, auth);
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
     * Get user bookings
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getUserBookings(@PathVariable Long userId) {
        List<BookingResponse> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }
    
    /**
     * Search booking by confirmation number
     */
    @GetMapping("/search")
    public ResponseEntity<BookingResponse> searchBooking(
            @RequestParam(required = false) String confirmationNumber,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String lastName) {
        
        BookingResponse response;
        if (confirmationNumber != null && !confirmationNumber.trim().isEmpty()) {
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
    public ResponseEntity<byte[]> downloadBookingPdf(@PathVariable Long reservationId) {
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
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Modify an existing booking (for guests)
     */
    @PutMapping("/modify")
    public ResponseEntity<BookingModificationResponse> modifyBooking(
            @Valid @RequestBody BookingModificationRequest request) {
        
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
        BookingModificationResponse response = bookingService.cancelCustomerBooking(reservationId, cancellationReason, userEmail);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}
