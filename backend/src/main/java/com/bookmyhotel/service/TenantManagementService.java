package com.bookmyhotel.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.admin.CreateTenantRequest;
import com.bookmyhotel.dto.admin.TenantDTO;
import com.bookmyhotel.dto.admin.UpdateTenantRequest;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for tenant management operations
 */
@Service
@Transactional
public class TenantManagementService {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Get all tenants with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<TenantDTO> getAllTenants(Pageable pageable, String search, Boolean isActive) {
        Specification<Tenant> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("subdomain")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")));
        }

        if (isActive != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isActive"), isActive));
        }

        Page<Tenant> tenants = tenantRepository.findAll(spec, pageable);
        return tenants.map(this::convertToDTO);
    }

    /**
     * Get tenant by ID
     */
    @Transactional(readOnly = true)
    public TenantDTO getTenantById(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + tenantId));
        return convertToDTO(tenant);
    }

    /**
     * Create new tenant
     */
    public TenantDTO createTenant(CreateTenantRequest request) {
        // Check if tenant name already exists
        if (tenantRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tenant with name '" + request.getName() + "' already exists");
        }

        // Clean and validate subdomain (if provided)
        String cleanSubdomain = null;
        if (request.getSubdomain() != null && !request.getSubdomain().trim().isEmpty()) {
            cleanSubdomain = request.getSubdomain().trim();
            if (tenantRepository.findBySubdomain(cleanSubdomain).isPresent()) {
                throw new RuntimeException("Tenant with subdomain '" + cleanSubdomain + "' already exists");
            }
        }

        String tenantId = UUID.randomUUID().toString();
        Tenant tenant = new Tenant(tenantId, request.getName());
        tenant.setSubdomain(cleanSubdomain);
        tenant.setDescription(request.getDescription());
        tenant.setIsActive(true);

        tenant = tenantRepository.save(tenant);
        return convertToDTO(tenant);
    }

    /**
     * Update tenant
     */
    public TenantDTO updateTenant(String tenantId, UpdateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + tenantId));

        // Update fields if provided
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            // Check if new name conflicts with existing tenant
            if (!request.getName().equals(tenant.getName()) &&
                    tenantRepository.existsByName(request.getName())) {
                throw new RuntimeException("Tenant with name '" + request.getName() + "' already exists");
            }
            tenant.setName(request.getName());
        }

        if (request.getSubdomain() != null) {
            // Clean subdomain - convert empty strings to null
            String cleanSubdomain = request.getSubdomain().trim().isEmpty() ? null : request.getSubdomain().trim();

            // Check if new subdomain conflicts with existing tenant (only if not
            // null/empty)
            if (cleanSubdomain != null &&
                    !cleanSubdomain.equals(tenant.getSubdomain()) &&
                    tenantRepository.findBySubdomain(cleanSubdomain).isPresent()) {
                throw new RuntimeException("Tenant with subdomain '" + cleanSubdomain + "' already exists");
            }
            tenant.setSubdomain(cleanSubdomain);
        }

        if (request.getDescription() != null) {
            tenant.setDescription(request.getDescription());
        }

        if (request.getIsActive() != null) {
            tenant.setIsActive(request.getIsActive());
        }

        tenant = tenantRepository.save(tenant);
        return convertToDTO(tenant);
    }

    /**
     * Toggle tenant status
     */
    public TenantDTO toggleTenantStatus(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + tenantId));

        tenant.setIsActive(!tenant.getIsActive());
        tenant = tenantRepository.save(tenant);
        return convertToDTO(tenant);
    }

    /**
     * Delete tenant
     */
    public void deleteTenant(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + tenantId));

        // Check if tenant has associated users or hotels
        long userCount = userRepository.countByTenantId(tenantId);
        long hotelCount = hotelRepository.countByTenant_Id(tenantId);

        if (userCount > 0 || hotelCount > 0) {
            throw new RuntimeException("Cannot delete tenant with associated users (" + userCount +
                    ") or hotels (" + hotelCount + "). Please reassign or remove them first.");
        }

        tenantRepository.delete(tenant);
    }

    /**
     * Get active tenants
     */
    @Transactional(readOnly = true)
    public List<TenantDTO> getActiveTenants() {
        List<Tenant> activeTenants = tenantRepository.findByIsActiveTrueOrderByName();
        return activeTenants.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get tenant statistics
     */
    @Transactional(readOnly = true)
    public TenantStatistics getTenantStatistics() {
        long totalTenants = tenantRepository.count();
        long activeTenants = tenantRepository.countByIsActiveTrue();
        long inactiveTenants = totalTenants - activeTenants;

        // Get total users and hotels across all tenants
        long totalUsers = userRepository.count();
        long totalHotels = hotelRepository.count();

        return new TenantStatistics(totalTenants, activeTenants, inactiveTenants, totalUsers, totalHotels);
    }

    /**
     * Convert Tenant entity to DTO
     */
    private TenantDTO convertToDTO(Tenant tenant) {
        TenantDTO dto = new TenantDTO(
                tenant.getId(),
                tenant.getId(), // Both id and tenantId are the same now
                tenant.getName(),
                tenant.getSubdomain(),
                tenant.getDescription(),
                tenant.getIsActive(),
                tenant.getCreatedAt(),
                tenant.getUpdatedAt());

        // Add statistics
        dto.setTotalUsers(userRepository.countByTenantId(tenant.getId()));
        dto.setTotalHotels(hotelRepository.countByTenant_Id(tenant.getId()));

        return dto;
    }

    /**
     * Statistics class for tenant data
     */
    public static class TenantStatistics {
        private final long totalTenants;
        private final long activeTenants;
        private final long inactiveTenants;
        private final long totalUsers;
        private final long totalHotels;

        public TenantStatistics(long totalTenants, long activeTenants, long inactiveTenants,
                long totalUsers, long totalHotels) {
            this.totalTenants = totalTenants;
            this.activeTenants = activeTenants;
            this.inactiveTenants = inactiveTenants;
            this.totalUsers = totalUsers;
            this.totalHotels = totalHotels;
        }

        public long getTotalTenants() {
            return totalTenants;
        }

        public long getActiveTenants() {
            return activeTenants;
        }

        public long getInactiveTenants() {
            return inactiveTenants;
        }

        public long getTotalUsers() {
            return totalUsers;
        }

        public long getTotalHotels() {
            return totalHotels;
        }
    }
}
