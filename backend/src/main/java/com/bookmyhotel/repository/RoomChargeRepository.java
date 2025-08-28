package com.bookmyhotel.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.RoomCharge;
import com.bookmyhotel.entity.RoomChargeType;

/**
 * Repository for room charges
 */
@Repository
public interface RoomChargeRepository extends JpaRepository<RoomCharge, Long> {

       /**
        * Find all room charges for a hotel with pagination
        */
       Page<RoomCharge> findByHotelIdAndTenantIdOrderByChargeDateDesc(Long hotelId, String tenantId, Pageable pageable);

       /**
        * Find all room charges for a specific reservation
        */
       List<RoomCharge> findByReservationIdAndTenantIdOrderByChargeDateDesc(Long reservationId, String tenantId);

       /**
        * Find all room charges by type for a hotel
        */
       List<RoomCharge> findByHotelIdAndTenantIdAndChargeTypeOrderByChargeDateDesc(Long hotelId, String tenantId,
                     RoomChargeType chargeType);

       /**
        * Find all unpaid room charges for a hotel
        */
       @Query("SELECT rc FROM RoomCharge rc WHERE rc.hotel.id = :hotelId AND rc.tenantId = :tenantId AND rc.isPaid = false ORDER BY rc.chargeDate DESC")
       List<RoomCharge> findUnpaidCharges(@Param("hotelId") Long hotelId, @Param("tenantId") String tenantId);

       /**
        * Find all unpaid room charges for a specific reservation
        */
       @Query("SELECT rc FROM RoomCharge rc WHERE rc.reservation.id = :reservationId AND rc.tenantId = :tenantId AND rc.isPaid = false ORDER BY rc.chargeDate DESC")
       List<RoomCharge> findUnpaidChargesByReservation(@Param("reservationId") Long reservationId,
                     @Param("tenantId") String tenantId);

       /**
        * Get total unpaid charges for a reservation
        */
       @Query("SELECT COALESCE(SUM(rc.amount), 0) FROM RoomCharge rc WHERE rc.reservation.id = :reservationId AND rc.tenantId = :tenantId AND rc.isPaid = false")
       BigDecimal getTotalUnpaidChargesByReservation(@Param("reservationId") Long reservationId,
                     @Param("tenantId") String tenantId);

       /**
        * Get total charges for a reservation (paid and unpaid)
        */
       @Query("SELECT COALESCE(SUM(rc.amount), 0) FROM RoomCharge rc WHERE rc.reservation.id = :reservationId AND rc.tenantId = :tenantId")
       BigDecimal getTotalChargesByReservation(@Param("reservationId") Long reservationId,
                     @Param("tenantId") String tenantId);

       /**
        * Find room charges by date range
        */
       @Query("SELECT rc FROM RoomCharge rc WHERE rc.hotel.id = :hotelId AND rc.tenantId = :tenantId AND rc.chargeDate BETWEEN :startDate AND :endDate ORDER BY rc.chargeDate DESC")
       List<RoomCharge> findByHotelAndDateRange(@Param("hotelId") Long hotelId, @Param("tenantId") String tenantId,
                     @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

       /**
        * Find room charges linked to a shop order
        */
       List<RoomCharge> findByShopOrderIdAndTenantId(Long shopOrderId, String tenantId);

       /**
        * Get revenue statistics for room charges by type
        */
       @Query("SELECT rc.chargeType, COALESCE(SUM(rc.amount), 0) FROM RoomCharge rc WHERE rc.hotel.id = :hotelId AND rc.tenantId = :tenantId AND rc.chargeDate BETWEEN :startDate AND :endDate GROUP BY rc.chargeType")
       List<Object[]> getRevenueByChargeType(@Param("hotelId") Long hotelId, @Param("tenantId") String tenantId,
                     @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

       /**
        * Get room charges count by payment status
        */
       @Query("SELECT rc.isPaid, COUNT(rc) FROM RoomCharge rc WHERE rc.hotel.id = :hotelId AND rc.tenantId = :tenantId GROUP BY rc.isPaid")
       List<Object[]> getChargesCountByPaymentStatus(@Param("hotelId") Long hotelId,
                     @Param("tenantId") String tenantId);

       /**
        * Find room charges with detailed reservation info
        */
       @Query("SELECT rc FROM RoomCharge rc " +
                     "JOIN FETCH rc.reservation r " +
                     "WHERE rc.hotel.id = :hotelId AND rc.tenantId = :tenantId " +
                     "ORDER BY rc.chargeDate DESC")
       Page<RoomCharge> findByHotelWithReservationDetails(@Param("hotelId") Long hotelId,
                     @Param("tenantId") String tenantId, Pageable pageable);

       /**
        * Search room charges by guest name or room number
        */
       @Query("SELECT rc FROM RoomCharge rc " +
                     "JOIN rc.reservation r " +
                     "WHERE rc.hotel.id = :hotelId AND rc.tenantId = :tenantId " +
                     "AND LOWER(r.guestInfo.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
                     "ORDER BY rc.chargeDate DESC")
       Page<RoomCharge> searchRoomCharges(@Param("hotelId") Long hotelId, @Param("tenantId") String tenantId,
                     @Param("searchTerm") String searchTerm, Pageable pageable);
}
