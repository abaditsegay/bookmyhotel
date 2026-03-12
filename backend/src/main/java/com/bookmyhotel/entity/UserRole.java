package com.bookmyhotel.entity;

/**
 * User roles enumeration with clear hierarchy:
 *
 * Global roles (not tied to any hotel):
 * SUPER_ADMIN - Full system access; can manage ADMIN and HOTEL_ADMIN
 * ADMIN - System administrator; can manage HOTEL_ADMIN and hotel users
 *
 * Hotel-scoped roles (must be tied to a specific hotel):
 * HOTEL_ADMIN - Manages a single hotel; can create all hotel-scoped roles
 * OPERATIONAL_ADMIN - Operations manager within a hotel; can create
 * HOUSEKEEPING and MAINTENANCE
 * FRONTDESK - Front desk staff; no user creation
 * HOUSEKEEPING - Housekeeping staff; no user creation
 * MAINTENANCE - Maintenance staff; no user creation
 *
 * Public / customer roles (not hotel-tied, non-privileged):
 * CUSTOMER - Registered users with accounts
 * GUEST - Anonymous users without accounts
 */
public enum UserRole {
    // Global administrative roles
    SUPER_ADMIN,
    ADMIN,

    // Hotel-scoped management roles
    HOTEL_ADMIN,
    OPERATIONAL_ADMIN,

    // Hotel-scoped operational roles
    FRONTDESK,
    HOUSEKEEPING,
    MAINTENANCE,

    // Public / customer roles
    CUSTOMER,
    GUEST
}
