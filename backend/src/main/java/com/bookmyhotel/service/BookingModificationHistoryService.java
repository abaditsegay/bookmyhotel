package com.bookmyhotel.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.BookingModificationHistory;
import com.bookmyhotel.repository.BookingModificationHistoryRepository;

/**
 * Service for managing booking modification history
 */
@Service
@Transactional(readOnly = true)
public class BookingModificationHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(BookingModificationHistoryService.class);

    @Autowired
    private BookingModificationHistoryRepository historyRepository;

    /**
     * Get modification history for a specific reservation ID
     */
    public List<BookingModificationHistory> getHistoryByReservationId(Long reservationId) {
        logger.debug("Fetching modification history for reservation ID: {}", reservationId);
        return historyRepository.findByReservationIdOrderByCreatedAtDesc(reservationId);
    }

    /**
     * Get modification history for a specific confirmation number
     */
    public List<BookingModificationHistory> getHistoryByConfirmationNumber(String confirmationNumber) {
        logger.debug("Fetching modification history for confirmation number: {}", confirmationNumber);
        return historyRepository.findByConfirmationNumberOrderByCreatedAtDesc(confirmationNumber);
    }

    /**
     * Save a new modification history entry
     */
    @Transactional
    public BookingModificationHistory saveHistory(BookingModificationHistory history) {
        logger.debug("Saving modification history for reservation ID: {}", history.getReservation().getId());
        return historyRepository.save(history);
    }
}