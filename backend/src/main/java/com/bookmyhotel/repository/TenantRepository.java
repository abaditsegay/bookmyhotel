package com.bookmyhotel.repository;

import com.bookmyhotel.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Tenant entity
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    /**
     * Find tenant by tenant ID
     */
    Optional<Tenant> findByTenantId(String tenantId);

    /**
     * Find tenant by name
     */
    Optional<Tenant> findByName(String name);

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
}
