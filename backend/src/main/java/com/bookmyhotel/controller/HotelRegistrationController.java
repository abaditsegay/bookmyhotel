package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.HotelRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationResponse;
import com.bookmyhotel.service.HotelRegistrationService;

import jakarta.validation.Valid;

/**
 * Public controller for hotel registration - allows hotels to register themselves
 * This is separate from the admin controller to provide public access without authentication
 */
@RestController
@RequestMapping("/api/public/hotel-registration")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HotelRegistrationController {
    
    @Autowired
    private HotelRegistrationService registrationService;
    
    /**
     * Submit new hotel registration - PUBLIC ENDPOINT
     * Allows hotels to register themselves without requiring authentication
     */
    @PostMapping("/submit")
    public ResponseEntity<HotelRegistrationResponse> submitRegistration(
            @Valid @RequestBody HotelRegistrationRequest request) {
        try {
            HotelRegistrationResponse response = registrationService.submitRegistration(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            // Return more detailed error information for public endpoint
            return ResponseEntity.badRequest()
                    .header("Error-Message", e.getMessage())
                    .build();
        }
    }
    
    /**
     * Check registration status by email - PUBLIC ENDPOINT
     * Allows hotels to check the status of their registration using the email provided during registration
     */
    @GetMapping("/status")
    public ResponseEntity<HotelRegistrationResponse> getRegistrationStatus(
            @RequestParam String email) {
        try {
            // Find registration by contact email
            var registrations = registrationService.getRegistrationByEmail(email);
            if (registrations.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            // Return the most recent registration for this email
            HotelRegistrationResponse response = registrations.get(0);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .header("Error-Message", e.getMessage())
                    .build();
        }
    }
}
