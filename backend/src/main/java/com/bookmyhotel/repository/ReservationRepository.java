package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
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
       List<Reservation> findByStatus(ReservationStatus status);

       /**
        * Find reservations by status and hotel
        */
       @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.hotel.id = :hotelId")
       List<Reservation> findByStatusAndHotelId(@Param("status") ReservationStatus status,
                     @Param("hotelId") Long hotelId);

       /**
        * Find overlapping reservations for a room (updated for assigned room)
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE r.assignedRoom.id = :roomId " +
                     "AND r.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "AND NOT (r.checkOutDate <= :checkInDate OR r.checkInDate >= :checkOutDate)")
       List<Reservation> findOverlappingReservations(
                     @Param("roomId") Long roomId,
                     @Param("checkInDate") LocalDate checkInDate,
                     @Param("checkOutDate") LocalDate checkOutDate);

       /**
        * Find reservations by hotel (updated for new structure)
        */
       @Query("SELECT r FROM Reservation r JOIN FETCH r.hotel WHERE r.hotel.id = :hotelId ORDER BY r.checkInDate DESC")
       List<Reservation> findByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Find upcoming check-ins by hotel
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE r.checkInDate = :date " +
                     "AND r.status = com.bookmyhotel.entity.ReservationStatus.CONFIRMED " +
                     "AND r.hotel.id = :hotelId")
       List<Reservation> findUpcomingCheckInsByHotelId(@Param("date") LocalDate date,
                     @Param("hotelId") Long hotelId);

       /**
        * Find upcoming check-outs by hotel
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE r.checkOutDate = :date " +
                     "AND r.status = com.bookmyhotel.entity.ReservationStatus.CHECKED_IN " +
                     "AND r.hotel.id = :hotelId")
       List<Reservation> findUpcomingCheckOutsByHotelId(@Param("date") LocalDate date,
                     @Param("hotelId") Long hotelId);

       /**
        * Find reservation by payment intent ID
        */
       Optional<Reservation> findByPaymentIntentId(String paymentIntentId);

       /**
        * Find upcoming check-ins
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE r.checkInDate = :date " +
                     "AND r.status = com.bookmyhotel.entity.ReservationStatus.CONFIRMED")
       List<Reservation> findUpcomingCheckIns(@Param("date") LocalDate date);

       /**
        * Find upcoming check-outs
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE r.checkOutDate = :date " +
                     "AND r.status = com.bookmyhotel.entity.ReservationStatus.CHECKED_IN")
       List<Reservation> findUpcomingCheckOuts(@Param("date") LocalDate date);

       /**
        * Generate confirmation number
        */
       @Query(value = "SELECT CONCAT('BK', LPAD(CAST(COALESCE(MAX(id), 0) + 1 AS CHAR), 8, '0')) FROM reservations", nativeQuery = true)
       String generateConfirmationNumber();

       /**
        * Find reservation by confirmation number
        */
       Optional<Reservation> findByConfirmationNumber(String confirmationNumber);

       /**
        * Find reservation by confirmation number (public search across all tenants)
        */
       @Query(value = "SELECT * FROM reservations WHERE confirmation_number = ?1", nativeQuery = true)
       Optional<Reservation> findByConfirmationNumberPublic(String confirmationNumber);

       /**
        * Find reservations by guest user ID (public search across all tenants)
        */
       @Query(value = "SELECT * FROM reservations WHERE guest_id = ?1 ORDER BY created_at DESC", nativeQuery = true)
       List<Reservation> findByGuestPublic(Long guestId);

       /**
        * Find reservations by guest and order by creation date descending
        */
       List<Reservation> findByGuestOrderByCreatedAtDesc(User guest);

       /**
        * Find conflicting reservations excluding a specific reservation (for
        * modifications) - updated for assigned rooms
        */
       @Query("SELECT r FROM Reservation r WHERE r.assignedRoom.id = :roomId " +
                     "AND r.id != :excludeReservationId " +
                     "AND r.status IN :statuses " +
                     "AND ((r.checkInDate <= :checkOut AND r.checkOutDate > :checkIn))")
       List<Reservation> findConflictingReservationsExcluding(
                     @Param("roomId") Long roomId,
                     @Param("checkIn") LocalDate checkIn,
                     @Param("checkOut") LocalDate checkOut,
                     @Param("excludeReservationId") Long excludeReservationId,
                     @Param("statuses") Set<ReservationStatus> statuses);

       /**
        * Search reservations by guest name, room number, or confirmation number with
        * pagination (updated for new structure)
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE LOWER(r.guestInfo.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                     "OR LOWER(COALESCE(r.assignedRoom.roomNumber, 'TBA')) LIKE LOWER(CONCAT('%', :search, '%')) " +
                     "OR LOWER(r.confirmationNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
                     "ORDER BY r.checkInDate DESC")
       Page<Reservation> findByGuestNameOrRoomNumberOrConfirmationNumber(@Param("search") String search,
                     Pageable pageable);

       /**
        * Search reservations by guest name, room number, or confirmation number with
        * pagination and tenant filtering (updated for new structure)
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE (LOWER(r.guestInfo.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                     "OR LOWER(COALESCE(r.assignedRoom.roomNumber, 'TBA')) LIKE LOWER(CONCAT('%', :search, '%')) " +
                     "OR LOWER(r.confirmationNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                     "AND r.hotel.id = :hotelId " +
                     "ORDER BY r.checkInDate DESC")
       Page<Reservation> findByGuestNameOrRoomNumberOrConfirmationNumberAndHotelId(@Param("search") String search,
                     @Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find all reservations by hotel with pagination
        */
       @Query("SELECT r FROM Reservation r WHERE r.hotel.id = :hotelId ORDER BY r.checkInDate DESC")
       Page<Reservation> findByHotelIdWithPagination(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Count active reservations in a date range for occupancy calculation (updated
        * for new structure)
        */
       @Query("SELECT COUNT(r) FROM Reservation r " +
                     "WHERE r.hotel.id = :hotelId " +
                     "AND r.status NOT IN ('CANCELLED', 'NO_SHOW') " +
                     "AND NOT (r.checkOutDate <= :startDate OR r.checkInDate >= :endDate)")
       long countActiveReservationsInDateRange(@Param("hotelId") Long hotelId,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate);

       /**
        * Find active reservations by guest email (for uniqueness validation)
        */
       @Query("SELECT r FROM Reservation r " +
                     "WHERE r.guestInfo.email = :email " +
                     "AND r.status NOT IN ('CANCELLED', 'NO_SHOW', 'CHECKED_OUT')")
       List<Reservation> findActiveReservationsByGuestEmail(@Param("email") String email);
}
