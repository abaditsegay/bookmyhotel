package com.bookmyhotel.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bookmyhotel.dto.ScheduleStatusUpdateRequest;
import com.bookmyhotel.dto.StaffMemberResponse;
import com.bookmyhotel.dto.StaffScheduleRequest;
import com.bookmyhotel.dto.StaffScheduleResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.StaffSchedule;
import com.bookmyhotel.entity.StaffSchedule.Department;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.StaffScheduleRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Service for managing staff schedules
 */
@Service
@Transactional
public class StaffScheduleService {

    private static final Logger logger = LoggerFactory.getLogger(StaffScheduleService.class);

    @Autowired
    private StaffScheduleRepository staffScheduleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Create a new staff schedule
     */
    public StaffScheduleResponse createSchedule(StaffScheduleRequest request, String adminEmail) {
        logger.info("Creating schedule for staff ID: {} on date: {}", request.getStaffId(), request.getScheduleDate());

        // Validate request
        validateScheduleRequest(request);

        // Get admin user
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        // Get staff user
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        // Get hotel
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        // Check for schedule conflicts
        checkScheduleConflicts(request.getStaffId(), request.getScheduleDate(), 
                             request.getStartTime(), request.getEndTime(), null);

        // Create schedule
        StaffSchedule schedule = new StaffSchedule(
                TenantContext.getTenantId(),
                staff,
                hotel,
                request.getScheduleDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getShiftType(),
                request.getDepartment(),
                admin
        );
        schedule.setNotes(request.getNotes());

        schedule = staffScheduleRepository.save(schedule);
        logger.info("Schedule created with ID: {}", schedule.getId());

        return convertToResponse(schedule);
    }

    /**
     * Update an existing schedule
     */
    public StaffScheduleResponse updateSchedule(Long scheduleId, StaffScheduleRequest request, String adminEmail) {
        logger.info("Updating schedule ID: {}", scheduleId);

        // Validate request
        validateScheduleRequest(request);

        // Get existing schedule
        StaffSchedule schedule = staffScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        // Get staff user
        User staff = userRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        // Get hotel
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        // Check for schedule conflicts (excluding current schedule)
        checkScheduleConflicts(request.getStaffId(), request.getScheduleDate(), 
                             request.getStartTime(), request.getEndTime(), scheduleId);

        // Update schedule
        schedule.setStaff(staff);
        schedule.setHotel(hotel);
        schedule.setScheduleDate(request.getScheduleDate());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setShiftType(request.getShiftType());
        schedule.setDepartment(request.getDepartment());
        schedule.setNotes(request.getNotes());

        schedule = staffScheduleRepository.save(schedule);
        logger.info("Schedule updated: {}", schedule.getId());

        return convertToResponse(schedule);
    }

    /**
     * Update schedule status
     */
    public StaffScheduleResponse updateScheduleStatus(Long scheduleId, ScheduleStatusUpdateRequest request) {
        logger.info("Updating schedule status for ID: {} to: {}", scheduleId, request.getStatus());

        StaffSchedule schedule = staffScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        schedule.setStatus(request.getStatus());
        if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            schedule.setNotes(request.getNotes());
        }

