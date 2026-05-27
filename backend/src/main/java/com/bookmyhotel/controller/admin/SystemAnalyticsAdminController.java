package com.bookmyhotel.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.service.SystemAnalyticsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
@Tag(name = "Admin Analytics", description = "System-wide booking and revenue analytics for privileged administrators")
@SecurityRequirement(name = "bearerAuth")
public class SystemAnalyticsAdminController {

    private final SystemAnalyticsService systemAnalyticsService;

    public SystemAnalyticsAdminController(SystemAnalyticsService systemAnalyticsService) {
        this.systemAnalyticsService = systemAnalyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get system-wide booking and revenue analytics", description = "Returns database-backed booking, payment, status, and monthly revenue analytics across all hotels for the system dashboard.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "System analytics overview returned"),
            @ApiResponse(responseCode = "403", description = "Access denied for non-admin users")
    })
    public ResponseEntity<SystemAnalyticsService.SystemAnalyticsOverview> getOverview() {
        return ResponseEntity.ok(systemAnalyticsService.getOverview());
    }
}