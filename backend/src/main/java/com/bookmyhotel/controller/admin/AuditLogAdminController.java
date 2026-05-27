package com.bookmyhotel.controller.admin;

import com.bookmyhotel.dto.SystemAuditLogDto;
import com.bookmyhotel.service.SystemAuditService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

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
@Tag(name = "Admin Audit", description = "System-level audit querying endpoints for privileged administrators")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogAdminController {

    @Autowired
    private SystemAuditService auditService;

    /**
     * Paginated audit log list with optional filters.
     *
     * @param action     filter by action type (CREATE, UPDATE, DELETE, …)
     * @param entityType filter by entity type (USER, HOTEL, TENANT, …)
     * @param userEmail  partial match on performer email
     * @param from       start of time range (ISO 8601)
     * @param to         end of time range (ISO 8601)
     * @param page       0-based page index
     * @param size       page size (max 100)
     * @param sort       sort field,direction e.g. performedAt,desc
     */
    @GetMapping("/logs")
        @Operation(summary = "Get paginated system audit logs", description = "Returns system-level audit records with optional action, entity, actor email, and ISO-8601 time range filters. Sort uses field,direction format and page size is capped at 100.")
        @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit logs returned"),
            @ApiResponse(responseCode = "403", description = "Access denied for non-admin users")
        })
    public ResponseEntity<Page<SystemAuditLogDto>> getLogs(
            @Parameter(description = "Filter by audit action, for example CREATE, UPDATE, DELETE, STATUS_CHANGE") @RequestParam(required = false) String action,
            @Parameter(description = "Filter by audited entity type, for example USER, HOTEL, TENANT, RESERVATION") @RequestParam(required = false) String entityType,
            @Parameter(description = "Case-insensitive partial match on performer email") @RequestParam(required = false) String userEmail,
            @Parameter(description = "Inclusive ISO-8601 start timestamp, for example 2026-05-26T00:00:00") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @Parameter(description = "Inclusive ISO-8601 end timestamp, for example 2026-05-26T23:59:59") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Requested page size. Values above 100 are clamped to 100.") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort expression in field,direction format. Example: performedAt,desc") @RequestParam(defaultValue = "performedAt,desc") String sort) {

        size = Math.min(size, 100);
        String[] sortParts = sort.split(",");
        Sort.Direction dir = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortParts[0]));

        Page<SystemAuditLogDto> result = auditService.getLogs(action, entityType, userEmail, from, to, pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * Get a single audit log entry by ID.
     */
    @GetMapping("/logs/{id}")
    @Operation(summary = "Get a single system audit log entry", description = "Returns one system-level audit record by its identifier.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit log entry returned"),
            @ApiResponse(responseCode = "403", description = "Access denied for non-admin users"),
            @ApiResponse(responseCode = "404", description = "Audit log entry not found")
    })
    public ResponseEntity<SystemAuditLogDto> getById(@Parameter(description = "Audit log identifier") @PathVariable Long id) {
        return ResponseEntity.ok(auditService.getById(id));
    }

    /**
     * Quick stats for the audit tab header banner.
     */
    @GetMapping("/stats")
        @Operation(summary = "Get audit headline stats", description = "Returns quick system-audit counters for today, including total records written today and failed entries recorded today.")
        @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit headline stats returned", content = @Content(mediaType = "application/json", schema = @Schema(type = "object", example = "{\"totalToday\":128,\"failedToday\":3}"))),
            @ApiResponse(responseCode = "403", description = "Access denied for non-admin users")
        })
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalToday", auditService.countToday(),
                "failedToday", auditService.countFailedToday()));
    }
}
