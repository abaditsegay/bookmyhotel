package com.bookmyhotel.repository;

import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.enums.WorkShift;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HousekeepingStaffRepository extends JpaRepository<HousekeepingStaff, Long> {
    
    // Basic queries
    List<HousekeepingStaff> findByTenantIdOrderByIdDesc(String tenantId);
    Page<HousekeepingStaff> findByTenantIdOrderByIdDesc(String tenantId, Pageable pageable);
    
    // Find by email (new primary method)
    Optional<HousekeepingStaff> findByTenantIdAndEmail(String tenantId, String email);
    Optional<HousekeepingStaff> findByEmail(String email);
    
    // Find by availability
    List<HousekeepingStaff> findByTenantIdAndIsActiveTrue(String tenantId);
    Page<HousekeepingStaff> findByTenantIdAndIsActive(String tenantId, Boolean isActive, Pageable pageable);
    List<HousekeepingStaff> findByTenantIdAndIsActive(String tenantId, Boolean isActive);
    
    // Find by shift
    List<HousekeepingStaff> findByTenantIdAndShift(String tenantId, WorkShift shift);
    
    // Statistics queries
    @Query("SELECT COUNT(hs) FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.isActive = true")
    Long countActiveStaff(@Param("tenantId") String tenantId);
    
    // Available staff based on current workload
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.isActive = true ORDER BY hs.id ASC")
    List<HousekeepingStaff> findAvailableStaff(@Param("tenantId") String tenantId);
    
    // Staff by work shift
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.shift = :shift AND hs.isActive = true ORDER BY hs.id ASC")
    List<HousekeepingStaff> findActiveStaffByShift(@Param("tenantId") String tenantId, @Param("shift") WorkShift shift);

    // Performance-based queries (simplified)
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.performanceRating >= :minRating AND hs.isActive = true ORDER BY hs.performanceRating DESC")
    List<HousekeepingStaff> findTopPerformers(@Param("tenantId") String tenantId, @Param("minRating") Double minRating);

    // Average staff rating
    @Query("SELECT AVG(hs.performanceRating) FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.isActive = true")
    Double getAverageStaffRating(@Param("tenantId") String tenantId);
}
