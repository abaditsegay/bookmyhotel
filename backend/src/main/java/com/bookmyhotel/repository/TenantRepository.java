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
public interface TenantRepository extends JpaRepository<Tenant, String>, JpaSpecificationExecutor<Tenant> {

    /**
     * Find tenant by name
     */
    Optional<Tenant> findByName(String name);

    /**
     * Find tenant by subdomain
     */
    Optional<Tenant> findBySubdomain(String subdomain);

    /**
     * Check if tenant exists by name
     */
    boolean existsByName(String name);

    /**
     * Find active tenant by ID
     */
    Optional<Tenant> findByIdAndIsActiveTrue(String id);

    /**
     * Find all active tenants ordered by name
     */
    List<Tenant> findByIsActiveTrueOrderByName();

    /**
     * Count active tenants
     */
    long countByIsActiveTrue();
}
