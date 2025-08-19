package com.bookmyhotel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Tenant;

/**
 * Repository for Tenant entity
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long>, JpaSpecificationExecutor<Tenant> {

    /**
     * Find tenant by tenant ID
     */
    Optional<Tenant> findByTenantId(String tenantId);

    /**
     * Find tenant by name
     */
    Optional<Tenant> findByName(String name);

    /**
     * Find tenant by subdomain
     */
    Optional<Tenant> findBySubdomain(String subdomain);

    /**
     * Check if tenant exists by tenant ID
     */
    boolean existsByTenantId(String tenantId);

    /**
     * Check if tenant exists by name
     */
    boolean existsByName(String name);

    /**
     * Find active tenant by tenant ID
     */
    Optional<Tenant> findByTenantIdAndIsActiveTrue(String tenantId);

    /**
     * Find all active tenants ordered by name
     */
    List<Tenant> findByIsActiveTrueOrderByName();

    /**
     * Count active tenants
     */
    long countByIsActiveTrue();
}
