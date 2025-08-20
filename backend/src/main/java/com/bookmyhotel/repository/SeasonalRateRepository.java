package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.SeasonalRate;

/**
 * Repository for managing SeasonalRate entities
 */
@Repository
public interface SeasonalRateRepository extends JpaRepository<SeasonalRate, Long> {
    
    /**
     * Find all active seasonal rates for a hotel
     */
    List<SeasonalRate> findByHotelIdAndIsActiveTrueOrderByPriorityDesc(Long hotelId);
    
    /**
     * Find active seasonal rates for a hotel and room type
     */
    List<SeasonalRate> findByHotelIdAndRoomTypeAndIsActiveTrueOrderByPriorityDesc(Long hotelId, RoomType roomType);
    
    /**
     * Find active seasonal rates that apply to a specific date
     */
    @Query("SELECT sr FROM SeasonalRate sr WHERE sr.hotelId = :hotelId " +
           "AND sr.isActive = true " +
           "AND sr.startDate <= :date " +
           "AND sr.endDate >= :date " +
           "ORDER BY sr.priority DESC")
    List<SeasonalRate> findActiveRatesForDate(@Param("hotelId") Long hotelId, 
                                             @Param("date") LocalDate date);
    
    /**
     * Find active seasonal rates for a hotel, room type, and date
     */
    @Query("SELECT sr FROM SeasonalRate sr WHERE sr.hotelId = :hotelId " +
           "AND (sr.roomType IS NULL OR sr.roomType = :roomType) " +
           "AND sr.isActive = true " +
           "AND sr.startDate <= :date " +
           "AND sr.endDate >= :date " +
           "ORDER BY sr.priority DESC")
    List<SeasonalRate> findActiveRatesForRoomTypeAndDate(@Param("hotelId") Long hotelId,
                                                        @Param("roomType") RoomType roomType,
                                                        @Param("date") LocalDate date);
    
    /**
     * Find seasonal rates that overlap with a date range
     */
    @Query("SELECT sr FROM SeasonalRate sr WHERE sr.hotelId = :hotelId " +
           "AND sr.isActive = true " +
           "AND NOT (sr.endDate < :startDate OR sr.startDate > :endDate) " +
           "ORDER BY sr.priority DESC")
    List<SeasonalRate> findRatesOverlappingDateRange(@Param("hotelId") Long hotelId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);
    
    /**
     * Find seasonal rates by season name for a hotel
     */
    List<SeasonalRate> findByHotelIdAndSeasonNameContainingIgnoreCaseAndIsActiveTrue(Long hotelId, String seasonName);
    
    /**
     * Find weekend-only seasonal rates
     */
    @Query("SELECT sr FROM SeasonalRate sr WHERE sr.hotelId = :hotelId " +
           "AND sr.isActive = true " +
           "AND sr.appliesToWeekendsOnly = true " +
           "AND sr.startDate <= :date " +
           "AND sr.endDate >= :date " +
           "ORDER BY sr.priority DESC")
    List<SeasonalRate> findWeekendOnlyRatesForDate(@Param("hotelId") Long hotelId,
                                                  @Param("date") LocalDate date);
    
    /**
     * Find weekday-only seasonal rates
     */
    @Query("SELECT sr FROM SeasonalRate sr WHERE sr.hotelId = :hotelId " +
           "AND sr.isActive = true " +
           "AND sr.appliesToWeekdaysOnly = true " +
           "AND sr.startDate <= :date " +
           "AND sr.endDate >= :date " +
           "ORDER BY sr.priority DESC")
    List<SeasonalRate> findWeekdayOnlyRatesForDate(@Param("hotelId") Long hotelId,
                                                  @Param("date") LocalDate date);
}
