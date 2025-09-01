package com.bookmyhotel.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.BookingActionType;
import com.bookmyhotel.entity.BookingHistory;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.repository.BookingHistoryRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Service for managing booking history and audit trail
 */
@Service
@Transactional
public class BookingHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(BookingHistoryService.class);

    @Autowired
    private BookingHistoryRepository bookingHistoryRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Record a booking action in the audit trail
     */
    public void recordBookingAction(Reservation reservation, BookingActionType actionType, String changedBy,
            String changeReason, Map<String, Object> oldValues,
            Map<String, Object> newValues) {
        try {
            BookingHistory history = new BookingHistory(reservation, actionType, changedBy);
            history.setChangeReason(changeReason);

            // Convert values to JSON strings
            if (oldValues != null && !oldValues.isEmpty()) {
                history.setOldValues(objectMapper.writeValueAsString(oldValues));
            }

            if (newValues != null && !newValues.isEmpty()) {
                history.setNewValues(objectMapper.writeValueAsString(newValues));
            }

            bookingHistoryRepository.save(history);
            logger.info("Recorded booking action: {} for reservation: {} by: {}",
                    actionType, reservation.getConfirmationNumber(), changedBy);

        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize booking history values", e);
        } catch (Exception e) {
            logger.error("Failed to record booking action", e);
        }
    }

    /**
     * Record booking modification
     */
    public void recordModification(Reservation reservation, String changedBy, String changeReason,
            Map<String, Object> changes) {
        Map<String, Object> oldValues = new HashMap<>();
        Map<String, Object> newValues = new HashMap<>();

        // Extract old and new values from changes map
        for (Map.Entry<String, Object> entry : changes.entrySet()) {
            if (entry.getValue() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> changeDetails = (Map<String, Object>) entry.getValue();
                oldValues.put(entry.getKey(), changeDetails.get("old"));
                newValues.put(entry.getKey(), changeDetails.get("new"));
            }
        }

        recordBookingAction(reservation, BookingActionType.MODIFIED, changedBy, changeReason,
                oldValues, newValues);
    }

    /**
     * Record booking cancellation
     */
    public void recordCancellation(Reservation reservation, String changedBy, String changeReason) {
        Map<String, Object> oldValues = Map.of(
                "status", reservation.getStatus().toString(),
                "totalAmount", reservation.getTotalAmount());

        Map<String, Object> newValues = Map.of(
                "status", "CANCELLED");

        recordBookingAction(reservation, BookingActionType.CANCELLED, changedBy, changeReason,
                oldValues, newValues);
    }

    /**
     * Record booking confirmation
     */
    public void recordConfirmation(Reservation reservation, String changedBy, String changeReason) {
        Map<String, Object> newValues = Map.of(
                "status", "CONFIRMED",
                "confirmedAt", LocalDateTime.now());

        recordBookingAction(reservation, BookingActionType.CONFIRMED, changedBy,
                changeReason, null, newValues);
    }

    /**
     * Record check-in
     */
    public void recordCheckIn(Reservation reservation, String changedBy) {
        Map<String, Object> newValues = Map.of(
                "status", "CHECKED_IN",
                "checkedInAt", LocalDateTime.now());

        recordBookingAction(reservation, BookingActionType.CHECKED_IN, changedBy,
                "Guest checked in", null, newValues);
    }

    /**
     * Record check-out
     */
    public void recordCheckOut(Reservation reservation, String changedBy) {
        Map<String, Object> newValues = Map.of(
                "status", "CHECKED_OUT",
                "checkedOutAt", LocalDateTime.now());

        recordBookingAction(reservation, BookingActionType.CHECKED_OUT, changedBy,
                "Guest checked out", null, newValues);
    }

    /**
     * Get booking history for a reservation
     */
    @Transactional(readOnly = true)
    public List<BookingHistory> getBookingHistory(Long reservationId) {
        return bookingHistoryRepository.findByReservationIdOrderByCreatedAtDesc(reservationId);
    }

    /**
     * Get booking history by confirmation number
     */
    @Transactional(readOnly = true)
    public List<BookingHistory> getBookingHistoryByConfirmationNumber(String confirmationNumber) {
        return bookingHistoryRepository.findByConfirmationNumberOrderByCreatedAtDesc(confirmationNumber);
    }

    /**
     * Get recent booking modifications for a hotel
     */
    @Transactional(readOnly = true)
    public List<BookingHistory> getRecentModifications(String hotelId, int days) {
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(days);
        return bookingHistoryRepository.findRecentModificationsByHotel(hotelId, sinceDate);
    }

    /**
     * Get booking action statistics
     */
    @Transactional(readOnly = true)
    public Map<BookingActionType, Long> getActionStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> results = bookingHistoryRepository.countActionsByType(startDate, endDate);
        Map<BookingActionType, Long> statistics = new HashMap<>();

        for (Object[] result : results) {
            BookingActionType actionType = (BookingActionType) result[0];
            Long count = (Long) result[1];
            statistics.put(actionType, count);
        }

        return statistics;
    }
}
