package com.bookmyhotel.entity;

/**
 * User roles enumeration
 * CUSTOMER: Registered users with accounts (persistent profiles, login access)
 * GUEST: Anonymous users without accounts (temporary token-based access)
 */
public enum UserRole {
    CUSTOMER,    // Registered users with accounts (was GUEST)
    GUEST,       // Anonymous users without accounts (was CUSTOMER)
    FRONTDESK,
    HOUSEKEEPING,
    MAINTENANCE,
    HOTEL_ADMIN,
    HOTEL_MANAGER,
    OPERATIONS_SUPERVISOR,
    ADMIN
}
