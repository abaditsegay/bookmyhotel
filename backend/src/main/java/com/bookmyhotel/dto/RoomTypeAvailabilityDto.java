package com.bookmyhotel.dto;

import java.math.BigDecimal;

import com.bookmyhotel.entity.RoomType;

/**
 * DTO for room type availability information
 * Shows availability by room type rather than individual rooms
 */
public class RoomTypeAvailabilityDto {
    private RoomType roomType;
    private String roomTypeName;
    private Integer availableCount;
    private Integer totalCount;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private String description;
    
    // Constructors
    public RoomTypeAvailabilityDto() {}
    
    public RoomTypeAvailabilityDto(RoomType roomType, Integer availableCount, Integer totalCount, 
                                  BigDecimal pricePerNight, Integer capacity) {
        this.roomType = roomType;
        this.roomTypeName = roomType.name();
        this.availableCount = availableCount;
        this.totalCount = totalCount;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
    }
    
    // Getters and Setters
    public RoomType getRoomType() {
        return roomType;
    }
    
    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
        this.roomTypeName = roomType != null ? roomType.name() : null;
    }
    
    public String getRoomTypeName() {
        return roomTypeName;
    }
    
    public void setRoomTypeName(String roomTypeName) {
        this.roomTypeName = roomTypeName;
    }
    
    public Integer getAvailableCount() {
        return availableCount;
    }
    
    public void setAvailableCount(Integer availableCount) {
        this.availableCount = availableCount;
    }
    
    public Integer getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
    
    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }
    
    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    /**
     * Check if this room type is available
     */
    public boolean isAvailable() {
        return availableCount != null && availableCount > 0;
    }
    
    /**
     * Get formatted availability message
     */
    public String getAvailabilityMessage() {
        if (!isAvailable()) {
            return "Not Available";
        }
        if (availableCount == 1) {
            return "1 room available";
        }
        return availableCount + " rooms available";
    }
}
