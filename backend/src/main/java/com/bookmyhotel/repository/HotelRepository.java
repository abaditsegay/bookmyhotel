package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
                     "h.isActive = true " +
                     "AND (:location IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                     "LOWER(h.country) LIKE LOWER(CONCAT('%', :location, '%')))")
       List<Hotel> findByLocation(@Param("location") String location);

       /**
        * Find hotels with available rooms for given criteria
        */
       @Query("SELECT DISTINCT h FROM Hotel h " +
                     "JOIN h.rooms r " +
                     "WHERE h.isActive = true " +
                     "AND (:location IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
                     "LOWER(h.country) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                     "AND r.isAvailable = true " +
                     "AND r.capacity >= :guests " +
                     "AND (:roomType IS NULL OR r.roomType = :roomType) " +
                     "AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice) " +
                     "AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice) " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assignedRoom.id FROM Reservation res " +
                     "  WHERE res.assignedRoom IS NOT NULL " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
                     ")")
       List<Hotel> findAvailableHotels(
                     @Param("location") String location,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate,
                     @Param("guests") Integer guests,
                     @Param("roomType") com.bookmyhotel.entity.RoomType roomType,
                     @Param("minPrice") Double minPrice,
                     @Param("maxPrice") Double maxPrice);

       /**
        * Find hotels by city
        */
       List<Hotel> findByCityContainingIgnoreCaseAndIsActiveTrue(String city);

       /**
        * Find hotels by country
        */
       List<Hotel> findByCountryContainingIgnoreCaseAndIsActiveTrue(String country);

       /**
        * Find hotels by name
        */
       List<Hotel> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

       /**
        * Find active hotels by city (legacy method)
        */
       List<Hotel> findByCityContainingIgnoreCase(String city);

       /**
        * Find active hotels by country (legacy method)
        */
       List<Hotel> findByCountryContainingIgnoreCase(String country);

       /**
        * Find active hotels by name (legacy method)
        */
       List<Hotel> findByNameContainingIgnoreCase(String name);

       /**
        * Find active hotel by ID
        */
       Optional<Hotel> findByIdAndIsActiveTrue(Long id);

       /**
        * Count active hotels
        */
       long countByIsActiveTrue();

       /**
        * Count inactive hotels
        */
       long countByIsActiveFalse();

       /**
        * Search hotels by name, description, address, city, or country
        */
       @Query("SELECT h FROM Hotel h WHERE " +
                     "h.isActive = true " +
                     "AND (LOWER(h.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(h.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(h.address) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(h.city) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(h.country) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
       org.springframework.data.domain.Page<Hotel> searchHotels(@Param("searchTerm") String searchTerm,
                     org.springframework.data.domain.Pageable pageable);

       /**
        * Find hotels by tenant ID
        */
       List<Hotel> findByTenantId(String tenantId);

       /**
        * Find active hotels by tenant ID
        */
       List<Hotel> findByTenantIdAndIsActiveTrue(String tenantId);

       /**
        * Count hotels by tenant ID
        */
       long countByTenantId(String tenantId);

       /**
        * Find random active hotels for advertisement display
        */
       @Query(value = "SELECT * FROM hotels WHERE is_active = true ORDER BY RAND() LIMIT 5", nativeQuery = true)
       List<Hotel> findRandomActiveHotels();
}
