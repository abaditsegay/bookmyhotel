package com.bookmyhotel.entity;

/**
 * Task status enumeration for housekeeping and maintenance tasks
 */
public enum TaskStatus {
    OPEN, // Task created but not yet assigned (was PENDING)
    ASSIGNED, // Task assigned to staff member
    IN_PROGRESS, // Staff has started working on the task
    ON_HOLD, // Task put on hold
    COMPLETED, // Task completed by staff
    VERIFIED, // Task verified by supervisor
    CANCELLED // Task cancelled
}
