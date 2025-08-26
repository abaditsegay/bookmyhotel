package com.bookmyhotel.enums;

/**
 * Enum representing different roles for housekeeping staff
 */
public enum HousekeepingRole {
    HOUSEKEEPER("Housekeeper", "General room cleaning and maintenance"),
    SUPERVISOR("Housekeeping Supervisor", "Oversees housekeeping operations and staff"),
    MAINTENANCE("Maintenance Staff", "Handles repairs and technical maintenance"),
    LAUNDRY("Laundry Attendant", "Manages linen and laundry operations"),
    PUBLIC_AREA("Public Area Cleaner", "Maintains common areas and public spaces"),
    DEEP_CLEANING("Deep Cleaning Specialist", "Performs detailed cleaning and sanitization"),
    INSPECTOR("Quality Inspector", "Inspects and validates cleaning standards");
    
    private final String displayName;
    private final String description;
    
    HousekeepingRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
}
