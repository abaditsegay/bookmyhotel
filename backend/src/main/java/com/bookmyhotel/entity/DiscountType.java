package com.bookmyhotel.entity;

/**
 * Enum representing different types of discounts
 */
public enum DiscountType {
    /**
     * Percentage-based discount (e.g., 15% off)
     */
    PERCENTAGE("Percentage"),
    
    /**
     * Fixed amount discount (e.g., $50 off)
     */
    FIXED_AMOUNT("Fixed Amount");
    
    private final String displayName;
    
    DiscountType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}
