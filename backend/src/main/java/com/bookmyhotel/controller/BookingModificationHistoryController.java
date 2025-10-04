package com.bookmyhotel.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.entity.BookingModificationHistory;
import com.bookmyhotel.service.BookingModificationHistoryService;

/**
 * REST Controller for managing booking modification history
 */
@RestController
@RequestMapping("/api/booking-history")
public class BookingModificationHistoryController {

    private static final Logger logger = LoggerFactory.getLogger(BookingModificationHistoryController.class);

    @Autowired
    private BookingModificationHistoryService historyService;

    /**
     * Get modification history for a specific reservation ID
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<BookingModificationHistory>> getHistoryByReservationId(
            @PathVariable Long reservationId) {
        try {
            logger.debug("Fetching modification history for reservation ID: {}", reservationId);
            List<BookingModificationHistory> history = historyService.getHistoryByReservationId(reservationId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Error fetching modification history for reservation {}: {}", reservationId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get modification history for a specific confirmation number
     */
    @GetMapping("/confirmation/{confirmationNumber}")
    public ResponseEntity<List<BookingModificationHistory>> getHistoryByConfirmationNumber(
            @PathVariable String confirmationNumber) {
        try {
            logger.info("🔍 API Request: Fetching modification history for confirmation number: {}", confirmationNumber);
            List<BookingModificationHistory> history = historyService.getHistoryByConfirmationNumber(confirmationNumber);
            logger.info("✅ API Response: Found {} modification records for confirmation: {}", history.size(), confirmationNumber);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("❌ API Error: Error fetching modification history for confirmation {}: {}", confirmationNumber, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}