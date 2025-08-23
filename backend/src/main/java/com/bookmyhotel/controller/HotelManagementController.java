package com.bookmyhotel.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.service.HotelManagementService;
import com.bookmyhotel.tenant.TenantContext;

/**
 * REST controller for hotel management operations (internal/authenticated)
 * Provides hotel data for admin interfaces and management functions
 */
@RestController
@RequestMapping("/api/hotels-mgmt")
@CrossOrigin(origins = "*")
public class HotelManagementController {

    @Autowired
    private HotelManagementService hotelManagementService;

    /**
     * Get all hotels for dropdown/selection purposes
     * Returns simple hotel information (id, name) for the current tenant
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONT_DESK')")
    public ResponseEntity<List<HotelResponse>> getAllHotels() {
        try {
            String tenantId = TenantContext.getTenantId();
            
            if (tenantId == null) {
                throw new IllegalStateException("Tenant context is not set");
            }
            
            List<HotelDTO> hotels = hotelManagementService.getHotelsByTenantForDropdown(tenantId);
            
            List<HotelResponse> response = hotels.stream()
                    .map(hotel -> new HotelResponse(hotel.getId(), hotel.getName()))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error in getAllHotels: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Simple response class for hotel dropdown
     */
    public static class HotelResponse {
        private Long id;
        private String name;

        public HotelResponse() {}

        public HotelResponse(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
