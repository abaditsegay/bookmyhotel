package com.bookmyhotel.security;

import com.bookmyhotel.entity.UserRole;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Central role permission matrix.
 *
 * Defines:
 * - Which roles are global (not hotel-bound)
 * - Which roles are hotel-scoped (must have hotel assigned)
 * - Which roles each caller role is allowed to create/manage
 * - Numeric hierarchy levels for ordered comparison
 *
 * All role enforcement in services and controllers should delegate checks here
 * rather than hard-coding inline strings.
 */
public final class RolePermissions {

    private RolePermissions() {
        /* utility – not instantiable */ }

    // -----------------------------------------------------------------------
    // Role scope classification
    // -----------------------------------------------------------------------

    /** Roles that are global and must NOT be assigned to a hotel. */
    public static final Set<UserRole> GLOBAL_ROLES = EnumSet.of(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.CUSTOMER,
            UserRole.GUEST);

    /** Roles that are hotel-scoped and MUST be assigned to a hotel. */
    public static final Set<UserRole> HOTEL_SCOPED_ROLES = EnumSet.of(
            UserRole.HOTEL_ADMIN,
            UserRole.OPERATIONAL_ADMIN,
            UserRole.FRONTDESK,
            UserRole.HOUSEKEEPING,
            UserRole.MAINTENANCE);

    // -----------------------------------------------------------------------
    // Creator permission matrix
    // -----------------------------------------------------------------------

    /**
     * Maps each caller role to the set of roles it is allowed to create.
     *
     * <pre>
     * SUPER_ADMIN    → ADMIN, HOTEL_ADMIN
     * ADMIN          → HOTEL_ADMIN
     * HOTEL_ADMIN    → OPERATIONAL_ADMIN, FRONTDESK, HOUSEKEEPING, MAINTENANCE
     *                  (same hotel only — cannot create another HOTEL_ADMIN)
     * OPERATIONAL_ADMIN → HOUSEKEEPING, MAINTENANCE   (same hotel only)
     * Others         → (none)
     * </pre>
     */
    private static final Map<UserRole, Set<UserRole>> CREATABLE_ROLES = new EnumMap<>(UserRole.class);

    static {
        CREATABLE_ROLES.put(UserRole.SUPER_ADMIN, EnumSet.of(
                UserRole.ADMIN,
                UserRole.HOTEL_ADMIN));

        CREATABLE_ROLES.put(UserRole.ADMIN, EnumSet.of(
                UserRole.HOTEL_ADMIN));

        CREATABLE_ROLES.put(UserRole.HOTEL_ADMIN, EnumSet.of(
                UserRole.OPERATIONAL_ADMIN,
                UserRole.FRONTDESK,
                UserRole.HOUSEKEEPING,
                UserRole.MAINTENANCE));

        CREATABLE_ROLES.put(UserRole.OPERATIONAL_ADMIN, EnumSet.of(
                UserRole.HOUSEKEEPING,
                UserRole.MAINTENANCE));

        // FRONTDESK, HOUSEKEEPING, MAINTENANCE, CUSTOMER, GUEST → no user creation
        for (UserRole noCreate : EnumSet.of(
                UserRole.FRONTDESK, UserRole.HOUSEKEEPING,
                UserRole.MAINTENANCE, UserRole.CUSTOMER, UserRole.GUEST)) {
            CREATABLE_ROLES.put(noCreate, EnumSet.noneOf(UserRole.class));
        }
    }

    // -----------------------------------------------------------------------
    // Hierarchy levels (higher = more privileged)
    // -----------------------------------------------------------------------

    private static final Map<UserRole, Integer> HIERARCHY = new EnumMap<>(UserRole.class);

    static {
        HIERARCHY.put(UserRole.GUEST, 1);
        HIERARCHY.put(UserRole.CUSTOMER, 1);
        HIERARCHY.put(UserRole.MAINTENANCE, 2);
        HIERARCHY.put(UserRole.HOUSEKEEPING, 2);
        HIERARCHY.put(UserRole.FRONTDESK, 2);
        HIERARCHY.put(UserRole.OPERATIONAL_ADMIN, 3);
        HIERARCHY.put(UserRole.HOTEL_ADMIN, 4);
        HIERARCHY.put(UserRole.ADMIN, 5);
        HIERARCHY.put(UserRole.SUPER_ADMIN, 6);
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Returns true if {@code callerRole} is allowed to create a user with
     * {@code targetRole}.
     */
    public static boolean canCreate(UserRole callerRole, UserRole targetRole) {
        if (callerRole == null || targetRole == null)
            return false;
        Set<UserRole> allowed = CREATABLE_ROLES.getOrDefault(callerRole, EnumSet.noneOf(UserRole.class));
        return allowed.contains(targetRole);
    }

    /**
     * Returns true if {@code callerRole} has a hierarchy level strictly higher
     * than {@code targetRole}, i.e. the caller is "above" the target.
     */
    public static boolean isHigherThan(UserRole callerRole, UserRole targetRole) {
        return levelOf(callerRole) > levelOf(targetRole);
    }

    /**
     * Returns the set of roles the given caller role is allowed to create.
     * Returns an empty set for unknown roles.
     */
    public static Set<UserRole> creatableRolesFor(UserRole callerRole) {
        return CREATABLE_ROLES.getOrDefault(callerRole, EnumSet.noneOf(UserRole.class));
    }

    /** Returns true when the role is classified as global (not hotel-bound). */
    public static boolean isGlobal(UserRole role) {
        return GLOBAL_ROLES.contains(role);
    }

    /** Returns true when the role must be associated with a specific hotel. */
    public static boolean isHotelScoped(UserRole role) {
        return HOTEL_SCOPED_ROLES.contains(role);
    }

    /**
     * Returns the numeric hierarchy level of a role (higher is more privileged).
     */
    public static int levelOf(UserRole role) {
        return HIERARCHY.getOrDefault(role, 0);
    }

    /**
     * Returns the highest-privilege role from a set of roles.
     * Returns null if the set is empty.
     */
    public static UserRole highestRole(Set<UserRole> roles) {
        return roles == null ? null
                : roles.stream()
                        .max((a, b) -> Integer.compare(levelOf(a), levelOf(b)))
                        .orElse(null);
    }
}
