package com.bookmyhotel.entity;

/**
 * Payment status enumeration for reservations
 */
public enum PaymentStatus {
    PENDING("Payment is pending"),
    PROCESSING("Payment is being processed"),
    COMPLETED("Payment has been completed");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Convert string to PaymentStatus enum with case-insensitive matching
     */
    public static PaymentStatus fromString(String status) {
        if (status == null || status.trim().isEmpty()) {
            return PENDING; // Default to PENDING
        }
        
        try {
            return PaymentStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            // If invalid status provided, default to PENDING
            return PENDING;
        }
    }
}