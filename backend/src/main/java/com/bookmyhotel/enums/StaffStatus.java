package com.bookmyhotel.enums;

/**
 * Enum representing different status values for staff
 */
public enum StaffStatus {
    ACTIVE("Active", "Staff member is currently working"),
    INACTIVE("Inactive", "Staff member is not currently working"),
    ON_BREAK("On Break", "Staff member is on break"),
    SICK_LEAVE("Sick Leave", "Staff member is on sick leave"),
    VACATION("Vacation", "Staff member is on vacation"),
    TERMINATED("Terminated", "Staff member's employment has ended");
    
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
