package com.bookmyhotel.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookmyhotel.dto.ScheduleStatusUpdateRequest;
import com.bookmyhotel.dto.StaffMemberResponse;
import com.bookmyhotel.dto.StaffScheduleRequest;
import com.bookmyhotel.dto.StaffScheduleResponse;
import com.bookmyhotel.entity.StaffSchedule.Department;
import com.bookmyhotel.service.StaffScheduleService;

import jakarta.validation.Valid;

/**
 * Controller for staff scheduling operations
 */
@RestController
@RequestMapping("/api/staff-schedules")
@CrossOrigin(origins = "*")
public class StaffScheduleController {

    private static final Logger logger = LoggerFactory.getLogger(StaffScheduleController.class);

    @Autowired
    private StaffScheduleService staffScheduleService;

    /**
     * Create a new staff schedule (Hotel Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<StaffScheduleResponse> createSchedule(
            @Valid @RequestBody StaffScheduleRequest request,
            Authentication auth) {
        logger.info("Creating schedule for staff ID: {}", request.getStaffId());

        String adminEmail = auth.getName();
        StaffScheduleResponse response = staffScheduleService.createSchedule(request, adminEmail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update an existing schedule (Hotel Admin only)
     */
    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<StaffScheduleResponse> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody StaffScheduleRequest request,
            Authentication auth) {
        logger.info("Updating schedule ID: {}", scheduleId);

        String adminEmail = auth.getName();
        StaffScheduleResponse response = staffScheduleService.updateSchedule(scheduleId, request, adminEmail);

        return ResponseEntity.ok(response);
    }

    /**
     * Update schedule status (Hotel Admin, Front Desk, Operations Supervisor,
     * Staff)
     */
    @PatchMapping("/{scheduleId}/status")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR', 'HOUSEKEEPING')")
    public ResponseEntity<StaffScheduleResponse> updateScheduleStatus(
            @PathVariable Long scheduleId,
            @Valid @RequestBody ScheduleStatusUpdateRequest request) {
        logger.info("Updating schedule status for ID: {} to: {}", scheduleId, request.getStatus());

        StaffScheduleResponse response = staffScheduleService.updateScheduleStatus(scheduleId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a schedule (Hotel Admin only)
     */
    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long scheduleId) {
        logger.info("Deleting schedule ID: {}", scheduleId);

        staffScheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all schedules with filters (Hotel Admin, Front Desk, Operations
     * Supervisor)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<List<StaffScheduleResponse>> getSchedules(
            @RequestParam(required = false) Long hotelId,
            @RequestParam(required = false) Department department,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            Authentication auth) {

        logger.info("Fetching schedules with filters - hotelId: {}, department: {}, date: {}, status: {}",
                hotelId, department, date, status);

        List<StaffScheduleResponse> schedules = staffScheduleService.getSchedulesWithFilters(
                hotelId, department, date, status, auth.getName());

        return ResponseEntity.ok(schedules);
    }

    /**
     * Get all staff members for scheduling (Hotel Admin, Front Desk, Operations
     * Supervisor)
     */
    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<List<StaffMemberResponse>> getAllStaff(Authentication auth) {
        logger.info("🔍 GET /staff endpoint called by user: {}", auth.getName());

        List<StaffMemberResponse> staff = staffScheduleService.getAllStaffMembers(auth.getName());

        logger.info("📤 Returning {} staff members from controller", staff.size());
        return ResponseEntity.ok(staff);
    }

    /**
     * Get schedule by ID
     */
    @GetMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR', 'HOUSEKEEPING')")
    public ResponseEntity<StaffScheduleResponse> getScheduleById(@PathVariable Long scheduleId) {
        StaffScheduleResponse response = staffScheduleService.getScheduleById(scheduleId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get schedules by hotel and date range
     */
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<List<StaffScheduleResponse>> getSchedulesByHotelAndDateRange(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<StaffScheduleResponse> schedules = staffScheduleService.getSchedulesByHotelAndDateRange(
                hotelId, startDate, endDate);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedules by staff and date range
     */
    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<List<StaffScheduleResponse>> getSchedulesByStaffAndDateRange(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<StaffScheduleResponse> schedules = staffScheduleService.getSchedulesByStaffAndDateRange(
                staffId, startDate, endDate);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedules by department and date range
     */
    @GetMapping("/hotel/{hotelId}/department/{department}")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<List<StaffScheduleResponse>> getSchedulesByDepartmentAndDateRange(
            @PathVariable Long hotelId,
            @PathVariable Department department,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<StaffScheduleResponse> schedules = staffScheduleService.getSchedulesByDepartmentAndDateRange(
                hotelId, department, startDate, endDate);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedules for a specific date
     */
    @GetMapping("/hotel/{hotelId}/date/{date}")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<List<StaffScheduleResponse>> getSchedulesByDate(
            @PathVariable Long hotelId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<StaffScheduleResponse> schedules = staffScheduleService.getSchedulesByDate(hotelId, date);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get my today's schedule (for staff members)
     */
    @GetMapping("/my-schedule/today")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR', 'HOUSEKEEPING')")
    public ResponseEntity<List<StaffScheduleResponse>> getMyTodaySchedule(Authentication auth) {
        String staffEmail = auth.getName();
        List<StaffScheduleResponse> schedules = staffScheduleService.getMyTodaySchedule(staffEmail);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get my upcoming schedules (for staff members)
     */
    @GetMapping("/my-schedule/upcoming")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR', 'HOUSEKEEPING')")
    public ResponseEntity<List<StaffScheduleResponse>> getMyUpcomingSchedules(Authentication auth) {
        String staffEmail = auth.getName();
        List<StaffScheduleResponse> schedules = staffScheduleService.getMyUpcomingSchedules(staffEmail);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedules with pagination
     */
    @GetMapping("/hotel/{hotelId}/paginated")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<Page<StaffScheduleResponse>> getSchedulesWithPagination(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<StaffScheduleResponse> schedules = staffScheduleService.getSchedulesWithPagination(
                hotelId, page, size);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedule statistics by department
     */
    @GetMapping("/hotel/{hotelId}/stats/department")
    @PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<Map<Department, Long>> getScheduleStatsByDepartment(
            @PathVariable Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Map<Department, Long> stats = staffScheduleService.getScheduleStatsByDepartment(
                hotelId, startDate, endDate);
        return ResponseEntity.ok(stats);
    }

    /**
     * Upload schedule file (CSV/Excel) for bulk schedule creation
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadScheduleFile(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        logger.info("Uploading schedule file: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Please select a file to upload");
        }

        String adminEmail = auth.getName();
        Map<String, Object> result = staffScheduleService.uploadScheduleFile(file, adminEmail);

        return ResponseEntity.ok(result);
    }
}
