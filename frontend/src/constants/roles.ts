/**
 * Authoritative role constants for the BookMyHotel application.
 * Mirrors the backend UserRole enum and RolePermissions utility.
 */

export const Roles = {
  SUPER_ADMIN:        'SUPER_ADMIN',        // Global: top-level system administrator
  ADMIN:              'ADMIN',              // Global: tenant/system-level administrator
  HOTEL_ADMIN:        'HOTEL_ADMIN',        // Hotel-scoped: hotel administrator
  OPERATIONAL_ADMIN:  'OPERATIONAL_ADMIN',  // Hotel-scoped: operations supervisor
  FRONTDESK:          'FRONTDESK',          // Hotel-scoped: front desk agent
  HOUSEKEEPING:       'HOUSEKEEPING',       // Hotel-scoped: housekeeping staff
  MAINTENANCE:        'MAINTENANCE',        // Hotel-scoped: maintenance staff
  CUSTOMER:           'CUSTOMER',           // Public: registered customer
  GUEST:              'GUEST',              // Public: anonymous / unregistered guest
} as const;

export type Role = typeof Roles[keyof typeof Roles];

/** Roles that have no hotel binding (tenantId is null). */
export const GLOBAL_ROLES: Role[] = [
  Roles.SUPER_ADMIN,
  Roles.ADMIN,
  Roles.CUSTOMER,
  Roles.GUEST,
];

/** Roles that must be associated with a specific hotel. */
export const HOTEL_SCOPED_ROLES: Role[] = [
  Roles.HOTEL_ADMIN,
  Roles.OPERATIONAL_ADMIN,
  Roles.FRONTDESK,
  Roles.HOUSEKEEPING,
  Roles.MAINTENANCE,
];

/**
 * Role hierarchy levels (higher = more privileged).
 * Used by ProtectedRoute to allow higher-level roles to access lower-level routes.
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  [Roles.GUEST]:              1,
  [Roles.CUSTOMER]:           1,
  [Roles.MAINTENANCE]:        2,
  [Roles.HOUSEKEEPING]:       2,
  [Roles.FRONTDESK]:          2,
  [Roles.OPERATIONAL_ADMIN]:  3,
  [Roles.HOTEL_ADMIN]:        4,
  [Roles.ADMIN]:              5,
  [Roles.SUPER_ADMIN]:        6,
};

/**
 * Human-readable display names for each role.
 */
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  [Roles.SUPER_ADMIN]:       'Super Administrator',
  [Roles.ADMIN]:             'Administrator',
  [Roles.HOTEL_ADMIN]:       'Hotel Administrator',
  [Roles.OPERATIONAL_ADMIN]: 'Operational Administrator',
  [Roles.FRONTDESK]:         'Front Desk Agent',
  [Roles.HOUSEKEEPING]:      'Housekeeping',
  [Roles.MAINTENANCE]:       'Maintenance',
  [Roles.CUSTOMER]:          'Customer',
  [Roles.GUEST]:             'Guest',
};

/**
 * MUI chip colours for each role badge.
 */
export const ROLE_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  [Roles.SUPER_ADMIN]:       'error',
  [Roles.ADMIN]:             'primary',
  [Roles.HOTEL_ADMIN]:       'secondary',
  [Roles.OPERATIONAL_ADMIN]: 'primary',
  [Roles.FRONTDESK]:         'info',
  [Roles.HOUSEKEEPING]:      'success',
  [Roles.MAINTENANCE]:       'warning',
  [Roles.CUSTOMER]:          'default',
  [Roles.GUEST]:             'default',
};
