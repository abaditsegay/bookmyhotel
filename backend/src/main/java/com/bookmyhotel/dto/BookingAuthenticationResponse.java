package com.bookmyhotel.dto;

/**
 * Response DTO for booking authentication
 */
public class BookingAuthenticationResponse {

    private boolean success;
    private String message;
    private String authenticationToken; // Optional - for immediate authentication

    // Constructors
    public BookingAuthenticationResponse() {
    }

    public BookingAuthenticationResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public BookingAuthenticationResponse(boolean success, String message, String authenticationToken) {
        this.success = success;
        this.message = message;
        this.authenticationToken = authenticationToken;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAuthenticationToken() {
        return authenticationToken;
    }

    public void setAuthenticationToken(String authenticationToken) {
        this.authenticationToken = authenticationToken;
    }
}