package com.bookmyhotel.repository;

import com.bookmyhotel.entity.ProcessMonitoringEvent;
import com.bookmyhotel.enums.EventType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for ProcessMonitoringEvent entity
 */
@Repository
public interface ProcessMonitoringEventRepository extends JpaRepository<ProcessMonitoringEvent, Long> {

       /**
        * Find events by hotel ID ordered by event time descending
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findByHotelIdOrderByEventTimeDesc(@Param("hotelId") Long hotelId,
                     Pageable pageable);

       /**
        * Find recent events by hotel ID (last 24 hours)
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventTime >= :since ORDER BY pme.eventTime DESC")
       List<ProcessMonitoringEvent> findRecentEventsByHotelId(@Param("hotelId") Long hotelId,
                     @Param("since") LocalDateTime since);

       /**
        * Find events by event type and hotel ID
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventType = :eventType ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findByHotelIdAndEventType(@Param("hotelId") Long hotelId,
                     @Param("eventType") EventType eventType,
                     Pageable pageable);

       /**
        * Find exception events by hotel ID
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.isException = true ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findExceptionEventsByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find events by staff user ID
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.staffUserId = :staffUserId ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findByHotelIdAndStaffUserId(@Param("hotelId") Long hotelId,
                     @Param("staffUserId") Long staffUserId,
                     Pageable pageable);

       /**
        * Find events by reservation ID
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.reservationId = :reservationId ORDER BY pme.eventTime DESC")
       List<ProcessMonitoringEvent> findByHotelIdAndReservationId(@Param("hotelId") Long hotelId,
                     @Param("reservationId") Long reservationId);

       /**
        * Count events by event type in a time period
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventType = :eventType AND pme.eventTime BETWEEN :startTime AND :endTime")
       long countByHotelIdAndEventTypeAndTimeRange(@Param("hotelId") Long hotelId,
                     @Param("eventType") EventType eventType,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       /**
        * Find ongoing check-ins (checked in today but not checked out)
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventType = 'CHECK_IN' AND DATE(pme.eventTime) = CURRENT_DATE " +
                     "AND NOT EXISTS (SELECT pme2 FROM ProcessMonitoringEvent pme2 WHERE pme2.reservationId = pme.reservationId "
                     +
                     "AND pme2.eventType = 'CHECK_OUT' AND pme2.eventTime > pme.eventTime) " +
                     "ORDER BY pme.eventTime DESC")
       List<ProcessMonitoringEvent> findOngoingCheckIns(@Param("hotelId") Long hotelId);

       /**
        * Find staff activity in a time period
        */
       @Query("SELECT pme.staffUserId, pme.staffName, COUNT(pme) as activityCount FROM ProcessMonitoringEvent pme " +
                     "WHERE pme.hotel.id = :hotelId AND pme.eventTime BETWEEN :startTime AND :endTime " +
                     "AND pme.staffUserId IS NOT NULL GROUP BY pme.staffUserId, pme.staffName " +
                     "ORDER BY activityCount DESC")
       List<Object[]> findStaffActivitySummary(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       /**
        * Find patterns of no-shows for a guest
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.guestEmail = :guestEmail AND pme.eventType = 'NO_SHOW' " +
                     "AND pme.eventTime >= :since")
       long countNoShowsForGuest(@Param("hotelId") Long hotelId,
                     @Param("guestEmail") String guestEmail,
                     @Param("since") LocalDateTime since);

       /**
        * Find patterns of cancellations for a guest
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.guestEmail = :guestEmail AND pme.eventType = 'CANCELLATION' " +
                     "AND pme.eventTime >= :since")
       long countCancellationsForGuest(@Param("hotelId") Long hotelId,
                     @Param("guestEmail") String guestEmail,
                     @Param("since") LocalDateTime since);

       // Additional methods needed by RealTimeProcessMonitoringService using eventTime

       /**
        * Count events by hotel and time range
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventTime BETWEEN :startTime AND :endTime")
       long countByHotelIdAndTimestampBetween(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       /**
        * Find events by hotel and eventTime after
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventTime > :timestamp ORDER BY pme.eventTime DESC")
       List<ProcessMonitoringEvent> findByHotelIdAndTimestampAfterOrderByTimestampDesc(@Param("hotelId") Long hotelId,
                     @Param("timestamp") LocalDateTime timestamp);

       /**
        * Find exceptions by hotel, isException true and eventTime after
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.isException = true AND pme.eventTime > :timestamp ORDER BY pme.eventTime DESC")
       List<ProcessMonitoringEvent> findByHotelIdAndIsExceptionTrueAndTimestampAfterOrderByTimestampDesc(
                     @Param("hotelId") Long hotelId,
                     @Param("timestamp") LocalDateTime timestamp);

       /**
        * Count exceptions by hotel and eventTime after
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.isException = true AND pme.eventTime > :timestamp")
       long countByHotelIdAndIsExceptionTrueAndTimestampAfter(@Param("hotelId") Long hotelId,
                     @Param("timestamp") LocalDateTime timestamp);

       /**
        * Find exceptions by hotel with pagination
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.isException = true ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findByHotelIdAndIsExceptionTrueOrderByTimestampDesc(@Param("hotelId") Long hotelId,
                     Pageable pageable);

       /**
        * Find events by hotel and event type with pagination
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.eventType = :eventType ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findByHotelIdAndEventTypeOrderByTimestampDesc(@Param("hotelId") Long hotelId,
                     @Param("eventType") EventType eventType,
                     Pageable pageable);

       /**
        * Find events by hotel with pagination
        */
       @Query("SELECT pme FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId ORDER BY pme.eventTime DESC")
       Page<ProcessMonitoringEvent> findByHotelIdOrderByTimestampDesc(@Param("hotelId") Long hotelId,
                     Pageable pageable);

       /**
        * Count events by hotel, staff and eventTime after
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.staffUserId = :staffId AND pme.eventTime > :timestamp")
       long countByHotelIdAndStaffIdAndTimestampAfter(@Param("hotelId") Long hotelId,
                     @Param("staffId") Long staffId,
                     @Param("timestamp") LocalDateTime timestamp);

       /**
        * Count exceptions by hotel, staff and eventTime after
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.staffUserId = :staffId AND pme.isException = true AND pme.eventTime > :timestamp")
       long countByHotelIdAndStaffIdAndIsExceptionTrueAndTimestampAfter(@Param("hotelId") Long hotelId,
                     @Param("staffId") Long staffId,
                     @Param("timestamp") LocalDateTime timestamp);

       /**
        * Count exceptions by hotel and eventTime between
        */
       @Query("SELECT COUNT(pme) FROM ProcessMonitoringEvent pme WHERE pme.hotel.id = :hotelId " +
                     "AND pme.isException = true AND pme.eventTime BETWEEN :startTime AND :endTime")
       long countByHotelIdAndIsExceptionTrueAndTimestampBetween(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);
}