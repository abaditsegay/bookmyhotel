package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.user.ChangePasswordRequest;
import com.bookmyhotel.dto.user.UpdateProfileRequest;
import com.bookmyhotel.dto.user.UserProfileResponse;
import com.bookmyhotel.service.UserProfileService;

import jakarta.validation.Valid;

/**
 * Controller for user profile management
 * Allows users to view and update their own profiles and change passwords
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserProfileService userProfileService;

    /**
     * Get user profile information
     * Users can only access their own profile
     */
    @GetMapping("/{userId}/profile")
    @PreAuthorize("@userProfileService.canAccessProfile(#userId, authentication)")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable Long userId,
            Authentication authentication) {
        
        UserProfileResponse profile = userProfileService.getUserProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * Update user profile information
     * Users can only update their own profile
     */
    @PutMapping("/{userId}/profile")
    @PreAuthorize("@userProfileService.canAccessProfile(#userId, authentication)")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        
        UserProfileResponse updatedProfile = userProfileService.updateUserProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    /**
     * Change user password
     * Users can only change their own password
     */
    @PutMapping("/{userId}/password")
    @PreAuthorize("@userProfileService.canAccessProfile(#userId, authentication)")
    public ResponseEntity<String> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        
        userProfileService.changePassword(userId, request);
        return ResponseEntity.ok("Password changed successfully");
    }
}
