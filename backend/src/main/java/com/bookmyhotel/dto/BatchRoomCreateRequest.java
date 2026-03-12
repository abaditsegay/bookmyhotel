package com.bookmyhotel.dto;

import com.bookmyhotel.entity.RoomType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class BatchRoomCreateRequest {

    @NotEmpty(message = "At least one room number is required")
    private List<@Size(max = 20, message = "Room number must not exceed 20 characters") String> roomNumbers;

    @NotNull(message = "Room type is required")
    private RoomType roomType;

    @Positive(message = "Price per night must be positive")
    private BigDecimal pricePerNight;

    @Positive(message = "Capacity must be positive")
    private Integer capacity;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    // Getters and setters
    public List<String> getRoomNumbers() {
        return roomNumbers;
    }

    public void setRoomNumbers(List<String> roomNumbers) {
        this.roomNumbers = roomNumbers;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
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
}
