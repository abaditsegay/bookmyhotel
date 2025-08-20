package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.PricingStrategy;
import com.bookmyhotel.entity.PricingStrategyType;
import com.bookmyhotel.entity.RoomType;

/**
 * Repository for managing PricingStrategy entities
 */
@Repository
public interface PricingStrategyRepository extends JpaRepository<PricingStrategy, Long> {
    
    /**
     * Find all active pricing strategies for a hotel
     */
    List<PricingStrategy> findByHotelIdAndIsActiveTrueOrderByPriorityDesc(Long hotelId);
    
    /**
     * Find active pricing strategies for a hotel and room type
     */
    List<PricingStrategy> findByHotelIdAndRoomTypeAndIsActiveTrueOrderByPriorityDesc(Long hotelId, RoomType roomType);
    
    /**
     * Find active pricing strategies for a hotel that are effective on a specific date
     */
    @Query("SELECT ps FROM PricingStrategy ps WHERE ps.hotelId = :hotelId " +
           "AND ps.isActive = true " +
           "AND ps.effectiveFrom <= :date " +
           "AND (ps.effectiveTo IS NULL OR ps.effectiveTo >= :date) " +
           "ORDER BY ps.priority DESC")
    List<PricingStrategy> findActiveStrategiesForDate(@Param("hotelId") Long hotelId, 
                                                     @Param("date") LocalDate date);
    
    /**
     * Find active pricing strategies for a hotel, room type, and date
     */
    @Query("SELECT ps FROM PricingStrategy ps WHERE ps.hotelId = :hotelId " +
           "AND (ps.roomType IS NULL OR ps.roomType = :roomType) " +
           "AND ps.isActive = true " +
           "AND ps.effectiveFrom <= :date " +
           "AND (ps.effectiveTo IS NULL OR ps.effectiveTo >= :date) " +
           "ORDER BY ps.priority DESC")
    List<PricingStrategy> findActiveStrategiesForRoomTypeAndDate(@Param("hotelId") Long hotelId,
                                                                @Param("roomType") RoomType roomType,
                                                                @Param("date") LocalDate date);
    
    /**
     * Find pricing strategies by type for a hotel
     */
    List<PricingStrategy> findByHotelIdAndStrategyTypeAndIsActiveTrueOrderByPriorityDesc(
        Long hotelId, PricingStrategyType strategyType);
    
    /**
     * Find demand-based pricing strategies for a hotel within occupancy thresholds
     */
    @Query("SELECT ps FROM PricingStrategy ps WHERE ps.hotelId = :hotelId " +
           "AND ps.strategyType = 'DEMAND_BASED' " +
           "AND ps.isActive = true " +
           "AND (ps.minOccupancyThreshold IS NULL OR ps.minOccupancyThreshold <= :occupancyRate) " +
           "AND (ps.maxOccupancyThreshold IS NULL OR ps.maxOccupancyThreshold >= :occupancyRate) " +
           "ORDER BY ps.priority DESC")
    List<PricingStrategy> findDemandBasedStrategiesForOccupancy(@Param("hotelId") Long hotelId,
                                                               @Param("occupancyRate") Double occupancyRate);
    
    /**
     * Find early bird pricing strategies for advance booking days
     */
    @Query("SELECT ps FROM PricingStrategy ps WHERE ps.hotelId = :hotelId " +
           "AND ps.strategyType = 'EARLY_BIRD' " +
           "AND ps.isActive = true " +
           "AND (ps.advanceBookingDays IS NULL OR ps.advanceBookingDays <= :advanceDays) " +
           "ORDER BY ps.priority DESC")
    List<PricingStrategy> findEarlyBirdStrategiesForAdvanceDays(@Param("hotelId") Long hotelId,
                                                               @Param("advanceDays") Integer advanceDays);
}
