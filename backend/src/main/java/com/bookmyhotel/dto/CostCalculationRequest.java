package com.bookmyhotel.dto;

import java.time.LocalDate;

import com.bookmyhotel.entity.RoomType;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for enhanced cost calculation
 */
public class CostCalculationRequest {
    
    @NotNull(message = "Hotel ID is required")
    private Long hotelId;
    
    @NotNull(message = "Room type is required")
    private RoomType roomType;
    
    @NotNull(message = "Check-in date is required")
    @Future(message = "Check-in date must be in the future")
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;
    
    private String promotionalCode;
    
    @Email(message = "Invalid email format")
    private String customerEmail;
    
    private Integer numberOfGuests;
    
    private Boolean includeBreakfast;
    
    private Boolean includeParkingPass;
    
    // Additional request parameters for enhanced pricing
    private Boolean isGroupBooking;
    
    private Boolean isCorporateBooking;
    
    private String corporateCode;
    
    // Constructors
    public CostCalculationRequest() {}
    
    public CostCalculationRequest(Long hotelId, RoomType roomType, LocalDate checkInDate, LocalDate checkOutDate) {
        this.hotelId = hotelId;
        this.roomType = roomType;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
    }
    
    // Getters and Setters
    public Long getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }
    
    public RoomType getRoomType() {
        return roomType;
    }
    
    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
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
    
    public String getPromotionalCode() {
        return promotionalCode;
    }
    
    public void setPromotionalCode(String promotionalCode) {
        this.promotionalCode = promotionalCode;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
    
    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }
    
    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }
    
    public Boolean getIncludeBreakfast() {
        return includeBreakfast;
    }
    
    public void setIncludeBreakfast(Boolean includeBreakfast) {
        this.includeBreakfast = includeBreakfast;
    }
    
    public Boolean getIncludeParkingPass() {
        return includeParkingPass;
    }
    
    public void setIncludeParkingPass(Boolean includeParkingPass) {
        this.includeParkingPass = includeParkingPass;
    }
    
    public Boolean getIsGroupBooking() {
        return isGroupBooking;
    }
    
    public void setIsGroupBooking(Boolean isGroupBooking) {
        this.isGroupBooking = isGroupBooking;
    }
    
    public Boolean getIsCorporateBooking() {
        return isCorporateBooking;
    }
    
    public void setIsCorporateBooking(Boolean isCorporateBooking) {
        this.isCorporateBooking = isCorporateBooking;
    }
    
    public String getCorporateCode() {
        return corporateCode;
    }
    
    public void setCorporateCode(String corporateCode) {
        this.corporateCode = corporateCode;
    }
}
