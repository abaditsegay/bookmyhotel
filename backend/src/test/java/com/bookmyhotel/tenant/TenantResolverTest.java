package com.bookmyhotel.tenant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.service.TenantService;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class TenantResolverTest {

    @Mock
    private TenantService tenantService;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private TenantResolver tenantResolver;

    @AfterEach
    void tearDown() {
        TenantContext.clear();
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
        when(tenantService.getOrCreateTenant("hotel-alpha")).thenReturn(tenant);

        assertEquals("tenant-guid", tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldUseSubdomainWhenHeaderIsMissing() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-subdomain-guid");

        when(request.getHeader("X-Tenant-Id")).thenReturn(null);
        when(request.getServerName()).thenReturn("grandplaza.example.com");
        when(tenantService.getOrCreateTenant("grandplaza")).thenReturn(tenant);

        assertEquals("tenant-subdomain-guid", tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldFallbackToDevelopmentForLocalhost() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-development-guid");

        when(request.getHeader("X-Tenant-Id")).thenReturn("   ");
        when(request.getServerName()).thenReturn("localhost");
        when(tenantService.getOrCreateTenant("development")).thenReturn(tenant);

        assertEquals("tenant-development-guid", tenantResolver.resolveTenant(request));
    }

    @Test
    void resolveTenantShouldFallbackToIdentifierWhenTenantLookupFails() {
        when(request.getHeader("X-Tenant-Id")).thenReturn("hotel-bravo");
        when(tenantService.getOrCreateTenant("hotel-bravo")).thenThrow(new RuntimeException("db down"));

        assertEquals("hotel-bravo", tenantResolver.resolveTenant(request));
    }
}