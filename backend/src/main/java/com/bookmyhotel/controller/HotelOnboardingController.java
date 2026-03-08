package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.HotelRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationResponse;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.service.HotelRegistrationService;

/**
 * Controller for hotel onboarding - allows newly registered hotel admins
 * to complete their hotel profile after initial registration.
 */
@RestController
@RequestMapping("/api/hotel-onboarding")
@PreAuthorize("hasRole('HOTEL_ADMIN')")
public class HotelOnboardingController {

    @Autowired
    private HotelRegistrationService registrationService;

    /**
     * Get the current registration data for onboarding (pre-fill the form)
     */
    @GetMapping("/registration")
    public ResponseEntity<HotelRegistrationResponse> getRegistrationData() {
        String email = getCurrentUserEmail();
        var registrations = registrationService.getRegistrationByEmail(email);
        if (registrations.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(registrations.get(0));
    }

    /**
     * Complete onboarding by updating registration with additional details
     */
    @PutMapping("/complete")
    public ResponseEntity<HotelRegistrationResponse> completeOnboarding(
            @RequestBody HotelRegistrationRequest request) {
        String email = getCurrentUserEmail();
        HotelRegistrationResponse response = registrationService.completeOnboarding(email, request);
        return ResponseEntity.ok(response);
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication.getPrincipal() instanceof User) {
            return ((User) authentication.getPrincipal()).getEmail();
        }
        return authentication.getName();
    }
}
