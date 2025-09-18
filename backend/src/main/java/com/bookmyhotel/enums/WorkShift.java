package com.bookmyhotel.enums;

/**
 * Enum representing different work shifts for staff
 */
public enum WorkShift {
    MORNING("Morning Shift", "6:00 AM - 2:00 PM"),
    AFTERNOON("Afternoon Shift", "2:00 PM - 10:00 PM"),
    EVENING("Evening Shift", "10:00 PM - 6:00 AM"),
    FULL_TIME("Full Time", "8:00 AM - 5:00 PM"),
    PART_TIME("Part Time", "Flexible hours"),
    ON_CALL("On Call", "Available when needed");
    
    private final String displayName;
    private final String hours;
    
    WorkShift(String displayName, String hours) {
        this.displayName = displayName;
        this.hours = hours;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getHours() {
        return hours;
    }
}
