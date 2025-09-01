package com.bookmyhotel.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.TenantDTO;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.service.TenantService;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Controller for tenant-related operations accessible to authenticated users
 */
@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    @Autowired
    private TenantService tenantService;

    /**
     * Get current user's tenant information
     * Accessible to any authenticated user with a tenant context
     */
    @GetMapping("/current")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TenantDTO> getCurrentTenant(Authentication authentication) {

        // Get tenant ID from current context
        String currentTenantId = TenantContext.getTenantId();

        if (currentTenantId == null) {
            // User is system-wide (no tenant context)
            return ResponseEntity.ok(null);
        }

        try {
            Optional<Tenant> tenantOpt = tenantService.getTenantById(currentTenantId);
            if (tenantOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Tenant tenant = tenantOpt.get();
            TenantDTO tenantDTO = new TenantDTO(
                    tenant.getId(),
                    tenant.getId(), // Using id as tenantId for compatibility
                    tenant.getName(),
                    tenant.getSubdomain(),
                    tenant.getDescription(),
                    tenant.getIsActive(),
                    tenant.getCreatedAt(),
                    tenant.getUpdatedAt());

            return ResponseEntity.ok(tenantDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
