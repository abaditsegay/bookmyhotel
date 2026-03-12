package com.bookmyhotel.service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.bookmyhotel.dto.admin.CreateUserRequest;
import com.bookmyhotel.dto.admin.UpdateUserRequest;
import com.bookmyhotel.dto.admin.UserManagementResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.security.RolePermissions;

/**
 * Service for user management by admin
 */
@Service
@Transactional
public class UserManagementService {

    private static final Logger logger = LoggerFactory.getLogger(UserManagementService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    @Autowired
    private MicrosoftGraphEmailService microsoftGraphEmailService;

    @Autowired
    @Qualifier("emailTemplateEngine")
    private TemplateEngine templateEngine;

    @Value("${app.email.from:noreply@shegersolutions.com}")
    private String fromEmail;

    @Value("${app.name:BookMyHotel}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Get all users with pagination.
     * ADMIN callers never see SUPER_ADMIN users.
     */
    public Page<UserManagementResponse> getAllUsers(Pageable pageable) {
        Page<User> users = isCallerAdminOnly()
                ? userRepository.findAllExcludingRole(UserRole.SUPER_ADMIN, pageable)
                : userRepository.findAll(pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Search users by email, first name, or last name.
     * ADMIN callers never see SUPER_ADMIN users.
     */
    public Page<UserManagementResponse> searchUsers(String searchTerm, Pageable pageable) {
        Page<User> users = isCallerAdminOnly()
                ? userRepository.searchUsersExcludingRole(searchTerm, UserRole.SUPER_ADMIN, pageable)
                : userRepository.searchUsers(searchTerm, pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Get users by role.
     * ADMIN callers cannot request SUPER_ADMIN — returns empty list.
     */
    public List<UserManagementResponse> getUsersByRole(UserRole role) {
        if (isCallerAdminOnly() && role == UserRole.SUPER_ADMIN) {
            return List.of();
        }
        List<User> users = userRepository.findByRolesContaining(role);
        return users.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get users by role with pagination.
     * ADMIN callers cannot request SUPER_ADMIN — returns empty page.
     */
    public Page<UserManagementResponse> getUsersByRolePaginated(UserRole role, Pageable pageable) {
        if (isCallerAdminOnly() && role == UserRole.SUPER_ADMIN) {
            return org.springframework.data.domain.Page.empty(pageable);
        }
        Page<User> users = userRepository.findByRolesContaining(role, pageable);
        return users.map(this::convertToResponse);
    }

    /**
     * Get users by status (active/inactive) with pagination.
     * ADMIN callers never see SUPER_ADMIN users.
     */
    public Page<UserManagementResponse> getUsersByStatus(boolean isActive, Pageable pageable) {
        Page<User> users = isCallerAdminOnly()
                ? userRepository.findByIsActiveExcludingRole(isActive, UserRole.SUPER_ADMIN, pageable)
                : userRepository.findByIsActive(isActive, pageable);
        return users.map(this::convertToResponse);
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
     * Get user by ID.
     * ADMIN callers cannot fetch a SUPER_ADMIN user.
     */
    public UserManagementResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        assertCanManageUser(user);
        return convertToResponse(user);
    }

    /**
     * Create a new user.
     *
     * Creator permission rules (enforced server-side):
     * - SUPER_ADMIN can create ADMIN and any hotel-scoped role
     * - ADMIN can create HOTEL_ADMIN and any hotel-scoped role (but NOT
     * SUPER_ADMIN)
     * - HOTEL_ADMIN can create roles within their hotel only
     * - OPERATIONAL_ADMIN can create HOUSEKEEPING and MAINTENANCE within their
     * hotel
     * - Lower roles cannot create any user
     */
    public UserManagementResponse createUser(CreateUserRequest request) {
        // Resolve calling user's roles
        UserRole callerHighestRole = getCallerHighestRole();

        // Validate that the caller may create EACH requested role
        if (callerHighestRole != null && request.getRoles() != null) {
            for (UserRole targetRole : request.getRoles()) {
                if (!RolePermissions.canCreate(callerHighestRole, targetRole)) {
                    throw new AccessDeniedException(
                            "Role " + callerHighestRole + " is not allowed to create users with role " + targetRole);
                }
            }
        }

        // Check if email already exists
        java.util.Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        // Determine scope of requested roles
        boolean hasGlobalRole = request.getRoles().stream().anyMatch(RolePermissions::isGlobal);
        boolean hasHotelScopedRole = request.getRoles().stream().anyMatch(RolePermissions::isHotelScoped);

        // Global roles must NOT be hotel-bound
        if (hasGlobalRole) {
            request.setTenantId(null);
            // Do not allow a hotel to be set for global roles
            if (request.getHotelId() != null) {
                throw new RuntimeException(
                        "Global roles (SUPER_ADMIN, ADMIN, CUSTOMER, GUEST) must not be assigned to a hotel");
            }
        }

        // Hotel-scoped roles MUST have a hotel assigned
        if (hasHotelScopedRole && !hasGlobalRole) {
            if (request.getHotelId() == null) {
                throw new RuntimeException(
                        "Hotel assignment is required for hotel-scoped roles (HOTEL_ADMIN, OPERATIONAL_ADMIN, FRONTDESK, HOUSEKEEPING, MAINTENANCE)");
            }

            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + request.getHotelId()));

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
        user.setIsActive(true);

        if (hasHotelScopedRole && !hasGlobalRole && request.getHotelId() != null) {
            Hotel hotel = hotelRepository.findById(request.getHotelId()).orElse(null);
            user.setHotel(hotel);
        }

        user = userRepository.save(user);
        return convertToResponse(user);
    }

    /**
     * Update user information.
     * Caller may only assign roles they are permitted to create, and may only
     * manage
     * users whose highest role is lower than or equal to their own.
     */
    public UserManagementResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserRole callerHighestRole = getCallerHighestRole();

        // Ensure the caller outranks (or equals) the target user's current roles
        if (callerHighestRole != null && user.getRoles() != null) {
            UserRole targetHighest = RolePermissions.highestRole(user.getRoles());
            if (targetHighest != null
                    && RolePermissions.levelOf(targetHighest) > RolePermissions.levelOf(callerHighestRole)) {
                throw new AccessDeniedException("You cannot modify a user with a higher role than your own");
            }
        }

        // Validate any new roles being assigned
        if (callerHighestRole != null && request.getRoles() != null) {
            for (UserRole targetRole : request.getRoles()) {
                if (!RolePermissions.canCreate(callerHighestRole, targetRole)) {
                    throw new AccessDeniedException(
                            "Role " + callerHighestRole + " is not allowed to assign role " + targetRole);
                }
            }
        }

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
     * Activate or deactivate user.
     * ADMIN callers cannot toggle a SUPER_ADMIN user.
     */
    public UserManagementResponse toggleUserStatus(Long userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        assertCanManageUser(user);

        boolean wasActive = user.getIsActive();
        user.setIsActive(!wasActive);
        user = userRepository.save(user);

        logger.info("User '{}' (ID: {}) {} by admin. Reason: {}",
                user.getEmail(), userId, wasActive ? "deactivated" : "activated", reason);

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
     * Delete user (soft delete by deactivating).
     * ADMIN callers cannot delete a SUPER_ADMIN user.
     */
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        assertCanManageUser(user);

        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Reset user password - generates a random password and emails it to the user.
     * ADMIN callers cannot reset a SUPER_ADMIN user's password.
     */
    public void resetUserPassword(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        assertCanManageUser(user);

        String randomPassword = generateRandomPassword(8);
        user.setPassword(passwordEncoder.encode(randomPassword));
        userRepository.save(user);

        sendPasswordResetNotification(user, randomPassword);
        logger.info("Admin reset password for user: {}", user.getEmail());
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(PASSWORD_CHARS.charAt(SECURE_RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private void sendPasswordResetNotification(User user, String newPassword) {
        if (!microsoftGraphEmailService.isConfigured()) {
            logger.warn("Email service not configured. Cannot send password notification to: {}", user.getEmail());
            return;
        }

        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("firstName", user.getFirstName());
            templateData.put("newPassword", newPassword);
            templateData.put("appName", appName);
            templateData.put("loginUrl", appUrl + "/login");

            Context context = new Context();
            context.setVariables(templateData);
            String htmlContent = templateEngine.process("admin-password-reset", context);

            String subject = appName + " - Your Password Has Been Reset";
            microsoftGraphEmailService.sendEmail(user.getEmail(), subject, htmlContent);
            logger.info("Password reset notification sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send password reset notification to: {}", user.getEmail(), e);
        }
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

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /**
     * Returns true when the calling user's highest role is ADMIN (not SUPER_ADMIN).
     * Used to apply SUPER_ADMIN visibility restrictions.
     */
    private boolean isCallerAdminOnly() {
        return getCallerHighestRole() == UserRole.ADMIN;
    }

    /**
     * Throws AccessDeniedException if the calling ADMIN tries to act on a
     * SUPER_ADMIN.
     */
    private void assertCanManageUser(User targetUser) {
        if (isCallerAdminOnly() && targetUser.getRoles() != null
                && targetUser.getRoles().contains(UserRole.SUPER_ADMIN)) {
            throw new AccessDeniedException("ADMIN cannot access or manage a SUPER_ADMIN user");
        }
    }

    /**
     * Resolves the highest-privilege role of the currently authenticated user.
     * Returns null when there is no authenticated user (e.g. in batch jobs).
     */
    private UserRole getCallerHighestRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return RolePermissions.highestRole(((User) principal).getRoles());
        }
        // Fallback: derive from GrantedAuthority strings
        return auth.getAuthorities().stream()
                .map(a -> {
                    String name = a.getAuthority().replace("ROLE_", "");
                    try {
                        return UserRole.valueOf(name);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .max((a, b) -> Integer.compare(RolePermissions.levelOf(a), RolePermissions.levelOf(b)))
                .orElse(null);
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
