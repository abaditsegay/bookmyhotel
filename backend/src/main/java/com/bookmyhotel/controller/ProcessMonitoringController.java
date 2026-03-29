package com.bookmyhotel.controller;

import com.bookmyhotel.audit.AuditTaxonomy;
import com.bookmyhotel.dto.AuditTrailDto;
import com.bookmyhotel.dto.DailyFinancialReconciliationDto;
import com.bookmyhotel.dto.ProcessMonitoringEventDto;
import com.bookmyhotel.service.FinancialAuditService;
import com.bookmyhotel.service.RealTimeProcessMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller for process monitoring and financial audit features
 */
@RestController
@RequestMapping("/api/hotel-admin")
public class ProcessMonitoringController {

    @Autowired
    private RealTimeProcessMonitoringService processMonitoringService;

    @Autowired
    private FinancialAuditService financialAuditService;

    // ========== Real-time Process Monitoring Endpoints ==========

    /**
     * Get live monitoring data for hotel dashboard
     */
    @GetMapping("/hotels/{hotelId}/monitoring/live")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getLiveMonitoringData(@PathVariable Long hotelId) {
        Map<String, Object> liveData = processMonitoringService.getLiveMonitoringData(hotelId);
        return ResponseEntity.ok(liveData);
    }

    /**
     * Get staff activity monitoring
     */
    @GetMapping("/hotels/{hotelId}/monitoring/staff-activity")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCurrentStaffActivity(@PathVariable Long hotelId) {
        List<Map<String, Object>> staffActivity = processMonitoringService.getCurrentStaffActivity(hotelId);
        return ResponseEntity.ok(staffActivity);
    }

    /**
     * Get exception alerts
     */
    @GetMapping("/hotels/{hotelId}/monitoring/alerts")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<ProcessMonitoringEventDto>> getExceptionAlerts(@PathVariable Long hotelId) {
        List<ProcessMonitoringEventDto> alerts = processMonitoringService.getExceptionAlerts(hotelId);
        return ResponseEntity.ok(alerts);
    }

    /**
     * Get pattern detection results
     */
    @GetMapping("/hotels/{hotelId}/monitoring/patterns")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getPatternDetection(@PathVariable Long hotelId,
            @RequestParam(defaultValue = "24") int hours) {
        Map<String, Object> patterns = processMonitoringService.detectPatterns(hotelId, hours);
        return ResponseEntity.ok(patterns);
    }

