package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.BookingNotification;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.enums.NotificationStatus;
import com.bookmyhotel.enums.NotificationType;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.BookingNotificationRepository;

/**
 * Service for managing booking change notifications for hotel admin and front
 * desk staff
 * Handles creation, reading, and management of booking cancellation and
 * modification notifications
 */
@Service
@Transactional
public class BookingChangeNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(BookingChangeNotificationService.class);

    @Autowired
    private BookingNotificationRepository notificationRepository;

    /**
     * Create a cancellation notification
     */
    public BookingNotification createCancellationNotification(Reservation reservation, String cancellationReason,
            BigDecimal refundAmount, String updatedBy) {
        try {
            // Validate input parameters
            if (reservation == null) {
                throw new IllegalArgumentException("Reservation cannot be null");
            }
            if (refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Refund amount cannot be negative");
            }
            if (cancellationReason == null || cancellationReason.trim().isEmpty()) {
                cancellationReason = "Booking cancelled";
            }

            BookingNotification notification = new BookingNotification(reservation, NotificationType.CANCELLED);
            notification.setCancellationReason(cancellationReason.trim());
            notification.setRefundAmount(refundAmount);
            notification.setUpdatedBy(updatedBy);

            BookingNotification savedNotification = notificationRepository.save(notification);
            logger.info("Created cancellation notification for booking {} (ID: {}), refund amount: {}",
                    reservation.getConfirmationNumber(), savedNotification.getId(), refundAmount);

            return savedNotification;
        } catch (Exception e) {
            logger.error("Failed to create cancellation notification for booking {}: {}",
                    reservation.getConfirmationNumber(), e.getMessage());
            throw e;
        }
    }

    /**
     * Create a modification notification
     */
    public BookingNotification createModificationNotification(Reservation reservation, String changeDetails,
            BigDecimal additionalCharges, BigDecimal refundAmount, String updatedBy) {
        try {
            // Validate input parameters
            if (reservation == null) {
                throw new IllegalArgumentException("Reservation cannot be null");
            }
            if (additionalCharges != null && additionalCharges.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Additional charges cannot be negative");
            }
            if (refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Refund amount cannot be negative");
            }
            if (changeDetails == null || changeDetails.trim().isEmpty()) {
                changeDetails = "Booking details modified";
            }

            // Skip notification creation if no financial implications (both amounts are
            // zero or null)
            boolean hasAdditionalCharges = additionalCharges != null
                    && additionalCharges.compareTo(BigDecimal.ZERO) > 0;
            boolean hasRefundAmount = refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) > 0;

            if (!hasAdditionalCharges && !hasRefundAmount) {
                logger.info(
                        "Skipping modification notification for booking {} - no financial implications (additional charges: {}, refund: {})",
                        reservation.getConfirmationNumber(), additionalCharges, refundAmount);
                return null; // No notification needed for non-financial modifications
            }

            // Check for recent duplicate notification (within last 5 minutes) for the same
            // booking
            LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(5);
            List<BookingNotification> recentNotifications = notificationRepository
                    .findByReservationIdAndTypeAndCreatedAtAfter(
                            reservation.getId(),
                            NotificationType.MODIFIED,
                            cutoffTime);

            // If there's a recent modification notification, update it instead of creating
            // a new one
            if (!recentNotifications.isEmpty()) {
                BookingNotification existingNotification = recentNotifications.get(0);
                logger.info("Updating existing modification notification for booking {} instead of creating duplicate",
                        reservation.getConfirmationNumber());

                // Update the existing notification with new amounts (final values)
                existingNotification.setChangeDetails(changeDetails.trim());
                existingNotification.setAdditionalCharges(additionalCharges);
                existingNotification.setRefundAmount(refundAmount);
                existingNotification.setUpdatedBy(updatedBy);
                existingNotification.setCreatedAt(LocalDateTime.now()); // Update timestamp

                BookingNotification updatedNotification = notificationRepository.save(existingNotification);
                logger.info(
                        "Updated modification notification for booking {} (ID: {}), final additional charges: {}, final refund: {}",
                        reservation.getConfirmationNumber(), updatedNotification.getId(), additionalCharges,
                        refundAmount);

                return updatedNotification;
            }

            BookingNotification notification = new BookingNotification(reservation, NotificationType.MODIFIED);
            notification.setChangeDetails(changeDetails.trim());
            notification.setAdditionalCharges(additionalCharges);
            notification.setRefundAmount(refundAmount);
            notification.setUpdatedBy(updatedBy);

            BookingNotification savedNotification = notificationRepository.save(notification);
            logger.info("Created modification notification for booking {} (ID: {}), additional charges: {}, refund: {}",
                    reservation.getConfirmationNumber(), savedNotification.getId(), additionalCharges, refundAmount);

            return savedNotification;
        } catch (Exception e) {
            logger.error("Failed to create modification notification for booking {}: {}",
                    reservation.getConfirmationNumber(), e.getMessage());
            throw e;
        }
    }

    /**
     * Get notifications for a specific hotel with pagination
     */
    public Page<BookingNotification> getHotelNotifications(Long hotelId, Pageable pageable) {
        return notificationRepository.findByHotelIdOrderByCreatedAtDesc(hotelId, pageable);
    }

    /**
     * Get notifications by type for a hotel
     */
    public Page<BookingNotification> getHotelNotificationsByType(Long hotelId, NotificationType type,
            Pageable pageable) {
        return notificationRepository.findByHotelIdAndTypeOrderByCreatedAtDesc(hotelId, type, pageable);
    }

    /**
     * Get recent notifications for dashboard (limited number)
     */
    public List<BookingNotification> getRecentNotifications(Long hotelId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return notificationRepository.findRecentByHotelId(hotelId, pageable);
    }

    /**
     * Get unread notification count for a hotel
     */
    public long getUnreadNotificationCount(Long hotelId) {
        return notificationRepository.countByHotelIdAndStatus(hotelId, NotificationStatus.UNREAD);
    }

    /**
     * Get notification statistics for a hotel
     */
    public NotificationStats getNotificationStats(Long hotelId) {
        long totalCount = notificationRepository.countByHotelId(hotelId);
        long unreadCount = notificationRepository.countByHotelIdAndStatus(hotelId, NotificationStatus.UNREAD);
        long cancelledCount = notificationRepository.countByHotelIdAndType(hotelId, NotificationType.CANCELLED);
        long modifiedCount = notificationRepository.countByHotelIdAndType(hotelId, NotificationType.MODIFIED);

        return new NotificationStats(totalCount, unreadCount, cancelledCount, modifiedCount);
    }

    /**
     * Mark a notification as read
     */
    public void markAsRead(Long notificationId) {
        BookingNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (notification.getStatus() == NotificationStatus.UNREAD) {
            notification.setStatus(NotificationStatus.READ);
            notificationRepository.save(notification);
            logger.debug("Marked notification {} as read", notificationId);
        }
    }

    /**
     * Mark all notifications as read for a hotel
     */
    public int markAllAsRead(Long hotelId) {
        List<BookingNotification> unreadNotifications = notificationRepository.findByHotelIdAndStatus(hotelId,
                NotificationStatus.UNREAD);

        if (!unreadNotifications.isEmpty()) {
            unreadNotifications.forEach(notification -> notification.setStatus(NotificationStatus.READ));
            notificationRepository.saveAll(unreadNotifications);
            logger.info("Marked {} notifications as read for hotel {}", unreadNotifications.size(), hotelId);
        }

        return unreadNotifications.size();
    }

    /**
     * Archive a notification
     */
    public void archiveNotification(Long notificationId) {
        BookingNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setStatus(NotificationStatus.ARCHIVED);
        notificationRepository.save(notification);
        logger.debug("Archived notification {}", notificationId);
    }

    /**
     * Get notification by ID
     */
    public BookingNotification getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
    }

    /**
     * Get notifications for a specific reservation
     */
    public List<BookingNotification> getNotificationsByReservation(Long reservationId) {
        return notificationRepository.findByReservationIdOrderByCreatedAtDesc(reservationId);
    }

    /**
     * Get notifications by confirmation number for a specific hotel
     * Returns notifications ordered by creation date (newest first)
     */
    public List<BookingNotification> getNotificationsByConfirmationNumber(String confirmationNumber, Long hotelId) {
        logger.debug("Getting notifications for confirmation number: {} and hotel: {}", confirmationNumber, hotelId);
        List<BookingNotification> notifications = notificationRepository
                .findByConfirmationNumberAndHotelIdOrderByCreatedAtDesc(confirmationNumber, hotelId);
        logger.debug("Found {} notifications for confirmation number: {}", notifications.size(), confirmationNumber);
        return notifications;
    }

    /**
     * Cleanup old archived notifications (for maintenance tasks)
     */
    public void cleanupOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteOldNotifications(cutoffDate, NotificationStatus.ARCHIVED);
        logger.info("Cleaned up archived notifications older than {} days", daysOld);
    }

    /**
     * Helper method to generate change details for modifications
     */
    public String generateChangeDetails(Reservation originalReservation, Reservation modifiedReservation) {
        StringBuilder changes = new StringBuilder();

        // Check date changes
        if (!originalReservation.getCheckInDate().equals(modifiedReservation.getCheckInDate())) {
            changes.append("Check-in changed from ")
                    .append(originalReservation.getCheckInDate())
                    .append(" to ")
                    .append(modifiedReservation.getCheckInDate())
                    .append("; ");
        }

        if (!originalReservation.getCheckOutDate().equals(modifiedReservation.getCheckOutDate())) {
            changes.append("Check-out changed from ")
                    .append(originalReservation.getCheckOutDate())
                    .append(" to ")
                    .append(modifiedReservation.getCheckOutDate())
                    .append("; ");
        }

        // Check guest count changes
        if (!originalReservation.getNumberOfGuests().equals(modifiedReservation.getNumberOfGuests())) {
            changes.append("Guest count changed from ")
                    .append(originalReservation.getNumberOfGuests())
                    .append(" to ")
                    .append(modifiedReservation.getNumberOfGuests())
                    .append("; ");
        }

        // Check special requests changes
        String originalRequests = originalReservation.getSpecialRequests() != null
                ? originalReservation.getSpecialRequests()
                : "";
        String modifiedRequests = modifiedReservation.getSpecialRequests() != null
                ? modifiedReservation.getSpecialRequests()
                : "";
        if (!originalRequests.equals(modifiedRequests)) {
            changes.append("Special requests updated; ");
        }

        return changes.length() > 0 ? changes.toString() : "Booking details modified";
    }

    /**
     * Clean up notifications with zero financial values (both additionalCharges and
     * refundAmount are zero or null)
     * This helps remove confusing "0"/"00" notifications from the display
     */
    public int cleanupZeroValueNotifications() {
        try {
            List<BookingNotification> zeroValueNotifications = notificationRepository.findAll()
                    .stream()
                    .filter(notification -> {
                        boolean hasZeroAdditionalCharges = notification.getAdditionalCharges() == null ||
                                notification.getAdditionalCharges().compareTo(BigDecimal.ZERO) == 0;
                        boolean hasZeroRefundAmount = notification.getRefundAmount() == null ||
                                notification.getRefundAmount().compareTo(BigDecimal.ZERO) == 0;
                        return notification.getType() == NotificationType.MODIFIED &&
                                hasZeroAdditionalCharges && hasZeroRefundAmount;
                    })
                    .toList();

            if (!zeroValueNotifications.isEmpty()) {
                notificationRepository.deleteAll(zeroValueNotifications);
                logger.info("Cleaned up {} modification notifications with zero financial values",
                        zeroValueNotifications.size());
                return zeroValueNotifications.size();
            }

            return 0;
        } catch (Exception e) {
            logger.error("Failed to cleanup zero value notifications: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Inner class for notification statistics
     */
    public static class NotificationStats {
        private final long totalCount;
        private final long unreadCount;
        private final long cancelledCount;
        private final long modifiedCount;

        public NotificationStats(long totalCount, long unreadCount, long cancelledCount, long modifiedCount) {
            this.totalCount = totalCount;
            this.unreadCount = unreadCount;
            this.cancelledCount = cancelledCount;
            this.modifiedCount = modifiedCount;
        }

        public long getTotalCount() {
            return totalCount;
        }

        public long getUnreadCount() {
            return unreadCount;
        }

        public long getCancelledCount() {
            return cancelledCount;
        }

        public long getModifiedCount() {
            return modifiedCount;
        }
    }
}