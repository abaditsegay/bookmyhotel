package com.bookmyhotel.controller;

import com.bookmyhotel.dto.TaskUpdateRequest;
import com.bookmyhotel.dto.HousekeepingTaskDTO;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.enums.WorkShift;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.HousekeepingService;
import com.bookmyhotel.service.HotelService;
import com.bookmyhotel.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/housekeeping")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('HOUSEKEEPING') or hasRole('OPERATIONS_SUPERVISOR')")
public class HousekeepingController {

    private static final Logger logger = LoggerFactory.getLogger(HousekeepingController.class);

    @Autowired
    private HousekeepingService housekeepingService;

    @Autowired
    private HotelService hotelService;

    @Autowired
    private UserRepository userRepository;

    // Task endpoints
    @PostMapping("/tasks")
    public ResponseEntity<HousekeepingTask> createTask(@RequestBody HousekeepingTaskRequest request) {
        // System.out.println("🔍 Creating task with request: " + request);
        // System.out.println("🔍 Title: " + request.getTitle());
        // System.out.println("🔍 Description: " + request.getDescription());
        // System.out.println("🔍 Task Type: " + request.getTaskType());
        // System.out.println("🔍 Priority: " + request.getPriority());
        // System.out.println("🔍 Room Number: " + request.getRoomNumber());
        // System.out.println("🔍 Estimated Duration: " +
        // request.getEstimatedDuration());
        // System.out.println("🔍 Assigned Staff ID: " + request.getAssignedStaffId());
        // System.out.println("🔍 Notes: " + request.getNotes());

        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        // System.out.println("🔍 Tenant ID: " + tenantId);
        // System.out.println("🔍 Hotel ID: " + hotelId);

        try {
            HousekeepingTask task = housekeepingService.createTaskEnhanced(
                    hotelId,
                    request.getRoomNumber(),
                    request.getTitle(),
                    request.getTaskType(),
                    request.getPriority(),
                    request.getDescription(),
                    request.getNotes(),
                    request.getEstimatedDuration(),
                    request.getAssignedStaffId());
            // System.out.println("✅ Task created successfully: " + task.getId());
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            logger.error("Error creating housekeeping task", e);
            throw e;
        }
    }

    @GetMapping("/tasks")
    public ResponseEntity<Page<HousekeepingTaskDTO>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        Pageable pageable = PageRequest.of(page, size);
        Page<HousekeepingTask> tasks = housekeepingService.getAllTasks(hotelId, pageable);
        Page<HousekeepingTaskDTO> taskDTOs = tasks.map(this::convertToDTO);
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<HousekeepingTaskDTO> getTaskById(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        List<HousekeepingTask> tasks = housekeepingService.getAllTasks(hotelId);
        HousekeepingTask task = tasks.stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return ResponseEntity.ok(convertToDTO(task));
    }

