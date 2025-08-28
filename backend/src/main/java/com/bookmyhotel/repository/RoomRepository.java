package com.bookmyhotel.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;

/**
 * Room repository
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

       /**
        * Find available rooms for a hotel within date range
        */
       @Query("SELECT r FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.isAvailable = true " +
                     "AND r.status = 'AVAILABLE' " +
                     "AND r.capacity >= :guests " +
                     "AND (:roomType IS NULL OR r.roomType = :roomType) " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assignedRoom.id FROM Reservation res " +
                     "  WHERE res.assignedRoom IS NOT NULL " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
                     ")")
       List<Room> findAvailableRooms(
                     @Param("hotelId") Long hotelId,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate,
                     @Param("guests") Integer guests,
                     @Param("roomType") com.bookmyhotel.entity.RoomType roomType);

       /**
        * Find rooms by hotel
        */
       List<Room> findByHotelId(Long hotelId);

       /**
        * Find rooms by hotel ordered by room number
        */
       List<Room> findByHotelIdOrderByRoomNumber(Long hotelId);

       /**
        * Find rooms by hotel and room type
        */
       List<Room> findByHotelIdAndRoomType(Long hotelId, com.bookmyhotel.entity.RoomType roomType);

       /**
        * Find first room by hotel and room type (for pricing lookup)
        */
       Optional<Room> findFirstByHotelIdAndRoomType(Long hotelId, RoomType roomType);

       /**
        * Find available rooms by hotel
        */
       List<Room> findByHotelIdAndIsAvailableTrue(Long hotelId);

       /**
        * Check if room is available for given dates
        */
       @Query("SELECT COUNT(res) = 0 FROM Reservation res " +
                     "WHERE res.assignedRoom.id = :roomId " +
                     "AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)")
       boolean isRoomAvailable(
                     @Param("roomId") Long roomId,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       /**
        * Check if room is currently booked (has active reservations) - tenant aware
        */
       @Query("SELECT COUNT(res) > 0 FROM Reservation res " +
                     "WHERE res.assignedRoom.id = :roomId " +
                     "AND res.tenantId = :tenantId " +
                     "AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "AND res.checkInDate <= CURRENT_DATE " +
                     "AND res.checkOutDate > CURRENT_DATE")
       boolean isRoomCurrentlyBooked(@Param("roomId") Long roomId, @Param("tenantId") String tenantId);

       /**
        * Find rooms by hotel
        */
       List<Room> findByHotel(Hotel hotel);

       /**
        * Check if room number exists for a hotel
        */
       boolean existsByHotelAndRoomNumber(Hotel hotel, String roomNumber);

       /**
        * Count rooms by hotel
        */
       long countByHotel(Hotel hotel);

       /**
        * Count rooms by hotel ID
        */
       long countByHotelId(Long hotelId);

       /**
        * Count available rooms
        */
       long countByIsAvailable(Boolean isAvailable);

       /**
        * Count rooms by status
        */
       long countByStatus(RoomStatus status);

       /**
        * Count rooms by status and tenant ID
        */
       long countByStatusAndTenantId(RoomStatus status, String tenantId);

       /**
        * Count total rooms by tenant ID
        */
       long countByTenantId(String tenantId);

       /**
        * Find available rooms of specific type excluding a reservation
        */
       @Query("SELECT r FROM Room r " +
                     "WHERE r.roomType = :roomType " +
                     "AND r.isAvailable = true " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assignedRoom.id FROM Reservation res " +
                     "  WHERE res.assignedRoom IS NOT NULL " +
                     "  AND res.id != :excludeReservationId " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
                     ")")
       List<Room> findAvailableRoomsOfType(
                     @Param("roomType") String roomType,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate,
                     @Param("excludeReservationId") Long excludeReservationId);

       /**
        * Count available rooms by type for a hotel within date range
        */
       @Query("SELECT COUNT(r) FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.roomType = :roomType " +
                     "AND r.isAvailable = true " +
                     "AND r.status = 'AVAILABLE' " +
                     "AND r.capacity >= :guests " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assignedRoom.id FROM Reservation res " +
                     "  WHERE res.assignedRoom IS NOT NULL " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
                     ")")
       long countAvailableRoomsByType(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate,
                     @Param("guests") Integer guests);

       /**
        * Count total rooms by type for a hotel
        */
       @Query("SELECT COUNT(r) FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.roomType = :roomType " +
                     "AND r.isAvailable = true")
       long countTotalRoomsByType(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType);

       /**
        * Get distinct room types for a hotel
        */
       @Query("SELECT DISTINCT r.roomType FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.isAvailable = true " +
                     "AND r.status = 'AVAILABLE'")
       List<RoomType> findDistinctRoomTypesByHotel(@Param("hotelId") Long hotelId);

       /**
        * Find first available room of specific type for assignment
        */
       @Query("SELECT r FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.roomType = :roomType " +
                     "AND r.isAvailable = true " +
                     "AND r.status = 'AVAILABLE' " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assignedRoom.id FROM Reservation res " +
                     "  WHERE res.assignedRoom IS NOT NULL " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
                     ") " +
                     "ORDER BY r.roomNumber")
       Optional<Room> findFirstAvailableRoomOfType(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       /**
        * Find first available room of specific type for cross-tenant bookings
        * (bypasses tenant filter)
        */
       @Query(value = "SELECT * FROM rooms r " +
                     "WHERE r.hotel_id = :hotelId " +
                     "AND r.room_type = :roomType " +
                     "AND r.is_available = true " +
                     "AND r.status = 'AVAILABLE' " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assigned_room_id FROM reservations res " +
                     "  WHERE res.assigned_room_id IS NOT NULL " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.check_out_date <= :checkInDate OR res.check_in_date >= :checkOutDate)" +
                     ") " +
                     "ORDER BY r.room_number " +
                     "LIMIT 1", nativeQuery = true)
       Optional<Room> findFirstAvailableRoomOfTypePublic(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") String roomType,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       /**
        * Check if there are available rooms of a specific type for given dates (room
        * type booking)
        */
       @Query("SELECT COUNT(r) > 0 FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.roomType = :roomType " +
                     "AND r.isAvailable = true " +
                     "AND r.status = 'AVAILABLE' " +
                     "AND r.id NOT IN (" +
                     "  SELECT res.assignedRoom.id FROM Reservation res " +
                     "  WHERE res.assignedRoom.id IS NOT NULL " +
                     "  AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
                     ")")
       boolean hasAvailableRoomsOfType(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") String roomType,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       /**
        * Get price for a specific room type in a hotel
        */
       @Query("SELECT r.pricePerNight FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.roomType = :roomType " +
                     "AND r.isAvailable = true " +
                     "ORDER BY r.id " +
                     "LIMIT 1")
       Optional<BigDecimal> getPriceForRoomType(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") String roomType);

       /**
        * Find hotel by ID (bypasses tenant filter for cross-tenant booking)
        */
       @Query("SELECT h FROM Hotel h WHERE h.id = :hotelId")
       Optional<Hotel> findHotelById(@Param("hotelId") Long hotelId);

       /**
        * Find all rooms ordered by hotel ID and room number (for SYSTEM_ADMIN)
        */
       List<Room> findAllByOrderByHotelIdAscRoomNumberAsc();
}
