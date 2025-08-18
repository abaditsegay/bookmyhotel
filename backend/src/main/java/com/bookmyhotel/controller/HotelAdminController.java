package com.bookmyhotel.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.dto.UserDTO;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.service.HotelAdminService;

import jakarta.validation.Valid;

/**
 * REST Controller for hotel admin operations
 */
@RestController
@RequestMapping("/api/hotel-admin")
@PreAuthorize("hasRole('HOTEL_ADMIN')")
public class HotelAdminController {

    @Autowired
    private HotelAdminService hotelAdminService;

    // Hotel Management
    @GetMapping("/hotel")
    public ResponseEntity<HotelDTO> getMyHotel(Authentication auth) {
        return ResponseEntity.ok(hotelAdminService.getMyHotel(auth.getName()));
    }

    @PutMapping("/hotel")
    public ResponseEntity<HotelDTO> updateMyHotel(@Valid @RequestBody HotelDTO hotelDTO, Authentication auth) {
        HotelDTO updated = hotelAdminService.updateMyHotel(hotelDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // Staff Management - Hotel admin can manage frontdesk, housekeeping, and other hotel_admin users
    @GetMapping("/staff")
    public ResponseEntity<Page<UserDTO>> getHotelStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            Authentication auth) {
        Page<UserDTO> staff = hotelAdminService.getHotelStaff(auth.getName(), page, size, search, role);
        return ResponseEntity.ok(staff);
    }

    @PostMapping("/staff")
    public ResponseEntity<UserDTO> addStaffMember(@Valid @RequestBody UserDTO userDTO, Authentication auth) {
        UserDTO newStaff = hotelAdminService.addStaffMember(userDTO, auth.getName());
        return ResponseEntity.ok(newStaff);
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<UserDTO> getStaffMemberById(@PathVariable Long staffId, Authentication auth) {
        UserDTO staff = hotelAdminService.getStaffMemberById(staffId, auth.getName());
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/staff/{staffId}")
    public ResponseEntity<UserDTO> updateStaffMember(
            @PathVariable Long staffId,
            @Valid @RequestBody UserDTO userDTO,
            Authentication auth) {
        UserDTO updated = hotelAdminService.updateStaffMember(staffId, userDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/staff/{staffId}")
    public ResponseEntity<Void> removeStaffMember(@PathVariable Long staffId, Authentication auth) {
        hotelAdminService.removeStaffMember(staffId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/staff/{staffId}/activate")
    public ResponseEntity<UserDTO> activateStaffMember(@PathVariable Long staffId, Authentication auth) {
        UserDTO updated = hotelAdminService.toggleStaffStatus(staffId, true, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/staff/{staffId}/deactivate")
    public ResponseEntity<UserDTO> deactivateStaffMember(@PathVariable Long staffId, Authentication auth) {
        UserDTO updated = hotelAdminService.toggleStaffStatus(staffId, false, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // Room Management
    @GetMapping("/rooms")
    public ResponseEntity<Page<RoomDTO>> getHotelRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) Boolean available,
            Authentication auth) {
        Page<RoomDTO> rooms = hotelAdminService.getHotelRooms(auth.getName(), page, size, search, roomType, available);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDTO> addRoom(@Valid @RequestBody RoomDTO roomDTO, Authentication auth) {
        RoomDTO newRoom = hotelAdminService.addRoom(roomDTO, auth.getName());
        return ResponseEntity.ok(newRoom);
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long roomId, Authentication auth) {
        RoomDTO room = hotelAdminService.getRoomById(roomId, auth.getName());
        return ResponseEntity.ok(room);
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDTO> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomDTO roomDTO,
            Authentication auth) {
        RoomDTO updated = hotelAdminService.updateRoom(roomId, roomDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId, Authentication auth) {
        hotelAdminService.deleteRoom(roomId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/rooms/{roomId}/availability")
    public ResponseEntity<RoomDTO> toggleRoomAvailability(
            @PathVariable Long roomId,
            @RequestParam Boolean available,
            Authentication auth) {
        RoomDTO updated = hotelAdminService.toggleRoomAvailability(roomId, available, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // Statistics for hotel admin dashboard
    @GetMapping("/statistics")
    public ResponseEntity<?> getHotelStatistics(Authentication auth) {
        return ResponseEntity.ok(hotelAdminService.getHotelStatistics(auth.getName()));
    }

    // ===========================
    // BOOKING MANAGEMENT ENDPOINTS
    // ===========================

    /**
     * Get all bookings for the hotel admin's hotel
     */
    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getHotelBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication auth) {
        
        // First get the hotel ID from the authenticated user
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        Page<BookingResponse> bookings = hotelAdminService.getHotelBookings(hotel.getId(), page, size, search);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking by reservation ID
     */
    @GetMapping("/bookings/{reservationId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long reservationId,
            Authentication auth) {
        
        // First get the hotel ID from the authenticated user
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        BookingResponse booking = hotelAdminService.getBookingById(reservationId, hotel.getId());
        return ResponseEntity.ok(booking);
    }

    /**
     * Get booking statistics for the hotel
     */
    @GetMapping("/bookings/statistics")
    public ResponseEntity<Map<String, Object>> getHotelBookingStats(Authentication auth) {
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        Map<String, Object> stats = hotelAdminService.getHotelBookingStats(hotel.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Update booking status
     */
    @PutMapping("/bookings/{reservationId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long reservationId,
            @RequestParam ReservationStatus status,
            Authentication auth) {
        
        // Verify the reservation belongs to the hotel admin's hotel
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        BookingResponse updated = hotelAdminService.updateBookingStatus(reservationId, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete booking
     */
    @DeleteMapping("/bookings/{reservationId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long reservationId,
            Authentication auth) {
        
        // Get the hotel ID from the authenticated user
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        hotelAdminService.deleteBooking(reservationId, hotel.getId());
        return ResponseEntity.noContent().build();
    }
}
