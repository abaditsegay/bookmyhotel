package com.bookmyhotel.entity;

/**
 * Simplified order status enum for payment tracking only
 * Simple sales workflow: PENDING (unpaid) or PAID
 */
public enum OrderStatus {
    PENDING("Pending"),
    PAID("Paid");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Check if the order is in a paid state
     */
    public boolean isPaid() {
        return this == PAID;
    }

    /**
     * Check if the order is pending payment
     */
    public boolean isPending() {
        return this == PENDING;
    }

    /**
     * Toggle between PAID and PENDING status
     */
    public OrderStatus toggle() {
        return this == PAID ? PENDING : PAID;
    }
}
