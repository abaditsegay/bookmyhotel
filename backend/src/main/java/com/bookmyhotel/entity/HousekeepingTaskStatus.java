package com.bookmyhotel.entity;

/**
 * Enum representing the status of housekeeping tasks
 */
public enum HousekeepingTaskStatus {
    
    // Initial states
    PENDING("Task created and waiting to be assigned"),
    ASSIGNED("Task assigned to a staff member"),
    
    // Work states
    IN_PROGRESS("Task is currently being worked on"),
    PAUSED("Task work has been temporarily paused"),
    
    // Completion states
    COMPLETED("Task has been completed by staff"),
    COMPLETED_WITH_ISSUES("Task completed but with noted issues"),
    PENDING_INSPECTION("Task completed and waiting for inspection"),
    
    // Final states
    APPROVED("Task completed and passed inspection"),
    REJECTED("Task failed inspection and needs rework"),
    
    // Other states
    CANCELLED("Task has been cancelled"),
    RESCHEDULED("Task has been rescheduled for later"),
    
    // Emergency states
    ESCALATED("Task escalated due to issues or urgency"),
    
    // Quality states
    QUALITY_ISSUE("Task has quality issues that need attention"),
    GUEST_COMPLAINT("Task related to guest complaint");
    
    private final String description;
    
    HousekeepingTaskStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if this status indicates the task is active (in progress)
     */
    public boolean isActive() {
        return this == IN_PROGRESS || this == PAUSED;
    }
    
    /**
     * Check if this status indicates the task is completed (finished)
     */
    public boolean isCompleted() {
        return this == APPROVED || this == COMPLETED || this == COMPLETED_WITH_ISSUES;
    }
    
    /**
     * Check if this status indicates the task needs attention
     */
    public boolean needsAttention() {
        return this == REJECTED || this == QUALITY_ISSUE || 
               this == GUEST_COMPLAINT || this == ESCALATED;
    }
    
    /**
     * Check if this status indicates the task is pending work
     */
    public boolean isPending() {
        return this == PENDING || this == ASSIGNED || this == RESCHEDULED;
    }
    
    /**
     * Check if this status indicates the task is in a final state
     */
    public boolean isFinal() {
        return this == APPROVED || this == CANCELLED;
    }
    
    /**
     * Get valid next statuses from current status
     */
    public HousekeepingTaskStatus[] getValidNextStatuses() {
        return switch (this) {
            case PENDING -> new HousekeepingTaskStatus[]{ASSIGNED, CANCELLED, RESCHEDULED};
            case ASSIGNED -> new HousekeepingTaskStatus[]{IN_PROGRESS, CANCELLED, RESCHEDULED, ESCALATED};
            case IN_PROGRESS -> new HousekeepingTaskStatus[]{COMPLETED, COMPLETED_WITH_ISSUES, PAUSED, CANCELLED, ESCALATED, QUALITY_ISSUE};
            case PAUSED -> new HousekeepingTaskStatus[]{IN_PROGRESS, CANCELLED, RESCHEDULED};
            case COMPLETED -> new HousekeepingTaskStatus[]{PENDING_INSPECTION, APPROVED, REJECTED};
            case COMPLETED_WITH_ISSUES -> new HousekeepingTaskStatus[]{PENDING_INSPECTION, APPROVED, REJECTED, QUALITY_ISSUE};
            case PENDING_INSPECTION -> new HousekeepingTaskStatus[]{APPROVED, REJECTED};
            case REJECTED -> new HousekeepingTaskStatus[]{ASSIGNED, CANCELLED};
            case QUALITY_ISSUE -> new HousekeepingTaskStatus[]{ASSIGNED, CANCELLED, ESCALATED};
            case GUEST_COMPLAINT -> new HousekeepingTaskStatus[]{ASSIGNED, ESCALATED, CANCELLED};
            case ESCALATED -> new HousekeepingTaskStatus[]{ASSIGNED, CANCELLED};
            case RESCHEDULED -> new HousekeepingTaskStatus[]{PENDING, CANCELLED};
            case APPROVED, CANCELLED -> new HousekeepingTaskStatus[]{}; // Final states
            default -> new HousekeepingTaskStatus[]{};
        };
    }
}
