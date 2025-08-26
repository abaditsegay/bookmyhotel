package com.bookmyhotel.repository;

import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.ShiftType;
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
    List<HousekeepingStaff> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    Page<HousekeepingStaff> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);
    List<HousekeepingStaff> findByTenantIdAndHotel_IdOrderByCreatedAtDesc(String tenantId, Long hotelId);
    Page<HousekeepingStaff> findByTenantIdAndHotel_IdOrderByCreatedAtDesc(String tenantId, Long hotelId, Pageable pageable);
    
    // Find by user
    Optional<HousekeepingStaff> findByTenantIdAndUserId(String tenantId, Long userId);
    Optional<HousekeepingStaff> findByTenantIdAndUserIdAndHotel_Id(String tenantId, Long userId, Long hotelId);
    Optional<HousekeepingStaff> findByUserId(Long userId);
    
    // Find by availability
    List<HousekeepingStaff> findByTenantIdAndIsActiveTrue(String tenantId);
    List<HousekeepingStaff> findByTenantIdAndHotel_IdAndIsActiveTrue(String tenantId, Long hotelId);
    Page<HousekeepingStaff> findByTenantIdAndIsActive(String tenantId, Boolean isActive, Pageable pageable);
    List<HousekeepingStaff> findByTenantIdAndIsActive(String tenantId, Boolean isActive);
    
    // Find by shift
    List<HousekeepingStaff> findByTenantIdAndShiftType(String tenantId, ShiftType shiftType);
    List<HousekeepingStaff> findByTenantIdAndHotel_IdAndShiftType(String tenantId, Long hotelId, ShiftType shiftType);
    
    // Performance queries
    // TODO: Fix entity field mapping for averageRating
    // @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.averageRating >= :minRating ORDER BY hs.averageRating DESC")
    // List<HousekeepingStaff> findTopPerformers(@Param("tenantId") String tenantId, @Param("minRating") Double minRating);
    
    // @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.hotel.id = :hotelId AND hs.averageRating >= :minRating ORDER BY hs.averageRating DESC")
    // List<HousekeepingStaff> findTopPerformersByHotel(@Param("tenantId") String tenantId, @Param("hotelId") Long hotelId, @Param("minRating") Double minRating);
    
    // Workload queries
    // TODO: Fix entity field mapping for currentWorkload
    // @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.currentWorkload < :maxWorkload AND hs.isActive = true ORDER BY hs.currentWorkload ASC")
    // List<HousekeepingStaff> findAvailableStaff(@Param("tenantId") String tenantId, @Param("maxWorkload") Integer maxWorkload);
    
    // @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.hotel.id = :hotelId AND hs.currentWorkload < :maxWorkload AND hs.isActive = true ORDER BY hs.currentWorkload ASC")
    // List<HousekeepingStaff> findAvailableStaffByHotel(@Param("tenantId") String tenantId, @Param("hotelId") Long hotelId, @Param("maxWorkload") Integer maxWorkload);
    
    // Statistics queries
    @Query("SELECT COUNT(hs) FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.isActive = true")
    Long countActiveStaff(@Param("tenantId") String tenantId);
    
    @Query("SELECT COUNT(hs) FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.hotel.id = :hotelId AND hs.isActive = true")
    Long countActiveStaffByHotel(@Param("tenantId") String tenantId, @Param("hotelId") Long hotelId);
    
    // Available staff based on current workload
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.isActive = true AND hs.currentWorkload <= :maxWorkload ORDER BY hs.currentWorkload ASC")
    List<HousekeepingStaff> findAvailableStaff(@Param("tenantId") String tenantId, @Param("maxWorkload") Integer maxWorkload);
    
    // Top performers based on rating
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.averageRating >= :minRating AND hs.isActive = true ORDER BY hs.averageRating DESC")
    List<HousekeepingStaff> findTopPerformers(@Param("tenantId") String tenantId, @Param("minRating") Double minRating);
    
    // Average staff rating
    @Query("SELECT AVG(hs.averageRating) FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.isActive = true")
    Double getAverageStaffRating(@Param("tenantId") String tenantId);
    
    @Query("SELECT AVG(hs.averageRating) FROM HousekeepingStaff hs WHERE hs.tenantId = :tenantId AND hs.hotel.id = :hotelId AND hs.isActive = true")
    Double getAverageStaffRatingByHotel(@Param("tenantId") String tenantId, @Param("hotelId") Long hotelId);
}
