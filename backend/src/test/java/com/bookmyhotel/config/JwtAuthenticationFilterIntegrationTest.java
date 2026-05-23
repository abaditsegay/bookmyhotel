package com.bookmyhotel.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.function.Function;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.service.SessionManagementService;
import com.bookmyhotel.tenant.HotelContext;
import com.bookmyhotel.tenant.TenantContext;
import com.bookmyhotel.util.JwtUtil;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterIntegrationTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private SessionManagementService sessionManagementService;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "jwtUtil", jwtUtil);
        ReflectionTestUtils.setField(filter, "userDetailsService", userDetailsService);
        ReflectionTestUtils.setField(filter, "sessionManagementService", sessionManagementService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        TenantContext.clear();
        HotelContext.clear();
    }

    @Test
    void shouldPopulateTenantAndHotelContextForHotelScopedUsers() throws Exception {
        User hotelUser = hotelScopedUser();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test/context");
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.extractUsername("valid-token")).thenReturn("staff@grandplaza.test");
        when(jwtUtil.extractTenantId("valid-token")).thenReturn("tenant-grand-plaza");
        when(jwtUtil.extractHotelId("valid-token")).thenReturn(101L);
        when(jwtUtil.extractClaim(eq("valid-token"), anyClaimFunction())).thenReturn("Grand Plaza");
        when(userDetailsService.loadUserByUsername("staff@grandplaza.test")).thenReturn(hotelUser);
        when(jwtUtil.validateToken("valid-token", hotelUser)).thenReturn(true);
        when(sessionManagementService.isSessionValid("valid-token")).thenReturn(true);

        filter.doFilter(request, response, recordingChain());

        assertEquals("staff@grandplaza.test", response.getHeader("X-Principal"));
        assertEquals("tenant-grand-plaza", response.getHeader("X-Tenant-Id"));
        assertEquals("101", response.getHeader("X-Hotel-Id"));
        assertEquals("Grand Plaza", response.getHeader("X-Hotel-Name"));
        assertNull(TenantContext.getTenantId());
        assertNull(HotelContext.getHotelId());
    }

    @Test
    void shouldSkipTenantAndHotelContextForSystemWideUsers() throws Exception {
        User adminUser = systemWideUser();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test/context");
        request.addHeader("Authorization", "Bearer admin-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.extractUsername("admin-token")).thenReturn("admin@platform.test");
        when(jwtUtil.extractTenantId("admin-token")).thenReturn(null);
        when(jwtUtil.extractHotelId("admin-token")).thenReturn(null);
        when(jwtUtil.extractClaim(eq("admin-token"), anyClaimFunction())).thenReturn(null);
        when(userDetailsService.loadUserByUsername("admin@platform.test")).thenReturn(adminUser);
        when(jwtUtil.validateToken("admin-token", adminUser)).thenReturn(true);
        when(sessionManagementService.isSessionValid("admin-token")).thenReturn(true);

        filter.doFilter(request, response, recordingChain());

        assertEquals("admin@platform.test", response.getHeader("X-Principal"));
        assertNull(response.getHeader("X-Tenant-Id"));
        assertNull(response.getHeader("X-Hotel-Id"));
        assertNull(response.getHeader("X-Hotel-Name"));
        assertNull(TenantContext.getTenantId());
        assertNull(HotelContext.getHotelId());
    }

    @Test
    void shouldRejectHotelScopedUserWhenJwtHotelScopeDoesNotMatchAuthenticatedUser() throws Exception {
        User hotelUser = hotelScopedUser();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test/context");
        request.addHeader("Authorization", "Bearer mismatched-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.extractUsername("mismatched-token")).thenReturn("staff@grandplaza.test");
        when(jwtUtil.extractTenantId("mismatched-token")).thenReturn("tenant-other-hotel");
        when(jwtUtil.extractHotelId("mismatched-token")).thenReturn(999L);
        when(jwtUtil.extractClaim(eq("mismatched-token"), anyClaimFunction())).thenReturn("Other Hotel");
        when(userDetailsService.loadUserByUsername("staff@grandplaza.test")).thenReturn(hotelUser);
        when(jwtUtil.validateToken("mismatched-token", hotelUser)).thenReturn(true);
        when(sessionManagementService.isSessionValid("mismatched-token")).thenReturn(true);

        filter.doFilter(request, response, new MockFilterChain());

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertNull(TenantContext.getTenantId());
        assertNull(HotelContext.getHotelId());
    }

    private FilterChain recordingChain() {
        return new MockFilterChain(new HttpServlet() {
            @Override
            protected void service(HttpServletRequest request, HttpServletResponse response)
                    throws ServletException, IOException {
                if (SecurityContextHolder.getContext().getAuthentication() != null) {
                    response.addHeader("X-Principal",
                            SecurityContextHolder.getContext().getAuthentication().getName());
                }
                if (TenantContext.getTenantId() != null) {
                    response.addHeader("X-Tenant-Id", TenantContext.getTenantId());
                }
                if (HotelContext.getHotelId() != null) {
                    response.addHeader("X-Hotel-Id", HotelContext.getHotelId().toString());
                }
                if (HotelContext.getHotelName() != null) {
                    response.addHeader("X-Hotel-Name", HotelContext.getHotelName());
                }
            }
        });
    }

    private User hotelScopedUser() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-grand-plaza");
        tenant.setName("Grand Plaza Tenant");

        Hotel hotel = new Hotel();
        hotel.setId(101L);
        hotel.setName("Grand Plaza");
        hotel.setTenant(tenant);

        User user = new User();
        user.setId(44L);
        user.setEmail("staff@grandplaza.test");
        user.setPassword("encoded");
        user.setFirstName("Front");
        user.setLastName("Desk");
        user.setRoles(java.util.Set.of(UserRole.HOTEL_ADMIN));
        user.setHotel(hotel);
        user.setIsActive(true);
        return user;
    }

    private User systemWideUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail("admin@platform.test");
        user.setPassword("encoded");
        user.setFirstName("Platform");
        user.setLastName("Admin");
        user.setRoles(java.util.Set.of(UserRole.ADMIN));
        user.setIsActive(true);
        return user;
    }

    @SuppressWarnings("unchecked")
    private Function<Claims, String> anyClaimFunction() {
        return any(Function.class);
    }
}
