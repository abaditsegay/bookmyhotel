package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import com.bookmyhotel.dto.admin.CreateTenantRequest;
import com.bookmyhotel.dto.admin.TenantDTO;
import com.bookmyhotel.dto.admin.UpdateTenantRequest;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class TenantManagementServiceTest {

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private TenantManagementService tenantManagementService;

    @Test
    void createTenantShouldTrimSubdomainPersistActiveTenantAndPopulateDtoCounts() {
        CreateTenantRequest request = new CreateTenantRequest("Grand Plaza Group", "  grand-plaza  ", "Demo tenant");

        when(tenantRepository.existsByName("Grand Plaza Group")).thenReturn(false);
        when(tenantRepository.findBySubdomain("grand-plaza")).thenReturn(Optional.empty());
        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> {
            Tenant tenant = invocation.getArgument(0);
            tenant.setCreatedAt(LocalDateTime.now());
            tenant.setUpdatedAt(LocalDateTime.now());
            return tenant;
        });
        when(userRepository.countByTenantId(any())).thenReturn(3L);
        when(hotelRepository.countByTenant_Id(any())).thenReturn(2L);

        TenantDTO result = tenantManagementService.createTenant(request);

        ArgumentCaptor<Tenant> tenantCaptor = ArgumentCaptor.forClass(Tenant.class);
        verify(tenantRepository).save(tenantCaptor.capture());
        Tenant savedTenant = tenantCaptor.getValue();

        assertNotNull(savedTenant.getId());
        assertEquals("Grand Plaza Group", savedTenant.getName());
        assertEquals("grand-plaza", savedTenant.getSubdomain());
        assertEquals("Demo tenant", savedTenant.getDescription());
        assertTrue(savedTenant.getIsActive());

        assertEquals(savedTenant.getId(), result.getId());
        assertEquals(savedTenant.getId(), result.getTenantId());
        assertEquals(3L, result.getTotalUsers());
        assertEquals(2L, result.getTotalHotels());
    }

    @Test
    void createTenantShouldRejectDuplicateNameBeforeSave() {
        CreateTenantRequest request = new CreateTenantRequest("Grand Plaza Group", "grand-plaza", "Demo tenant");
        when(tenantRepository.existsByName("Grand Plaza Group")).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantManagementService.createTenant(request));

        assertTrue(exception.getMessage().contains("already exists"));
        verify(tenantRepository, never()).save(any(Tenant.class));
    }

    @Test
    void createTenantShouldRejectDuplicateSubdomainBeforeSave() {
        CreateTenantRequest request = new CreateTenantRequest("Grand Plaza Group", " grand-plaza ", "Demo tenant");

        when(tenantRepository.existsByName("Grand Plaza Group")).thenReturn(false);
        when(tenantRepository.findBySubdomain("grand-plaza")).thenReturn(Optional.of(tenant("tenant-9", "Existing", "grand-plaza", true)));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantManagementService.createTenant(request));

        assertTrue(exception.getMessage().contains("subdomain 'grand-plaza' already exists"));
        verify(tenantRepository, never()).save(any(Tenant.class));
    }

    @Test
    void updateTenantShouldClearBlankSubdomainAndApplyProvidedFields() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Group", "grand-plaza", true);
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.countByTenantId("tenant-1")).thenReturn(5L);
        when(hotelRepository.countByTenant_Id("tenant-1")).thenReturn(4L);

        UpdateTenantRequest request = new UpdateTenantRequest("Updated Group", "   ", "Updated description", false);

        TenantDTO result = tenantManagementService.updateTenant("tenant-1", request);

        assertEquals("Updated Group", tenant.getName());
        assertNull(tenant.getSubdomain());
        assertEquals("Updated description", tenant.getDescription());
        assertFalse(tenant.getIsActive());
        assertEquals(5L, result.getTotalUsers());
        assertEquals(4L, result.getTotalHotels());
    }

    @Test
    void updateTenantShouldRejectDuplicateSubdomainWhenChangingValue() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Group", "grand-plaza", true);
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(tenantRepository.findBySubdomain("beta-hotels"))
                .thenReturn(Optional.of(tenant("tenant-2", "Beta Hotels", "beta-hotels", true)));

        UpdateTenantRequest request = new UpdateTenantRequest(null, " beta-hotels ", null, null);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantManagementService.updateTenant("tenant-1", request));

        assertTrue(exception.getMessage().contains("subdomain 'beta-hotels' already exists"));
        verify(tenantRepository, never()).save(any(Tenant.class));
    }

    @Test
    void getTenantByIdShouldReturnMappedTenantDto() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Group", "grand-plaza", true);
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(userRepository.countByTenantId("tenant-1")).thenReturn(9L);
        when(hotelRepository.countByTenant_Id("tenant-1")).thenReturn(4L);

        TenantDTO result = tenantManagementService.getTenantById("tenant-1");

        assertEquals("tenant-1", result.getId());
        assertEquals("Grand Plaza Group", result.getName());
        assertEquals("grand-plaza", result.getSubdomain());
        assertEquals(9L, result.getTotalUsers());
        assertEquals(4L, result.getTotalHotels());
    }

    @Test
    void getTenantByIdShouldRejectUnknownTenant() {
        when(tenantRepository.findById("missing-tenant")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantManagementService.getTenantById("missing-tenant"));

        assertTrue(exception.getMessage().contains("Tenant not found with ID: missing-tenant"));
    }

    @Test
    void getAllTenantsShouldMapPagedTenantsToDtos() {
        PageRequest pageable = PageRequest.of(0, 2);
        Tenant tenantA = tenant("tenant-a", "Alpha Hotels", "alpha", true);
        Tenant tenantB = tenant("tenant-b", "Beta Hotels", "beta", false);
        Page<Tenant> tenants = new PageImpl<>(List.of(tenantA, tenantB), pageable, 2);

        when(tenantRepository.findAll(org.mockito.ArgumentMatchers.<Specification<Tenant>>any(), any(Pageable.class)))
            .thenReturn(tenants);
        when(userRepository.countByTenantId("tenant-a")).thenReturn(7L);
        when(userRepository.countByTenantId("tenant-b")).thenReturn(1L);
        when(hotelRepository.countByTenant_Id("tenant-a")).thenReturn(3L);
        when(hotelRepository.countByTenant_Id("tenant-b")).thenReturn(1L);

        Page<TenantDTO> result = tenantManagementService.getAllTenants(pageable, "hotel", null);

        assertEquals(2, result.getTotalElements());
        assertEquals("tenant-a", result.getContent().get(0).getId());
        assertEquals(7L, result.getContent().get(0).getTotalUsers());
        assertEquals("tenant-b", result.getContent().get(1).getId());
        assertEquals(1L, result.getContent().get(1).getTotalHotels());
    }

    @Test
    void toggleTenantStatusShouldFlipFlagAndReturnUpdatedDto() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Group", "grand-plaza", true);
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.countByTenantId("tenant-1")).thenReturn(5L);
        when(hotelRepository.countByTenant_Id("tenant-1")).thenReturn(4L);

        TenantDTO result = tenantManagementService.toggleTenantStatus("tenant-1");

        assertFalse(tenant.getIsActive());
        assertFalse(result.getIsActive());
        assertEquals(5L, result.getTotalUsers());
        assertEquals(4L, result.getTotalHotels());
    }

    @Test
    void deleteTenantShouldRejectWhenUsersOrHotelsExist() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Group", "grand-plaza", true);
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(userRepository.countByTenantId("tenant-1")).thenReturn(2L);
        when(hotelRepository.countByTenant_Id("tenant-1")).thenReturn(1L);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> tenantManagementService.deleteTenant("tenant-1"));

        assertTrue(exception.getMessage().contains("associated users (2) or hotels (1)"));
        verify(tenantRepository, never()).delete(any(Tenant.class));
    }

    @Test
    void deleteTenantShouldRemoveTenantWhenNoUsersOrHotelsExist() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Group", "grand-plaza", true);
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(userRepository.countByTenantId("tenant-1")).thenReturn(0L);
        when(hotelRepository.countByTenant_Id("tenant-1")).thenReturn(0L);

        tenantManagementService.deleteTenant("tenant-1");

        verify(tenantRepository).delete(tenant);
    }

    @Test
    void getActiveTenantsAndStatisticsShouldReflectRepositoryCounts() {
        Tenant activeA = tenant("tenant-a", "Alpha Hotels", "alpha", true);
        Tenant activeB = tenant("tenant-b", "Beta Hotels", "beta", true);
        when(tenantRepository.findByIsActiveTrueOrderByName()).thenReturn(List.of(activeA, activeB));
        when(userRepository.countByTenantId("tenant-a")).thenReturn(7L);
        when(userRepository.countByTenantId("tenant-b")).thenReturn(4L);
        when(hotelRepository.countByTenant_Id("tenant-a")).thenReturn(3L);
        when(hotelRepository.countByTenant_Id("tenant-b")).thenReturn(2L);
        when(tenantRepository.count()).thenReturn(3L);
        when(tenantRepository.countByIsActiveTrue()).thenReturn(2L);
        when(userRepository.count()).thenReturn(11L);
        when(hotelRepository.count()).thenReturn(5L);

        List<TenantDTO> activeTenants = tenantManagementService.getActiveTenants();
        TenantManagementService.TenantStatistics statistics = tenantManagementService.getTenantStatistics();

        assertEquals(2, activeTenants.size());
        assertEquals("tenant-a", activeTenants.get(0).getId());
        assertEquals(7L, activeTenants.get(0).getTotalUsers());
        assertEquals(3L, activeTenants.get(0).getTotalHotels());
        assertEquals("tenant-b", activeTenants.get(1).getId());

        assertEquals(3L, statistics.getTotalTenants());
        assertEquals(2L, statistics.getActiveTenants());
        assertEquals(1L, statistics.getInactiveTenants());
        assertEquals(11L, statistics.getTotalUsers());
        assertEquals(5L, statistics.getTotalHotels());
    }

    private Tenant tenant(String id, String name, String subdomain, boolean isActive) {
        Tenant tenant = new Tenant(id, name);
        tenant.setSubdomain(subdomain);
        tenant.setIsActive(isActive);
        tenant.setDescription(name + " description");
        tenant.setCreatedAt(LocalDateTime.now());
        tenant.setUpdatedAt(LocalDateTime.now());
        return tenant;
    }
}