/**
 * Frontend permission utilities — mirrors backend RolePermissions.java.
 * Determines what roles a caller can create/manage, and role scope helpers.
 */

import { Role, Roles, GLOBAL_ROLES, HOTEL_SCOPED_ROLES, ROLE_HIERARCHY } from '../constants/roles';

/**
 * Defines which roles each creator role is permitted to assign.
 * Matches com.bookmyhotel.security.RolePermissions.CREATABLE_ROLES.
 */
const CREATABLE_ROLES: Record<string, Role[]> = {
  [Roles.SUPER_ADMIN]: [
    Roles.ADMIN,
    Roles.HOTEL_ADMIN,
    Roles.OPERATIONAL_ADMIN,
    Roles.FRONTDESK,
    Roles.HOUSEKEEPING,
    Roles.MAINTENANCE,
    Roles.CUSTOMER,
  ],
  [Roles.ADMIN]: [
    Roles.HOTEL_ADMIN,
    Roles.OPERATIONAL_ADMIN,
    Roles.FRONTDESK,
    Roles.HOUSEKEEPING,
    Roles.MAINTENANCE,
    Roles.CUSTOMER,
  ],
  [Roles.HOTEL_ADMIN]: [
    Roles.OPERATIONAL_ADMIN,
    Roles.FRONTDESK,
    Roles.HOUSEKEEPING,
    Roles.MAINTENANCE,
  ],
  [Roles.OPERATIONAL_ADMIN]: [
    Roles.HOUSEKEEPING,
    Roles.MAINTENANCE,
  ],
};

/**
 * Returns true if a user holding `callerRole` is permitted to create/assign `targetRole`.
 */
export function canCreateRole(callerRole: string, targetRole: string): boolean {
  const allowed = CREATABLE_ROLES[callerRole];
  return allowed ? allowed.includes(targetRole as Role) : false;
}

/**
 * Returns the list of roles that `callerRole` is permitted to create.
 */
export function getCreatableRoles(callerRole: string): Role[] {
  return CREATABLE_ROLES[callerRole] ?? [];
}

/**
 * Returns the combined set of creatable roles across all roles a user holds.
 */
export function getCreatableRolesForUser(userRoles: string[]): Role[] {
  const result = new Set<Role>();
  for (const role of userRoles) {
    for (const creatable of getCreatableRoles(role)) {
      result.add(creatable);
    }
  }
  return Array.from(result);
}

/** Returns true if the role has no hotel binding (global scope). */
export function isGlobalRole(role: string): boolean {
  return GLOBAL_ROLES.includes(role as Role);
}

/** Returns true if the role requires a hotel association. */
export function isHotelScopedRole(role: string): boolean {
  return HOTEL_SCOPED_ROLES.includes(role as Role);
}

/** Returns the numeric hierarchy level of a role (0 if unknown). */
export function levelOf(role: string): number {
  return ROLE_HIERARCHY[role] ?? 0;
}

/**
 * Returns the highest-privilege role from a list of role strings.
 * Returns undefined if the list is empty.
 */
export function highestRole(roles: string[]): string | undefined {
  return roles.reduce<string | undefined>((best, role) => {
    if (!best || levelOf(role) > levelOf(best)) return role;
    return best;
  }, undefined);
}

/**
 * Returns true if callerRoles grants strictly higher privilege than targetRole.
 */
export function isHigherThan(callerRoles: string[], targetRole: string): boolean {
  const callerLevel = Math.max(0, ...callerRoles.map(levelOf));
  return callerLevel > levelOf(targetRole);
}
