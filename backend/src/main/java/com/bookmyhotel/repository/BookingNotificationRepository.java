package com.bookmyhotel.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.BookingNotification;
import com.bookmyhotel.enums.NotificationStatus;
import com.bookmyhotel.enums.NotificationType;

/**
 * Repository interface for BookingNotification entities
 * Provides data access methods for booking notifications
 */
@Repository
public interface BookingNotificationRepository extends JpaRepository<BookingNotification, Long> {

    /**
     * Find all notifications for a specific hotel ordered by creation date (newest
     * first)
     */
    Page<BookingNotification> findByHotelIdOrderByCreatedAtDesc(Long hotelId, Pageable pageable);

    /**
     * Find notifications by hotel ID and status
     */
    List<BookingNotification> findByHotelIdAndStatus(Long hotelId, NotificationStatus status);

    /**
     * Count unread notifications for a hotel
     */
    long countByHotelIdAndStatus(Long hotelId, NotificationStatus status);

    /**
     * Find notifications by hotel ID and type
     */
    Page<BookingNotification> findByHotelIdAndTypeOrderByCreatedAtDesc(Long hotelId, NotificationType type,
            Pageable pageable);

    /**
     * Find notifications by hotel ID, type and status
     */
    Page<BookingNotification> findByHotelIdAndTypeAndStatusOrderByCreatedAtDesc(Long hotelId, NotificationType type,
            NotificationStatus status, Pageable pageable);

    /**
     * Find recent notifications for a hotel (limited number)
     */
    @Query("SELECT n FROM BookingNotification n WHERE n.hotelId = :hotelId ORDER BY n.createdAt DESC")
    List<BookingNotification> findRecentByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

    /**
     * Find all notifications for a tenant
     */
    Page<BookingNotification> findByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);

    /**
     * Count total notifications for a hotel
     */
    long countByHotelId(Long hotelId);

    /**
     * Count notifications by type for a hotel
     */
    long countByHotelIdAndType(Long hotelId, NotificationType type);

    /**
     * Find notifications by reservation ID
     */
    List<BookingNotification> findByReservationIdOrderByCreatedAtDesc(Long reservationId);

    /**
     * Delete old notifications (for cleanup tasks)
     */
    @Query("DELETE FROM BookingNotification n WHERE n.createdAt < :cutoffDate AND n.status = :status")
    void deleteOldNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate,
            @Param("status") NotificationStatus status);
}