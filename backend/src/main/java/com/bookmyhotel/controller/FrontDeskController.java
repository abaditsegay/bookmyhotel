package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.CheckoutResponse;
import com.bookmyhotel.dto.ConsolidatedReceiptResponse;
import com.bookmyhotel.dto.FrontDeskStats;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomResponse;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.service.CheckoutReceiptService;
import com.bookmyhotel.service.FrontDeskService;

import jakarta.validation.Valid;

/**
 * REST controller for front desk operations
 */
@RestController
@RequestMapping("/api/front-desk")
@PreAuthorize("hasRole('FRONTDESK') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
public class FrontDeskController {

    @Autowired
    private FrontDeskService frontDeskService;

    @Autowired
    private CheckoutReceiptService checkoutReceiptService;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private com.bookmyhotel.service.BookingService bookingService;

    /**
     * Get paginated bookings for front desk
     */
    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = frontDeskService.getBookings(pageable, status, search);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get booking details by reservation ID
     */
    @GetMapping("/bookings/{reservationId}")
    public ResponseEntity<BookingResponse> getBookingDetails(@PathVariable Long reservationId) {
        BookingResponse booking = frontDeskService.getBookingDetails(reservationId);
        return ResponseEntity.ok(booking);
    }

    /**
     * Update booking room assignment (for confirmed bookings during check-in)
     */
    @PutMapping("/bookings/{reservationId}/room-assignment")
    public ResponseEntity<BookingResponse> updateBookingRoomAssignment(
            @PathVariable Long reservationId,
            @RequestParam Long roomId,
            @RequestParam(required = false) String roomType) {

        BookingResponse booking = frontDeskService.updateBookingRoomAssignment(reservationId, roomId, roomType);
        return ResponseEntity.ok(booking);
    }

    /**
     * Update booking status
     */
    @PutMapping("/bookings/{reservationId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long reservationId,
            @RequestParam String status) {

        BookingResponse booking = frontDeskService.updateBookingStatus(reservationId, status);
        return ResponseEntity.ok(booking);
    }

    /**
     * Check in a guest (simple status update)
     */
    @PostMapping("/bookings/{reservationId}/checkin-simple")
    public ResponseEntity<BookingResponse> checkIn(@PathVariable Long reservationId) {
        BookingResponse booking = frontDeskService.checkIn(reservationId);
        return ResponseEntity.ok(booking);
    }

    /**
     * Enhanced check-in with room assignment and price recalculation
     */
    @PostMapping("/bookings/{reservationId}/checkin")
    public ResponseEntity<BookingResponse> checkInWithRoomAssignment(
            @PathVariable Long reservationId,
            @RequestParam Long roomId,
            @RequestParam(required = false) String roomType) {

        BookingResponse booking = frontDeskService.checkInWithRoomAssignment(reservationId, roomId, roomType);
        return ResponseEntity.ok(booking);
    }

    /**
     * Get available rooms for check-in at a specific hotel
     * Enhanced to support date-based filtering to exclude occupied rooms
     */
    @GetMapping("/hotels/{hotelId}/available-rooms")
    public ResponseEntity<List<RoomResponse>> getAvailableRoomsForCheckin(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String checkInDate,
            @RequestParam(required = false) String checkOutDate,
            @RequestParam(defaultValue = "1") Integer guests) {

        try {
            List<RoomResponse> availableRooms;

            if (checkInDate != null && checkOutDate != null) {
                // Use date-based filtering to exclude occupied rooms
                java.time.LocalDate checkIn = java.time.LocalDate.parse(checkInDate);
                java.time.LocalDate checkOut = java.time.LocalDate.parse(checkOutDate);

                availableRooms = frontDeskService.getAvailableRoomsForDateRange(hotelId, checkIn, checkOut, guests);
            } else {
                // Fallback to basic availability (existing behavior)
                availableRooms = frontDeskService.getAvailableRoomsForHotel(hotelId);
            }

            return ResponseEntity.ok(availableRooms);
        } catch (Exception e) {
            System.err.println("Failed to get available rooms: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Check out a guest
     */
    @PostMapping("/bookings/{reservationId}/checkout")
    public ResponseEntity<CheckoutResponse> checkOut(@PathVariable Long reservationId) {
        CheckoutResponse response = frontDeskService.checkOut(reservationId);
        return ResponseEntity.ok(response);
    }

    /**
     * Check out a guest with receipt generation (generic - supports both front desk
     * and hotel admin)
     */
    @PutMapping("/checkout-with-receipt/{reservationId}")
    public ResponseEntity<CheckoutResponse> checkOutWithReceipt(
            @PathVariable Long reservationId,
            Authentication authentication) {

        // Use the generic checkout service method that works for both front desk and
        // hotel admin
        CheckoutResponse response = checkOutGuestWithReceiptGeneric(reservationId, authentication.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Get consolidated receipt for a reservation
     */
    @GetMapping("/bookings/{reservationId}/receipt")
    public ResponseEntity<ConsolidatedReceiptResponse> getConsolidatedReceipt(@PathVariable Long reservationId) {
        ConsolidatedReceiptResponse receipt = frontDeskService.getConsolidatedReceipt(reservationId);
        return ResponseEntity.ok(receipt);
    }

    /**
     * Get front desk statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<FrontDeskStats> getFrontDeskStats() {
        FrontDeskStats stats = frontDeskService.getFrontDeskStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all rooms with pagination and filtering
     */
    @GetMapping("/rooms")
    public ResponseEntity<Page<RoomResponse>> getAllRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("roomNumber"));
        Page<RoomResponse> rooms = frontDeskService.getAllRooms(pageable, search, roomType, status);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Update room status
     */
    @PutMapping("/rooms/{roomId}/status")
    public ResponseEntity<RoomResponse> updateRoomStatus(
            @PathVariable Long roomId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {

        RoomResponse room = frontDeskService.updateRoomStatus(roomId, status, notes);
        return ResponseEntity.ok(room);
    }

    /**
     * Toggle room availability
     */
    @PutMapping("/rooms/{roomId}/availability")
    public ResponseEntity<RoomResponse> toggleRoomAvailability(
            @PathVariable Long roomId,
            @RequestParam boolean available,
            @RequestParam(required = false) String reason) {

        RoomResponse room = frontDeskService.toggleRoomAvailability(roomId, available, reason);
        return ResponseEntity.ok(room);
    }

    /**
     * Get room details by ID
     */
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long roomId) {
        RoomResponse room = frontDeskService.getRoomById(roomId);
        return ResponseEntity.ok(room);
    }

    /**
     * Generic checkout method that can be used by both front desk and hotel admin
     * This method contains the same business logic as
     * FrontDeskService.checkOutGuestWithReceipt()
     * but is role-agnostic and can be used by any authorized user
     */
    private CheckoutResponse checkOutGuestWithReceiptGeneric(Long reservationId, String generatedByEmail) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        // Validate that check-out is allowed
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new IllegalStateException("Only checked-in guests can be checked out");
        }

        // Update reservation status
        reservation.setStatus(ReservationStatus.CHECKED_OUT);
        reservation.setActualCheckOutTime(java.time.LocalDateTime.now());

        // Update room status to need cleaning (if room is assigned)
        Room room = reservation.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.MAINTENANCE); // Assuming rooms need cleaning after checkout
            roomRepository.save(room);
        }

        reservation = reservationRepository.save(reservation);

        // Generate booking response
        BookingResponse bookingResponse = bookingService.convertToBookingResponse(reservation);

        // Generate final receipt with room and shop charges
        try {
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
     * Get hotel information for the front desk
     */
    @GetMapping("/hotel")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelDTO> getHotelInfo() {
        HotelDTO hotel = frontDeskService.getHotelInfo();
        return ResponseEntity.ok(hotel);
    }

    /**
     * Create a walk-in booking
     * Front desk staff can create immediate bookings for walk-in guests
     * 
     * IMPORTANT: Walk-in bookings automatically send email confirmation to the
     * guest's email address,
     * not to the staff member who creates the booking. This ensures guests receive
     * their
     * booking confirmation details for their records.
     */
    @PostMapping("/walk-in-booking")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<BookingResponse> createWalkInBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {

        // Set payment method to front desk payment for walk-in bookings
        if (request.getPaymentMethodId() == null || request.getPaymentMethodId().isEmpty()) {
            request.setPaymentMethodId("pay_at_frontdesk");
        }

        // For walk-in bookings, create as anonymous guest so email goes to guest, not
        // staff
        // Pass null as userEmail to ensure guest gets the confirmation email
        // This ensures the booking confirmation email is sent to the guest's email
        // address
        BookingResponse response = bookingService.createBooking(request, null);

        // Log the walk-in booking creation for audit purposes
        String staffEmail = auth.getName();
        System.out.println("Walk-in booking created by front desk staff: " + staffEmail +
                " with confirmation number: " + response.getConfirmationNumber() +
                " for guest email: " + request.getGuestEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
