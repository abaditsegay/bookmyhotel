package com.bookmyhotel.entity;

/**
 * Enum representing different types of pricing strategies
 */
public enum PricingStrategyType {
    /**
     * Base pricing - standard rates
     */
    BASE("Base Pricing"),
    
    /**
     * Seasonal pricing - adjusts based on season/time of year
     */
    SEASONAL("Seasonal Pricing"),
    
    /**
     * Demand-based pricing - adjusts based on occupancy levels
     */
    DEMAND_BASED("Demand-Based Pricing"),
    
    /**
     * Early bird pricing - discounts for advance bookings
     */
    EARLY_BIRD("Early Bird Pricing"),
    
    /**
     * Last minute pricing - discounts for same-day or next-day bookings
     */
    LAST_MINUTE("Last Minute Pricing"),
    
    /**
     * Weekend pricing - special rates for weekends
     */
    WEEKEND("Weekend Pricing"),
    
    /**
     * Holiday pricing - special rates for holidays and peak periods
     */
    HOLIDAY("Holiday Pricing"),
    
    /**
     * Corporate pricing - special rates for business customers
     */
    CORPORATE("Corporate Pricing"),
    
    /**
     * Group pricing - special rates for group bookings
     */
    GROUP("Group Pricing"),
    
    /**
     * Length of stay pricing - discounts for extended stays
     */
    LENGTH_OF_STAY("Length of Stay Pricing");
    
    private final String displayName;
    
    PricingStrategyType(String displayName) {
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
