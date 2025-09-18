package com.bookmyhotel.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.admin.CreateUserRequest;
import com.bookmyhotel.dto.admin.UpdateUserRequest;
import com.bookmyhotel.dto.admin.UserManagementResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for user management by admin
 */
@Service
@Transactional
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users with pagination
     */
    public Page<UserManagementResponse> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Search users by email, first name, or last name
     */
    public Page<UserManagementResponse> searchUsers(String searchTerm, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(searchTerm, pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Get users by role
     */
    public List<UserManagementResponse> getUsersByRole(UserRole role) {
        List<User> users = userRepository.findByRolesContaining(role);
        return users.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get users by hotel
     */
    public Page<UserManagementResponse> getUsersByHotel(Long hotelId, Pageable pageable) {
        Page<User> users = userRepository.findByHotelId(hotelId, pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Get users by tenant (for backward compatibility and admin operations)
     */
    public Page<UserManagementResponse> getUsersByTenant(String tenantId, Pageable pageable) {
        Page<User> users = userRepository.findByTenantId(tenantId, pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Get user by ID
     */
    public UserManagementResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return convertToResponse(user);
    }

    /**
     * Create a new user
     */
    public UserManagementResponse createUser(CreateUserRequest request) {
        // Check if email already exists
        java.util.Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Check if user has system-wide roles (SYSTEM_ADMIN, ADMIN, GUEST, CUSTOMER)
        boolean hasSystemWideRole = request.getRoles().stream()
                .anyMatch(role -> role == UserRole.SYSTEM_ADMIN ||
                        role == UserRole.ADMIN ||
                        role == UserRole.GUEST ||
                        role == UserRole.CUSTOMER);

        // If user has system-wide roles, ensure no tenant assignment
        if (hasSystemWideRole) {
            request.setTenantId(null); // System-wide users should not have tenant assignments
        }

        // If creating a HOTEL_ADMIN, validate hotel assignment
        if (request.getRoles().contains(UserRole.HOTEL_ADMIN)) {
            if (request.getHotelId() == null) {
                throw new RuntimeException("Hotel assignment is required for HOTEL_ADMIN users");
            }

            // Verify the hotel exists
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + request.getHotelId()));

            // If tenantId is not provided, use the hotel's tenant
            if (request.getTenantId() == null || request.getTenantId().trim().isEmpty()) {
                request.setTenantId(hotel.getTenantId());
            }
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(request.getRoles());
        user.setIsActive(true); // New users are active by default

        // Set hotel for HOTEL_ADMIN users (only if they are not system-wide)
        if (request.getRoles().contains(UserRole.HOTEL_ADMIN) && !hasSystemWideRole && request.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(request.getHotelId()).orElse(null);
            user.setHotel(hotel);
        }

        user = userRepository.save(user);

        return convertToResponse(user);
    }

    /**
     * Update user information
     */
    public UserManagementResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if email is already taken by another user
        if (!user.getEmail().equals(request.getEmail())) {
            java.util.Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                throw new RuntimeException("Email already exists: " + request.getEmail());
            }
        }

        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(request.getIsActive());
        user.setRoles(request.getRoles());

        user = userRepository.save(user);

        return convertToResponse(user);
    }

    /**
     * Activate or deactivate user
     */
    public UserManagementResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(!user.getIsActive());
        user = userRepository.save(user);

        return convertToResponse(user);
    }

    /**
     * Add role to user
     */
    public UserManagementResponse addRoleToUser(Long userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Set<UserRole> roles = user.getRoles();
        roles.add(role);
        user.setRoles(roles);

        user = userRepository.save(user);

        return convertToResponse(user);
    }

    /**
     * Remove role from user
     */
    public UserManagementResponse removeRoleFromUser(Long userId, UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Set<UserRole> roles = user.getRoles();
        roles.remove(role);
        user.setRoles(roles);

        user = userRepository.save(user);

        return convertToResponse(user);
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Reset user password
     */
    public void resetUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Get user statistics
     */
    public UserStatistics getUserStatistics() {
        UserStatistics stats = new UserStatistics();
        stats.setTotal(userRepository.count());
        stats.setActive(userRepository.countByIsActive(true));
        stats.setInactive(userRepository.countByIsActive(false));

        for (UserRole role : UserRole.values()) {
            long count = userRepository.countByRolesContaining(role);
            stats.getRoleCounts().put(role.name(), count);
        }

        return stats;
    }

    /**
     * Convert entity to response DTO
     */
    private UserManagementResponse convertToResponse(User user) {
        UserManagementResponse response = new UserManagementResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setIsActive(user.getIsActive());
        response.setRoles(user.getRoles());
        response.setTenantId(user.getTenantId());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    /**
     * Inner class for user statistics
     */
    public static class UserStatistics {
        private long total;
        private long active;
        private long inactive;
        private java.util.Map<String, Long> roleCounts = new java.util.HashMap<>();

        // Getters and Setters
        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public long getActive() {
            return active;
        }

        public void setActive(long active) {
            this.active = active;
        }

        public long getInactive() {
            return inactive;
        }

        public void setInactive(long inactive) {
            this.inactive = inactive;
        }

        public java.util.Map<String, Long> getRoleCounts() {
            return roleCounts;
        }

        public void setRoleCounts(java.util.Map<String, Long> roleCounts) {
            this.roleCounts = roleCounts;
        }
    }
}
