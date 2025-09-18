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
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId ORDER BY hs.id DESC")
    List<HousekeepingStaff> findByHotelIdOrderByIdDesc(@Param("hotelId") Long hotelId);

    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId ORDER BY hs.id DESC")
    Page<HousekeepingStaff> findByHotelIdOrderByIdDesc(@Param("hotelId") Long hotelId, Pageable pageable);

    // Find by email (new primary method)
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.email = :email")
    Optional<HousekeepingStaff> findByHotelIdAndEmail(@Param("hotelId") Long hotelId, @Param("email") String email);

    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.email = :email")
    Optional<HousekeepingStaff> findByEmail(@Param("email") String email);

    // Find by availability
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.isActive = true")
    List<HousekeepingStaff> findByHotelIdAndIsActiveTrue(@Param("hotelId") Long hotelId);

    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.isActive = :isActive")
    Page<HousekeepingStaff> findByHotelIdAndIsActive(@Param("hotelId") Long hotelId,
            @Param("isActive") Boolean isActive, Pageable pageable);

    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.isActive = :isActive")
    List<HousekeepingStaff> findByHotelIdAndIsActive(@Param("hotelId") Long hotelId,
            @Param("isActive") Boolean isActive);

    // Find by shift
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.shift = :shift")
    List<HousekeepingStaff> findByHotelIdAndShift(@Param("hotelId") Long hotelId, @Param("shift") WorkShift shift);

    // Statistics queries
    @Query("SELECT COUNT(hs) FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.isActive = true")
    Long countActiveStaff(@Param("hotelId") Long hotelId);

    // Available staff based on current workload
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.isActive = true ORDER BY hs.id ASC")
    List<HousekeepingStaff> findAvailableStaff(@Param("hotelId") Long hotelId);

    // Staff by work shift
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.shift = :shift AND hs.isActive = true ORDER BY hs.id ASC")
    List<HousekeepingStaff> findActiveStaffByShift(@Param("hotelId") Long hotelId, @Param("shift") WorkShift shift);

    // Performance-based queries (simplified)
    @Query("SELECT hs FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.performanceRating >= :minRating AND hs.isActive = true ORDER BY hs.performanceRating DESC")
    List<HousekeepingStaff> findTopPerformers(@Param("hotelId") Long hotelId, @Param("minRating") Double minRating);

    // Average staff rating
    @Query("SELECT AVG(hs.performanceRating) FROM HousekeepingStaff hs WHERE hs.hotel.id = :hotelId AND hs.isActive = true")
    Double getAverageStaffRating(@Param("hotelId") Long hotelId);
}
