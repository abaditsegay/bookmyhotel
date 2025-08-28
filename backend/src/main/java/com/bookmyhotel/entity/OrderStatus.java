package com.bookmyhotel.entity;

/**
 * Order status enum matching database ENUM values
 * Represents the lifecycle of a shop order from creation to completion
 */
public enum OrderStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    PREPARING("Preparing"),
    READY("Ready for Pickup/Delivery"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Check if the order is in a paid state (confirmed or later)
     */
    public boolean isPaid() {
        return this == CONFIRMED || this == PREPARING || this == READY || this == COMPLETED;
    }

    /**
     * Check if the order is pending payment
     */
    public boolean isPending() {
        return this == PENDING;
    }

    /**
     * Check if the order is completed
     */
    public boolean isCompleted() {
        return this == COMPLETED;
    }

    /**
     * Check if the order is cancelled
     */
    public boolean isCancelled() {
        return this == CANCELLED;
    }
}
