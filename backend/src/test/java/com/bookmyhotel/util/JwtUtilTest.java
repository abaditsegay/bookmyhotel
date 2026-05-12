package com.bookmyhotel.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.service.TokenBlacklistService;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {

    private static final String SECRET = "0123456789012345678901234567890101234567890123456789012345678901";

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 60_000L);
        ReflectionTestUtils.setField(jwtUtil, "tokenBlacklistService", tokenBlacklistService);
    }

    @Test
    void generateTokenShouldIncludeHotelAndTenantClaimsForHotelUsers() {
        User user = buildHotelUser();
        when(tokenBlacklistService.isTokenBlacklisted(org.mockito.ArgumentMatchers.anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(user);

        assertNotNull(token);
        assertEquals("staff@grandplaza.test", jwtUtil.extractEmail(token));
        assertEquals(101L, jwtUtil.extractHotelId(token));
        assertEquals("tenant-grand-plaza", jwtUtil.extractTenantId(token));
        assertTrue(jwtUtil.isTokenValid(token));
        assertTrue(jwtUtil.validateToken(token, user));
    }

    @Test
    void generateTokenShouldLeaveTenantAndHotelClaimsNullForSystemUsers() {
        User user = new User();
        user.setId(7L);
        user.setEmail("customer@example.com");
        user.setFirstName("Customer");
        user.setLastName("User");
        user.setRoles(Set.of(UserRole.CUSTOMER));

        String token = jwtUtil.generateToken(user);

        assertNull(jwtUtil.extractHotelId(token));
        assertNull(jwtUtil.extractTenantId(token));
    }

    @Test
    void isTokenValidShouldRejectBlacklistedTokens() {
        String token = jwtUtil.generateToken(buildHotelUser());
        when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(true);

        assertFalse(jwtUtil.isTokenValid(token));
    }

    @Test
    void validateTokenShouldRejectUsernameMismatch() {
        User tokenUser = buildHotelUser();
        String token = jwtUtil.generateToken(tokenUser);

        User differentUser = buildHotelUser();
        differentUser.setEmail("other@grandplaza.test");

        assertFalse(jwtUtil.validateToken(token, differentUser));
    }

    @Test
    void isTokenValidShouldRejectExpiredTokens() {
        ReflectionTestUtils.setField(jwtUtil, "expiration", -1_000L);
        when(tokenBlacklistService.isTokenBlacklisted(org.mockito.ArgumentMatchers.anyString())).thenReturn(false);
        String token = jwtUtil.generateToken(buildHotelUser());

        assertFalse(jwtUtil.isTokenValid(token));
    }

    @Test
    void blacklistTokenShouldUseExtractedExpiration() {
        String token = jwtUtil.generateToken(buildHotelUser());

        jwtUtil.blacklistToken(token);

        verify(tokenBlacklistService).blacklistToken(token, jwtUtil.extractExpiration(token));
    }

    private User buildHotelUser() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-grand-plaza");
        tenant.setName("Grand Plaza Tenant");

        Hotel hotel = new Hotel();
        hotel.setId(101L);
        hotel.setName("Grand Plaza");
        hotel.setTenant(tenant);

        User user = new User();
        user.setId(42L);
        user.setEmail("staff@grandplaza.test");
        user.setFirstName("Grace");
        user.setLastName("Hopper");
        user.setPassword("encoded-password");
        user.setRoles(Set.of(UserRole.HOTEL_ADMIN));
        user.setHotel(hotel);
        user.setIsActive(true);
        return user;
    }
}