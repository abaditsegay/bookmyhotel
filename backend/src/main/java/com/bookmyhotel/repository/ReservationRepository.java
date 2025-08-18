package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.User;

/**
 * Reservation repository
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    /**
     * Find reservations by guest
     */
    List<Reservation> findByGuestIdOrderByCreatedAtDesc(Long guestId);
    
    /**
     * Find reservations by status
     */
    List<Reservation> findByStatus(String status);
    
    /**
     * Find reservation by payment intent ID
     */
    Optional<Reservation> findByPaymentIntentId(String paymentIntentId);
    
    /**
     * Find overlapping reservations for a room
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.room.id = :roomId " +
           "AND r.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND NOT (r.checkOutDate <= :checkInDate OR r.checkInDate >= :checkOutDate)")
    List<Reservation> findOverlappingReservations(
        @Param("roomId") Long roomId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );
    
    /**
     * Find reservations by hotel
     */
    @Query("SELECT r FROM Reservation r WHERE r.room.hotel.id = :hotelId ORDER BY r.checkInDate DESC")
    List<Reservation> findByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Find upcoming check-ins
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.checkInDate = :date " +
           "AND r.status = 'CONFIRMED'")
    List<Reservation> findUpcomingCheckIns(@Param("date") LocalDate date);
    
    /**
     * Find upcoming check-outs
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.checkOutDate = :date " +
           "AND r.status = 'CHECKED_IN'")
    List<Reservation> findUpcomingCheckOuts(@Param("date") LocalDate date);
    
    /**
     * Generate confirmation number
     */
    @Query(value = "SELECT CONCAT('BK', LPAD(CAST(COALESCE(MAX(id), 0) + 1 AS CHAR), 8, '0')) FROM reservations", 
           nativeQuery = true)
    String generateConfirmationNumber();
    
    /**
     * Find reservation by confirmation number
     */
    Optional<Reservation> findByConfirmationNumber(String confirmationNumber);
    
    /**
     * Find reservations by user ordered by creation date
     */
    List<Reservation> findByGuestOrderByCreatedAtDesc(User guest);
}
