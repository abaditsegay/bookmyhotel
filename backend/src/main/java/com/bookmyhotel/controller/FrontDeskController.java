package com.bookmyhotel.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomResponse;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.service.FrontDeskService;

/**
 * Front desk controller for managing bookings and guest services
 */
@RestController
@RequestMapping("/api/front-desk")
@CrossOrigin(origins = "*")
public class FrontDeskController {
    
    @Autowired
    private FrontDeskService frontDeskService;
    
    /**
     * Get all bookings with pagination and search
     */
    @GetMapping("/bookings")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Page<BookingResponse>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("checkInDate").descending());
        Page<BookingResponse> bookings = frontDeskService.getAllBookings(pageable, search);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a single booking by reservation ID
     */
    @GetMapping("/bookings/{reservationId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long reservationId) {
        BookingResponse booking = frontDeskService.getBookingById(reservationId);
        return ResponseEntity.ok(booking);
    }

    /**
     * Update booking status
     */
    @PutMapping("/bookings/{reservationId}/status")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long reservationId,
            @RequestParam String status) {
        BookingResponse response = frontDeskService.updateBookingStatus(reservationId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete booking
     */
    @DeleteMapping("/bookings/{reservationId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long reservationId) {
        frontDeskService.deleteBooking(reservationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get today's arrivals
     */
    @GetMapping("/arrivals")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getTodaysArrivals() {
        List<BookingResponse> arrivals = frontDeskService.getTodaysArrivals();
        return ResponseEntity.ok(arrivals);
    }
    
    /**
     * Get today's departures
     */
    @GetMapping("/departures")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getTodaysDepartures() {
        List<BookingResponse> departures = frontDeskService.getTodaysDepartures();
        return ResponseEntity.ok(departures);
    }
    
    /**
     * Get all current guests (checked in)
     */
    @GetMapping("/current-guests")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<BookingResponse>> getCurrentGuests() {
        List<BookingResponse> currentGuests = frontDeskService.getCurrentGuests();
        return ResponseEntity.ok(currentGuests);
    }
    
    /**
     * Check in a guest
     */
    @PutMapping("/checkin/{reservationId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<BookingResponse> checkInGuest(@PathVariable Long reservationId) {
        BookingResponse response = frontDeskService.checkInGuest(reservationId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check out a guest
     */
    @PutMapping("/checkout/{reservationId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<BookingResponse> checkOutGuest(@PathVariable Long reservationId) {
        BookingResponse response = frontDeskService.checkOutGuest(reservationId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark guest as no-show
     */
    @PutMapping("/no-show/{reservationId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<BookingResponse> markNoShow(@PathVariable Long reservationId) {
        BookingResponse response = frontDeskService.markNoShow(reservationId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel booking
     */
    @PutMapping("/cancel/{reservationId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long reservationId,
            @RequestParam(required = false) String reason) {
        BookingResponse response = frontDeskService.cancelBooking(reservationId, reason);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Search bookings by various criteria
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<BookingResponse>> searchBookings(
            @RequestParam(required = false) String guestName,
            @RequestParam(required = false) String roomNumber,
            @RequestParam(required = false) String confirmationNumber,
            @RequestParam(required = false) LocalDate checkInDate,
            @RequestParam(required = false) ReservationStatus status) {
        
        List<BookingResponse> results = frontDeskService.searchBookings(
            guestName, roomNumber, confirmationNumber, checkInDate, status);
        return ResponseEntity.ok(results);
    }
    
    /**
     * Get front desk statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<FrontDeskStats> getFrontDeskStats() {
        FrontDeskStats stats = frontDeskService.getFrontDeskStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get hotel information for the front desk
     */
    @GetMapping("/hotel")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<HotelDTO> getHotelInfo() {
        HotelDTO hotel = frontDeskService.getHotelInfo();
        return ResponseEntity.ok(hotel);
    }

    /**
     * Get all rooms with pagination and filtering
     */
    @GetMapping("/rooms")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
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
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<RoomResponse> updateRoomStatus(
            @PathVariable Long roomId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        RoomResponse response = frontDeskService.updateRoomStatus(roomId, status, notes);
        return ResponseEntity.ok(response);
    }

    /**
     * Toggle room availability
     */
    @PutMapping("/rooms/{roomId}/availability")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<RoomResponse> toggleRoomAvailability(
            @PathVariable Long roomId,
            @RequestParam boolean available,
            @RequestParam(required = false) String reason) {
        RoomResponse response = frontDeskService.toggleRoomAvailability(roomId, available, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Toggle room availability (simple toggle without parameters)
     */
    @PostMapping("/rooms/{roomId}/toggle-availability")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<RoomResponse> toggleRoomAvailability(@PathVariable Long roomId) {
        RoomResponse response = frontDeskService.toggleRoomAvailability(roomId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get rooms for front desk operations
     */
    @GetMapping("/rooms")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Page<Map<String, Object>>> getRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String status) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("roomNumber").ascending());
        Page<Map<String, Object>> rooms = frontDeskService.getRooms(pageable, search, roomType, status);
        return ResponseEntity.ok(rooms);
    }
    
    /**
     * Update room status for housekeeping operations
     */
    @PutMapping("/rooms/{roomId}/status")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateRoomStatus(
            @PathVariable Long roomId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        
        Map<String, Object> updatedRoom = frontDeskService.updateRoomStatus(roomId, status, notes);
        return ResponseEntity.ok(updatedRoom);
    }
    
    /**
     * Get room details by ID
     */
    @GetMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('FRONT_DESK') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getRoomById(@PathVariable Long roomId) {
        Map<String, Object> room = frontDeskService.getRoomById(roomId);
        return ResponseEntity.ok(room);
    }
    
    /**
     * Inner class for front desk statistics
     */
    public static class FrontDeskStats {
        private long todaysArrivals;
        private long todaysDepartures;
        private long currentOccupancy;
        private long availableRooms;
        private long roomsOutOfOrder;
        private long roomsUnderMaintenance;
        
        // Constructors
        public FrontDeskStats() {}
        
        public FrontDeskStats(long todaysArrivals, long todaysDepartures, 
                             long currentOccupancy, long availableRooms,
                             long roomsOutOfOrder, long roomsUnderMaintenance) {
            this.todaysArrivals = todaysArrivals;
            this.todaysDepartures = todaysDepartures;
            this.currentOccupancy = currentOccupancy;
            this.availableRooms = availableRooms;
            this.roomsOutOfOrder = roomsOutOfOrder;
            this.roomsUnderMaintenance = roomsUnderMaintenance;
        }
        
        // Getters and Setters
        public long getTodaysArrivals() { return todaysArrivals; }
        public void setTodaysArrivals(long todaysArrivals) { this.todaysArrivals = todaysArrivals; }
        
        public long getTodaysDepartures() { return todaysDepartures; }
        public void setTodaysDepartures(long todaysDepartures) { this.todaysDepartures = todaysDepartures; }
        
        public long getCurrentOccupancy() { return currentOccupancy; }
        public void setCurrentOccupancy(long currentOccupancy) { this.currentOccupancy = currentOccupancy; }
        
        public long getAvailableRooms() { return availableRooms; }
        public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }
        
        public long getRoomsOutOfOrder() { return roomsOutOfOrder; }
        public void setRoomsOutOfOrder(long roomsOutOfOrder) { this.roomsOutOfOrder = roomsOutOfOrder; }
        
        public long getRoomsUnderMaintenance() { return roomsUnderMaintenance; }
        public void setRoomsUnderMaintenance(long roomsUnderMaintenance) { this.roomsUnderMaintenance = roomsUnderMaintenance; }
    }
}
