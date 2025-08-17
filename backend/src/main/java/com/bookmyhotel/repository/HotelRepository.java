package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Hotel;

/**
 * Hotel repository
 */
@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    /**
     * Find hotels by location (city or country)
     */
    @Query("SELECT DISTINCT h FROM Hotel h WHERE " +
           "(:location IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :location, '%')))")
    List<Hotel> findByLocation(@Param("location") String location);
    
    /**
     * Find hotels with available rooms for given criteria
     */
    @Query("SELECT DISTINCT h FROM Hotel h " +
           "JOIN h.rooms r " +
           "WHERE (:location IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND r.isAvailable = true " +
           "AND r.capacity >= :guests " +
           "AND (:roomType IS NULL OR r.roomType = :roomType) " +
           "AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice) " +
           "AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice) " +
           "AND r.id NOT IN (" +
           "  SELECT res.room.id FROM Reservation res " +
           "  WHERE res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
           ")")
    List<Hotel> findAvailableHotels(
        @Param("location") String location,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate,
        @Param("guests") Integer guests,
        @Param("roomType") String roomType,
        @Param("minPrice") Double minPrice,
        @Param("maxPrice") Double maxPrice
    );
    
    /**
     * Find hotels by city
     */
    List<Hotel> findByCityContainingIgnoreCase(String city);
    
    /**
     * Find hotels by country
     */
    List<Hotel> findByCountryContainingIgnoreCase(String country);
    
    /**
     * Find hotels by name
     */
    List<Hotel> findByNameContainingIgnoreCase(String name);
}
