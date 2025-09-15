package com.bookmyhotel.controller.admin;

import com.bookmyhotel.dto.admin.CreateTenantRequest;
import com.bookmyhotel.dto.admin.TenantDTO;
import com.bookmyhotel.dto.admin.UpdateTenantRequest;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.service.TenantManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin controller for tenant management
 */
@RestController
@RequestMapping("/api/admin/tenants")
@PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TenantManagementAdminController {

    @Autowired
    private TenantManagementService tenantManagementService;

    /**
     * Get all tenants with pagination and search
     */
    @GetMapping
    public ResponseEntity<Page<TenantDTO>> getAllTenants(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<TenantDTO> tenants = tenantManagementService.getAllTenants(pageable, search, isActive);
        return ResponseEntity.ok(tenants);
    }

    /**
     * Get tenant by ID
     */
    @GetMapping("/{tenantId}")
    public ResponseEntity<TenantDTO> getTenantById(@PathVariable String tenantId) {
        TenantDTO tenant = tenantManagementService.getTenantById(tenantId);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Create new tenant
     */
    @PostMapping
    public ResponseEntity<TenantDTO> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        TenantDTO tenant = tenantManagementService.createTenant(request);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Update tenant
     */
    @PutMapping("/{tenantId}")
    public ResponseEntity<TenantDTO> updateTenant(
            @PathVariable String tenantId,
            @Valid @RequestBody UpdateTenantRequest request) {
        TenantDTO tenant = tenantManagementService.updateTenant(tenantId, request);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Toggle tenant status
     */
    @PostMapping("/{tenantId}/toggle-status")
    public ResponseEntity<TenantDTO> toggleTenantStatus(@PathVariable String tenantId) {
        TenantDTO tenant = tenantManagementService.toggleTenantStatus(tenantId);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Delete tenant
     */
    @DeleteMapping("/{tenantId}")
    public ResponseEntity<Void> deleteTenant(@PathVariable String tenantId) {
        tenantManagementService.deleteTenant(tenantId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get tenant statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<TenantManagementService.TenantStatistics> getTenantStatistics() {
        TenantManagementService.TenantStatistics stats = tenantManagementService.getTenantStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all active tenants (for dropdowns, etc.)
     */
    @GetMapping("/active")
    public ResponseEntity<List<TenantDTO>> getActiveTenants() {
        List<TenantDTO> activeTenants = tenantManagementService.getActiveTenants();
        return ResponseEntity.ok(activeTenants);
    }
}
