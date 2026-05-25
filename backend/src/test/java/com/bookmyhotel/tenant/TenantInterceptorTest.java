package com.bookmyhotel.tenant;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;

@ExtendWith(MockitoExtension.class)
class TenantInterceptorTest {

    @Mock
    private TenantResolver tenantResolver;

    @InjectMocks
    private TenantInterceptor tenantInterceptor;

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        HotelContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void preHandleShouldRejectAuthenticatedHotelUserWithoutHotelContext() throws Exception {
        User hotelUser = new User();
        hotelUser.setEmail("staff@hotel.test");
        hotelUser.setRoles(java.util.Set.of(UserRole.HOTEL_ADMIN));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(hotelUser, null, hotelUser.getAuthorities()));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/dashboard");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(tenantResolver.resolveTenant(request)).thenReturn("tenant-1");

        boolean allowed = tenantInterceptor.preHandle(request, response, new Object());

        assertFalse(allowed);
        String errorMessage = response.getErrorMessage();
        assertNotNull(errorMessage);
        assertTrue(errorMessage.contains("Hotel context is required"));
    }

    @Test
    void preHandleShouldAllowAuthenticatedHotelUserWhenHotelContextExists() throws Exception {
        User hotelUser = new User();
        hotelUser.setEmail("staff@hotel.test");
        hotelUser.setRoles(java.util.Set.of(UserRole.HOTEL_ADMIN));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(hotelUser, null, hotelUser.getAuthorities()));
        HotelContext.setHotelId(77L);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/dashboard");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(tenantResolver.resolveTenant(request)).thenReturn("tenant-1");

        boolean allowed = tenantInterceptor.preHandle(request, response, new Object());

        assertTrue(allowed);
    }
}