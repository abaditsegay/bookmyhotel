package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;

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
           "AND r.capacity >= :guests " +
           "AND (:roomType IS NULL OR r.roomType = :roomType) " +
           "AND r.id NOT IN (" +
           "  SELECT res.room.id FROM Reservation res " +
           "  WHERE res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "  AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)" +
           ")")
    List<Room> findAvailableRooms(
        @Param("hotelId") Long hotelId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate,
        @Param("guests") Integer guests,
        @Param("roomType") String roomType
    );
    
    /**
     * Find rooms by hotel
     */
    List<Room> findByHotelId(Long hotelId);
    
    /**
     * Find rooms by hotel and room type
     */
    List<Room> findByHotelIdAndRoomType(Long hotelId, String roomType);
    
    /**
     * Find available rooms by hotel
     */
    List<Room> findByHotelIdAndIsAvailableTrue(Long hotelId);
    
    /**
     * Check if room is available for given dates
     */
    @Query("SELECT COUNT(res) = 0 FROM Reservation res " +
           "WHERE res.room.id = :roomId " +
           "AND res.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND NOT (res.checkOutDate <= :checkInDate OR res.checkInDate >= :checkOutDate)")
    boolean isRoomAvailable(
        @Param("roomId") Long roomId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );
    
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
     * Count available rooms
     */
    long countByIsAvailable(Boolean isAvailable);
}
