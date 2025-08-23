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
    
    private BigDecimal weekendMultiplier;
    private BigDecimal holidayMultiplier;
    private BigDecimal peakSeasonMultiplier;
    private Boolean isActive;
    private String currency;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public RoomTypePricingDTO() {}
    
    public RoomTypePricingDTO(RoomType roomType, BigDecimal basePricePerNight) {
        this.roomType = roomType;
        this.basePricePerNight = basePricePerNight;
        this.isActive = true;
        this.currency = "USD";
        this.weekendMultiplier = BigDecimal.valueOf(1.2);
        this.holidayMultiplier = BigDecimal.valueOf(1.5);
        this.peakSeasonMultiplier = BigDecimal.valueOf(1.3);
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
    
    public BigDecimal getWeekendMultiplier() {
        return weekendMultiplier;
    }
    
    public void setWeekendMultiplier(BigDecimal weekendMultiplier) {
        this.weekendMultiplier = weekendMultiplier;
    }
    
    public BigDecimal getHolidayMultiplier() {
        return holidayMultiplier;
    }
    
    public void setHolidayMultiplier(BigDecimal holidayMultiplier) {
        this.holidayMultiplier = holidayMultiplier;
    }
    
    public BigDecimal getPeakSeasonMultiplier() {
        return peakSeasonMultiplier;
    }
    
    public void setPeakSeasonMultiplier(BigDecimal peakSeasonMultiplier) {
        this.peakSeasonMultiplier = peakSeasonMultiplier;
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
