package com.bookmyhotel.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Booking cancellation request DTO
 */
public class BookingCancellationRequest {
    
    @NotNull(message = "Confirmation number is required")
    private String confirmationNumber;
    
    @NotNull(message = "Guest email is required")
    private String guestEmail;
    
    private String cancellationReason;
    
    // Constructors
    public BookingCancellationRequest() {}
    
    public BookingCancellationRequest(String confirmationNumber, String guestEmail) {
        this.confirmationNumber = confirmationNumber;
        this.guestEmail = guestEmail;
    }
    
    // Getters and Setters
    public String getConfirmationNumber() {
        return confirmationNumber;
    }
    
    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }
    
    public String getGuestEmail() {
        return guestEmail;
    }
    
    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }
    
    public String getCancellationReason() {
        return cancellationReason;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
}
