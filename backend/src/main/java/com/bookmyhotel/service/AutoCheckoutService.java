package com.bookmyhotel.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;

/**
 * Service for automatic checkout of expired reservations
 */
@Service
@Transactional
public class AutoCheckoutService {

    private static final Logger logger = LoggerFactory.getLogger(AutoCheckoutService.class);

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Automatically check out guests whose checkout date has passed
     * Runs every day at 12:00 PM (noon) to check for expired stays
     * DISABLED: Auto-checkout has been disabled to prevent immediate checkouts
     */
    // @Scheduled(cron = "0 0 12 * * ?") // Daily at 12:00 PM - DISABLED
    public void autoCheckoutExpiredReservations() {
        logger.info("Starting automatic checkout process for expired reservations");

        LocalDate today = LocalDate.now();

        try {
            // Find all CHECKED_IN reservations where checkout date has passed
            List<Reservation> expiredReservations = reservationRepository.findExpiredCheckedInReservations(today);

            logger.info("Found {} expired reservations to auto-checkout", expiredReservations.size());

            int checkedOutCount = 0;

            for (Reservation reservation : expiredReservations) {
                try {
                    // Update reservation status to checked out
                    reservation.setStatus(ReservationStatus.CHECKED_OUT);
                    reservation.setActualCheckOutTime(LocalDateTime.now());

                    // Add note indicating this was an automatic checkout
                    String autoCheckoutNote = "Automatically checked out - checkout date passed";
                    if (reservation.getSpecialRequests() != null) {
                        reservation.setSpecialRequests(reservation.getSpecialRequests() + "\n" + autoCheckoutNote);
                    } else {
                        reservation.setSpecialRequests(autoCheckoutNote);
                    }

                    // Update room status to maintenance (needs cleaning)
                    Room room = reservation.getRoom();
                    if (room != null) {
                        room.setStatus(RoomStatus.MAINTENANCE);
                        roomRepository.save(room);
                        logger.debug("Set room {} to MAINTENANCE status for cleaning", room.getRoomNumber());
                    }

                    reservationRepository.save(reservation);

                    logger.info("Auto-checked out reservation {} for guest {} (checkout date: {})",
                            reservation.getConfirmationNumber(),
                            reservation.getGuestInfo() != null ? reservation.getGuestInfo().getName() : "Unknown",
                            reservation.getCheckOutDate());

                    checkedOutCount++;

                } catch (Exception e) {
                    logger.error("Failed to auto-checkout reservation {} for guest {}: {}",
                            reservation.getConfirmationNumber(),
                            reservation.getGuestInfo() != null ? reservation.getGuestInfo().getName() : "Unknown",
                            e.getMessage(), e);
                }
            }

            logger.info("Auto-checkout process completed successfully. Checked out {} reservations", checkedOutCount);

        } catch (Exception e) {
            logger.error("Error during auto-checkout process: {}", e.getMessage(), e);
        }
    }

    /**
     * Manual trigger for auto-checkout (for testing or emergency use)
     */
    public int manualAutoCheckout() {
        logger.info("Manual auto-checkout triggered");

        LocalDate today = LocalDate.now();
        List<Reservation> expiredReservations = reservationRepository.findExpiredCheckedInReservations(today);

        int checkedOutCount = 0;

        for (Reservation reservation : expiredReservations) {
            try {
                reservation.setStatus(ReservationStatus.CHECKED_OUT);
                reservation.setActualCheckOutTime(LocalDateTime.now());

                String autoCheckoutNote = "Manually triggered automatic checkout - checkout date passed";
                if (reservation.getSpecialRequests() != null) {
                    reservation.setSpecialRequests(reservation.getSpecialRequests() + "\n" + autoCheckoutNote);
                } else {
                    reservation.setSpecialRequests(autoCheckoutNote);
                }

                Room room = reservation.getRoom();
                if (room != null) {
                    room.setStatus(RoomStatus.MAINTENANCE);
                    roomRepository.save(room);
                }

                reservationRepository.save(reservation);
                checkedOutCount++;

            } catch (Exception e) {
                logger.error("Failed to manually auto-checkout reservation {}: {}",
                        reservation.getConfirmationNumber(), e.getMessage(), e);
            }
        }

        logger.info("Manual auto-checkout completed. Checked out {} reservations", checkedOutCount);
        return checkedOutCount;
    }
}
