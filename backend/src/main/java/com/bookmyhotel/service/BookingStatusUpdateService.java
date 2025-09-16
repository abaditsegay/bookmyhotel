package com.bookmyhotel.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

/**
 * Unified service for updating booking status
 * Used by both HotelAdminService and FrontDeskService
 */
@Service
@Transactional
public class BookingStatusUpdateService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingChangeNotificationService bookingChangeNotificationService;

    /**
     * Update booking status with notification creation
     * 
     * @param reservationId The reservation ID to update
     * @param newStatus     The new status to set
     * @param initiatedBy   Who initiated the status change (e.g., "hotel admin",
     *                      "front desk")
     * @return BookingResponse with updated booking information
     */
    public BookingResponse updateBookingStatus(Long reservationId, ReservationStatus newStatus, String initiatedBy) {
        System.out.println("🔄 BookingStatusUpdateService.updateBookingStatus called - reservationId: " + reservationId
                + ", newStatus: " + newStatus + ", initiatedBy: " + initiatedBy);

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        System.out.println("📋 Found reservation: " + generateConfirmationNumber(reservation.getId())
                + " - Current status: " + reservation.getStatus());

        // Store old status for comparison
        ReservationStatus oldStatus = reservation.getStatus();

        // Update reservation status
        reservation.setStatus(newStatus);

        // Handle room status updates based on reservation status (only if room is
        // assigned)
        Room room = reservation.getRoom();
        if (room != null) {
            switch (newStatus) {
                case CHECKED_IN:
                    room.setStatus(RoomStatus.OCCUPIED);
                    reservation.setActualCheckInTime(LocalDateTime.now());
                    break;
                case CHECKED_OUT:
                    room.setStatus(RoomStatus.MAINTENANCE);
                    reservation.setActualCheckOutTime(LocalDateTime.now());
                    break;
                case CANCELLED:
                case NO_SHOW:
                    room.setStatus(RoomStatus.AVAILABLE);
                    break;
                default:
                    // For other statuses, keep room status as is
                    break;
            }
            roomRepository.save(room);
        }

        // Save the reservation
        reservation = reservationRepository.save(reservation);

        // Create booking notification if status changed to CANCELLED
        if (newStatus == ReservationStatus.CANCELLED) {
            System.out.println("📢 Creating cancellation notification for reservation: "
                    + generateConfirmationNumber(reservation.getId()));
            try {
                String reason = "Booking cancelled by " + initiatedBy;
                bookingChangeNotificationService.createCancellationNotification(
                        reservation,
                        reason,
                        java.math.BigDecimal.ZERO // No refund calculation for admin/front desk cancellations
                );
                System.out.println("✅ Successfully created cancellation notification");
            } catch (Exception e) {
                // Log error but don't fail the status update
                System.err.println("❌ Failed to create cancellation notification: " + e.getMessage());
                e.printStackTrace();
            }
        }

        System.out.println("✅ Status updated successfully: " + oldStatus + " → " + newStatus);
        return convertToBookingResponse(reservation);
    }

    /**
     * Update booking status (string version for API compatibility)
     */
    public BookingResponse updateBookingStatus(Long reservationId, String status, String initiatedBy) {
        try {
            ReservationStatus newStatus = ReservationStatus.valueOf(status.toUpperCase());
            return updateBookingStatus(reservationId, newStatus, initiatedBy);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid reservation status: " + status);
        }
    }

    /**
     * Convert reservation to booking response (simplified version)
     */
    private BookingResponse convertToBookingResponse(Reservation reservation) {
        BookingResponse response = new BookingResponse();
        response.setReservationId(reservation.getId());
        response.setStatus(reservation.getStatus().name());
        response.setConfirmationNumber(generateConfirmationNumber(reservation.getId()));
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setPaymentIntentId(reservation.getPaymentIntentId());
        response.setCreatedAt(reservation.getCreatedAt());
        response.setNumberOfGuests(reservation.getNumberOfGuests());
        response.setSpecialRequests(reservation.getSpecialRequests());

        // Room details
        Room room = reservation.getRoom();
        if (room != null) {
            response.setRoomNumber(room.getRoomNumber());
            response.setRoomType(room.getRoomType().name());
            response.setPricePerNight(room.getPricePerNight());
            response.setHotelName(room.getHotel().getName());
            response.setHotelAddress(room.getHotel().getAddress());
        } else {
            // For bookings without assigned rooms yet
            response.setRoomNumber("To be assigned");
            response.setRoomType(reservation.getRoomType() != null ? reservation.getRoomType().name() : "Unknown");
            response.setPricePerNight(reservation.getPricePerNight());
            // Get hotel details from reservation's hotel field
            if (reservation.getHotel() != null) {
                response.setHotelName(reservation.getHotel().getName());
                response.setHotelAddress(reservation.getHotel().getAddress());
            } else {
                response.setHotelName("Unknown Hotel");
                response.setHotelAddress("Unknown Address");
            }
        }

        // Guest details - handle both registered users and guest bookings
        if (reservation.getGuest() != null) {
            // Registered user booking - fetch guest safely
            User guest = fetchGuestUserById(reservation.getGuest().getId());
            if (guest != null) {
                response.setGuestName(guest.getFirstName() + " " + guest.getLastName());
                response.setGuestEmail(guest.getEmail());
            } else {
                // If guest user is not found, use guestInfo from reservation
                if (reservation.getGuestInfo() != null) {
                    response.setGuestName(
                            reservation.getGuestInfo().getName() != null ? reservation.getGuestInfo().getName()
                                    : "Name Not Available");
                    response.setGuestEmail(
                            reservation.getGuestInfo().getEmail() != null ? reservation.getGuestInfo().getEmail()
                                    : "N/A");
                } else {
                    response.setGuestName("Name Not Available");
                    response.setGuestEmail("N/A");
                }
            }
        } else if (reservation.getGuestInfo() != null) {
            // Anonymous guest booking (no User record)
            response.setGuestName(reservation.getGuestInfo().getName() != null ? reservation.getGuestInfo().getName()
                    : "Name Not Available");
            response.setGuestEmail(
                    reservation.getGuestInfo().getEmail() != null ? reservation.getGuestInfo().getEmail() : "N/A");
        } else {
            // Fallback for incomplete data
            response.setGuestName("Name Not Available");
            response.setGuestEmail("N/A");
        }

        // Payment status
        if (reservation.getPaymentIntentId() != null) {
            response.setPaymentStatus("PAID");
        } else {
            response.setPaymentStatus("PENDING");
        }

        return response;
    }

    /**
     * Generate confirmation number
     */
    private String generateConfirmationNumber(Long reservationId) {
        return String.format("BK%08d", reservationId);
    }

    /**
     * Fetch guest user by ID safely (copied from HotelAdminService)
     */
    private User fetchGuestUserById(Long guestId) {
        try {
            return userRepository.findById(guestId).orElse(null);
        } catch (Exception e) {
            System.err.println("Error fetching guest user: " + e.getMessage());
            return null;
        }
    }
}