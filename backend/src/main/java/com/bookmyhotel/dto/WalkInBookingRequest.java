package com.bookmyhotel.dto;

import java.time.LocalDate;

import com.bookmyhotel.entity.RoomType;

import jakarta.validation.constraints.NotNull;

/**
 * Walk-in booking request DTO - Supports specific room assignment with
 * immediate check-in
 */
public class WalkInBookingRequest extends BookingRequest {

    @NotNull(message = "Room ID is required for walk-in bookings")
    private Long roomId;

    // Flag to indicate immediate check-in (default true for walk-ins)
    private Boolean immediateCheckIn = true;

    // Constructors
    public WalkInBookingRequest() {
        super();
    }

    // Constructor for walk-in booking with specific room
    public WalkInBookingRequest(Long hotelId, Long roomId, RoomType roomType, LocalDate checkInDate,
            LocalDate checkOutDate, Integer guests) {
        super(hotelId, roomType, checkInDate, checkOutDate, guests);
        this.roomId = roomId;
        this.immediateCheckIn = true;
    }

    // Getters and Setters
    @Override
    public Long getRoomId() {
        return roomId;
    }

    @Override
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Boolean getImmediateCheckIn() {
        return immediateCheckIn;
    }

    public void setImmediateCheckIn(Boolean immediateCheckIn) {
        this.immediateCheckIn = immediateCheckIn;
    }
}
