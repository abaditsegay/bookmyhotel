package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.SystemAdminRequest;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.service.SystemWideUserService;

/**
 * Controller for managing system-wide users (SYSTEM_ADMIN, ADMIN, GUEST, and
 * CUSTOMER roles)
 */
@RestController
@RequestMapping("/api/system-users")
public class SystemUserController {

    @Autowired
    private SystemWideUserService systemWideUserService;

    /**
     * Get all system-wide users (GUEST and ADMIN)
     * Only system admins can access this
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> getAllSystemUsers(Pageable pageable) {
        Page<User> users = systemWideUserService.getAllSystemWideUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Get all GUEST users
     * Only system admins can access this
     */
    @GetMapping("/guests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllGuestUsers() {
        List<User> guests = systemWideUserService.getAllGuestUsers();
        return ResponseEntity.ok(guests);
    }

    /**
     * Get all system admins
     * Only system admins can access this
     */
    @GetMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllSystemAdmins() {
        List<User> admins = systemWideUserService.getAllAdminUsers();
        return ResponseEntity.ok(admins);
    }

    /**
     * Create a new system admin
     * Only existing system admins can create new ones
     */
    @PostMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createSystemAdmin(@RequestBody SystemAdminRequest request) {
        try {
            User admin = systemWideUserService.createSystemAdmin(
                    request.getEmail(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getPassword());
            return ResponseEntity.ok(admin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Promote a user to system admin
     * Only existing system admins can promote users
     */
    @PostMapping("/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> promoteToSystemAdmin(@RequestParam Long userId) {
        try {
            User admin = systemWideUserService.promoteToSystemAdmin(userId);
            return ResponseEntity.ok(admin);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Demote a system admin to regular guest
     * Only existing system admins can demote other admins
     */
    @PostMapping("/demote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> demoteFromSystemAdmin(@RequestParam Long userId, @RequestParam String tenantId) {
        try {
            User user = systemWideUserService.demoteFromSystemAdmin(userId, tenantId);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