    @GetMapping("/tasks/hotel/{hotelId}")
    public ResponseEntity<List<HousekeepingTaskDTO>> getTasksByHotel(@PathVariable Long hotelId) {
        String tenantId = TenantContext.getTenantId();
        // Get tasks directly by hotel ID (tasks now store hotel ID directly)
        List<HousekeepingTask> hotelTasks = housekeepingService.getAllTasks(hotelId);
        List<HousekeepingTaskDTO> taskDTOs = hotelTasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<HousekeepingTask>> getTasksByStatus(@PathVariable HousekeepingTaskStatus status) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        List<HousekeepingTask> tasks = housekeepingService.getTasksByStatus(hotelId, status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/tasks/assigned/{staffId}")
    public ResponseEntity<List<HousekeepingTask>> getTasksByAssignedUser(@PathVariable Long staffId) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        List<HousekeepingTask> tasks = housekeepingService.getTasksByStaff(hotelId, staffId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/tasks/{id}/assign")
    public ResponseEntity<HousekeepingTask> assignTask(@PathVariable Long id, @RequestBody AssignTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingTask task = housekeepingService.assignTask(hotelId, id, request.getStaffId());
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{id}/start")
    public ResponseEntity<HousekeepingTask> startTask(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingTask task = housekeepingService.startTask(hotelId, id);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{id}/complete")
    public ResponseEntity<HousekeepingTask> completeTask(@PathVariable Long id,
            @RequestBody CompleteTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingTask task = housekeepingService.completeTask(hotelId, id, request.getNotes(),
                request.getQualityScore());
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{id}/complete-with-issues")
    public ResponseEntity<HousekeepingTask> completeTaskWithIssues(@PathVariable Long id,
            @RequestBody CompleteTaskWithIssuesRequest request) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingTask task = housekeepingService.completeTaskWithIssues(hotelId, id, request.getNotes(),
                request.getIssueDescription());
        return ResponseEntity.ok(task);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<HousekeepingTask> updateTask(@PathVariable Long id, @RequestBody HousekeepingTask task) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingTask updatedTask = housekeepingService.updateTask(hotelId, id, task);
        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        try {
            String tenantId = TenantContext.getTenantId();
            Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
            HousekeepingTask updatedTask = housekeepingService.updateTaskStatus(hotelId, id, request.getStatus(),
                    request.getNotes());
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating task status: " + e.getMessage());
        }
    }

    @PostMapping("/tasks/{id}/cancel")
    public ResponseEntity<HousekeepingTask> cancelTask(@PathVariable Long id, @RequestBody CancelTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingTask task = housekeepingService.cancelTask(hotelId, id, request.getReason());
        return ResponseEntity.ok(task);
    }

    // Staff endpoints
    @PostMapping("/staff")
    public ResponseEntity<HousekeepingStaff> createStaff(@RequestBody HousekeepingStaffRequest request) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingStaff staff = housekeepingService.createStaff(
                hotelId,
                request.getEmail(),
                request.getShiftType(),
                request.getEmployeeId(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone());
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/staff")
    public ResponseEntity<List<HousekeepingStaffDTO>> getAllStaff() {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);

        // Get users with HOUSEKEEPING role from the hotel
        List<User> housekeepingUsers = userRepository.findByHotelIdAndRole(hotelId, UserRole.HOUSEKEEPING);

        List<HousekeepingStaffDTO> staffDTOs = housekeepingUsers.stream()
                .map(this::convertUserToStaffDTO)
                .toList();
        return ResponseEntity.ok(staffDTOs);
    }

    @GetMapping("/staff/hotel/{hotelId}")
    public ResponseEntity<List<HousekeepingStaff>> getStaffByHotel(@PathVariable Long hotelId) {
        String tenantId = TenantContext.getTenantId();
        // Validate that the provided hotelId matches the tenant's hotel
        Long userHotelId = hotelService.getHotelIdByTenantId(tenantId);
        if (!hotelId.equals(userHotelId)) {
            return ResponseEntity.badRequest().build();
        }
        List<HousekeepingStaff> staff = housekeepingService.getAllStaff(hotelId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/staff/{id}")
    public ResponseEntity<HousekeepingStaff> getStaffById(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        List<HousekeepingStaff> allStaff = housekeepingService.getAllStaff(hotelId);
        HousekeepingStaff staff = allStaff.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Staff not found"));
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<HousekeepingStaff> updateStaff(@PathVariable Long id, @RequestBody HousekeepingStaff staff) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingStaff updatedStaff = housekeepingService.updateStaff(hotelId, id, staff);
        return ResponseEntity.ok(updatedStaff);
    }

    @PostMapping("/staff/{id}/deactivate")
    public ResponseEntity<HousekeepingStaff> deactivateStaff(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        HousekeepingStaff staff = housekeepingService.deactivateStaff(hotelId, id);
        return ResponseEntity.ok(staff);
    }

    // Statistics endpoints
    @GetMapping("/stats/tasks/status/{status}/count")
    public ResponseEntity<Long> getTaskCountByStatus(@PathVariable HousekeepingTaskStatus status) {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        long count = housekeepingService.getTaskCountByStatus(hotelId, status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/quality-score")
    public ResponseEntity<Double> getAverageQualityScore() {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        Double score = housekeepingService.getAverageQualityScore(hotelId);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/stats/staff/count")
    public ResponseEntity<Long> getActiveStaffCount() {
        String tenantId = TenantContext.getTenantId();
        Long hotelId = hotelService.getHotelIdByTenantId(tenantId);
        Long count = housekeepingService.getActiveStaffCount(hotelId);
        return ResponseEntity.ok(count);
    }

    // DTO Classes
    public static class HousekeepingTaskRequest {
        private String title; // Will use as part of description
        private String description;
        private HousekeepingTaskType taskType;
        private TaskPriority priority;
        private String roomNumber; // Will look up room by number
        private Integer floorNumber;
        private Integer estimatedDuration; // Duration in minutes
        private String dueDate; // ISO date string
        private Long assignedStaffId;
        private String notes; // Will use as specialInstructions

        // Getters and setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public HousekeepingTaskType getTaskType() {
            return taskType;
        }

        public void setTaskType(HousekeepingTaskType taskType) {
            this.taskType = taskType;
        }

        public TaskPriority getPriority() {
            return priority;
        }

        public void setPriority(TaskPriority priority) {
            this.priority = priority;
        }

        public String getRoomNumber() {
            return roomNumber;
        }

        public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
        }

        public Integer getFloorNumber() {
            return floorNumber;
        }

        public void setFloorNumber(Integer floorNumber) {
            this.floorNumber = floorNumber;
        }

        public Integer getEstimatedDuration() {
            return estimatedDuration;
        }

        public void setEstimatedDuration(Integer estimatedDuration) {
            this.estimatedDuration = estimatedDuration;
        }

        public String getDueDate() {
            return dueDate;
        }

        public void setDueDate(String dueDate) {
            this.dueDate = dueDate;
        }

        public Long getAssignedStaffId() {
            return assignedStaffId;
        }

        public void setAssignedStaffId(Long assignedStaffId) {
            this.assignedStaffId = assignedStaffId;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        // Legacy getters for backward compatibility
        public Long getRoomId() {
            return null; // Not used in new implementation
        }

        public String getSpecialInstructions() {
            return notes;
        }
    }

    public static class HousekeepingStaffRequest {
        private String email;
        private Long hotelId;
        private com.bookmyhotel.enums.WorkShift shiftType;
        private String employeeId;
        private String firstName;
        private String lastName;
        private String phone;

        // Getters and setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Long getHotelId() {
            return hotelId;
        }

        public void setHotelId(Long hotelId) {
            this.hotelId = hotelId;
        }

        public com.bookmyhotel.enums.WorkShift getShiftType() {
            return shiftType;
        }

        public void setShiftType(com.bookmyhotel.enums.WorkShift shiftType) {
            this.shiftType = shiftType;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }

    public static class AssignTaskRequest {
        private Long staffId;

        public Long getStaffId() {
            return staffId;
        }

        public void setStaffId(Long staffId) {
            this.staffId = staffId;
        }
    }

    public static class CompleteTaskRequest {
        private String notes;
        private Integer qualityScore;

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public Integer getQualityScore() {
            return qualityScore;
        }

        public void setQualityScore(Integer qualityScore) {
            this.qualityScore = qualityScore;
        }
    }

    public static class CompleteTaskWithIssuesRequest {
        private String notes;
        private String issueDescription;

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public String getIssueDescription() {
            return issueDescription;
        }

        public void setIssueDescription(String issueDescription) {
            this.issueDescription = issueDescription;
        }
    }

    public static class CancelTaskRequest {
        private String reason;

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }

    // DTO for frontend compatibility
    public static class HousekeepingStaffDTO {
        private Long id;
        private String employeeId;
        private UserDTO user;
        private String shiftType;
        private boolean isActive;
        private Double averageRating;
        private Integer totalTasksCompleted;
        private String tenantId;

        // Getters and setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public UserDTO getUser() {
            return user;
        }

        public void setUser(UserDTO user) {
            this.user = user;
        }

        public String getShiftType() {
            return shiftType;
        }

        public void setShiftType(String shiftType) {
            this.shiftType = shiftType;
        }

        public boolean isActive() {
            return isActive;
        }

        public void setActive(boolean active) {
            isActive = active;
        }

        public Double getAverageRating() {
            return averageRating;
        }

        public void setAverageRating(Double averageRating) {
            this.averageRating = averageRating;
        }

        public Integer getTotalTasksCompleted() {
            return totalTasksCompleted;
        }

        public void setTotalTasksCompleted(Integer totalTasksCompleted) {
            this.totalTasksCompleted = totalTasksCompleted;
        }

        public String getTenantId() {
            return tenantId;
        }

        public void setTenantId(String tenantId) {
            this.tenantId = tenantId;
        }
    }

    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;

        public UserDTO(Long id, String firstName, String lastName) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Getters and setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    // Conversion method
    private HousekeepingStaffDTO convertToStaffDTO(HousekeepingStaff staff) {
        HousekeepingStaffDTO dto = new HousekeepingStaffDTO();
        dto.setId(staff.getId());
        dto.setEmployeeId(staff.getEmployeeId());
        dto.setUser(new UserDTO(staff.getId(), staff.getFirstName(), staff.getLastName()));
        dto.setShiftType(staff.getShift() != null ? staff.getShift().toString() : "DAY");
        dto.setActive(staff.getIsActive() != null ? staff.getIsActive() : true);
        dto.setAverageRating(staff.getAverageRating() != null ? staff.getAverageRating() : 0.0);
        dto.setTotalTasksCompleted(staff.getTasksCompletedToday() != null ? staff.getTasksCompletedToday() : 0);
        dto.setTenantId(staff.getTenantId());
        return dto;
    }

    // Conversion method for User to HousekeepingStaffDTO
    private HousekeepingStaffDTO convertUserToStaffDTO(User user) {
        HousekeepingStaffDTO dto = new HousekeepingStaffDTO();
        dto.setId(user.getId());
        dto.setEmployeeId("EMP" + user.getId()); // Generate employee ID from user ID
        dto.setUser(new UserDTO(user.getId(), user.getFirstName(), user.getLastName()));
        dto.setShiftType("DAY"); // Default shift type since it's not stored in User entity
        dto.setActive(user.getIsActive() != null ? user.getIsActive() : true);
        dto.setAverageRating(0.0); // Default rating since not tracked for users
        dto.setTotalTasksCompleted(0); // Default tasks completed since not tracked for users
        dto.setTenantId(user.getHotel() != null && user.getHotel().getTenant() != null
                ? user.getHotel().getTenant().getId()
                : null);
        return dto;
    }

    // Conversion method for HousekeepingTask to DTO
    private HousekeepingTaskDTO convertToDTO(HousekeepingTask task) {
        HousekeepingTaskDTO dto = new HousekeepingTaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setRoomNumber(task.getRoomNumber());
        dto.setTaskType(task.getTaskType());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDescription(task.getDescription());
        dto.setSpecialInstructions(task.getSpecialInstructions());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setAssignedAt(task.getAssignedAt());
        dto.setStartedAt(task.getStartedAt());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setEstimatedDurationMinutes(task.getEstimatedDurationMinutes());
        dto.setActualDurationMinutes(task.getActualDurationMinutes());
        dto.setQualityScore(task.getQualityScore());
        dto.setInspectorNotes(task.getInspectorNotes());

        // Set hotel information
        if (task.getHotel() != null) {
            dto.setHotelName(task.getHotel().getName());
        }

        // Set assigned user information safely
        if (task.getAssignedUser() != null) {
            User assignedUser = task.getAssignedUser();
            dto.setAssignedUserId(assignedUser.getId());

            // Create the assignedUser object for the frontend
            HousekeepingTaskDTO.AssignedUser dtoUser = new HousekeepingTaskDTO.AssignedUser(
                    assignedUser.getId(),
                    assignedUser.getFirstName(),
                    assignedUser.getLastName(),
                    assignedUser.getEmail());
            dto.setAssignedUser(dtoUser);
        } else {
            // Set default values for unassigned tasks
            dto.setAssignedUserId(null);
            dto.setAssignedUser(null);
        }

        return dto;
    }
}
