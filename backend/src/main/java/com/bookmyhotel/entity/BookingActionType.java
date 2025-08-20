package com.bookmyhotel.entity;

/**
 * Enum for booking action types in audit trail
 */
public enum BookingActionType {
    CREATED("Booking Created"),
    MODIFIED("Booking Modified"),
    CANCELLED("Booking Cancelled"),
    CONFIRMED("Booking Confirmed"),
    CHECKED_IN("Checked In"),
    CHECKED_OUT("Checked Out");
    
    private final String description;
    
    BookingActionType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    @Override
    public String toString() {
        return description;
    }
}
