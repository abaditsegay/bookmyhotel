package com.bookmyhotel.service;

import com.bookmyhotel.dto.ProcessMonitoringEventDto;
import com.bookmyhotel.entity.ProcessMonitoringEvent;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.enums.EventType;
import com.bookmyhotel.repository.ProcessMonitoringEventRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for real-time process monitoring
 */
@Service
@Transactional
public class RealTimeProcessMonitoringService {

    private static final Logger logger = LoggerFactory.getLogger(RealTimeProcessMonitoringService.class);

    @Autowired
    private ProcessMonitoringEventRepository processMonitoringEventRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Log a process monitoring event
     */
    public ProcessMonitoringEventDto logEvent(EventType eventType, Long hotelId, Long reservationId,
            String userEmail, HttpServletRequest request, String details) {
        try {
            ProcessMonitoringEvent event = new ProcessMonitoringEvent();
            event.setEventType(eventType);
            event.setReservationId(reservationId);
            event.setEventDetails(details);
            event.setEventTime(LocalDateTime.now());

            // Tenant/hotel context is handled automatically by interceptors

            // Get reservation details if available
            if (reservationId != null) {
                Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
                if (reservation != null) {
                    event.setConfirmationNumber(reservation.getConfirmationNumber());
                    if (reservation.getGuest() != null) {
                        event.setGuestName(
                                reservation.getGuest().getFirstName() + " " + reservation.getGuest().getLastName());
                        event.setGuestEmail(reservation.getGuest().getEmail());
                    }
                    if (reservation.getAssignedRoom() != null) {
                        event.setRoomNumber(reservation.getAssignedRoom().getRoomNumber());
                    }
                }
            }

            // Get user details if available
            if (userEmail != null) {
                User user = userRepository.findByEmail(userEmail).orElse(null);
                if (user != null) {
                    event.setStaffUserId(user.getId());
                    event.setStaffName(user.getFirstName() + " " + user.getLastName());
                    event.setStaffEmail(user.getEmail());
                }
            }

            // Set request details
            if (request != null) {
                event.setIpAddress(getClientIpAddress(request));
                event.setUserAgent(request.getHeader("User-Agent"));
            }

            // Determine if this is an exception event
            event.setException(eventType.isException());
            if (eventType.isException()) {
                event.setExceptionReason(eventType.name() + ": " + details);
            }

            event = processMonitoringEventRepository.save(event);
            return convertEventToDto(event);

        } catch (Exception e) {
            logger.error("Failed to log process monitoring event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to log process monitoring event", e);
        }
    }

