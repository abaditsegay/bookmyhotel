package com.bookmyhotel.entity;

/**
 * Task status enumeration for housekeeping and maintenance tasks
 */
public enum TaskStatus {
    PENDING,        // Task created but not yet assigned
    ASSIGNED,       // Task assigned to staff member
    IN_PROGRESS,    // Staff has started working on the task
    COMPLETED,      // Task completed by staff
    VERIFIED,       // Task verified by supervisor
    CANCELLED       // Task cancelled
}
