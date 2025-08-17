package com.bookmyhotel.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.service.HotelManagementService;

import jakarta.validation.Valid;

/**
 * Admin controller for hotel management
 */
@RestController
@RequestMapping("/api/admin/hotels")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HotelManagementAdminController {
    
    @Autowired
    private HotelManagementService hotelManagementService;
    
    /**
     * Get all hotels with pagination
     */
    @GetMapping
    public ResponseEntity<Page<HotelDTO>> getAllHotels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelDTO> hotels = hotelManagementService.getAllHotels(pageable);
        return ResponseEntity.ok(hotels);
    }
    
    /**
     * Search hotels
     */
    @GetMapping("/search")
    public ResponseEntity<Page<HotelDTO>> searchHotels(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelDTO> hotels = hotelManagementService.searchHotels(searchTerm, pageable);
        return ResponseEntity.ok(hotels);
    }
    
    /**
     * Get hotels by tenant
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<Page<HotelDTO>> getHotelsByTenant(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelDTO> hotels = hotelManagementService.getHotelsByTenant(tenantId, pageable);
        return ResponseEntity.ok(hotels);
    }
    
    /**
     * Get hotel by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable Long id) {
        HotelDTO hotel = hotelManagementService.getHotelById(id);
        return ResponseEntity.ok(hotel);
    }
    
    /**
     * Create new hotel
     */
    @PostMapping
    public ResponseEntity<HotelDTO> createHotel(@Valid @RequestBody HotelDTO hotelDTO) {
        HotelDTO createdHotel = hotelManagementService.createHotel(hotelDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHotel);
    }
    
    /**
     * Update hotel
     */
    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelDTO hotelDTO) {
        
        HotelDTO updatedHotel = hotelManagementService.updateHotel(id, hotelDTO);
        return ResponseEntity.ok(updatedHotel);
    }
    
    /**
     * Delete hotel
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelManagementService.deleteHotel(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Toggle hotel status
     */
    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<HotelDTO> toggleHotelStatus(@PathVariable Long id) {
        HotelDTO hotel = hotelManagementService.toggleHotelStatus(id);
        return ResponseEntity.ok(hotel);
    }
    
    /**
     * Get rooms for a hotel
     */
    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<RoomDTO>> getHotelRooms(@PathVariable Long id) {
        List<RoomDTO> rooms = hotelManagementService.getHotelRooms(id);
        return ResponseEntity.ok(rooms);
    }
    
    /**
     * Add room to hotel
     */
    @PostMapping("/{id}/rooms")
    public ResponseEntity<RoomDTO> addRoomToHotel(
            @PathVariable Long id,
            @Valid @RequestBody RoomDTO roomDTO) {
        
        RoomDTO createdRoom = hotelManagementService.addRoomToHotel(id, roomDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
    }
    
    /**
     * Update room
     */
    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDTO> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomDTO roomDTO) {
        
        RoomDTO updatedRoom = hotelManagementService.updateRoom(roomId, roomDTO);
        return ResponseEntity.ok(updatedRoom);
    }
    
    /**
     * Delete room
     */
    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId) {
        hotelManagementService.deleteRoom(roomId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Assign hotel admin to hotel
     */
    @PostMapping("/{hotelId}/assign-admin/{userId}")
    public ResponseEntity<HotelDTO> assignHotelAdmin(
            @PathVariable Long hotelId,
            @PathVariable Long userId) {
        
        HotelDTO hotel = hotelManagementService.assignHotelAdmin(hotelId, userId);
        return ResponseEntity.ok(hotel);
    }
    
    /**
     * Get hotel statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<HotelManagementService.HotelStatistics> getHotelStatistics() {
        HotelManagementService.HotelStatistics stats = hotelManagementService.getHotelStatistics();
        return ResponseEntity.ok(stats);
    }
}
