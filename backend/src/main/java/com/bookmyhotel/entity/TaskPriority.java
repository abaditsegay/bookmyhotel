package com.bookmyhotel.entity;

/**
 * Task priority enumeration
 */
public enum TaskPriority {
    LOW,        // Can be done when convenient
    NORMAL,     // Standard priority
    HIGH,       // Should be done soon
    URGENT,     // Must be done immediately (emergencies)
    CRITICAL    // Safety or guest satisfaction critical
}
