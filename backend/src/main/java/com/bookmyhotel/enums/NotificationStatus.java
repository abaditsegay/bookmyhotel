package com.bookmyhotel.enums;

/**
 * Enum for notification status tracking
 */
public enum NotificationStatus {
    /**
     * Notification has not been read yet
     */
    UNREAD,
    
    /**
     * Notification has been read by user
     */
    READ,
    
    /**
     * Notification has been archived/dismissed
     */
    ARCHIVED
}