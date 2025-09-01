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
                     "  AND (res.checkInDate < :checkOutDate AND res.checkOutDate > :checkInDate)" +
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
       @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId")
       List<Room> findByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Find rooms by hotel ordered by room number
        */
       @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId ORDER BY r.roomNumber")
       List<Room> findByHotelIdOrderByRoomNumber(@Param("hotelId") Long hotelId);

       /**
        * Find rooms by hotel and room type
        */
       @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.roomType = :roomType")
       List<Room> findByHotelIdAndRoomType(@Param("hotelId") Long hotelId,
                     @Param("roomType") com.bookmyhotel.entity.RoomType roomType);

       /**
        * Find first room by hotel and room type (for pricing lookup)
        */
       @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.roomType = :roomType ORDER BY r.id LIMIT 1")
       Optional<Room> findFirstByHotelIdAndRoomType(@Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType);

       /**
        * Find available rooms by hotel
        */
       @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.isAvailable = true")
       List<Room> findByHotelIdAndIsAvailableTrue(@Param("hotelId") Long hotelId);

       /**
        * Find truly available rooms by hotel (both isAvailable=true and
        * status=AVAILABLE)
        */
       @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.isAvailable = true AND r.status = :status")
       List<Room> findByHotelIdAndIsAvailableTrueAndStatus(@Param("hotelId") Long hotelId,
                     @Param("status") RoomStatus status);

       /**
        * Check if room is available for given dates
        */
       @Query("SELECT COUNT(res) = 0 FROM Reservation res " +
                     "WHERE res.assignedRoom.id = :roomId " +
                     "AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "AND (res.checkInDate < :checkOutDate AND res.checkOutDate > :checkInDate)")
       boolean isRoomAvailable(
                     @Param("roomId") Long roomId,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       /**
        * Check if room is currently booked (has active reservations) - hotel aware
        */
       @Query("SELECT COUNT(res) > 0 FROM Reservation res " +
                     "WHERE res.assignedRoom.id = :roomId " +
                     "AND res.hotel.id = :hotelId " +
                     "AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "AND res.checkInDate <= CURRENT_DATE " +
                     "AND res.checkOutDate > CURRENT_DATE")
       boolean isRoomCurrentlyBooked(@Param("roomId") Long roomId, @Param("hotelId") Long hotelId);

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
       @Query("SELECT COUNT(r) FROM Room r WHERE r.hotel.id = :hotelId")
       long countByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Count available rooms
        */
       long countByIsAvailable(Boolean isAvailable);

       /**
        * Count rooms by status
        */
       long countByStatus(RoomStatus status);

       /**
        * Count rooms by status and hotel ID
        */
       @Query("SELECT COUNT(r) FROM Room r WHERE r.status = :status AND r.hotel.id = :hotelId")
       long countByStatusAndHotelId(@Param("status") RoomStatus status, @Param("hotelId") Long hotelId);

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
                     "  AND (res.checkInDate < :checkOutDate AND res.checkOutDate > :checkInDate)" +
                     ")")
       List<Room> findAvailableRoomsOfType(
                     @Param("roomType") RoomType roomType,
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
                     "  AND (res.checkInDate < :checkOutDate AND res.checkOutDate > :checkInDate)" +
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
                     "  AND (res.checkInDate < :checkOutDate AND res.checkOutDate > :checkInDate)" +
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
                     "  AND (res.check_in_date < :checkOutDate AND res.check_out_date > :checkInDate)" +
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
                     "  AND (res.checkInDate < :checkOutDate AND res.checkOutDate > :checkInDate)" +
                     ")")
       boolean hasAvailableRoomsOfType(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType,
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
                     @Param("roomType") RoomType roomType);

       /**
        * Find first room of a specific type for a hotel (for pricing reference, not
        * assignment)
        */
       @Query("SELECT r FROM Room r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.roomType = :roomType " +
                     "ORDER BY r.id " +
                     "LIMIT 1")
       Optional<Room> findFirstRoomOfTypeForHotel(
                     @Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType);

       /**
        * Find hotel by ID (bypasses tenant filter for cross-tenant booking)
        */
       @Query("SELECT h FROM Hotel h WHERE h.id = :hotelId")
       Optional<Hotel> findHotelById(@Param("hotelId") Long hotelId);

       /**
        * Find all rooms ordered by hotel ID and room number (for SYSTEM_ADMIN)
        */
       @Query("SELECT r FROM Room r ORDER BY r.hotel.id ASC, r.roomNumber ASC")
       List<Room> findAllByOrderByHotelIdAscRoomNumberAsc();
}
