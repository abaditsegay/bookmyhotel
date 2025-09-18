package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.HotelSearchRequest;
import com.bookmyhotel.dto.HotelSearchResult;
import com.bookmyhotel.service.HotelSearchService;

import jakarta.validation.Valid;

/**
 * Hotel search controller - Public endpoints for hotel discovery and booking
 * Provides public access to hotel search, details, and room availability
 * Used by anonymous guests and the booking system
 */
@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelSearchController {

    @Autowired
    private HotelSearchService hotelSearchService;

    /**
     * Search hotels based on criteria - PUBLIC ENDPOINT
     * Shows hotels from ALL tenants for anonymous users
     */
    @PostMapping("/search")
    public ResponseEntity<List<HotelSearchResult>> searchHotels(
            @Valid @RequestBody HotelSearchRequest request) {

        List<HotelSearchResult> results = hotelSearchService.searchHotels(request);
        return ResponseEntity.ok(results);
    }

    /**
     * Get hotel details by ID - PUBLIC ENDPOINT
     */
    @GetMapping("/{hotelId}")
    public ResponseEntity<HotelSearchResult> getHotelDetails(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String checkInDate,
            @RequestParam(required = false) String checkOutDate,
            @RequestParam(defaultValue = "1") Integer guests) {

        // Create search request for available rooms
        HotelSearchRequest request = new HotelSearchRequest();
        request.setLocation(location);
        request.setGuests(guests);

        // Parse dates if provided
        if (checkInDate != null && checkOutDate != null) {
            try {
                request.setCheckInDate(java.time.LocalDate.parse(checkInDate));
                request.setCheckOutDate(java.time.LocalDate.parse(checkOutDate));
            } catch (Exception e) {
                // Use default dates if parsing fails
                request.setCheckInDate(java.time.LocalDate.now().plusDays(1));
                request.setCheckOutDate(java.time.LocalDate.now().plusDays(2));
            }
        } else {
            // Default dates
            request.setCheckInDate(java.time.LocalDate.now().plusDays(1));
            request.setCheckOutDate(java.time.LocalDate.now().plusDays(2));
        }

        HotelSearchResult result = hotelSearchService.getHotelDetails(hotelId, request);
        return ResponseEntity.ok(result);
    }

    /**
     * Get available rooms for a hotel - PUBLIC ENDPOINT
     */
    @GetMapping("/{hotelId}/rooms")
    public ResponseEntity<List<HotelSearchResult.AvailableRoomDto>> getAvailableRooms(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String checkInDate,
            @RequestParam(required = false) String checkOutDate,
            @RequestParam(defaultValue = "1") Integer guests,
            @RequestParam(required = false) String roomType) {

        // Create search request
        HotelSearchRequest request = new HotelSearchRequest();
        request.setLocation(location);
        request.setGuests(guests);
        request.setRoomType(roomType);

        // Parse dates if provided
        if (checkInDate != null && checkOutDate != null) {
            try {
                request.setCheckInDate(java.time.LocalDate.parse(checkInDate));
                request.setCheckOutDate(java.time.LocalDate.parse(checkOutDate));
            } catch (Exception e) {
                // Use default dates if parsing fails
                request.setCheckInDate(java.time.LocalDate.now().plusDays(1));
                request.setCheckOutDate(java.time.LocalDate.now().plusDays(2));
            }
        } else {
            // Default dates
            request.setCheckInDate(java.time.LocalDate.now().plusDays(1));
            request.setCheckOutDate(java.time.LocalDate.now().plusDays(2));
        }

        List<HotelSearchResult.AvailableRoomDto> rooms = hotelSearchService.getAvailableRooms(hotelId, request);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Get all hotels - PUBLIC ENDPOINT
     */
    @GetMapping
    public ResponseEntity<List<HotelSearchResult>> getAllHotels() {
        List<HotelSearchResult> hotels = hotelSearchService.getRandomHotels(); // Reuse random hotels for now
        return ResponseEntity.ok(hotels);
    }

    /**
     * Get random hotels for advertisement display - PUBLIC ENDPOINT
     */
    @GetMapping("/random")
    public ResponseEntity<List<HotelSearchResult>> getRandomHotels() {
        List<HotelSearchResult> randomHotels = hotelSearchService.getRandomHotels();
        return ResponseEntity.ok(randomHotels);
    }
}
