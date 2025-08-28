package com.bookmyhotel.controller.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.admin.CreateUserRequest;
import com.bookmyhotel.dto.admin.UpdateUserRequest;
import com.bookmyhotel.dto.admin.UserManagementResponse;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.service.UserManagementService;

import jakarta.validation.Valid;

/**
 * Admin controller for user management
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserManagementAdminController {

    @Autowired
    private UserManagementService userManagementService;

    /**
     * Get all users with pagination
     */
    @GetMapping
    public ResponseEntity<Page<UserManagementResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserManagementResponse> users = userManagementService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Search users
     */
    @GetMapping("/search")
    public ResponseEntity<Page<UserManagementResponse>> searchUsers(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserManagementResponse> users = userManagementService.searchUsers(searchTerm, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by role
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserManagementResponse>> getUsersByRole(@PathVariable UserRole role) {
        List<UserManagementResponse> users = userManagementService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by tenant
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<Page<UserManagementResponse>> getUsersByTenant(
            @PathVariable String tenantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserManagementResponse> users = userManagementService.getUsersByTenant(tenantId, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserManagementResponse> getUserById(@PathVariable Long id) {
        UserManagementResponse user = userManagementService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Create a new user
     */
    @PostMapping
    public ResponseEntity<UserManagementResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserManagementResponse user = userManagementService.createUser(request);
        return ResponseEntity.ok(user);
    }

    /**
     * Update user
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserManagementResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {

        UserManagementResponse user = userManagementService.updateUser(id, request);
        return ResponseEntity.ok(user);
    }

    /**
     * Toggle user active status
     */
    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<UserManagementResponse> toggleUserStatus(@PathVariable Long id) {
        UserManagementResponse user = userManagementService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Add role to user
     */
    @PostMapping("/{id}/roles/{role}")
    public ResponseEntity<UserManagementResponse> addRoleToUser(
            @PathVariable Long id,
            @PathVariable UserRole role) {

        UserManagementResponse user = userManagementService.addRoleToUser(id, role);
        return ResponseEntity.ok(user);
    }

    /**
     * Remove role from user
     */
    @DeleteMapping("/{id}/roles/{role}")
    public ResponseEntity<UserManagementResponse> removeRoleFromUser(
            @PathVariable Long id,
            @PathVariable UserRole role) {

        UserManagementResponse user = userManagementService.removeRoleFromUser(id, role);
        return ResponseEntity.ok(user);
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagementService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Reset user password
     */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetUserPassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {

        userManagementService.resetUserPassword(id, newPassword);
        return ResponseEntity.ok().build();
    }

    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<UserManagementService.UserStatistics> getUserStatistics() {
        UserManagementService.UserStatistics stats = userManagementService.getUserStatistics();
        return ResponseEntity.ok(stats);
    }
}
