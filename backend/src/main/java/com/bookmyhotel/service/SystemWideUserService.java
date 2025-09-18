package com.bookmyhotel.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookmyhotel.dto.admin.UserManagementResponse;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for managing system-wide users (SYSTEM_ADMIN, ADMIN, GUEST, and
 * CUSTOMER)
 * These users are not bound to any specific tenant and have global access
 */
@Service
public class SystemWideUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Create a new system-wide ADMIN user
     */
    public User createSystemAdmin(String email, String password, String firstName, String lastName) {
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("User with email " + email + " already exists");
        }

        User admin = new User();
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setIsActive(true);
        admin.setRoles(Set.of(UserRole.ADMIN));
        // tenant_id remains null for system-wide users

        return userRepository.save(admin);
    }

    /**
     * Get all system-wide users (users not bound to any tenant/hotel)
     */
    public Page<User> getAllSystemWideUsers(Pageable pageable) {
        return userRepository.findByHotelIsNull(pageable);
    }

    /**
     * Get all users in the system (both system-wide and tenant users)
     */
    public Page<UserManagementResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToUserManagementResponse);
    }

    /**
     * Convert User entity to UserManagementResponse DTO
     */
    private UserManagementResponse convertToUserManagementResponse(User user) {
        UserManagementResponse response = new UserManagementResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setIsActive(user.getIsActive());
        response.setTenantId(user.getTenantId());
        response.setRoles(user.getRoles());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    /**
     * Get system-wide users by role
     */
    public List<User> getSystemWideUsersByRole(UserRole role) {
        return userRepository.findSystemWideUsersByRole(role);
    }

    /**
     * Get all GUEST users (system-wide)
     */
    public List<User> getAllGuestUsers() {
        return userRepository.findSystemWideUsersByRole(UserRole.CUSTOMER);
    }

    /**
     * Get all ADMIN users (system-wide)
     */
    public List<User> getAllAdminUsers() {
        return userRepository.findSystemWideUsersByRole(UserRole.ADMIN);
    }

    /**
     * Find system-wide user by email
     */
    public Optional<User> findSystemWideUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().isSystemWideUser()) {
            return userOpt;
        }
        return Optional.empty();
    }

    /**
     * Check if a user is system-wide based on email
     */
    public boolean isSystemWideUser(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        return userOpt.isPresent() && userOpt.get().isSystemWideUser();
    }

    /**
     * Promote a user to system admin (removes tenant binding)
     */
    public User promoteToSystemAdmin(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        User user = userOpt.get();

        // Only system-wide users can be promoted to system admin
        if (user.isTenantBoundUser()) {
            throw new IllegalArgumentException("Cannot promote tenant-bound user to system admin");
        }

        user.setRoles(Set.of(UserRole.ADMIN));
        user.setHotel(null); // Remove hotel association

        return userRepository.save(user);
    }

    /**
     * Demote a system admin to regular guest user
     */
    public User demoteFromSystemAdmin(Long userId, String tenantId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        User user = userOpt.get();
        if (!user.getRoles().contains(UserRole.ADMIN)) {
            throw new IllegalArgumentException("User is not a system admin");
        }

        user.setRoles(Set.of(UserRole.CUSTOMER));
        // For tenant binding, this would need to be handled through hotel relationships
        // in a proper multi-tenant architecture

        return userRepository.save(user);
    }
}
