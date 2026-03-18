package com.bookmyhotel.repository;

import com.bookmyhotel.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for AuditLog entity
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

       /**
        * Find audit logs by hotel ID ordered by timestamp descending
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId ORDER BY al.timestamp DESC")
       Page<AuditLog> findByHotelIdOrderByTimestampDesc(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find audit logs by entity type and entity ID
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId " +
                     "AND al.entityType = :entityType AND al.entityId = :entityId ORDER BY al.timestamp DESC")
       List<AuditLog> findByHotelIdAndEntityTypeAndEntityId(@Param("hotelId") Long hotelId,
                     @Param("entityType") String entityType,
                     @Param("entityId") Long entityId);

       /**
        * Find audit logs by user ID
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId AND al.userId = :userId ORDER BY al.timestamp DESC")
       Page<AuditLog> findByHotelIdAndUserId(@Param("hotelId") Long hotelId, @Param("userId") Long userId,
                     Pageable pageable);

       /**
        * Find audit logs by action type
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId AND al.action = :action ORDER BY al.timestamp DESC")
       Page<AuditLog> findByHotelIdAndAction(@Param("hotelId") Long hotelId, @Param("action") String action,
                     Pageable pageable);

       /**
        * Find sensitive audit logs
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId AND al.isSensitive = true ORDER BY al.timestamp DESC")
       Page<AuditLog> findSensitiveLogsByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find audit logs by compliance category
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId " +
                     "AND al.complianceCategory = :complianceCategory ORDER BY al.timestamp DESC")
       Page<AuditLog> findByHotelIdAndComplianceCategory(@Param("hotelId") Long hotelId,
                     @Param("complianceCategory") String complianceCategory,
                     Pageable pageable);

       /**
        * Find audit logs in a time range
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId " +
                     "AND al.timestamp BETWEEN :startTime AND :endTime ORDER BY al.timestamp DESC")
       Page<AuditLog> findByHotelIdAndTimeRange(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime,
                     Pageable pageable);

       /**
        * Count actions by user in a time period
        */
       @Query("SELECT al.userId, al.userName, COUNT(al) as actionCount FROM AuditLog al " +
                     "WHERE al.hotel.id = :hotelId AND al.timestamp BETWEEN :startTime AND :endTime " +
                     "GROUP BY al.userId, al.userName ORDER BY actionCount DESC")
       List<Object[]> countActionsByUser(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       /**
        * Count actions by type in a time period
        */
       @Query("SELECT al.action, COUNT(al) as actionCount FROM AuditLog al " +
                     "WHERE al.hotel.id = :hotelId AND al.timestamp BETWEEN :startTime AND :endTime " +
                     "GROUP BY al.action ORDER BY actionCount DESC")
       List<Object[]> countActionsByType(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       /**
        * Find recent payment-related audit logs
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId " +
                     "AND (al.entityType = 'PAYMENT' OR al.entityType = 'RESERVATION') " +
                     "AND al.timestamp >= :since ORDER BY al.timestamp DESC")
       List<AuditLog> findRecentPaymentAuditLogs(@Param("hotelId") Long hotelId, @Param("since") LocalDateTime since);

       /**
        * Find audit logs by IP address (for security analysis)
        */
       @Query("SELECT al FROM AuditLog al WHERE al.hotel.id = :hotelId AND al.ipAddress = :ipAddress ORDER BY al.timestamp DESC")
       List<AuditLog> findByHotelIdAndIpAddress(@Param("hotelId") Long hotelId, @Param("ipAddress") String ipAddress);

       /**
        * Count sensitive data access by user
        */
       @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.hotel.id = :hotelId " +
                     "AND al.userId = :userId AND al.isSensitive = true AND al.timestamp >= :since")
       long countSensitiveDataAccessByUser(@Param("hotelId") Long hotelId,
                     @Param("userId") Long userId,
                     @Param("since") LocalDateTime since);
}