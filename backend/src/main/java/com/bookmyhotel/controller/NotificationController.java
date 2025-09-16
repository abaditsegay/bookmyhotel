package com.bookmyhotel.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingNotificationResponse;
import com.bookmyhotel.entity.BookingNotification;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.enums.NotificationType;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.BookingChangeNotificationService;
import com.bookmyhotel.service.BookingChangeNotificationService.NotificationStats;

/**
 * REST controller for booking notifications
 * Provides endpoints for hotel admin and front desk staff to view and manage
 * booking notifications
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = { "http://localhost:3000", "https://yourdomain.com" })
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private BookingChangeNotificationService notificationService;
    @Autowired
    private UserRepository userRepository;

    /**
     * Get notifications for the hotel with pagination
     */
    @GetMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<Page<BookingNotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type,
            Authentication auth) {

        logger.info("🔔 NotificationController.getNotifications called - user: {}, authorities: {}",
                auth.getName(), auth.getAuthorities());

        Long currentHotelId = getCurrentUserHotelId(auth);
        logger.info("🏨 Hotel ID for user {}: {}", auth.getName(), currentHotelId);

        if (currentHotelId == null) {
            logger.warn("❌ No hotel ID found for user: {}", auth.getName());
            return ResponseEntity.badRequest().build();
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<BookingNotification> notifications;

        if (type != null && !type.isEmpty()) {
            NotificationType notificationType = NotificationType.valueOf(type.toUpperCase());
            notifications = notificationService.getHotelNotificationsByType(currentHotelId, notificationType, pageable);
        } else {
            notifications = notificationService.getHotelNotifications(currentHotelId, pageable);
        }

        logger.info("📊 Found {} notifications for hotel {}", notifications.getTotalElements(), currentHotelId);

        Page<BookingNotificationResponse> response = notifications.map(this::convertToResponse);
        logger.info("✅ Successfully returning notifications response");
        return ResponseEntity.ok(response);
    }

    /**
     * Get recent notifications for dashboard
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<List<BookingNotificationResponse>> getRecentNotifications(
            @RequestParam(defaultValue = "5") int limit,
            Authentication auth) {

        Long hotelId = getCurrentUserHotelId(auth);
        if (hotelId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<BookingNotification> notifications = notificationService.getRecentNotifications(hotelId, limit);
        List<BookingNotificationResponse> response = notifications.stream()
                .map(this::convertToResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long hotelId = getCurrentUserHotelId(auth);
        if (hotelId == null) {
            return ResponseEntity.badRequest().build();
        }

        long count = notificationService.getUnreadNotificationCount(hotelId);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get notification statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<NotificationStats> getNotificationStats(Authentication auth) {
        Long hotelId = getCurrentUserHotelId(auth);
        if (hotelId == null) {
            return ResponseEntity.badRequest().build();
        }

        NotificationStats stats = notificationService.getNotificationStats(hotelId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Mark a notification as read
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id, Authentication auth) {
        try {
            // Verify the notification belongs to the user's hotel
            BookingNotification notification = notificationService.getNotificationById(id);
            Long userHotelId = getCurrentUserHotelId(auth);

            if (!notification.getHotelId().equals(userHotelId)) {
                return ResponseEntity.status(403).body(buildErrorResponse("Access denied"));
            }

            notificationService.markAsRead(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to mark notification as read");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Mark all notifications as read for the hotel
     */
    @PutMapping("/mark-all-read")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<Map<String, Object>> markAllAsRead(Authentication auth) {
        Long hotelId = getCurrentUserHotelId(auth);
        if (hotelId == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Hotel ID not found");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        int markedCount = notificationService.markAllAsRead(hotelId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        response.put("markedCount", markedCount);
        return ResponseEntity.ok(response);
    }

    /**
     * Archive a notification
     */
    @PutMapping("/{id}/archive")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<Map<String, String>> archiveNotification(@PathVariable Long id, Authentication auth) {
        try {
            // Verify the notification belongs to the user's hotel
            BookingNotification notification = notificationService.getNotificationById(id);
            Long userHotelId = getCurrentUserHotelId(auth);

            if (!notification.getHotelId().equals(userHotelId)) {
                return ResponseEntity.status(403).body(buildErrorResponse("Access denied"));
            }

            notificationService.archiveNotification(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification archived");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to archive notification");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Get a specific notification by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK')")
    public ResponseEntity<BookingNotificationResponse> getNotification(@PathVariable Long id, Authentication auth) {
        try {
            BookingNotification notification = notificationService.getNotificationById(id);
            Long userHotelId = getCurrentUserHotelId(auth);

            if (!notification.getHotelId().equals(userHotelId)) {
                return ResponseEntity.notFound().build();
            }

            BookingNotificationResponse response = convertToResponse(notification);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Helper method to get current user's hotel ID
     */
    private Long getCurrentUserHotelId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return null;
        }

        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null || user.getHotel() == null) {
            return null;
        }

        return user.getHotel().getId();
    }

    /**
     * Convert BookingNotification entity to response DTO
     */
    private BookingNotificationResponse convertToResponse(BookingNotification notification) {
        BookingNotificationResponse response = new BookingNotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setStatus(notification.getStatus());
        response.setGuestName(notification.getGuestName());
        response.setGuestEmail(notification.getGuestEmail());
        response.setConfirmationNumber(notification.getConfirmationNumber());
        response.setRoomNumber(notification.getRoomNumber());
        response.setRoomType(notification.getRoomType());
        response.setCheckInDate(notification.getCheckInDate());
        response.setCheckOutDate(notification.getCheckOutDate());
        response.setChangeDetails(notification.getChangeDetails());
        response.setRefundAmount(notification.getRefundAmount());
        response.setAdditionalCharges(notification.getAdditionalCharges());
        response.setCancellationReason(notification.getCancellationReason());
        response.setCreatedAt(notification.getCreatedAt());

        // Add reservation ID if available
        if (notification.getReservation() != null) {
            response.setReservationId(notification.getReservation().getId());
        }

        return response;
    }

    /**
     * Helper method to build error response
     */
    private Map<String, String> buildErrorResponse(String message) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", message);
        return errorResponse;
    }
}