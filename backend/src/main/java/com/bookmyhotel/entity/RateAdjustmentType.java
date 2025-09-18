package com.bookmyhotel.entity;

/**
 * Enum representing different types of rate adjustments
 */
public enum RateAdjustmentType {
    /**
     * Multiplier-based adjustment (e.g., 1.5x the base rate)
     */
    MULTIPLIER("Multiplier"),
    
    /**
     * Fixed amount adjustment (e.g., +$25 per night)
     */
    FIXED_ADJUSTMENT("Fixed Adjustment");
    
    private final String displayName;
    
    RateAdjustmentType(String displayName) {
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