        schedule = staffScheduleRepository.save(schedule);
        return convertToResponse(schedule);
    }

    /**
     * Delete a schedule
     */
    public void deleteSchedule(Long scheduleId) {
        logger.info("Deleting schedule ID: {}", scheduleId);

        StaffSchedule schedule = staffScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        staffScheduleRepository.delete(schedule);
        logger.info("Schedule deleted: {}", scheduleId);
    }

    /**
     * Get schedule by ID
     */
    @Transactional(readOnly = true)
    public StaffScheduleResponse getScheduleById(Long scheduleId) {
        StaffSchedule schedule = staffScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        return convertToResponse(schedule);
    }

    /**
     * Get schedules by hotel and date range
     */
    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getSchedulesByHotelAndDateRange(Long hotelId, LocalDate startDate, LocalDate endDate) {
        List<StaffSchedule> schedules = staffScheduleRepository.findByHotelAndDateRange(hotelId, startDate, endDate);
        return schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get schedules by staff member and date range
     */
    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getSchedulesByStaffAndDateRange(Long staffId, LocalDate startDate, LocalDate endDate) {
        List<StaffSchedule> schedules = staffScheduleRepository.findByStaffAndDateRange(staffId, startDate, endDate);
        return schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get schedules by department and date range
     */
    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getSchedulesByDepartmentAndDateRange(Long hotelId, Department department, 
                                                                           LocalDate startDate, LocalDate endDate) {
        List<StaffSchedule> schedules = staffScheduleRepository.findByHotelAndDepartmentAndDateRange(
                hotelId, department, startDate, endDate);
        return schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get schedules for a specific date
     */
    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getSchedulesByDate(Long hotelId, LocalDate date) {
        List<StaffSchedule> schedules = staffScheduleRepository.findByHotelAndDate(hotelId, date);
        return schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get staff member's schedule for today
     */
    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getMyTodaySchedule(String staffEmail) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        List<StaffSchedule> schedules = staffScheduleRepository.findByStaffAndDate(staff.getId(), LocalDate.now());
        return schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get staff member's upcoming schedules
     */
    @Transactional(readOnly = true)
    public List<StaffScheduleResponse> getMyUpcomingSchedules(String staffEmail) {
        User staff = userRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));

        List<StaffSchedule> schedules = staffScheduleRepository.findUpcomingSchedulesByStaff(
                staff.getId(), LocalDate.now());
        return schedules.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get schedules with pagination
     */
    @Transactional(readOnly = true)
    public Page<StaffScheduleResponse> getSchedulesWithPagination(Long hotelId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StaffSchedule> schedulePage = staffScheduleRepository.findByHotelWithPagination(hotelId, pageable);
        
        return schedulePage.map(this::convertToResponse);
    }

    /**
     * Get schedule statistics by department
     */
    @Transactional(readOnly = true)
    public Map<Department, Long> getScheduleStatsByDepartment(Long hotelId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = staffScheduleRepository.countSchedulesByDepartment(hotelId, startDate, endDate);
        
        return results.stream()
                .collect(Collectors.toMap(
                        result -> (Department) result[0],
                        result -> (Long) result[1]
                ));
    }

    // Private helper methods

    private void validateScheduleRequest(StaffScheduleRequest request) {
        if (request.getEndTime().isBefore(request.getStartTime()) || 
            request.getEndTime().equals(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (request.getScheduleDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot schedule in the past");
        }

        // Validate reasonable shift duration (not more than 16 hours)
        long hoursWorked = java.time.Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        if (hoursWorked > 16) {
            throw new IllegalArgumentException("Shift duration cannot exceed 16 hours");
        }
    }

    private void checkScheduleConflicts(Long staffId, LocalDate date, LocalTime startTime, 
                                       LocalTime endTime, Long excludeId) {
        Long excludeScheduleId = excludeId != null ? excludeId : -1L;
        List<StaffSchedule> conflicts = staffScheduleRepository.findConflictingSchedules(
                staffId, date, startTime, endTime, excludeScheduleId);

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Schedule conflicts with existing schedule");
        }
    }

    private StaffScheduleResponse convertToResponse(StaffSchedule schedule) {
        String staffName = schedule.getStaff().getFirstName() + " " + schedule.getStaff().getLastName();
        String createdByName = schedule.getCreatedBy() != null ? 
                schedule.getCreatedBy().getFirstName() + " " + schedule.getCreatedBy().getLastName() : 
                "System";

        return new StaffScheduleResponse(
                schedule.getId(),
                schedule.getStaff().getId(),
                staffName,
                schedule.getStaff().getEmail(),
                schedule.getHotel().getId(),
                schedule.getHotel().getName(),
                schedule.getScheduleDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getShiftType(),
                schedule.getDepartment(),
                schedule.getNotes(),
                schedule.getStatus(),
                createdByName,
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }

    public List<StaffScheduleResponse> getSchedulesWithFilters(Long hotelId, Department department, 
                                                              LocalDate date, String status, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        // If no hotelId provided and user is HOTEL_ADMIN, use their hotel
        if (hotelId == null && admin.getHotel() != null) {
            hotelId = admin.getHotel().getId();
        }

        List<StaffSchedule> schedules;
        if (hotelId != null) {
            schedules = staffScheduleRepository.findByHotelIdOrderByScheduleDateDescStartTimeAsc(hotelId);
        } else {
            // For system admins, get all schedules
            schedules = staffScheduleRepository.findAllByOrderByScheduleDateDescStartTimeAsc();
        }

        // Apply filters
        return schedules.stream()
                .filter(schedule -> department == null || schedule.getDepartment() == department)
                .filter(schedule -> date == null || schedule.getScheduleDate().equals(date))
                .filter(schedule -> status == null || schedule.getStatus().name().equals(status))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<StaffMemberResponse> getAllStaffMembers(String adminEmail) {
        logger.info("🔍 getAllStaffMembers called for adminEmail: {}", adminEmail);
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        logger.info("✅ Admin found: id={}, email={}, hotel={}", 
                   admin.getId(), admin.getEmail(), 
                   admin.getHotel() != null ? admin.getHotel().getId() : "null");

        List<User> staffMembers;
        if (admin.getHotel() != null) {
            // Hotel admin - get staff from their hotel
            List<UserRole> staffRoles = Arrays.asList(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN);
            logger.info("🏨 Searching for staff in hotel {} with roles: {}", admin.getHotel().getId(), staffRoles);
            
            staffMembers = userRepository.findStaffByHotelId(admin.getHotel().getId(), staffRoles);
            logger.info("📋 Found {} staff members", staffMembers.size());
            
            for (User staff : staffMembers) {
                logger.info("👤 Staff: id={}, email={}, hotel={}", 
                           staff.getId(), staff.getEmail(), 
                           staff.getHotel() != null ? staff.getHotel().getId() : "null");
            }
        } else {
            // System admin - get all staff members (this might need refinement based on requirements)
            logger.info("🌐 System admin - getting all staff members");
            staffMembers = userRepository.findAll().stream()
                    .filter(user -> user.getHotel() != null)
                    .collect(Collectors.toList());
            logger.info("📋 Found {} staff members for system admin", staffMembers.size());
        }

        List<StaffMemberResponse> responses = staffMembers.stream()
                .map(this::convertToStaffMemberResponse)
                .collect(Collectors.toList());
        
        logger.info("🔄 Returning {} staff member responses", responses.size());
        return responses;
    }

    private StaffMemberResponse convertToStaffMemberResponse(User user) {
        String hotelName = user.getHotel() != null ? user.getHotel().getName() : "No Hotel";
        Long hotelId = user.getHotel() != null ? user.getHotel().getId() : null;
        
        return new StaffMemberResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                hotelId,
                hotelName,
                user.getRoles()
        );
    }

    /**
     * Upload schedule file (CSV format)
     */
    public Map<String, Object> uploadScheduleFile(MultipartFile file, String adminEmail) {
        logger.info("Processing schedule upload file: {}", file.getOriginalFilename());
        
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        
        int totalSchedules = 0;
        int successCount = 0;
        int failureCount = 0;
        List<String> errors = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header row
                }
                
                totalSchedules++;
                
                try {
                    String[] columns = line.split(",");
                    if (columns.length < 7) {
                        errors.add("Row " + totalSchedules + ": Insufficient columns");
                        failureCount++;
                        continue;
                    }
                    
                    String staffEmail = columns[0].trim();
                    String hotelName = columns[1].trim();
                    String scheduleDate = columns[2].trim();
                    String startTime = columns[3].trim();
                    String endTime = columns[4].trim();
                    String shiftType = columns[5].trim();
                    String department = columns[6].trim();
                    String notes = columns.length > 7 ? columns[7].trim() : "";
                    
                    // Find staff member
                    User staff = userRepository.findByEmail(staffEmail)
                            .orElse(null);
                    if (staff == null) {
                        errors.add("Row " + totalSchedules + ": Staff member not found: " + staffEmail);
                        failureCount++;
                        continue;
                    }
                    
                    // Find hotel
                    Hotel hotel = hotelRepository.findByNameContainingIgnoreCase(hotelName).stream()
                            .findFirst()
                            .orElse(null);
                    if (hotel == null) {
                        errors.add("Row " + totalSchedules + ": Hotel not found: " + hotelName);
                        failureCount++;
                        continue;
                    }
                    
                    // Parse date and times
                    LocalDate date;
                    LocalTime start;
                    LocalTime end;
                    
                    try {
                        date = LocalDate.parse(scheduleDate);
                        start = LocalTime.parse(startTime);
                        end = LocalTime.parse(endTime);
                    } catch (DateTimeParseException e) {
                        errors.add("Row " + totalSchedules + ": Invalid date/time format");
                        failureCount++;
                        continue;
                    }
                    
                    // Validate shift type and department
                    StaffSchedule.ShiftType shiftTypeEnum;
                    Department departmentEnum;
                    
                    try {
                        shiftTypeEnum = StaffSchedule.ShiftType.valueOf(shiftType.toUpperCase());
                        departmentEnum = Department.valueOf(department.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        errors.add("Row " + totalSchedules + ": Invalid shift type or department");
                        failureCount++;
                        continue;
                    }
                    
                    // Create schedule request
                    StaffScheduleRequest request = new StaffScheduleRequest();
                    request.setStaffId(staff.getId());
                    request.setHotelId(hotel.getId());
                    request.setScheduleDate(date);
                    request.setStartTime(start);
                    request.setEndTime(end);
                    request.setShiftType(shiftTypeEnum);
                    request.setDepartment(departmentEnum);
                    request.setNotes(notes);
                    
                    // Create the schedule
                    createSchedule(request, adminEmail);
                    successCount++;
                    
                } catch (Exception e) {
                    logger.error("Error processing row {}: {}", totalSchedules, e.getMessage());
                    errors.add("Row " + totalSchedules + ": " + e.getMessage());
                    failureCount++;
                }
            }
            
        } catch (Exception e) {
            logger.error("Error reading file: {}", e.getMessage());
            throw new RuntimeException("Failed to process upload file: " + e.getMessage());
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalSchedules", totalSchedules);
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("errors", errors);
        
        logger.info("Schedule upload completed: {} total, {} success, {} failures", 
                   totalSchedules, successCount, failureCount);
        
        return result;
    }
}