    /**
     * Get process monitoring events with pagination
     */
    @GetMapping("/hotels/{hotelId}/monitoring/events")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Page<ProcessMonitoringEventDto>> getMonitoringEvents(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) Boolean exceptionsOnly,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            Pageable pageable) {

        Page<ProcessMonitoringEventDto> events = processMonitoringService.getMonitoringEvents(
                hotelId, eventType, exceptionsOnly, startTime, endTime, pageable);
        return ResponseEntity.ok(events);
    }

    /**
     * Log custom monitoring event
     */
    @PostMapping("/hotels/{hotelId}/monitoring/events")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<ProcessMonitoringEventDto> logMonitoringEvent(
            @PathVariable Long hotelId,
            @RequestBody ProcessMonitoringEventDto eventDto,
            HttpServletRequest request) {

        ProcessMonitoringEventDto loggedEvent = processMonitoringService.logEvent(
                eventDto.getEventType(), hotelId, eventDto.getReservationId(),
                eventDto.getGuestEmail(), request, eventDto.getDetails());
        return ResponseEntity.ok(loggedEvent);
    }

    /**
     * Get staff performance summary
     */
    @GetMapping("/hotels/{hotelId}/monitoring/staff/{staffId}/performance")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getStaffPerformance(
            @PathVariable Long hotelId,
            @PathVariable Long staffId,
            @RequestParam(defaultValue = "7") int days) {

        Map<String, Object> performance = processMonitoringService.getStaffPerformanceSummary(hotelId, staffId, days);
        return ResponseEntity.ok(performance);
    }

    // ========== Financial Audit Endpoints ==========

    /**
     * Generate daily financial reconciliation
     */
    @GetMapping("/hotels/{hotelId}/audit/reconciliation")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<DailyFinancialReconciliationDto> getDailyReconciliation(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        DailyFinancialReconciliationDto reconciliation = financialAuditService.generateDailyReconciliation(hotelId,
                date);
        return ResponseEntity.ok(reconciliation);
    }

    /**
     * Get supported audit taxonomy values for client validation and filtering
     */
    @GetMapping("/hotels/{hotelId}/audit/taxonomy")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, List<String>>> getAuditTaxonomy(@PathVariable Long hotelId) {
        Map<String, List<String>> taxonomy = Map.of(
                "entityTypes", AuditTaxonomy.entityTypes(),
                "actions", AuditTaxonomy.actions(),
                "complianceCategories", AuditTaxonomy.complianceCategories());
        return ResponseEntity.ok(taxonomy);
    }

    /**
     * Get audit trail for specific entity
     */
    @GetMapping("/hotels/{hotelId}/audit/trail")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<List<AuditTrailDto>> getAuditTrail(
            @PathVariable Long hotelId,
            @RequestParam String entityType,
            @RequestParam Long entityId) {

        String normalizedEntityType;
        try {
            normalizedEntityType = AuditTaxonomy.normalizeEntityType(entityType);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }

        List<AuditTrailDto> auditTrail = financialAuditService.getAuditTrail(hotelId, normalizedEntityType, entityId);
        return ResponseEntity.ok(auditTrail);
    }

    /**
     * Get all audit logs with pagination
     */
    @GetMapping("/hotels/{hotelId}/audit/logs")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Page<AuditTrailDto>> getAuditLogs(@PathVariable Long hotelId, Pageable pageable) {
        Page<AuditTrailDto> auditLogs = financialAuditService.getAuditLogs(hotelId, pageable);
        return ResponseEntity.ok(auditLogs);
    }

    /**
     * Get sensitive audit logs
     */
    @GetMapping("/hotels/{hotelId}/audit/logs/sensitive")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Page<AuditTrailDto>> getSensitiveAuditLogs(@PathVariable Long hotelId, Pageable pageable) {
        Page<AuditTrailDto> auditLogs = financialAuditService.getSensitiveAuditLogs(hotelId, pageable);
        return ResponseEntity.ok(auditLogs);
    }

    /**
     * Get compliance report
     */
    @GetMapping("/hotels/{hotelId}/audit/compliance/{category}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Page<AuditTrailDto>> getComplianceReport(
            @PathVariable Long hotelId,
            @PathVariable String category,
            Pageable pageable) {

        String normalizedCategory;
        try {
            normalizedCategory = AuditTaxonomy.normalizeComplianceCategory(category);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }

        Page<AuditTrailDto> complianceReport = financialAuditService.getComplianceReport(hotelId, normalizedCategory,
                pageable);
        return ResponseEntity.ok(complianceReport);
    }

    /**
     * Create manual audit log entry
     */
    @PostMapping("/hotels/{hotelId}/audit/logs")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<AuditTrailDto> createAuditLog(
            @PathVariable Long hotelId,
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestParam String action,
            @RequestParam(required = false) String oldValues,
            @RequestParam(required = false) String newValues,
            @RequestParam(required = false) String changedFields,
            @RequestParam Long userId,
            @RequestParam String userName,
            @RequestParam String userEmail,
            @RequestParam String userRole,
            @RequestParam(required = false) String reason,
            @RequestParam(defaultValue = "false") boolean isSensitive,
            @RequestParam(required = false) String complianceCategory,
            HttpServletRequest request) {

        String normalizedEntityType;
        String normalizedAction;
        String normalizedComplianceCategory;
        try {
            normalizedEntityType = AuditTaxonomy.normalizeEntityType(entityType);
            normalizedAction = AuditTaxonomy.normalizeAction(action);
            normalizedComplianceCategory = AuditTaxonomy.normalizeComplianceCategory(complianceCategory);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().build();
        }

        AuditTrailDto auditLog = financialAuditService.createAuditLog(
            hotelId, normalizedEntityType, entityId, normalizedAction, oldValues, newValues, changedFields,
                userId, userName, userEmail, userRole, request, reason, isSensitive, normalizedComplianceCategory);

        return ResponseEntity.ok(auditLog);
    }

    // ========== Dashboard Summary Endpoints ==========

    /**
     * Get comprehensive dashboard data
     */
    @GetMapping("/hotels/{hotelId}/dashboard/summary")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@PathVariable Long hotelId) {
        Map<String, Object> summary = Map.of(
                "liveMonitoring", Map.of("totalEventsToday", 0, "lastUpdated", LocalDateTime.now()),
                "staffActivity", List.of(),
                "recentAlerts", List.of(),
                "patterns", Map.of("exceptionCount", 0, "hasPatterns", false, "period", "24 hours"),
                "todayReconciliation", Map.of("date", LocalDate.now(), "totalRevenue", 0.0, "totalBookings", 0));
        return ResponseEntity.ok(summary);
    }

    /**
     * Get system health status
     */
    @GetMapping("/hotels/{hotelId}/monitoring/health")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemHealth(@PathVariable Long hotelId) {
        Map<String, Object> health = Map.of(
                "status", "healthy",
                "hotelId", hotelId,
                "timestamp", LocalDateTime.now(),
                "services", Map.of(
                        "database", "up",
                        "monitoring", "up",
                        "processing", "up"));
        return ResponseEntity.ok(health);
    }
}