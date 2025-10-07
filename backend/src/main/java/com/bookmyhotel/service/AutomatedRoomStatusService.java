package com.bookmyhotel.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;

/**
 * Automated service for maintaining room status consistency
 * Runs scheduled tasks to sync room statuses with actual occupancy
 */
@Service
@Transactional
public class AutomatedRoomStatusService {

    private static final Logger logger = LoggerFactory.getLogger(AutomatedRoomStatusService.class);

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Scheduled task that runs every 5 minutes to ensure room status consistency
     * This prevents the need for manual "Fix Status" operations
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 ms
    @Async
    public void autoFixRoomStatusConsistency() {
        logger.info("🔧 Starting automated room status consistency check...");

        try {
            List<Hotel> allHotels = hotelRepository.findAll();
            int totalFixedRooms = 0;

            for (Hotel hotel : allHotels) {
                int hotelFixedRooms = fixRoomStatusForHotel(hotel.getId());
                totalFixedRooms += hotelFixedRooms;

                if (hotelFixedRooms > 0) {
                    logger.info("🏨 Fixed {} room status inconsistencies for hotel: {}",
                            hotelFixedRooms, hotel.getName());
                }
            }

            if (totalFixedRooms > 0) {
                logger.warn("🔧 Automated fix completed: {} room status inconsistencies resolved across all hotels",
                        totalFixedRooms);
            } else {
                logger.debug("✅ All room statuses are consistent across all hotels");
            }

        } catch (Exception e) {
            logger.error("❌ Failed to run automated room status consistency check", e);
        }
    }

    /**
     * Scheduled task that runs every hour to handle checkout-related status updates
     * Automatically sets rooms to MAINTENANCE after checkout for cleaning
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3,600,000 ms
    @Async
    public void autoHandleCheckoutMaintenance() {
        logger.info("🧹 Starting automated checkout maintenance check...");

        try {
            LocalDate today = LocalDate.now();
            LocalDateTime yesterday = today.minusDays(1).atStartOfDay();

            // Find rooms that should be in maintenance after checkout
            List<Room> roomsNeedingMaintenance = roomRepository.findRoomsNeedingMaintenanceAfterCheckout(
                    yesterday, today.atStartOfDay());

            int maintenanceCount = 0;
            for (Room room : roomsNeedingMaintenance) {
                if (room.getStatus() == RoomStatus.OCCUPIED) {
                    room.setStatus(RoomStatus.MAINTENANCE);
                    room.setUpdatedAt(LocalDateTime.now());
                    roomRepository.save(room);
                    maintenanceCount++;

                    logger.info("🧹 Set room {} to MAINTENANCE after checkout", room.getRoomNumber());
                }
            }

            if (maintenanceCount > 0) {
                logger.info("🧹 Set {} rooms to MAINTENANCE status after checkout", maintenanceCount);
            }

        } catch (Exception e) {
            logger.error("❌ Failed to run automated checkout maintenance check", e);
        }
    }

    /**
     * Real-time consistency check for a specific room
     * Called immediately after booking status changes
     */
    @Async
    public void checkRoomStatusConsistency(Long roomId) {
        logger.debug("🔍 Checking room status consistency for room ID: {}", roomId);

        try {
            Room room = roomRepository.findById(roomId).orElse(null);
            if (room == null) {
                logger.warn("⚠️ Room not found for consistency check: {}", roomId);
                return;
            }

            boolean wasFixed = fixRoomStatusIfNeeded(room);
            if (wasFixed) {
                logger.info("🔧 Fixed status inconsistency for room {}", room.getRoomNumber());
            }

        } catch (Exception e) {
            logger.error("❌ Failed to check room status consistency for room ID: {}", roomId, e);
        }
    }

    /**
     * Fix room status for all rooms in a specific hotel
     */
    private int fixRoomStatusForHotel(Long hotelId) {
        List<Room> hotelRooms = roomRepository.findByHotelId(hotelId);
        int fixedCount = 0;

        for (Room room : hotelRooms) {
            boolean wasFixed = fixRoomStatusIfNeeded(room);
            if (wasFixed) {
                fixedCount++;
            }
        }

        return fixedCount;
    }

    /**
     * Check and fix room status if needed
     * Returns true if the status was changed
     */
    private boolean fixRoomStatusIfNeeded(Room room) {
        LocalDate today = LocalDate.now();
        RoomStatus originalStatus = room.getStatus();

        // Check if room has checked-in guest
        boolean hasCheckedInGuest = room.getReservations() != null &&
                room.getReservations().stream()
                        .anyMatch(reservation -> reservation.getStatus() == ReservationStatus.CHECKED_IN &&
                                reservation.getCheckOutDate().isAfter(today));

        // Check if room has future confirmed booking for today
        boolean hasTodayConfirmedBooking = room.getReservations() != null &&
                room.getReservations().stream()
                        .anyMatch(reservation -> reservation.getStatus() == ReservationStatus.CONFIRMED &&
                                !reservation.getCheckInDate().isAfter(today) &&
                                !reservation.getCheckOutDate().isBefore(today));

        boolean statusChanged = false;

        // Fix logic: Update room status based on actual occupancy
        if (hasCheckedInGuest && room.getStatus() != RoomStatus.OCCUPIED) {
            room.setStatus(RoomStatus.OCCUPIED);
            statusChanged = true;
            logger.debug("🔧 Fixed room {} status: {} → OCCUPIED (has checked-in guest)",
                    room.getRoomNumber(), originalStatus);

        } else if (!hasCheckedInGuest && room.getStatus() == RoomStatus.OCCUPIED && room.getIsAvailable()) {
            // If room is marked as occupied but has no checked-in guest
            if (hasTodayConfirmedBooking) {
                // Keep as occupied if there's a confirmed booking for today (guest might be
                // arriving)
                logger.debug("🔍 Room {} stays OCCUPIED (confirmed booking for today)", room.getRoomNumber());
            } else {
                // Set to AVAILABLE if no active reservations
                room.setStatus(RoomStatus.AVAILABLE);
                statusChanged = true;
                logger.debug("🔧 Fixed room {} status: {} → AVAILABLE (no checked-in guest)",
                        room.getRoomNumber(), originalStatus);
            }
        }

        if (statusChanged) {
            room.setUpdatedAt(LocalDateTime.now());
            roomRepository.save(room);
        }

        return statusChanged;
    }

    /**
     * Manual trigger for immediate consistency check across all hotels
     * Can be called from admin APIs or emergency situations
     */
    @Async
    public void triggerImmediateConsistencyCheck() {
        logger.info("🚨 Manual trigger: Starting immediate room status consistency check...");
        autoFixRoomStatusConsistency();
    }
}