package com.bookmyhotel.enums;

/**
 * Enum representing different status values for staff
 */
public enum StaffStatus {
    AVAILABLE("Available", "Staff member is available for tasks"),
    WORKING("Working", "Staff member is currently working on a task"),
    ON_BREAK("On Break", "Staff member is on break"),
    OFF_DUTY("Off Duty", "Staff member is off duty"),
    SICK_LEAVE("Sick Leave", "Staff member is on sick leave"),
    VACATION("Vacation", "Staff member is on vacation");
    
    private final String displayName;
    private final String description;
    
    StaffStatus(String displayName, String description) {
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
