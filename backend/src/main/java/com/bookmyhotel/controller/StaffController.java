package com.bookmyhotel.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.HousekeepingTaskDTO;
import com.bookmyhotel.dto.MaintenanceTaskDTO;
import com.bookmyhotel.dto.MaintenanceUpdateRequest;
import com.bookmyhotel.dto.TaskUpdateRequest;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.MaintenanceTask;
import com.bookmyhotel.entity.TaskStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.HousekeepingStaffRepository;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.MaintenanceTaskRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.HousekeepingService;
import com.bookmyhotel.service.UserManagementService;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    @Autowired
    private UserManagementService userManagementService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HousekeepingService housekeepingService;

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @Autowired
    private HousekeepingStaffRepository housekeepingStaffRepository;

    @Autowired
    private MaintenanceTaskRepository maintenanceTaskRepository;

    // Get current staff profile
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'MAINTENANCE', 'STAFF', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        try {
            String username = authentication.getName();
            // Use email to find user since username maps to email in our system
            Optional<User> userOpt = userRepository.findByEmail(username);

            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", user.getId());
            profile.put("username", user.getUsername());
            profile.put("role",
                    user.getRoles() != null && !user.getRoles().isEmpty() ? user.getRoles().iterator().next().name()
                            : "STAFF");
            profile.put("firstName", user.getFirstName());
            profile.put("lastName", user.getLastName());
            profile.put("email", user.getEmail());

            // Determine staff type based on role
            String staffType = null;
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                String roleName = user.getRoles().iterator().next().name();
                if (roleName.contains("HOUSEKEEPING")) {
                    staffType = "HOUSEKEEPING";
                } else if (roleName.contains("MAINTENANCE")) {
                    staffType = "MAINTENANCE";
                }
            }
            profile.put("staffType", staffType);

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting profile: " + e.getMessage());
        }
    }

    // Housekeeping Staff Endpoints
    @GetMapping("/housekeeping/my-tasks")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getMyHousekeepingTasks(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);

            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();

            // Get housekeeping staff record
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Housekeeping staff record not found");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<HousekeepingTask> tasks = housekeepingTaskRepository.findByAssignedStaffId(staffOpt.get().getId(),
                    pageable);

            // Convert to DTOs to avoid JSON serialization issues
            Page<HousekeepingTaskDTO> taskDTOs = tasks.map(this::convertToDTO);

            return ResponseEntity.ok(taskDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting tasks: " + e.getMessage());
        }
    }

    @PutMapping("/housekeeping/tasks/{taskId}/status")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> updateHousekeepingTaskStatus(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequest updateRequest,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Task not found");
            }

            HousekeepingTask task = taskOpt.get();

            // Verify the task is assigned to this user (match by email)
            if (task.getAssignedStaff() == null || !task.getAssignedStaff().getEmail().equals(user.getEmail())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            // Update task status based on the request
            if (updateRequest.getStatus().equals("IN_PROGRESS")) {
                task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS);
                task.setStartedAt(LocalDateTime.now());
            } else if (updateRequest.getStatus().equals("COMPLETED")) {
                task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED);
                task.setCompletedAt(LocalDateTime.now());
            } else if (updateRequest.getStatus().equals("COMPLETED_WITH_ISSUES")) {
                task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED_WITH_ISSUES);
                task.setCompletedAt(LocalDateTime.now());
            }

            if (updateRequest.getNotes() != null) {
                task.setInspectorNotes(updateRequest.getNotes());
            }

            housekeepingTaskRepository.save(task);

            return ResponseEntity.ok("Task status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating task status: " + e.getMessage());
        }
    }

    @PutMapping("/housekeeping/tasks/{taskId}/start")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> startHousekeepingTask(@PathVariable Long taskId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Task not found");
            }

            HousekeepingTask task = taskOpt.get();

            // Verify the task is assigned to this user (match by email)
            if (task.getAssignedStaff() == null || !task.getAssignedStaff().getEmail().equals(user.getEmail())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS);
            task.setStartedAt(LocalDateTime.now());
            housekeepingTaskRepository.save(task);

            return ResponseEntity.ok("Task started successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error starting task: " + e.getMessage());
        }
    }

    @PutMapping("/housekeeping/tasks/{taskId}/complete")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> completeHousekeepingTask(
            @PathVariable Long taskId,
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Task not found");
            }

            HousekeepingTask task = taskOpt.get();

            // Verify the task is assigned to this user (match by email)
            if (task.getAssignedStaff() == null || !task.getAssignedStaff().getEmail().equals(user.getEmail())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            String notes = request != null ? request.get("notes") : "Task completed by staff";
            task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
            if (notes != null) {
                task.setInspectorNotes(notes);
            }
            housekeepingTaskRepository.save(task);

            return ResponseEntity.ok("Task completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing task: " + e.getMessage());
        }
    }

    // Maintenance Staff Endpoints
    @GetMapping("/maintenance/my-tasks")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'STAFF')")
    public ResponseEntity<?> getMyMaintenanceTasks(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // Find the corresponding HousekeepingStaff record by email for maintenance
            // tasks
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance staff record not found");
            }

            // Get maintenance tasks (not maintenance requests) assigned to this staff
            // member
            List<MaintenanceTask> tasks = maintenanceTaskRepository
                    .findByTenantIdAndAssignedToOrderByScheduledStartTimeAsc(
                            user.getTenantId(), staffOpt.get());

            // Convert to DTOs to avoid JSON serialization issues
            List<MaintenanceTaskDTO> taskDTOs = tasks.stream()
                    .map(this::convertToMaintenanceTaskDTO)
                    .collect(Collectors.toList());

            // Create a pageable response
            int start = page * size;
            int end = Math.min((start + size), taskDTOs.size());
            List<MaintenanceTaskDTO> pageContent = start >= taskDTOs.size() ? List.of() : taskDTOs.subList(start, end);

            // Create a simple page response
            Map<String, Object> response = new HashMap<>();
            response.put("content", pageContent);
            response.put("totalElements", taskDTOs.size());
            response.put("totalPages", (int) Math.ceil((double) taskDTOs.size() / size));
            response.put("number", page);
            response.put("size", size);
            response.put("numberOfElements", pageContent.size());
            response.put("first", page == 0);
            response.put("last", end >= taskDTOs.size());
            response.put("empty", taskDTOs.isEmpty());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting maintenance tasks: " + e.getMessage());
        }
    }

    @PutMapping("/maintenance/tasks/{taskId}/start")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'STAFF')")
    public ResponseEntity<?> startMaintenanceTask(@PathVariable Long taskId, Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<MaintenanceTask> taskOpt = maintenanceTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance task not found");
            }

            MaintenanceTask task = taskOpt.get();

            // Verify the task is assigned to this user by checking staff record
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Staff record not found");
            }

            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(staffOpt.get().getId())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            // Start the task
            task.setStatus(TaskStatus.IN_PROGRESS);
            task.setActualStartTime(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
            maintenanceTaskRepository.save(task);

            return ResponseEntity.ok("Maintenance task started successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error starting maintenance task: " + e.getMessage());
        }
    }

    @PutMapping("/maintenance/tasks/{taskId}/complete")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'STAFF')")
    public ResponseEntity<?> completeMaintenanceTask(
            @PathVariable Long taskId,
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<MaintenanceTask> taskOpt = maintenanceTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance task not found");
            }

            MaintenanceTask task = taskOpt.get();

            // Verify the task is assigned to this user by checking staff record
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Staff record not found");
            }

            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(staffOpt.get().getId())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            // Complete the task
            String workPerformed = request != null ? request.get("workPerformed")
                    : "Task completed by maintenance staff";
            String partsUsed = request != null ? request.get("partsUsed") : "";

            task.setStatus(TaskStatus.COMPLETED);
            task.setActualEndTime(LocalDateTime.now());
            if (task.getActualStartTime() != null) {
                // Calculate actual duration if start time was set
                long minutes = java.time.Duration.between(task.getActualStartTime(), task.getActualEndTime())
                        .toMinutes();
                task.setActualDurationMinutes((int) minutes);
            }
            if (workPerformed != null) {
                task.setWorkPerformed(workPerformed);
            }
            if (partsUsed != null) {
                task.setPartsUsed(partsUsed);
            }
            task.setUpdatedAt(LocalDateTime.now());
            maintenanceTaskRepository.save(task);

            return ResponseEntity.ok("Maintenance task completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing maintenance task: " + e.getMessage());
        }
    }

    @PutMapping("/maintenance/tasks/{taskId}/status")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'STAFF')")
    public ResponseEntity<?> updateMaintenanceTaskStatus(
            @PathVariable Long taskId,
            @RequestBody MaintenanceUpdateRequest updateRequest,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<MaintenanceTask> taskOpt = maintenanceTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance task not found");
            }

            MaintenanceTask task = taskOpt.get();

            // Verify the task is assigned to this user by checking staff record
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Staff record not found");
            }

            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(staffOpt.get().getId())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            // Convert string status to enum
            TaskStatus status;
            try {
                status = TaskStatus.valueOf(updateRequest.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + updateRequest.getStatus());
            }

            task.setStatus(status);

            if (status == TaskStatus.COMPLETED) {
                task.setActualEndTime(LocalDateTime.now());
                if (task.getActualStartTime() != null) {
                    // Calculate actual duration if start time was set
                    long minutes = java.time.Duration.between(task.getActualStartTime(), task.getActualEndTime())
                            .toMinutes();
                    task.setActualDurationMinutes((int) minutes);
                }
            } else if (status == TaskStatus.IN_PROGRESS && task.getActualStartTime() == null) {
                task.setActualStartTime(LocalDateTime.now());
            }

            task.setUpdatedAt(LocalDateTime.now());
            maintenanceTaskRepository.save(task);

            return ResponseEntity.ok("Maintenance task status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating maintenance task status: " + e.getMessage());
        }
    }

    // Common Stats Endpoints
    @GetMapping("/housekeeping/stats")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF', 'OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getHousekeepingStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Housekeeping staff record not found");
            }

            Long staffId = staffOpt.get().getId();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", housekeepingTaskRepository.countByAssignedStaffId(staffId));
            stats.put("pendingTasks", housekeepingTaskRepository.countByAssignedStaffIdAndStatus(staffId,
                    HousekeepingTaskStatus.PENDING));
            stats.put("inProgressTasks", housekeepingTaskRepository.countByAssignedStaffIdAndStatus(staffId,
                    HousekeepingTaskStatus.IN_PROGRESS));
            stats.put("completedTasks", housekeepingTaskRepository.countByAssignedStaffIdAndStatus(staffId,
                    HousekeepingTaskStatus.COMPLETED));

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting housekeeping stats: " + e.getMessage());
        }
    }

    @GetMapping("/maintenance/stats")
    @PreAuthorize("hasAnyRole('MAINTENANCE', 'STAFF')")
    public ResponseEntity<?> getMaintenanceStats(Authentication authentication) {
        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(username);
            if (!userOpt.isPresent()) {
                return ResponseEntity.badRequest().body("User not found");
            }
            User user = userOpt.get();

            // Find the corresponding HousekeepingStaff record by email for maintenance
            // tasks
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance staff record not found");
            }

            // Get maintenance tasks assigned to this staff member and calculate stats
            List<MaintenanceTask> allTasks = maintenanceTaskRepository.findByTenantIdAndAssignedTo(
                    user.getTenantId(), staffOpt.get());

            long totalTasks = allTasks.size();
            long pendingTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.OPEN).count();
            long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
            long completedTasks = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", totalTasks);
            stats.put("pendingTasks", pendingTasks);
            stats.put("inProgressTasks", inProgressTasks);
            stats.put("completedTasks", completedTasks);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting maintenance stats: " + e.getMessage());
        }
    }

    // Helper method to convert HousekeepingTask to DTO
    private HousekeepingTaskDTO convertToDTO(HousekeepingTask task) {
        HousekeepingTaskDTO dto = new HousekeepingTaskDTO();
        dto.setId(task.getId());
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

        // Extract room and hotel details safely
        if (task.getRoom() != null) {
            dto.setRoomId(task.getRoom().getId());
            dto.setRoomNumber(task.getRoom().getRoomNumber());
            dto.setRoomType(task.getRoom().getRoomType() != null ? task.getRoom().getRoomType().toString() : null);

            if (task.getRoom().getHotel() != null) {
                dto.setHotelName(task.getRoom().getHotel().getName());
            }
        }

        return dto;
    }

    // Helper method to convert MaintenanceTask to DTO
    private MaintenanceTaskDTO convertToMaintenanceTaskDTO(MaintenanceTask task) {
        MaintenanceTaskDTO dto = new MaintenanceTaskDTO();
        dto.setId(task.getId());
        dto.setTaskType(task.getTaskType());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setLocation(task.getLocation());
        dto.setEquipmentType(task.getEquipmentType());
        dto.setEstimatedDurationMinutes(task.getEstimatedDurationMinutes());
        dto.setActualDurationMinutes(task.getActualDurationMinutes());
        dto.setEstimatedCost(task.getEstimatedCost());
        dto.setActualCost(task.getActualCost());
        dto.setScheduledStartTime(task.getScheduledStartTime());
        dto.setActualStartTime(task.getActualStartTime());
        dto.setActualEndTime(task.getActualEndTime());
        dto.setPartsRequired(task.getPartsRequired());
        dto.setToolsRequired(task.getToolsRequired());
        dto.setSafetyRequirements(task.getSafetyRequirements());
        dto.setWorkPerformed(task.getWorkPerformed());
        dto.setPartsUsed(task.getPartsUsed());
        dto.setFollowUpRequired(task.getFollowUpRequired());
        dto.setFollowUpDate(task.getFollowUpDate());
        dto.setFollowUpNotes(task.getFollowUpNotes());
        dto.setVerificationNotes(task.getVerificationNotes());
        dto.setVerificationTime(task.getVerificationTime());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // Extract room and hotel details safely
        if (task.getRoom() != null) {
            dto.setRoomId(task.getRoom().getId());
            dto.setRoomNumber(task.getRoom().getRoomNumber());
            dto.setRoomType(
                    task.getRoom().getRoomType() != null ? task.getRoom().getRoomType().toString() : null);

            if (task.getRoom().getHotel() != null) {
                dto.setHotelName(task.getRoom().getHotel().getName());
            }
        }

        // Extract created by details safely
        if (task.getCreatedBy() != null) {
            dto.setCreatedByName(task.getCreatedBy().getFirstName() + " " + task.getCreatedBy().getLastName());
            dto.setCreatedByEmail(task.getCreatedBy().getEmail());
        }

        // Extract reported by details safely
        if (task.getReportedBy() != null) {
            dto.setReportedByName(task.getReportedBy().getFirstName() + " " + task.getReportedBy().getLastName());
            dto.setReportedByEmail(task.getReportedBy().getEmail());
        }

        // Extract assigned staff details safely
        if (task.getAssignedTo() != null) {
            dto.setAssignedToName(task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName());
            dto.setAssignedToEmail(task.getAssignedTo().getEmail());
        }

        // Extract verified by details safely
        if (task.getVerifiedBy() != null) {
            dto.setVerifiedByName(task.getVerifiedBy().getFirstName() + " " + task.getVerifiedBy().getLastName());
            dto.setVerifiedByEmail(task.getVerifiedBy().getEmail());
        }

        return dto;
    }
}
