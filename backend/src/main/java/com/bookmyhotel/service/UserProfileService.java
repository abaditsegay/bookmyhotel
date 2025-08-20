package com.bookmyhotel.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.user.ChangePasswordRequest;
import com.bookmyhotel.dto.user.UpdateProfileRequest;
import com.bookmyhotel.dto.user.UserProfileResponse;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for user profile management
 * Handles user profile operations that users can perform on their own accounts
 */
@Service
@Transactional
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Check if the authenticated user can access the specified user profile
     * Users can only access their own profile, admins can access any profile
     */
    public boolean canAccessProfile(Long userId, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return false;
        }
        
        String userEmail = authentication.getName();
        
        // Check if user is admin (can access any profile)
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
        
        if (isAdmin) {
            return true;
        }
        
        // Check if the user is accessing their own profile
        Optional<User> currentUser = userRepository.findByEmail(userEmail);
        if (currentUser.isPresent()) {
            return currentUser.get().getId().equals(userId);
        }
        
        return false;
    }

    /**
     * Get user profile information
     */
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return convertToProfileResponse(user);
    }

    /**
     * Update user profile information
     */
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Check if email is already taken by another user
        if (request.getEmail() != null && !user.getEmail().equals(request.getEmail())) {
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        
        // Update fields only if they are provided
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        user = userRepository.save(user);
        
        return convertToProfileResponse(user);
    }

    /**
     * Change user password
     */
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Convert User entity to UserProfileResponse DTO
     */
    private UserProfileResponse convertToProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setRoles(user.getRoles());
        response.setTenantId(user.getTenantId());
        
        // Hotel information (if user is associated with a hotel)
        if (user.getHotel() != null) {
            response.setHotelId(user.getHotel().getId().toString());
            response.setHotelName(user.getHotel().getName());
        }
        
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLogin(user.getUpdatedAt()); // Use updatedAt as last login for now
        response.setIsActive(user.getIsActive());
        
        return response;
    }
}
