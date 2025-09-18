package com.bookmyhotel.enums;

/**
 * Enum representing different priority levels for maintenance requests
 */
public enum MaintenancePriority {
    LOW("Low", 1, "Non-urgent maintenance that can be scheduled flexibly"),
    MEDIUM("Medium", 2, "Standard maintenance with reasonable timeframe"),
    HIGH("High", 3, "Important maintenance requiring prompt attention"),
    URGENT("Urgent", 4, "Critical maintenance affecting guest experience"),
    EMERGENCY("Emergency", 5, "Immediate attention required for safety or security");
    
    private final String displayName;
    private final int level;
    private final String description;
    
    MaintenancePriority(String displayName, int level, String description) {
        this.displayName = displayName;
        this.level = level;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public int getLevel() {
        return level;
    }
    
    public String getDescription() {
        return description;
    }
}
