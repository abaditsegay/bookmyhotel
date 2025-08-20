package com.bookmyhotel.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.BookingActionType;
import com.bookmyhotel.entity.BookingHistory;

/**
 * Repository for booking history and audit trail
 */
@Repository
public interface BookingHistoryRepository extends JpaRepository<BookingHistory, Long> {
    
    /**
     * Find booking history by reservation ID
     */
    @Query("SELECT bh FROM BookingHistory bh WHERE bh.reservation.id = :reservationId ORDER BY bh.createdAt DESC")
    List<BookingHistory> findByReservationIdOrderByCreatedAtDesc(@Param("reservationId") Long reservationId);
    
    /**
     * Find booking history by reservation ID with pagination
     */
    @Query("SELECT bh FROM BookingHistory bh WHERE bh.reservation.id = :reservationId ORDER BY bh.createdAt DESC")
    Page<BookingHistory> findByReservationIdOrderByCreatedAtDesc(@Param("reservationId") Long reservationId, Pageable pageable);
    
    /**
     * Find booking history by action type
     */
    @Query("SELECT bh FROM BookingHistory bh WHERE bh.actionType = :actionType ORDER BY bh.createdAt DESC")
    List<BookingHistory> findByActionTypeOrderByCreatedAtDesc(@Param("actionType") BookingActionType actionType);
    
    /**
     * Find booking history by performer (guest email or admin username)
     */
    @Query("SELECT bh FROM BookingHistory bh WHERE bh.changedBy = :changedBy ORDER BY bh.createdAt DESC")
    List<BookingHistory> findByChangedByOrderByCreatedAtDesc(@Param("changedBy") String changedBy);
    
    /**
     * Find booking history within date range
     */
    @Query("SELECT bh FROM BookingHistory bh WHERE bh.createdAt BETWEEN :startDate AND :endDate ORDER BY bh.createdAt DESC")
    List<BookingHistory> findByCreatedAtBetweenOrderByCreatedAtDesc(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find booking history by confirmation number
     */
    @Query("SELECT bh FROM BookingHistory bh WHERE bh.reservation.confirmationNumber = :confirmationNumber ORDER BY bh.createdAt DESC")
    List<BookingHistory> findByConfirmationNumberOrderByCreatedAtDesc(@Param("confirmationNumber") String confirmationNumber);
    
    /**
     * Find recent booking modifications for a specific tenant
     */
    @Query("SELECT bh FROM BookingHistory bh " +
           "WHERE bh.reservation.room.hotel.tenantId = :tenantId " +
           "AND bh.actionType IN ('MODIFIED', 'CANCELLED') " +
           "AND bh.createdAt >= :sinceDate " +
           "ORDER BY bh.createdAt DESC")
    List<BookingHistory> findRecentModificationsByTenant(
        @Param("tenantId") String tenantId, 
        @Param("sinceDate") LocalDateTime sinceDate);
    
    /**
     * Count booking actions by type for analytics
     */
    @Query("SELECT bh.actionType, COUNT(bh) FROM BookingHistory bh " +
           "WHERE bh.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY bh.actionType")
    List<Object[]> countActionsByType(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate);
}
