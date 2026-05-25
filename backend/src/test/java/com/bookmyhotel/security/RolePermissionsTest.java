package com.bookmyhotel.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.bookmyhotel.entity.UserRole;

class RolePermissionsTest {

    @ParameterizedTest
    @MethodSource("creatableRoleCases")
    void canCreateShouldMatchPermissionMatrix(UserRole callerRole, UserRole targetRole, boolean expected) {
        assertEquals(expected, RolePermissions.canCreate(callerRole, targetRole));
    }

    @Test
    void creatableRolesForShouldExposeExpectedRoles() {
        assertEquals(
                EnumSet.of(UserRole.OPERATIONAL_ADMIN, UserRole.FRONTDESK, UserRole.HOUSEKEEPING,
                        UserRole.MAINTENANCE, UserRole.TESTER),
                RolePermissions.creatableRolesFor(UserRole.HOTEL_ADMIN));
        assertTrue(RolePermissions.creatableRolesFor(UserRole.FRONTDESK).isEmpty());
    }

    @Test
    void roleScopeClassificationShouldStayConsistent() {
        assertTrue(RolePermissions.isGlobal(UserRole.SUPER_ADMIN));
        assertTrue(RolePermissions.isGlobal(UserRole.CUSTOMER));
        assertFalse(RolePermissions.isGlobal(UserRole.HOTEL_ADMIN));

        assertTrue(RolePermissions.isHotelScoped(UserRole.HOTEL_ADMIN));
        assertTrue(RolePermissions.isHotelScoped(UserRole.FRONTDESK));
        assertFalse(RolePermissions.isHotelScoped(UserRole.GUEST));
    }

    @Test
    void hierarchyChecksShouldRequireStrictlyHigherPrivilege() {
        assertTrue(RolePermissions.isHigherThan(UserRole.ADMIN, UserRole.HOTEL_ADMIN));
        assertFalse(RolePermissions.isHigherThan(UserRole.HOTEL_ADMIN, UserRole.ADMIN));
        assertFalse(RolePermissions.isHigherThan(UserRole.GUEST, UserRole.CUSTOMER));
        assertEquals(6, RolePermissions.levelOf(UserRole.SUPER_ADMIN));
        assertEquals(0, RolePermissions.levelOf(null));
    }

    @Test
    void highestRoleShouldReturnMostPrivilegedRole() {
        Set<UserRole> roles = EnumSet.of(UserRole.HOUSEKEEPING, UserRole.ADMIN, UserRole.HOTEL_ADMIN);

        assertEquals(UserRole.ADMIN, RolePermissions.highestRole(roles));
        assertNull(RolePermissions.highestRole(EnumSet.noneOf(UserRole.class)));
        assertNull(RolePermissions.highestRole(null));
    }

    private static Stream<Arguments> creatableRoleCases() {
        return Stream.of(
                Arguments.of(UserRole.SUPER_ADMIN, UserRole.ADMIN, true),
                Arguments.of(UserRole.SUPER_ADMIN, UserRole.HOTEL_ADMIN, true),
                Arguments.of(UserRole.SUPER_ADMIN, UserRole.OPERATIONAL_ADMIN, false),
                Arguments.of(UserRole.ADMIN, UserRole.HOTEL_ADMIN, true),
                Arguments.of(UserRole.ADMIN, UserRole.ADMIN, false),
                Arguments.of(UserRole.HOTEL_ADMIN, UserRole.OPERATIONAL_ADMIN, true),
                Arguments.of(UserRole.HOTEL_ADMIN, UserRole.HOTEL_ADMIN, false),
                Arguments.of(UserRole.OPERATIONAL_ADMIN, UserRole.HOUSEKEEPING, true),
                Arguments.of(UserRole.OPERATIONAL_ADMIN, UserRole.FRONTDESK, false),
                Arguments.of(UserRole.FRONTDESK, UserRole.TESTER, false),
                Arguments.of(null, UserRole.TESTER, false),
                Arguments.of(UserRole.ADMIN, null, false));
    }
}