package com.bookmyhotel.enums;

/**
 * Enum representing different categories of maintenance requests
 */
public enum MaintenanceCategory {
    PLUMBING("Plumbing"),
    ELECTRICAL("Electrical"),
    HVAC("HVAC & Climate Control"),
    CARPENTRY("Carpentry & Furniture"),
    PAINTING("Painting & Decoration"),
    APPLIANCES("Appliances & Equipment"),
    SAFETY("Safety & Security"),
    GENERAL("General Maintenance"),
    EMERGENCY("Emergency Repair"),
    PREVENTIVE("Preventive Maintenance");
    
    private final String displayName;
    
    MaintenanceCategory(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
