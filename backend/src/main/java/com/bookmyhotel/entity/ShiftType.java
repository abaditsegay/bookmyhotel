package com.bookmyhotel.entity;

public enum ShiftType {
    MORNING("Morning", "6:00 AM - 2:00 PM"),
    AFTERNOON("Afternoon", "2:00 PM - 10:00 PM"), 
    NIGHT("Night", "10:00 PM - 6:00 AM"),
    FULL_TIME("Full Time", "8:00 AM - 5:00 PM"),
    PART_TIME("Part Time", "Flexible hours"),
    ON_CALL("On Call", "Available as needed");

    private final String displayName;
    private final String timeRange;

    ShiftType(String displayName, String timeRange) {
        this.displayName = displayName;
        this.timeRange = timeRange;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getTimeRange() {
        return timeRange;
    }

    @Override
    public String toString() {
        return displayName + " (" + timeRange + ")";
    }
}
