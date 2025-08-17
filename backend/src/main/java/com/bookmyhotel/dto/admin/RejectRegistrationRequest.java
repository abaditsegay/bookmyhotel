package com.bookmyhotel.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for rejecting hotel registration
 */
public class RejectRegistrationRequest {
    
    @NotBlank(message = "Rejection reason is required")
    @Size(max = 500, message = "Rejection reason must not exceed 500 characters")
    private String reason;
    
    // Constructors
    public RejectRegistrationRequest() {}
    
    public RejectRegistrationRequest(String reason) {
        this.reason = reason;
    }
    
    // Getters and Setters
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}
