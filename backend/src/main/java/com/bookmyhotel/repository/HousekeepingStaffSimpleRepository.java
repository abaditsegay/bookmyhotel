package com.bookmyhotel.repository;

import com.bookmyhotel.entity.HousekeepingStaffSimple;
import com.bookmyhotel.enums.HousekeepingRole;
import com.bookmyhotel.enums.StaffStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HousekeepingStaffSimpleRepository extends JpaRepository<HousekeepingStaffSimple, Long> {

    // Basic queries matching database schema
    List<HousekeepingStaffSimple> findByTenantIdOrderByIdDesc(String tenantId);

    Page<HousekeepingStaffSimple> findByTenantIdOrderByIdDesc(String tenantId, Pageable pageable);

    // Find by user (using employee_id as proxy for user lookup)
    Optional<HousekeepingStaffSimple> findByEmployeeId(String employeeId);

    Optional<HousekeepingStaffSimple> findByTenantIdAndEmployeeId(String tenantId, String employeeId);

    // Find by email (direct field in table)
    Optional<HousekeepingStaffSimple> findByEmail(String email);

    Optional<HousekeepingStaffSimple> findByTenantIdAndEmail(String tenantId, String email);

    // Find by status
    List<HousekeepingStaffSimple> findByTenantIdAndIsActiveTrue(String tenantId);

    List<HousekeepingStaffSimple> findByTenantIdAndStatus(String tenantId, StaffStatus status);

    // Find by role
    List<HousekeepingStaffSimple> findByTenantIdAndRole(String tenantId, HousekeepingRole role);

    // Statistics queries using actual database fields
    @Query("SELECT COUNT(hs) FROM HousekeepingStaffSimple hs WHERE hs.tenantId = :tenantId AND hs.isActive = true")
    Long countActiveStaff(@Param("tenantId") String tenantId);

    // Available staff based on current workload
    @Query("SELECT hs FROM HousekeepingStaffSimple hs WHERE hs.tenantId = :tenantId AND hs.isActive = true AND hs.currentWorkload <= :maxWorkload ORDER BY hs.currentWorkload ASC")
    List<HousekeepingStaffSimple> findAvailableStaff(@Param("tenantId") String tenantId,
            @Param("maxWorkload") Integer maxWorkload);

    // Top performers based on average rating
    @Query("SELECT hs FROM HousekeepingStaffSimple hs WHERE hs.tenantId = :tenantId AND hs.averageRating >= :minRating AND hs.isActive = true ORDER BY hs.averageRating DESC")
    List<HousekeepingStaffSimple> findTopPerformers(@Param("tenantId") String tenantId,
            @Param("minRating") Double minRating);

    // Average staff rating using performance_rating field
    @Query("SELECT AVG(hs.performanceRating) FROM HousekeepingStaffSimple hs WHERE hs.tenantId = :tenantId AND hs.isActive = true")
    Double getAverageStaffRating(@Param("tenantId") String tenantId);
}
