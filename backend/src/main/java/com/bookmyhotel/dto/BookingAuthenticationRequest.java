package com.bookmyhotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for booking authentication
 */
public class BookingAuthenticationRequest {
    
    @NotBlank(message = "Confirmation number is required")
    private String confirmationNumber;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;
    
    private String action; // "modify" or "cancel"
    
    // Constructors
    public BookingAuthenticationRequest() {}
    
    public BookingAuthenticationRequest(String confirmationNumber, String email, String action) {
        this.confirmationNumber = confirmationNumber;
        this.email = email;
        this.action = action;
    }
    
    // Getters and Setters
    public String getConfirmationNumber() {
        return confirmationNumber;
    }
    
    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
}