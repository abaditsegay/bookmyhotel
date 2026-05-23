package com.bookmyhotel.tenant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.TenantService;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class TenantResolverTest {

    @Mock
    private TenantService tenantService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TenantResolver tenantResolver;

    @AfterEach
    void tearDown() {
        TenantContext.clear();
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolveTenantShouldPreferExistingTenantContext() {
        TenantContext.setTenantId("tenant-from-context");

        assertEquals("tenant-from-context", tenantResolver.resolveTenant(request));
        verifyNoInteractions(tenantService);
    }

    @Test
    void resolveTenantShouldUseHeaderBeforeSubdomain() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-guid");

        when(request.getHeader("X-Tenant-Id")).thenReturn(" hotel-alpha ");
        when(tenantService.findActiveTenantByIdentifier("hotel-alpha")).thenReturn(java.util.Optional.of(tenant));

        assertEquals("tenant-guid", tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldUseSubdomainWhenHeaderIsMissing() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-subdomain-guid");

        when(request.getHeader("X-Tenant-Id")).thenReturn(null);
        when(request.getServerName()).thenReturn("grandplaza.example.com");
        when(tenantService.findActiveTenantByIdentifier("grandplaza")).thenReturn(java.util.Optional.of(tenant));

        assertEquals("tenant-subdomain-guid", tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldUseAuthenticatedUserHotelTenantWhenRequestHasNoIdentifier() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-hotel-guid");
        Hotel hotel = new Hotel();
        hotel.setTenant(tenant);
        User user = new User();
        user.setEmail("admin@example.com");
        user.setHotel(hotel);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin@example.com", "n/a", java.util.List.of()));
        when(request.getHeader("X-Tenant-Id")).thenReturn("   ");
        when(request.getServerName()).thenReturn("localhost");
        when(userRepository.findByEmailWithHotel("admin@example.com")).thenReturn(java.util.Optional.of(user));
        when(tenantService.findActiveTenantByIdentifier("tenant-hotel-guid")).thenReturn(java.util.Optional.of(tenant));

        assertEquals("tenant-hotel-guid", tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldRejectHeaderThatDoesNotMatchAuthenticatedUserTenant() {
    Tenant authenticatedTenant = new Tenant();
    authenticatedTenant.setTenantId("tenant-hotel-guid");
    Tenant headerTenant = new Tenant();
    headerTenant.setTenantId("tenant-other-guid");

    Hotel hotel = new Hotel();
    hotel.setTenant(authenticatedTenant);
    User user = new User();
    user.setEmail("admin@example.com");
    user.setHotel(hotel);

    SecurityContextHolder.getContext().setAuthentication(
        new UsernamePasswordAuthenticationToken("admin@example.com", "n/a", java.util.List.of()));
    when(request.getHeader("X-Tenant-Id")).thenReturn("other-hotel");
    when(userRepository.findByEmailWithHotel("admin@example.com")).thenReturn(java.util.Optional.of(user));
    when(tenantService.findActiveTenantByIdentifier("tenant-hotel-guid"))
        .thenReturn(java.util.Optional.of(authenticatedTenant));
    when(tenantService.findActiveTenantByIdentifier("other-hotel"))
        .thenReturn(java.util.Optional.of(headerTenant));

    assertThrows(IllegalStateException.class, () -> tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldReturnNullWhenNoTenantCanBeResolved() {
        when(request.getHeader("X-Tenant-Id")).thenReturn("hotel-bravo");
        when(tenantService.findActiveTenantByIdentifier("hotel-bravo")).thenReturn(java.util.Optional.empty());

        assertThrows(IllegalStateException.class, () -> tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldReturnNullWhenAuthenticatedUserHasNoHotelTenant() {
        User user = new User();
        user.setEmail("admin@example.com");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin@example.com", "n/a", java.util.List.of()));
        when(request.getHeader("X-Tenant-Id")).thenReturn(null);
        when(request.getServerName()).thenReturn("localhost");
        when(userRepository.findByEmailWithHotel("admin@example.com")).thenReturn(java.util.Optional.of(user));

        assertNull(tenantResolver.resolveTenant(request));
    }
}