package com.bookmyhotel.repository;

import com.bookmyhotel.entity.Ad;
import com.bookmyhotel.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Ad entities
 */
@Repository
public interface AdRepository extends JpaRepository<Ad, Long> {

    /**
     * Find all active ads that are still valid
     */
    @Query("SELECT a FROM Ad a WHERE a.isActive = true AND (a.validUntil IS NULL OR a.validUntil > :currentDate) ORDER BY a.priorityLevel DESC, a.clickCount ASC")
    List<Ad> findActiveValidAds(@Param("currentDate") LocalDate currentDate);

    /**
     * Find all active ads for a specific tenant that are still valid
     */
    @Query("SELECT a FROM Ad a WHERE a.tenant = :tenant AND a.isActive = true AND (a.validUntil IS NULL OR a.validUntil > :currentDate) ORDER BY a.priorityLevel DESC, a.clickCount ASC")
    List<Ad> findActiveValidAdsByTenant(@Param("tenant") Tenant tenant, @Param("currentDate") LocalDate currentDate);

    /**
     * Find random active ads (for homepage rotation)
     */
    @Query("SELECT a FROM Ad a WHERE a.isActive = true AND (a.validUntil IS NULL OR a.validUntil > :currentDate) ORDER BY FUNCTION('RAND')")
    List<Ad> findRandomActiveAds(@Param("currentDate") LocalDate currentDate);

    /**
     * Find ads by hotel
     */
    @Query("SELECT a FROM Ad a WHERE a.hotel.id = :hotelId AND a.isActive = true AND (a.validUntil IS NULL OR a.validUntil > :currentDate)")
    List<Ad> findActiveAdsByHotelId(@Param("hotelId") Long hotelId, @Param("currentDate") LocalDate currentDate);

    /**
     * Find ads by priority level
     */
    @Query("SELECT a FROM Ad a WHERE a.priorityLevel >= :minPriority AND a.isActive = true AND (a.validUntil IS NULL OR a.validUntil > :currentDate) ORDER BY a.priorityLevel DESC")
    List<Ad> findAdsByPriority(@Param("minPriority") Integer minPriority, @Param("currentDate") LocalDate currentDate);

    /**
     * Find all ads for a specific tenant (for admin management)
     */
    List<Ad> findByTenantOrderByCreatedAtDesc(Tenant tenant);

    /**
     * Count active ads
     */
    @Query("SELECT COUNT(a) FROM Ad a WHERE a.isActive = true AND (a.validUntil IS NULL OR a.validUntil > :currentDate)")
    Long countActiveAds(@Param("currentDate") LocalDate currentDate);
}
