package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.bookmyhotel.service.PerformanceMonitoringService;

import java.util.Map;

/**
 * Performance Monitoring Controller
 * Provides REST endpoints for monitoring application performance
 * Requires admin privileges for access
 */
@RestController
@RequestMapping("/api/admin/performance")
@PreAuthorize("hasRole('ADMIN')")
public class PerformanceMonitoringController {

    @Autowired
    private PerformanceMonitoringService performanceService;

    /**
     * Get comprehensive performance summary
     * GET /api/admin/performance/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary() {
        try {
            Map<String, Object> summary = performanceService.getPerformanceSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve performance summary: " + e.getMessage()));
        }
    }

    /**
     * Get database connection pool statistics
     * GET /api/admin/performance/database
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> getConnectionPoolStats() {
        try {
            Map<String, Object> stats = performanceService.getConnectionPoolStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve database stats: " + e.getMessage()));
        }
    }

    /**
     * Get cache performance statistics
     * GET /api/admin/performance/cache
     */
    @GetMapping("/cache")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        try {
            Map<String, Object> stats = performanceService.getCacheStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve cache stats: " + e.getMessage()));
        }
    }

    /**
     * Get memory usage statistics
     * GET /api/admin/performance/memory
     */
    @GetMapping("/memory")
    public ResponseEntity<Map<String, Object>> getMemoryStats() {
        try {
            Map<String, Object> stats = performanceService.getMemoryStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to retrieve memory stats: " + e.getMessage()));
        }
    }
}
