package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.CheckoutResponse;
import com.bookmyhotel.dto.ConsolidatedReceiptResponse;
import com.bookmyhotel.dto.FrontDeskStats;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Front desk service for managing bookings and guest services
 */
@Service
@Transactional
public class FrontDeskService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CheckoutReceiptService checkoutReceiptService;

    @Autowired
    private BookingService bookingService;

    // TODO: Temporarily commented out for compilation - will reintegrate after
    // Phase 3.3
    // @Autowired
    // private BookingHistoryService historyService;

    /**
     * Get bookings with pagination, status filter, and search (for controller
     * compatibility)
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookings(Pageable pageable, String status, String search) {
        // For now, delegate to the existing method (can be enhanced later to support
        // status filtering)
        return getAllBookings(pageable, search);
    }

    /**
     * Get all bookings with pagination and search
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(Pageable pageable, String search) {
        // Get the current user's hotel to ensure proper data isolation
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }

        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmailWithHotel(userEmail)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userEmail));

        Hotel userHotel = currentUser.getHotel();
        if (userHotel == null) {
            throw new IllegalStateException("User is not associated with any hotel");
        }

        // Get reservations for the user's specific hotel only
        List<Reservation> allReservations = reservationRepository.findByHotelId(userHotel.getId());

        // Apply search filter if provided
        List<Reservation> filteredReservations = allReservations;
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            filteredReservations = allReservations.stream()
                    .filter(reservation -> {
                        // Handle both registered users and guest bookings
                        String firstName = "", lastName = "", email = "";

                        if (reservation.getGuest() != null) {
                            // Registered user booking
                            firstName = reservation.getGuest().getFirstName();
                            lastName = reservation.getGuest().getLastName();
                            email = reservation.getGuest().getEmail();
                        } else if (reservation.getGuestInfo() != null) {
                            // Guest booking - use the combined name
                            String fullName = reservation.getGuestInfo().getName() != null
                                    ? reservation.getGuestInfo().getName()
                                    : "";
                            firstName = fullName; // Use full name for first name field
                            lastName = ""; // Leave last name empty since we have a combined name
                            email = reservation.getGuestInfo().getEmail() != null
                                    ? reservation.getGuestInfo().getEmail()
                                    : "";
                        }

                        return firstName.toLowerCase().contains(searchLower) ||
                                lastName.toLowerCase().contains(searchLower) ||
                                email.toLowerCase().contains(searchLower) ||
                                reservation.getRoom().getRoomNumber().toLowerCase().contains(searchLower) ||
                                reservation.getConfirmationNumber().toLowerCase().contains(searchLower);
                    })
                    .collect(Collectors.toList());
        }

        // Sort by check-in date descending
        filteredReservations.sort((r1, r2) -> r2.getCheckInDate().compareTo(r1.getCheckInDate()));

        // Apply manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredReservations.size());
        List<Reservation> pagedReservations = start < filteredReservations.size()
                ? filteredReservations.subList(start, end)
                : List.of();

        List<BookingResponse> bookingResponses = pagedReservations.stream()
                .map(this::convertToBookingResponse)
                .toList();

        return new PageImpl<>(bookingResponses, pageable, filteredReservations.size());
    }

    /**
     * Get booking details by reservation ID (for controller compatibility)
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(Long reservationId) {
        return getBookingById(reservationId);
    }

    /**
     * Get a single booking by reservation ID
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        return convertToBookingResponse(reservation);
    }

    /**
     * Update booking status
     */
    public BookingResponse updateBookingStatus(Long reservationId, String status) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        try {
            ReservationStatus newStatus = ReservationStatus.valueOf(status.toUpperCase());
            reservation.setStatus(newStatus);

            // Update room status based on reservation status
            Room room = reservation.getRoom();
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
            reservation = reservationRepository.save(reservation);

            return convertToBookingResponse(reservation);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid reservation status: " + status);
        }
    }

    /**
     * Check-in with room assignment
     */
    public BookingResponse checkInWithRoomAssignment(Long reservationId, Long roomId, String roomType) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        // Verify room is available
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalStateException("Room is not available for check-in");
        }

        // Update room assignment
        reservation.setRoom(room);

        // Update room type if provided and different
        if (roomType != null && !roomType.equals(reservation.getRoomType().name())) {
            try {
                RoomType newRoomType = RoomType.valueOf(roomType.toUpperCase());
                reservation.setRoomType(newRoomType);
                // Recalculate total based on new room type
                recalculateBookingTotal(reservation, room.getPricePerNight());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid room type: " + roomType);
            }
        }

        // Set status to checked in
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setActualCheckInTime(LocalDateTime.now());

        // Update room status
        room.setStatus(RoomStatus.OCCUPIED);

        roomRepository.save(room);
        reservation = reservationRepository.save(reservation);

        return convertToBookingResponse(reservation);
    }

    /**
     * Recalculate booking total based on new price per night
     */
    private void recalculateBookingTotal(Reservation reservation, BigDecimal pricePerNight) {
        // Calculate number of nights
        long nights = java.time.temporal.ChronoUnit.DAYS.between(
                reservation.getCheckInDate(),
                reservation.getCheckOutDate());

        // Update price per night and total amount
        reservation.setPricePerNight(pricePerNight);
        reservation.setTotalAmount(pricePerNight.multiply(BigDecimal.valueOf(nights)));
    }

    /**
     * Delete booking
     */
    public void deleteBooking(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Only allow deletion if not checked in
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new IllegalStateException("Cannot delete an active (checked-in) reservation");
        }

        // Make room available if it was reserved
        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            Room room = reservation.getRoom();
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        reservationRepository.delete(reservation);
    }

    /**
     * Update booking room assignment (for confirmed bookings during check-in)
     */
    public BookingResponse updateBookingRoomAssignment(Long reservationId, Long newRoomId, String newRoomType) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Only allow room assignment updates for confirmed bookings
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Room assignment can only be updated for confirmed bookings");
        }

        // Get the new room
        Room newRoom = roomRepository.findById(newRoomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + newRoomId));

        // Verify new room is available
        if (newRoom.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalStateException("Selected room is not available");
        }

        // If there was a previously assigned room, make it available again
        Room previousRoom = reservation.getRoom();
        if (previousRoom != null) {
            previousRoom.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(previousRoom);
        }

        // Assign new room
        reservation.setRoom(newRoom);

        // Update room type if provided and different
        if (newRoomType != null && !newRoomType.equals(reservation.getRoomType().name())) {
            try {
                RoomType roomType = RoomType.valueOf(newRoomType.toUpperCase());
                reservation.setRoomType(roomType);

                // Recalculate total based on new room's price
                recalculateBookingTotal(reservation, newRoom.getPricePerNight());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid room type: " + newRoomType);
            }
        }

        // Reserve the new room (don't mark as occupied until check-in)
        newRoom.setStatus(RoomStatus.AVAILABLE); // Keep available until actual check-in

        roomRepository.save(newRoom);
        reservation = reservationRepository.save(reservation);

        return convertToBookingResponse(reservation);
    }

    /**
     * Get today's arrivals
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getTodaysArrivals() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }

        LocalDate today = LocalDate.now();
        List<Reservation> arrivals = reservationRepository.findUpcomingCheckInsByTenantId(today, tenantId);

        return arrivals.stream()
                .map(this::convertToBookingResponse)
                .toList();
    }

    /**
     * Get available rooms for a hotel
     */
    @Transactional(readOnly = true)
    public List<RoomResponse> getAvailableRoomsForHotel(Long hotelId) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }

        List<Room> availableRooms = roomRepository.findByHotelIdAndIsAvailableTrueAndStatus(hotelId, RoomStatus.AVAILABLE);

        return availableRooms.stream()
                .map(this::convertToRoomResponse)
                .toList();
    }

    /**
     * Get today's departures
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getTodaysDepartures() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }

        LocalDate today = LocalDate.now();
        List<Reservation> departures = reservationRepository.findUpcomingCheckOutsByTenantId(today, tenantId);

        return departures.stream()
                .map(this::convertToBookingResponse)
                .toList();
    }

    /**
     * Get all current guests (checked in)
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getCurrentGuests() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }

        List<Reservation> currentGuests = reservationRepository.findByStatusAndTenantId(ReservationStatus.CHECKED_IN,
                tenantId);

        return currentGuests.stream()
                .map(this::convertToBookingResponse)
                .toList();
    }

    /**
     * Simple check-in (for controller compatibility)
     */
    public BookingResponse checkIn(Long reservationId) {
        return checkInGuest(reservationId);
    }

    /**
     * Check in a guest
     */
    public BookingResponse checkInGuest(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Validate that check-in is allowed
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed reservations can be checked in");
        }

        if (reservation.getCheckInDate().isAfter(LocalDate.now().plusDays(1))) {
            throw new IllegalStateException("Cannot check in more than 1 day early");
        }

        // Update reservation status
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setActualCheckInTime(LocalDateTime.now());

        // Update room status to occupied
        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        reservation = reservationRepository.save(reservation);

        // Record check-in in history
        // TODO: Complete history integration after Phase 3.3
        /*
         * try {
         * historyService.recordBookingAction(
         * reservation,
         * BookingActionType.CHECKED_IN,
         * "Front Desk Staff", // TODO: Get actual staff member name
         * "Guest checked in to room " + room.getRoomNumber(),
         * null, null, null
         * );
         * } catch (Exception e) {
         * // Log but don't fail the check-in process
         * System.err.println("Failed to record check-in in history: " +
         * e.getMessage());
         * }
         */

        return convertToBookingResponse(reservation);
    }

    /**
     * Check out a guest (for controller compatibility)
     */
    public CheckoutResponse checkOut(Long reservationId) {
        return checkOutGuestWithReceipt(reservationId);
    }

    /**
     * Check out a guest (backward compatibility)
     */
    public BookingResponse checkOutGuest(Long reservationId) {
        CheckoutResponse checkoutResponse = checkOutGuestWithReceipt(reservationId);
        return checkoutResponse.getBooking();
    }

    /**
     * Check out a guest and generate final receipt
     */
    public CheckoutResponse checkOutGuestWithReceipt(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Validate that check-out is allowed
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new IllegalStateException("Only checked-in guests can be checked out");
        }

        // Update reservation status
        reservation.setStatus(ReservationStatus.CHECKED_OUT);
        reservation.setActualCheckOutTime(LocalDateTime.now());

        // Update room status to need cleaning (if room is assigned)
        Room room = reservation.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.MAINTENANCE); // Assuming rooms need cleaning after checkout
            roomRepository.save(room);
        }

        reservation = reservationRepository.save(reservation);

        // Record check-out in history
        // TODO: Complete history integration after Phase 3.3
        /*
         * try {
         * historyService.recordBookingAction(
         * reservation,
         * BookingActionType.CHECKED_OUT,
         * "Front Desk Staff", // TODO: Get actual staff member name
         * "Guest checked out from room " + room.getRoomNumber(),
         * null, null, null
         * );
         * } catch (Exception e) {
         * // Log but don't fail the check-out process
         * System.err.println("Failed to record check-out in history: " +
         * e.getMessage());
         * }
         */

        // Generate booking response
        BookingResponse bookingResponse = convertToBookingResponse(reservation);

        // Generate final receipt with room and shop charges
        try {
            // Get current user email for receipt generation
            String generatedByEmail = getCurrentUserEmail();

            ConsolidatedReceiptResponse receipt = checkoutReceiptService.generateFinalReceipt(
                    reservationId, generatedByEmail);

            return new CheckoutResponse(bookingResponse, receipt,
                    "Guest checked out successfully. Final receipt generated with room charges and shop charges.");

        } catch (Exception e) {
            // Log the error but don't fail the checkout process
            System.err.println("Failed to generate receipt during checkout: " + e.getMessage());
            e.printStackTrace();

            return new CheckoutResponse(bookingResponse, null,
                    "Guest checked out successfully. Receipt generation failed - please generate manually if needed.");
        }
    }

    /**
     * Get consolidated receipt for a reservation (for controller compatibility)
     */
    public ConsolidatedReceiptResponse getConsolidatedReceipt(Long reservationId) {
        try {
            String generatedByEmail = getCurrentUserEmail();
            return checkoutReceiptService.generateFinalReceipt(reservationId, generatedByEmail);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate consolidated receipt: " + e.getMessage(), e);
        }
    }

    /**
     * Get current authenticated user's email
     */
    private String getCurrentUserEmail() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getName() != null) {
                return authentication.getName();
            }
        } catch (Exception e) {
            System.err.println("Failed to get current user email: " + e.getMessage());
        }
        return "front-desk-staff@bookmyhotel.com"; // Fallback
    }

    /**
     * Mark guest as no-show
     */
    public BookingResponse markNoShow(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Validate that no-show marking is allowed
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed reservations can be marked as no-show");
        }

        // Check if it's past the check-in date
        if (reservation.getCheckInDate().isAfter(LocalDate.now())) {
            throw new IllegalStateException("Cannot mark as no-show before check-in date");
        }

        // Update reservation status
        reservation.setStatus(ReservationStatus.NO_SHOW);

        // Make room available again
        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);

        reservation = reservationRepository.save(reservation);

        // Record no-show in history
        // TODO: Complete history integration after Phase 3.3
        /*
         * try {
         * historyService.recordBookingAction(
         * reservation,
         * BookingActionType.NO_SHOW,
         * "Front Desk Staff", // TODO: Get actual staff member name
         * "Guest marked as no-show for room " + room.getRoomNumber(),
         * null, null, null
         * );
         * } catch (Exception e) {
         * // Log but don't fail the no-show process
         * System.err.println("Failed to record no-show in history: " + e.getMessage());
         * }
         */

        return convertToBookingResponse(reservation);
    }

    /**
     * Cancel booking
     */
    public BookingResponse cancelBooking(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Validate that cancellation is allowed
        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
            throw new IllegalStateException("Cannot cancel a completed reservation");
        }

        // Update reservation status
        reservation.setStatus(ReservationStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            reservation.setCancellationReason(reason.trim());
        }
        reservation.setCancelledAt(LocalDateTime.now());

        // Make room available again if not already checked in
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            Room room = reservation.getRoom();
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }

        reservation = reservationRepository.save(reservation);

        return convertToBookingResponse(reservation);
    }

    /**
     * Search bookings by various criteria
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> searchBookings(String guestName, String roomNumber,
            String confirmationNumber, LocalDate checkInDate,
            ReservationStatus status) {

        // Get the current user's hotel to ensure proper data isolation
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }

        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmailWithHotel(userEmail)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userEmail));

        Hotel userHotel = currentUser.getHotel();
        if (userHotel == null) {
            throw new IllegalStateException("User is not associated with any hotel");
        }

        // Get reservations for the user's specific hotel only
        List<Reservation> allReservations = reservationRepository.findByHotelId(userHotel.getId());

        return allReservations.stream()
                .filter(reservation -> {
                    if (guestName != null && !guestName.trim().isEmpty()) {
                        if (reservation.getGuest() != null) {
                            // Registered user booking
                            String fullName = (reservation.getGuest().getFirstName() + " "
                                    + reservation.getGuest().getLastName()).toLowerCase();
                            return fullName.contains(guestName.toLowerCase().trim());
                        } else if (reservation.getGuestInfo() != null) {
                            // Guest booking
                            String guestInfoName = reservation.getGuestInfo().getName() != null
                                    ? reservation.getGuestInfo().getName().toLowerCase()
                                    : "";
                            return guestInfoName.contains(guestName.toLowerCase().trim());
                        }
                        return false;
                    }
                    return true;
                })
                .filter(reservation -> {
                    if (roomNumber != null && !roomNumber.trim().isEmpty()) {
                        return reservation.getRoom().getRoomNumber()
                                .toLowerCase().contains(roomNumber.toLowerCase().trim());
                    }
                    return true;
                })
                .filter(reservation -> {
                    if (confirmationNumber != null && !confirmationNumber.trim().isEmpty()) {
                        return reservation.getConfirmationNumber()
                                .toLowerCase().contains(confirmationNumber.toLowerCase().trim());
                    }
                    return true;
                })
                .filter(reservation -> {
                    if (checkInDate != null) {
                        return reservation.getCheckInDate().equals(checkInDate);
                    }
                    return true;
                })
                .filter(reservation -> {
                    if (status != null) {
                        return reservation.getStatus() == status;
                    }
                    return true;
                })
                .map(this::convertToBookingResponse)
                .toList();
    }

    /**
     * Get front desk statistics
     */
    @Transactional(readOnly = true)
    public FrontDeskStats getFrontDeskStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("User authentication is not available");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        Hotel hotel = user.getHotel();
        if (hotel == null) {
            throw new ResourceNotFoundException("User is not associated with any hotel");
        }

        LocalDate today = LocalDate.now();
        String tenantId = TenantContext.getTenantId();

        // Get bookings for this specific hotel by joining with rooms
        // Using existing repository methods with custom queries for hotel-specific data
        long todaysArrivals = reservationRepository.findByHotelId(hotel.getId()).stream()
                .filter(r -> r.getCheckInDate().equals(today) && r.getStatus() == ReservationStatus.CONFIRMED)
                .count();
        long todaysDepartures = reservationRepository.findByHotelId(hotel.getId()).stream()
                .filter(r -> r.getCheckOutDate().equals(today) && r.getStatus() == ReservationStatus.CHECKED_IN)
                .count();
        long currentOccupancy = reservationRepository.findByHotelId(hotel.getId()).stream()
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN)
                .count();

        // Get room counts for this specific hotel
        long totalRooms = roomRepository.countByHotelId(hotel.getId());
        long availableRooms = roomRepository.findByHotelId(hotel.getId()).stream()
                .filter(room -> room.getStatus() == RoomStatus.AVAILABLE)
                .count();
        long roomsOutOfOrder = roomRepository.findByHotelId(hotel.getId()).stream()
                .filter(room -> room.getStatus() == RoomStatus.OUT_OF_ORDER)
                .count();
        long roomsUnderMaintenance = roomRepository.findByHotelId(hotel.getId()).stream()
                .filter(room -> room.getStatus() == RoomStatus.MAINTENANCE)
                .count();

        return new FrontDeskStats(
                todaysArrivals,
                todaysDepartures,
                currentOccupancy,
                availableRooms,
                roomsOutOfOrder,
                roomsUnderMaintenance);
    }

    /**
     * Get hotel information for the current user
     */
    @Transactional(readOnly = true)
    public HotelDTO getHotelInfo() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null) {
                throw new IllegalStateException("User authentication is not available");
            }

            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

            // Get hotel ID from user and fetch hotel directly from repository
            // This avoids tenant filter issues with lazy loading
            if (user.getHotel() == null) {
                throw new ResourceNotFoundException("User is not associated with any hotel");
            }

            Long hotelId = user.getHotel().getId();
            Hotel userHotel = hotelRepository.findById(hotelId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));

            return convertToHotelDTO(userHotel);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error getting hotel info: " + e.getMessage(), e);
        }
    }

    /**
     * Get all rooms with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<RoomResponse> getAllRooms(Pageable pageable, String search, String roomType, String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("User authentication is not available");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));

        // Check if user is SYSTEM_ADMIN - they can see all rooms across all hotels
        boolean isSystemAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SYSTEM_ADMIN"));

        List<Room> allRooms;
        if (isSystemAdmin) {
            // System admin can see all rooms from all hotels
            allRooms = roomRepository.findAllByOrderByHotelIdAscRoomNumberAsc();
        } else {
            // Regular hotel staff can only see rooms from their hotel
            Hotel hotel = user.getHotel();
            if (hotel == null) {
                throw new ResourceNotFoundException("User is not associated with any hotel");
            }
            allRooms = roomRepository.findByHotelIdOrderByRoomNumber(hotel.getId());
        }

        // Convert to responses first (this computes the actual status including
        // OCCUPIED)
        List<RoomResponse> allRoomResponses = allRooms.stream()
                .map(this::convertToRoomResponse)
                .toList();

        // Apply search and filters on the computed responses
        List<RoomResponse> filteredRooms = allRoomResponses.stream()
                .filter(room -> search == null || search.trim().isEmpty() ||
                        room.getRoomNumber().toLowerCase().contains(search.toLowerCase()) ||
                        room.getDescription() != null
                                && room.getDescription().toLowerCase().contains(search.toLowerCase()))
                .filter(room -> roomType == null || roomType.trim().isEmpty() ||
                        room.getRoomType().toString().equalsIgnoreCase(roomType))
                .filter(room -> status == null || status.trim().isEmpty() ||
                        room.getStatus().toString().equalsIgnoreCase(status))
                .toList();

        // Apply manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredRooms.size());
        List<RoomResponse> pagedRooms = start < filteredRooms.size() ? filteredRooms.subList(start, end) : List.of();

        return new PageImpl<>(pagedRooms, pageable, filteredRooms.size());
    }

    /**
     * Update room status
     */
    public RoomResponse updateRoomStatus(Long roomId, String status, String notes) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        try {
            // Convert status string to RoomStatus enum (consistent with Hotel Admin)
            String normalizedStatus = status.replace(" ", "_").toUpperCase();
            RoomStatus newStatus = RoomStatus.valueOf(normalizedStatus);

            // Business rule: Cannot change status if room has active bookings and new
            // status would conflict
            LocalDate today = LocalDate.now();
            boolean hasActiveBookings = room.getReservations().stream()
                    .anyMatch(reservation -> (reservation.getStatus() == ReservationStatus.CONFIRMED ||
                            reservation.getStatus() == ReservationStatus.CHECKED_IN) &&
                            !reservation.getCheckInDate().isAfter(today) &&
                            !reservation.getCheckOutDate().isBefore(today));

            if (hasActiveBookings && (newStatus == RoomStatus.OUT_OF_ORDER ||
                    newStatus == RoomStatus.MAINTENANCE)) {
                throw new RuntimeException("Cannot set room to " + status + " - it has active bookings");
            }

            room.setStatus(newStatus);
            room.setUpdatedAt(LocalDateTime.now());

            // Note: Availability is controlled independently through toggleRoomAvailability
            // This allows hotel staff to control booking availability separately from room
            // status

            room = roomRepository.save(room);

            return convertToRoomResponse(room);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid room status: " + status);
        }
    }

    /**
     * Toggle room availability
     */
    public RoomResponse toggleRoomAvailability(Long roomId, boolean available, String reason) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        // Business rule: Cannot make room unavailable if it has active bookings
        if (!available) {
            LocalDate today = LocalDate.now();
            boolean hasActiveBookings = room.getReservations().stream()
                    .anyMatch(reservation -> (reservation.getStatus() == ReservationStatus.CONFIRMED ||
                            reservation.getStatus() == ReservationStatus.CHECKED_IN) &&
                            !reservation.getCheckInDate().isAfter(today) &&
                            !reservation.getCheckOutDate().isBefore(today));

            if (hasActiveBookings) {
                throw new RuntimeException("Cannot make room unavailable - it has active bookings");
            }
        }

        room.setIsAvailable(available);
        room.setUpdatedAt(LocalDateTime.now());

        // Note: Status and availability are controlled independently
        // This allows hotel staff to control booking availability without changing room
        // status

        room = roomRepository.save(room);

        return convertToRoomResponse(room);
    }

    /**
     * Toggle room availability (overloaded method for actual toggling)
     */
    public RoomResponse toggleRoomAvailability(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        // Toggle the availability
        boolean newAvailability = !room.getIsAvailable();

        return toggleRoomAvailability(roomId, newAvailability, null);
    }

    /**
     * Get room details by ID
     */
    public RoomResponse getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));

        return convertToRoomResponse(room);
    }

    /**
     * Convert Hotel entity to HotelDTO
     */
    private HotelDTO convertToHotelDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setDescription(hotel.getDescription());
        dto.setAddress(hotel.getAddress());
        dto.setCity(hotel.getCity());
        dto.setCountry(hotel.getCountry());
        dto.setPhone(hotel.getPhone());
        dto.setEmail(hotel.getEmail());
        dto.setTenantId(hotel.getTenantId());
        dto.setIsActive(hotel.getIsActive());
        dto.setCreatedAt(hotel.getCreatedAt());
        dto.setUpdatedAt(hotel.getUpdatedAt());

        // Add room count
        if (hotel.getRooms() != null) {
            dto.setRoomCount(hotel.getRooms().size());
        } else {
            long roomCount = roomRepository.countByHotelId(hotel.getId());
            dto.setRoomCount((int) roomCount);
        }

        return dto;
    }

    /**
     * Convert reservation to booking response
     */
    private BookingResponse convertToBookingResponse(Reservation reservation) {
        // Delegate to BookingService for consistent conversion
        return bookingService.convertToBookingResponse(reservation);
    }

    /**
     * Convert room to room response with consistent business logic
     */
    private RoomResponse convertToRoomResponse(Room room) {
        String tenantId = TenantContext.getTenantId();

        RoomResponse response = new RoomResponse();
        response.setId(room.getId());
        response.setRoomNumber(room.getRoomNumber());
        response.setRoomType(room.getRoomType());
        response.setPricePerNight(room.getPricePerNight());
        response.setCapacity(room.getCapacity());
        response.setDescription(room.getDescription());

        // Check if room is currently booked (tenant-aware)
        boolean isCurrentlyBooked = roomRepository.isRoomCurrentlyBooked(room.getId(), tenantId);

        // Update room status to OCCUPIED if currently booked and status is AVAILABLE
        // This ensures consistent status display across Hotel Admin and Front Desk
        if (isCurrentlyBooked && room.getStatus() == RoomStatus.AVAILABLE) {
            response.setStatus(RoomStatus.OCCUPIED);
        } else {
            response.setStatus(room.getStatus());
        }

        // Availability toggle shows the admin's manual setting (independent of booking
        // status)
        // This allows hotel admin to control booking availability separately from
        // operational status
        response.setIsAvailable(room.getIsAvailable());

        // Set hotel name
        if (room.getHotel() != null) {
            response.setHotelName(room.getHotel().getName());
        }

        // Check if room has current guest (checked-in reservation)
        if (room.getReservations() != null) {
            room.getReservations().stream()
                    .filter(reservation -> reservation.getStatus() == ReservationStatus.CHECKED_IN)
                    .findFirst()
                    .ifPresent(reservation -> {
                        String guestName = "";

                        // Handle both registered users and guest bookings
                        if (reservation.getGuest() != null) {
                            // Registered user booking
                            guestName = reservation.getGuest().getFirstName() + " " +
                                    reservation.getGuest().getLastName();
                        } else if (reservation.getGuestInfo() != null &&
                                reservation.getGuestInfo().getName() != null) {
                            // Guest booking
                            guestName = reservation.getGuestInfo().getName();
                        } else {
                            // Fallback for data integrity issues
                            guestName = "Guest (ID: " + reservation.getId() + ")";
                        }

                        response.setCurrentGuest(guestName);
                    });
        }

        return response;
    }
}
