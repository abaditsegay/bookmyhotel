package com.bookmyhotel.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

/**
 * Booking modification request DTO
 */
public class BookingModificationRequest {
    
    @NotNull(message = "Confirmation number is required")
    private String confirmationNumber;
    
    @NotNull(message = "Guest email is required")
    private String guestEmail;
    
    // Optional fields for modification
    private LocalDate newCheckInDate;
    
    @Future(message = "Check-out date must be in the future")
    private LocalDate newCheckOutDate;
    
    private Long newRoomId; // For room type changes
    
    private String newRoomType; // For room type changes by name
    
    private String newSpecialRequests;
    
    private String guestName;
    
    private String guestPhone;
    
    // Modification reason
    private String reason;
    
    // Constructors
    public BookingModificationRequest() {}
    
    public BookingModificationRequest(String confirmationNumber, String guestEmail) {
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
    
    public LocalDate getNewCheckInDate() {
        return newCheckInDate;
    }
    
    public void setNewCheckInDate(LocalDate newCheckInDate) {
        this.newCheckInDate = newCheckInDate;
    }
    
    public LocalDate getNewCheckOutDate() {
        return newCheckOutDate;
    }
    
    public void setNewCheckOutDate(LocalDate newCheckOutDate) {
        this.newCheckOutDate = newCheckOutDate;
    }
    
    public Long getNewRoomId() {
        return newRoomId;
    }
    
    public void setNewRoomId(Long newRoomId) {
        this.newRoomId = newRoomId;
    }
    
    public String getNewRoomType() {
        return newRoomType;
    }
    
    public void setNewRoomType(String newRoomType) {
        this.newRoomType = newRoomType;
    }
    
    public String getNewSpecialRequests() {
        return newSpecialRequests;
    }
    
    public void setNewSpecialRequests(String newSpecialRequests) {
        this.newSpecialRequests = newSpecialRequests;
    }
    
    public String getGuestName() {
        return guestName;
    }
    
    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }
    
    public String getGuestPhone() {
        return guestPhone;
    }
    
    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}
