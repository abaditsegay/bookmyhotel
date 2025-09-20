package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.RoomResponse;
import com.bookmyhotel.service.FrontDeskService;

/**
 * Unified Room Controller
 * Provides room endpoints that can be used by both hotel admin and front desk
 * users
 * Delegates to FrontDeskService which handles hotel-scoped data access
 */
@RestController
@RequestMapping("/api/rooms")
@PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'HOUSEKEEPING', 'OPERATIONS_SUPERVISOR')")
public class RoomController {

    @Autowired
    private FrontDeskService frontDeskService;

    /**
     * Get rooms with pagination for normal operations
     * Works for both hotel admin and front desk users
     */
    @GetMapping
    public ResponseEntity<Page<RoomResponse>> getRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String status) {

        try {
            // Create pageable with sorting by room number
            Pageable pageable = PageRequest.of(page, size, Sort.by("roomNumber"));

            // Use FrontDeskService which already handles hotel-scoped access
            Page<RoomResponse> rooms = frontDeskService.getAllRooms(pageable, search, roomType, status);

            return ResponseEntity.ok(rooms);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get ALL rooms for offline caching (no pagination)
     * Returns all rooms from the user's hotel for IndexedDB storage
     */
    @GetMapping("/all")
    public ResponseEntity<List<RoomResponse>> getAllRoomsForCaching() {

        try {
            // Use a large page size to get all rooms in one request
            Pageable pageable = PageRequest.of(0, 10000, Sort.by("roomNumber"));

            // Use FrontDeskService which already handles hotel-scoped access
            Page<RoomResponse> roomsPage = frontDeskService.getAllRooms(pageable, null, null, null);

            // Return just the content list (not the Page wrapper) for simpler client
            // processing
            return ResponseEntity.ok(roomsPage.getContent());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get a specific room by ID (must belong to user's hotel)
     */
    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long roomId) {

        try {
            // Use FrontDeskService which already handles hotel-scoped access and security
            RoomResponse room = frontDeskService.getRoomById(roomId);

            if (room == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(room);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available rooms for the user's hotel
     */
    @GetMapping("/available")
    public ResponseEntity<Page<RoomResponse>> getAvailableRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size,
            @RequestParam(required = false) String roomType) {

        try {
            // Create pageable with sorting by room number
            Pageable pageable = PageRequest.of(page, size, Sort.by("roomNumber"));

            // Use FrontDeskService to get available rooms only
            Page<RoomResponse> rooms = frontDeskService.getAllRooms(pageable, null, roomType, "AVAILABLE");

            return ResponseEntity.ok(rooms);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}