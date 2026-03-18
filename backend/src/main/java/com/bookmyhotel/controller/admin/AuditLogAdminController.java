package com.bookmyhotel.controller.admin;

import com.bookmyhotel.dto.SystemAuditLogDto;
import com.bookmyhotel.service.SystemAuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Admin controller for querying the system-level audit log.
 * Accessible only to SUPER_ADMIN and ADMIN roles.
 */
@RestController
@RequestMapping("/api/admin/audit")
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
public class AuditLogAdminController {

    @Autowired
    private SystemAuditService auditService;

    /**
     * Paginated audit log list with optional filters.
     *
     * @param action      filter by action type (CREATE, UPDATE, DELETE, …)
     * @param entityType  filter by entity type (USER, HOTEL, TENANT, …)
     * @param userEmail   partial match on performer email
     * @param from        start of time range (ISO 8601)
     * @param to          end of time range (ISO 8601)
     * @param page        0-based page index
     * @param size        page size (max 100)
     * @param sort        sort field,direction  e.g. performedAt,desc
     */
    @GetMapping("/logs")
    public ResponseEntity<Page<SystemAuditLogDto>> getLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "performedAt,desc") String sort) {

        size = Math.min(size, 100);
        String[] sortParts = sort.split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        Page<SystemAuditLogDto> result = auditService.getLogs(action, entityType, userEmail, from, to, pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * Get a single audit log entry by ID.
     */
    @GetMapping("/logs/{id}")
    public ResponseEntity<SystemAuditLogDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getById(id));
    }

    /**
     * Quick stats for the audit tab header banner.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalToday", auditService.countToday(),
                "failedToday", auditService.countFailedToday()
        ));
    }
}
