package com.bookmyhotel.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Booking request DTO
 */
public class BookingRequest {
    
    @NotNull(message = "Room ID is required")
    private Long roomId;
    
    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;
    
    @Positive(message = "Number of guests must be positive")
    private Integer guests;
    
    private String specialRequests;
    
    // Payment information
    private String paymentMethodId; // Stripe payment method ID
    
    // Guest information (required for anonymous bookings, optional for authenticated users)
    private String guestName;
    
    private String guestEmail;
    
    private String guestPhone;
    
    // Constructors
    public BookingRequest() {}
    
    public BookingRequest(Long roomId, LocalDate checkInDate, LocalDate checkOutDate, Integer guests) {
        this.roomId = roomId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.guests = guests;
    }
    
    // Getters and Setters
    public Long getRoomId() {
        return roomId;
    }
    
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
    
    public LocalDate getCheckInDate() {
        return checkInDate;
    }
    
    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }
    
    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }
    
    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }
    
    public Integer getGuests() {
        return guests;
    }
    
    public void setGuests(Integer guests) {
        this.guests = guests;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public String getPaymentMethodId() {
        return paymentMethodId;
    }
    
    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
    
    public String getGuestName() {
        return guestName;
    }
    
    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }
    
    public String getGuestEmail() {
        return guestEmail;
    }
    
    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }
    
    public String getGuestPhone() {
        return guestPhone;
    }
    
    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }
}
