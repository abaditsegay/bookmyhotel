package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;

/**
 * Room response DTO for front desk operations
 */
public class RoomResponse {

    private Long id;
    private String roomNumber;
    private RoomType roomType;
    private RoomStatus status;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private String description;
    private Boolean isAvailable;
    private String currentGuest;
    private String notes;
    private LocalDateTime lastStatusUpdate;
    private String hotelName;
    private Long hotelId;

    // Constructors
    public RoomResponse() {
    }

    public RoomResponse(Long id, String roomNumber, RoomType roomType, RoomStatus status,
            BigDecimal pricePerNight, Integer capacity, Boolean isAvailable) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.status = status;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.isAvailable = isAvailable;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
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

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getCurrentGuest() {
        return currentGuest;
    }

    public void setCurrentGuest(String currentGuest) {
        this.currentGuest = currentGuest;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getLastStatusUpdate() {
        return lastStatusUpdate;
    }

    public void setLastStatusUpdate(LocalDateTime lastStatusUpdate) {
        this.lastStatusUpdate = lastStatusUpdate;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }
}