    /**
     * Get live monitoring data for hotel dashboard
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getLiveMonitoringData(Long hotelId) {
        try {
            Map<String, Object> liveData = new HashMap<>();
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime todayStart = now.toLocalDate().atStartOfDay();

            // Get current activity counts using simple counting
            long totalEventsToday = processMonitoringEventRepository.countByHotelIdAndTimestampBetween(hotelId,
                    todayStart, now);

            liveData.put("totalEventsToday", totalEventsToday);
            liveData.put("lastUpdated", now);

            return liveData;

        } catch (Exception e) {
            logger.error("Failed to get live monitoring data for hotel {}: {}", hotelId, e.getMessage(), e);
            return Map.of("error", "Failed to get live monitoring data");
        }
    }

    /**
     * Get current staff activity
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCurrentStaffActivity(Long hotelId) {
        try {
            LocalDateTime last4Hours = LocalDateTime.now().minusHours(4);

            // Simple implementation - get recent events by staff
            List<ProcessMonitoringEvent> recentEvents = processMonitoringEventRepository
                    .findByHotelIdAndTimestampAfterOrderByTimestampDesc(hotelId, last4Hours);

            Map<Long, Map<String, Object>> staffActivityMap = new HashMap<>();

            for (ProcessMonitoringEvent event : recentEvents) {
                if (event.getStaffUserId() != null) {
                    staffActivityMap.computeIfAbsent(event.getStaffUserId(), k -> {
                        Map<String, Object> activity = new HashMap<>();
                        activity.put("staffId", event.getStaffUserId());
                        activity.put("staffName", event.getStaffName());
                        activity.put("eventCount", 0);
                        activity.put("lastActivity", event.getEventTime());
                        return activity;
                    });

                    Map<String, Object> activity = staffActivityMap.get(event.getStaffUserId());
                    activity.put("eventCount", (Integer) activity.get("eventCount") + 1);

                    LocalDateTime lastActivity = (LocalDateTime) activity.get("lastActivity");
                    if (event.getEventTime().isAfter(lastActivity)) {
                        activity.put("lastActivity", event.getEventTime());
                    }
                }
            }

            return new ArrayList<>(staffActivityMap.values());

        } catch (Exception e) {
            logger.error("Failed to get current staff activity for hotel {}: {}", hotelId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Get exception alerts
     */
    @Transactional(readOnly = true)
    public List<ProcessMonitoringEventDto> getExceptionAlerts(Long hotelId) {
        try {
            LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
            List<ProcessMonitoringEvent> exceptions = processMonitoringEventRepository
                    .findByHotelIdAndIsExceptionTrueAndTimestampAfterOrderByTimestampDesc(hotelId, last24Hours);

            return exceptions.stream().map(this::convertEventToDto).collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Failed to get exception alerts for hotel {}: {}", hotelId, e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Detect patterns and anomalies
     */
    @Transactional(readOnly = true)
    public Map<String, Object> detectPatterns(Long hotelId, int hours) {
        try {
            Map<String, Object> patterns = new HashMap<>();
            LocalDateTime cutoff = LocalDateTime.now().minusHours(hours);

            // Simple pattern detection based on exception counts
            long exceptionCount = processMonitoringEventRepository
                    .countByHotelIdAndIsExceptionTrueAndTimestampAfter(hotelId, cutoff);

            patterns.put("exceptionCount", exceptionCount);
            patterns.put("hasPatterns", exceptionCount > 5);
            patterns.put("period", hours + " hours");

            return patterns;

        } catch (Exception e) {
            logger.error("Failed to detect patterns for hotel {}: {}", hotelId, e.getMessage(), e);
            return Map.of("error", "Failed to detect patterns");
        }
    }

    /**
     * Get monitoring events with filtering
     */
    @Transactional(readOnly = true)
    public Page<ProcessMonitoringEventDto> getMonitoringEvents(Long hotelId, String eventType, Boolean exceptionsOnly,
            LocalDateTime startTime, LocalDateTime endTime, Pageable pageable) {
        try {
            Page<ProcessMonitoringEvent> events;

            if (exceptionsOnly != null && exceptionsOnly) {
                events = processMonitoringEventRepository.findByHotelIdAndIsExceptionTrueOrderByTimestampDesc(hotelId,
                        pageable);
            } else if (eventType != null) {
                EventType type = EventType.valueOf(eventType);
                events = processMonitoringEventRepository.findByHotelIdAndEventTypeOrderByTimestampDesc(hotelId, type,
                        pageable);
            } else {
                events = processMonitoringEventRepository.findByHotelIdOrderByTimestampDesc(hotelId, pageable);
            }

            List<ProcessMonitoringEventDto> dtos = events.getContent().stream()
                    .map(this::convertEventToDto)
                    .collect(Collectors.toList());

            return new PageImpl<>(dtos, pageable, events.getTotalElements());

        } catch (Exception e) {
            logger.error("Failed to get monitoring events for hotel {}: {}", hotelId, e.getMessage(), e);
            return Page.empty();
        }
    }

    /**
     * Get staff performance summary
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStaffPerformanceSummary(Long hotelId, Long staffId, int days) {
        try {
            Map<String, Object> performance = new HashMap<>();
            LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

            long totalEvents = processMonitoringEventRepository.countByHotelIdAndStaffIdAndTimestampAfter(hotelId,
                    staffId, cutoff);
            long exceptions = processMonitoringEventRepository
                    .countByHotelIdAndStaffIdAndIsExceptionTrueAndTimestampAfter(hotelId, staffId, cutoff);

            performance.put("totalEvents", totalEvents);
            performance.put("exceptions", exceptions);
            performance.put("exceptionRate", totalEvents > 0 ? (double) exceptions / totalEvents : 0.0);
            performance.put("period", days + " days");

            return performance;

        } catch (Exception e) {
            logger.error("Failed to get staff performance summary for hotel {} staff {}: {}", hotelId, staffId,
                    e.getMessage(), e);
            return Map.of("error", "Failed to get staff performance summary");
        }
    }

    /**
     * Get system health status
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSystemHealthStatus(Long hotelId) {
        try {
            Map<String, Object> health = new HashMap<>();
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime last24Hours = now.minusHours(24);

            long totalEvents = processMonitoringEventRepository.countByHotelIdAndTimestampBetween(hotelId, last24Hours,
                    now);
            long exceptions = processMonitoringEventRepository
                    .countByHotelIdAndIsExceptionTrueAndTimestampBetween(hotelId, last24Hours, now);

            double exceptionRate = totalEvents > 0 ? (double) exceptions / totalEvents : 0.0;
            String healthStatus = exceptionRate > 0.1 ? "CRITICAL" : exceptionRate > 0.05 ? "WARNING" : "HEALTHY";

            health.put("status", healthStatus);
            health.put("totalEvents", totalEvents);
            health.put("exceptions", exceptions);
            health.put("exceptionRate", exceptionRate);
            health.put("lastChecked", now);

            return health;

        } catch (Exception e) {
            logger.error("Failed to get system health status for hotel {}: {}", hotelId, e.getMessage(), e);
            return Map.of("status", "ERROR", "error", "Failed to get system health status");
        }
    }

    /**
     * Convert ProcessMonitoringEvent to DTO
     */
    private ProcessMonitoringEventDto convertEventToDto(ProcessMonitoringEvent event) {
        ProcessMonitoringEventDto dto = new ProcessMonitoringEventDto();
        dto.setId(event.getId());
        dto.setHotelId(event.getHotel() != null ? event.getHotel().getId() : null);
        dto.setEventType(event.getEventType());
        dto.setGuestName(event.getGuestName());
        dto.setGuestEmail(event.getGuestEmail());
        dto.setStaffId(event.getStaffUserId());
        dto.setStaffName(event.getStaffName());
        dto.setReservationId(event.getReservationId());
        dto.setConfirmationNumber(event.getConfirmationNumber());
        dto.setRoomNumber(event.getRoomNumber());
        dto.setTimestamp(event.getEventTime());
        dto.setDetails(event.getEventDetails());
        dto.setException(event.isException());
        dto.setExceptionMessage(event.getExceptionReason());
        dto.setIpAddress(event.getIpAddress());
        dto.setUserAgent(event.getUserAgent());
        return dto;
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}