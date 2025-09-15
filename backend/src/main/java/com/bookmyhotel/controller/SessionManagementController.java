package com.bookmyhotel.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.service.SessionManagementService;

/**
 * Controller for session management operations
 * Only accessible by system administrators
 */
@RestController
@RequestMapping("/api/admin/sessions")
@PreAuthorize("hasRole('ADMIN')")
public class SessionManagementController {

    @Autowired
    private SessionManagementService sessionManagementService;

    /**
     * Get session statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSessionStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("activeSessionCount", sessionManagementService.getActiveSessionCount());
        stats.put("timestamp", java.time.LocalDateTime.now());

        return ResponseEntity.ok(stats);
    }

    /**
     * Get session count for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserSessionInfo(@PathVariable Long userId) {
        Map<String, Object> info = new HashMap<>();
        info.put("userId", userId);
        info.put("activeSessionCount", sessionManagementService.getUserActiveSessionCount(userId));
        info.put("timestamp", java.time.LocalDateTime.now());

        return ResponseEntity.ok(info);
    }

    /**
     * Force logout a user (invalidate all their sessions)
     */
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Map<String, String>> forceLogoutUser(@PathVariable Long userId) {
        sessionManagementService.invalidateAllUserSessions(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All sessions for user " + userId + " have been invalidated");
        response.put("timestamp", java.time.LocalDateTime.now().toString());

        return ResponseEntity.ok(response);
    }
}