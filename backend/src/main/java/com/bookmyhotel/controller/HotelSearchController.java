package com.bookmyhotel.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;

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
import com.bookmyhotel.service.HotelPricingConfigService;

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

    @Autowired
    private HotelPricingConfigService hotelPricingConfigService;

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

    /**
     * Get tax rate for a hotel - PUBLIC ENDPOINT
     * Returns the total tax rate (VAT + Service Tax + City Tax) with breakdown
     */
    @GetMapping("/{hotelId}/tax-rate")
    public ResponseEntity<Map<String, Object>> getHotelTaxRate(@PathVariable Long hotelId) {
        try {
            BigDecimal totalTaxRate = hotelPricingConfigService.getTotalTaxRate(hotelId);
            BigDecimal vatRate = hotelPricingConfigService.getVatRate(hotelId);
            BigDecimal serviceTaxRate = hotelPricingConfigService.getServiceTaxRate(hotelId);
            BigDecimal cityTaxRate = hotelPricingConfigService.getCityTaxRate(hotelId);

            if (vatRate == null) {
                vatRate = BigDecimal.ZERO;
            }
            if (serviceTaxRate == null) {
                serviceTaxRate = BigDecimal.ZERO;
            }
            if (cityTaxRate == null) {
                cityTaxRate = BigDecimal.ZERO;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("hotelId", hotelId);

            // Total tax
            response.put("taxRate", totalTaxRate); // As decimal (e.g., 0.20 for 20%)
            response.put("taxRatePercentage", totalTaxRate.multiply(new BigDecimal("100"))); // As percentage (e.g.,
                                                                                             // 20.00)

            // VAT breakdown
            response.put("vatRate", vatRate); // As decimal (e.g., 0.15 for 15%)
            response.put("vatRatePercentage", vatRate.multiply(new BigDecimal("100"))); // As percentage (e.g., 15.00)

            // Service tax breakdown
            response.put("serviceTaxRate", serviceTaxRate); // As decimal (e.g., 0.05 for 5%)
            response.put("serviceTaxRatePercentage", serviceTaxRate.multiply(new BigDecimal("100"))); // As percentage
                                                                                                      // (e.g., 5.00)

            // City tax breakdown
            response.put("cityTaxRate", cityTaxRate); // As decimal (e.g., 0.02 for 2%)
            response.put("cityTaxRatePercentage", cityTaxRate.multiply(new BigDecimal("100"))); // As percentage
                                                                                                // (e.g., 2.00)

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch tax rate");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
