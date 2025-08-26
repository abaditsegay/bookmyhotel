package com.bookmyhotel.entity;

/**
 * Enum representing different types of housekeeping tasks
 */
public enum HousekeepingTaskType {
    
    // Room cleaning tasks
    ROOM_CLEANING("Standard room cleaning and maintenance"),
    CHECKOUT_CLEANING("Deep cleaning after guest checkout"),
    MAINTENANCE_CLEANING("Cleaning during maintenance work"),
    DEEP_CLEANING("Thorough deep cleaning of room"),
    
    // Inspection tasks
    INSPECTION("Room inspection for quality control"),
    
    // Maintenance tasks
    MAINTENANCE_TASK("General maintenance work in room"),
    
    // Supply and inventory tasks
    RESTOCKING("Restocking room amenities and supplies"),
    LAUNDRY("Laundry and linen management"),
    
    // Special requests
    SPECIAL_REQUEST("Special cleaning or maintenance request"),
    
    // Emergency tasks
    EMERGENCY_CLEANUP("Emergency cleaning (spills, damages)"),
    
    // Preventive maintenance
    PREVENTIVE_MAINTENANCE("Scheduled preventive maintenance"),
    
    // Public area tasks
    PUBLIC_AREA_CLEANING("Cleaning of public areas (lobby, hallways)"),
    BATHROOM_DEEP_CLEAN("Deep cleaning of bathrooms"),
    CARPET_CLEANING("Professional carpet cleaning"),
    
    // Equipment maintenance
    EQUIPMENT_CHECK("Check and maintain room equipment"),
    HVAC_MAINTENANCE("HVAC system maintenance and cleaning"),
    
    // Seasonal tasks
    SEASONAL_PREPARATION("Seasonal room preparation (summer/winter)"),
    
    // Quality assurance
    QUALITY_CHECK("Quality assurance check"),
    GUEST_COMPLAINT_FOLLOWUP("Follow-up on guest complaints");
    
    private final String description;
    
    HousekeepingTaskType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Get estimated duration in minutes for this task type
     */
    public int getEstimatedDurationMinutes() {
        return switch (this) {
            case ROOM_CLEANING -> 40;
            case CHECKOUT_CLEANING -> 45;
            case MAINTENANCE_CLEANING -> 30;
            case DEEP_CLEANING -> 90;
            case INSPECTION -> 15;
            case MAINTENANCE_TASK -> 60;
            case RESTOCKING -> 20;
            case LAUNDRY -> 25;
            case SPECIAL_REQUEST -> 30;
            case EMERGENCY_CLEANUP -> 45;
            case PREVENTIVE_MAINTENANCE -> 60;
            case PUBLIC_AREA_CLEANING -> 120;
            case BATHROOM_DEEP_CLEAN -> 60;
            case CARPET_CLEANING -> 90;
            case EQUIPMENT_CHECK -> 30;
            case HVAC_MAINTENANCE -> 90;
            case SEASONAL_PREPARATION -> 60;
            case QUALITY_CHECK -> 20;
            case GUEST_COMPLAINT_FOLLOWUP -> 45;
            default -> 30;
        };
    }
    
    /**
     * Check if this task type requires inspection after completion
     */
    public boolean requiresInspection() {
        return switch (this) {
            case CHECKOUT_CLEANING, DEEP_CLEANING, MAINTENANCE_TASK, 
                 EMERGENCY_CLEANUP, BATHROOM_DEEP_CLEAN, CARPET_CLEANING,
                 GUEST_COMPLAINT_FOLLOWUP -> true;
            default -> false;
        };
    }
    
    /**
     * Get the recommended priority for this task type
     */
    public TaskPriority getDefaultPriority() {
        return switch (this) {
            case EMERGENCY_CLEANUP -> TaskPriority.URGENT;
            case CHECKOUT_CLEANING, GUEST_COMPLAINT_FOLLOWUP -> TaskPriority.HIGH;
            case MAINTENANCE_TASK, INSPECTION, QUALITY_CHECK -> TaskPriority.NORMAL;
            case RESTOCKING, LAUNDRY, SEASONAL_PREPARATION -> TaskPriority.LOW;
            default -> TaskPriority.NORMAL;
        };
    }
}
