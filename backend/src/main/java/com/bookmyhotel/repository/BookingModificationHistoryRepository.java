package com.bookmyhotel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.BookingModificationHistory;

/**
 * Repository for booking modification history
 */
@Repository
public interface BookingModificationHistoryRepository extends JpaRepository<BookingModificationHistory, Long> {
    
    /**
     * Find all modification history for a specific reservation
     */
    List<BookingModificationHistory> findByReservationIdOrderByCreatedAtDesc(Long reservationId);
    
    /**
     * Find all modification history for a specific confirmation number
     */
    List<BookingModificationHistory> findByConfirmationNumberOrderByCreatedAtDesc(String confirmationNumber);
    
    /**
     * Find modification history by hotel
     */
    @Query("SELECT h FROM BookingModificationHistory h WHERE h.hotel.id = :hotelId ORDER BY h.createdAt DESC")
    List<BookingModificationHistory> findByHotelIdOrderByCreatedAtDesc(@Param("hotelId") Long hotelId);
    
    /**
     * Find recent modification history for a reservation (for duplicate prevention)
     */
    @Query("SELECT h FROM BookingModificationHistory h WHERE h.reservation.id = :reservationId " +
           "AND h.createdAt > :afterTime ORDER BY h.createdAt DESC")
    List<BookingModificationHistory> findByReservationIdAndCreatedAtAfter(@Param("reservationId") Long reservationId, 
                                                                          @Param("afterTime") java.time.LocalDateTime afterTime);
}