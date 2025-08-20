package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
     * Find reservations by status and tenant
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.room.hotel.tenantId = :tenantId")
    List<Reservation> findByStatusAndTenantId(@Param("status") ReservationStatus status, @Param("tenantId") String tenantId);
    
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
           "AND r.status = com.bookmyhotel.entity.ReservationStatus.CONFIRMED")
    List<Reservation> findUpcomingCheckIns(@Param("date") LocalDate date);
    
    /**
     * Find upcoming check-ins by tenant
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.checkInDate = :date " +
           "AND r.status = com.bookmyhotel.entity.ReservationStatus.CONFIRMED " +
           "AND r.room.hotel.tenantId = :tenantId")
    List<Reservation> findUpcomingCheckInsByTenantId(@Param("date") LocalDate date, @Param("tenantId") String tenantId);
    
    /**
     * Find upcoming check-outs
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.checkOutDate = :date " +
           "AND r.status = com.bookmyhotel.entity.ReservationStatus.CHECKED_IN")
    List<Reservation> findUpcomingCheckOuts(@Param("date") LocalDate date);
    
    /**
     * Find upcoming check-outs by tenant
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.checkOutDate = :date " +
           "AND r.status = com.bookmyhotel.entity.ReservationStatus.CHECKED_IN " +
           "AND r.room.hotel.tenantId = :tenantId")
    List<Reservation> findUpcomingCheckOutsByTenantId(@Param("date") LocalDate date, @Param("tenantId") String tenantId);
    
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
     * Search reservations by guest name, room number, or confirmation number with pagination
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE LOWER(CONCAT(r.guest.firstName, ' ', r.guest.lastName)) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.room.roomNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.confirmationNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY r.checkInDate DESC")
    Page<Reservation> findByGuestNameOrRoomNumberOrConfirmationNumber(@Param("search") String search, Pageable pageable);
    
    /**
     * Search reservations by guest name, room number, or confirmation number with pagination and tenant filtering
     */
    @Query("SELECT r FROM Reservation r " +
           "WHERE (LOWER(CONCAT(r.guest.firstName, ' ', r.guest.lastName)) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.room.roomNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(r.confirmationNumber) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND r.room.hotel.tenantId = :tenantId " +
           "ORDER BY r.checkInDate DESC")
    Page<Reservation> findByGuestNameOrRoomNumberOrConfirmationNumberAndTenantId(@Param("search") String search, @Param("tenantId") String tenantId, Pageable pageable);
    
    /**
     * Find all reservations by tenant with pagination
     */
    @Query("SELECT r FROM Reservation r WHERE r.room.hotel.tenantId = :tenantId ORDER BY r.checkInDate DESC")
    Page<Reservation> findByTenantId(@Param("tenantId") String tenantId, Pageable pageable);
}
