package com.bookmyhotel.dto;

import com.bookmyhotel.entity.RoomType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for room type pricing operations
 */
public class RoomTypePricingDTO {

    private Long id;

    @NotNull(message = "Room type is required")
    private RoomType roomType;

    @NotNull(message = "Base price per night is required")
    @Positive(message = "Base price per night must be positive")
    private BigDecimal basePricePerNight;

    private BigDecimal weekendPrice;
    private BigDecimal holidayPrice;
    private BigDecimal peakSeasonPrice;
    private Boolean isActive;
    private String currency;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public RoomTypePricingDTO() {
    }

    public RoomTypePricingDTO(RoomType roomType, BigDecimal basePricePerNight) {
        this.roomType = roomType;
        this.basePricePerNight = basePricePerNight;
        this.isActive = true;
        this.currency = "ETB"; // Default to Ethiopian Birr for Ethiopian hotels
        // Initialize with base price - actual multipliers are applied during entity creation/update in service layer
        this.weekendPrice = basePricePerNight; 
        this.holidayPrice = basePricePerNight;  
        this.peakSeasonPrice = basePricePerNight;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public BigDecimal getBasePricePerNight() {
        return basePricePerNight;
    }

    public void setBasePricePerNight(BigDecimal basePricePerNight) {
        this.basePricePerNight = basePricePerNight;
    }

    public BigDecimal getWeekendPrice() {
        return weekendPrice;
    }

    public void setWeekendPrice(BigDecimal weekendPrice) {
        this.weekendPrice = weekendPrice;
    }

    public BigDecimal getHolidayPrice() {
        return holidayPrice;
    }

    public void setHolidayPrice(BigDecimal holidayPrice) {
        this.holidayPrice = holidayPrice;
    }

    public BigDecimal getPeakSeasonPrice() {
        return peakSeasonPrice;
    }

    public void setPeakSeasonPrice(BigDecimal peakSeasonPrice) {
        this.peakSeasonPrice = peakSeasonPrice;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
