package com.bookmyhotel.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.TenantRepository;

/**
 * Service for managing tenants
 */
@Service
@Transactional
public class TenantService {

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Get or create tenant by identifier
     * This method will create a new tenant with a GUID if it doesn't exist
     */
    public Tenant getOrCreateTenant(String tenantIdentifier) {
        // Check if tenant already exists by name first
        Optional<Tenant> existingTenant = tenantRepository.findByName(tenantIdentifier);
        if (existingTenant.isPresent()) {
            return existingTenant.get();
        }

        // Create new tenant with GUID as ID
        String tenantId = UUID.randomUUID().toString();
        Tenant newTenant = new Tenant(tenantId, tenantIdentifier);
        newTenant.setDescription("Auto-created tenant for: " + tenantIdentifier);

        return tenantRepository.save(newTenant);
    }

    /**
     * Create a new tenant with a specific name
     */
    public Tenant createTenant(String name, String description) {
        if (tenantRepository.existsByName(name)) {
            throw new RuntimeException("Tenant with name '" + name + "' already exists");
        }

        String tenantId = UUID.randomUUID().toString();
        Tenant tenant = new Tenant(tenantId, name);
        tenant.setDescription(description);

        return tenantRepository.save(tenant);
    }

    /**
     * Get tenant by tenant ID
     */
    @Transactional(readOnly = true)
    public Optional<Tenant> getTenantById(String tenantId) {
        return tenantRepository.findById(tenantId);
    }

    /**
     * Get tenant by name
     */
    @Transactional(readOnly = true)
    public Optional<Tenant> getTenantByName(String name) {
        return tenantRepository.findByName(name);
    }

    /**
     * Update tenant status
     */
    public Tenant updateTenantStatus(String tenantId, boolean isActive) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        tenant.setIsActive(isActive);
        return tenantRepository.save(tenant);
    }
}
