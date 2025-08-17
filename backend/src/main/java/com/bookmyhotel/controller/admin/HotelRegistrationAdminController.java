package com.bookmyhotel.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.ApproveRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationResponse;
import com.bookmyhotel.dto.admin.RejectRegistrationRequest;
import com.bookmyhotel.entity.RegistrationStatus;
import com.bookmyhotel.service.HotelRegistrationService;

import jakarta.validation.Valid;

/**
 * Admin controller for hotel registration management
 */
@RestController
@RequestMapping("/api/admin/hotel-registrations")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HotelRegistrationAdminController {
    
    @Autowired
    private HotelRegistrationService registrationService;
    
    /**
     * Submit new hotel registration
     */
    @PostMapping
    public ResponseEntity<HotelRegistrationResponse> submitRegistration(@Valid @RequestBody HotelRegistrationRequest request) {
        try {
            HotelRegistrationResponse response = registrationService.submitRegistration(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all registrations with pagination
     */
    @GetMapping
    public ResponseEntity<Page<HotelRegistrationResponse>> getAllRegistrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelRegistrationResponse> registrations = registrationService.getAllRegistrations(pageable);
        return ResponseEntity.ok(registrations);
    }
    
    /**
     * Get registrations by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<HotelRegistrationResponse>> getRegistrationsByStatus(
            @PathVariable RegistrationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelRegistrationResponse> registrations = registrationService.getRegistrationsByStatus(status, pageable);
        return ResponseEntity.ok(registrations);
    }
    
    /**
     * Get pending registrations
     */
    @GetMapping("/pending")
    public ResponseEntity<List<HotelRegistrationResponse>> getPendingRegistrations() {
        List<HotelRegistrationResponse> registrations = registrationService.getPendingRegistrations();
        return ResponseEntity.ok(registrations);
    }
    
    /**
     * Search registrations
     */
    @GetMapping("/search")
    public ResponseEntity<Page<HotelRegistrationResponse>> searchRegistrations(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<HotelRegistrationResponse> registrations = registrationService.searchRegistrations(searchTerm, pageable);
        return ResponseEntity.ok(registrations);
    }
    
    /**
     * Get registration by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HotelRegistrationResponse> getRegistrationById(@PathVariable Long id) {
        try {
            HotelRegistrationResponse registration = registrationService.getRegistrationById(id);
            return ResponseEntity.ok(registration);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Approve hotel registration
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<HotelRegistrationResponse> approveRegistration(
            @PathVariable Long id,
            @Valid @RequestBody ApproveRegistrationRequest request,
            Authentication authentication) {
        
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // In a real application, you would get the user ID from the authentication
            Long reviewerId = 1L; // Placeholder - should be extracted from authenticated user
            
            HotelRegistrationResponse response = registrationService.approveRegistration(id, request, reviewerId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Reject hotel registration
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<HotelRegistrationResponse> rejectRegistration(
            @PathVariable Long id,
            @Valid @RequestBody RejectRegistrationRequest request,
            Authentication authentication) {
        
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // In a real application, you would get the user ID from the authentication
            Long reviewerId = 1L; // Placeholder - should be extracted from authenticated user
            
            HotelRegistrationResponse response = registrationService.rejectRegistration(id, request, reviewerId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Mark registration as under review
     */
    @PostMapping("/{id}/under-review")
    public ResponseEntity<HotelRegistrationResponse> markUnderReview(
            @PathVariable Long id,
            Authentication authentication) {
        
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            // In a real application, you would get the user ID from the authentication
            Long reviewerId = 1L; // Placeholder - should be extracted from authenticated user
            
            HotelRegistrationResponse response = registrationService.markUnderReview(id, reviewerId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get registration statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<HotelRegistrationService.RegistrationStatistics> getRegistrationStatistics() {
        HotelRegistrationService.RegistrationStatistics stats = registrationService.getRegistrationStatistics();
        return ResponseEntity.ok(stats);
    }
}
