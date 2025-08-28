package com.bookmyhotel.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
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
import com.bookmyhotel.dto.MaintenanceRequestDTO;
import com.bookmyhotel.dto.MaintenanceUpdateRequest;
import com.bookmyhotel.dto.TaskUpdateRequest;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.MaintenanceRequest;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.MaintenanceRequestRepository;
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
    private MaintenanceRequestRepository maintenanceRequestRepository;

    // Get current staff profile
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'MAINTENANCE', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF')")
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
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF')")
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

            // Find the corresponding HousekeepingStaff record by email
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Staff record not found");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<MaintenanceRequest> tasks = maintenanceRequestRepository.findByAssignedToId(staffOpt.get().getId(),
                    pageable);

            // Convert to DTOs to avoid JSON serialization issues
            Page<MaintenanceRequestDTO> taskDTOs = tasks.map(this::convertToMaintenanceRequestDTO);

            return ResponseEntity.ok(taskDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting maintenance tasks: " + e.getMessage());
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

            Optional<MaintenanceRequest> taskOpt = maintenanceRequestRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance task not found");
            }

            MaintenanceRequest task = taskOpt.get();

            // Verify the task is assigned to this user
            // Note: Since entity no longer has User relationship, we compare by email
            if (task.getAssignedTo() == null || !task.getAssignedTo().getEmail().equals(user.getEmail())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            // Convert string status to enum
            MaintenanceRequest.MaintenanceStatus status;
            try {
                status = MaintenanceRequest.MaintenanceStatus.valueOf(updateRequest.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Invalid status: " + updateRequest.getStatus());
            }

            task.setStatus(status);

            if (status == MaintenanceRequest.MaintenanceStatus.COMPLETED) {
                task.setCompletedAt(LocalDateTime.now());
            }

            maintenanceRequestRepository.save(task);

            return ResponseEntity.ok("Maintenance task status updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating maintenance task status: " + e.getMessage());
        }
    }

    // Common Stats Endpoints
    @GetMapping("/housekeeping/stats")
    @PreAuthorize("hasAnyRole('HOUSEKEEPING', 'STAFF')")
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

            // Find the corresponding HousekeepingStaff record by email
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByEmail(user.getEmail());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Staff record not found");
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", maintenanceRequestRepository.countByAssignedToId(staffOpt.get().getId()));
            stats.put("pendingTasks", maintenanceRequestRepository.countByAssignedToIdAndStatus(staffOpt.get().getId(),
                    MaintenanceRequest.MaintenanceStatus.PENDING));
            stats.put("inProgressTasks", maintenanceRequestRepository.countByAssignedToIdAndStatus(
                    staffOpt.get().getId(), MaintenanceRequest.MaintenanceStatus.IN_PROGRESS));
            stats.put("completedTasks", maintenanceRequestRepository.countByAssignedToIdAndStatus(
                    staffOpt.get().getId(), MaintenanceRequest.MaintenanceStatus.COMPLETED));

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

    // Helper method to convert MaintenanceRequest to DTO
    private MaintenanceRequestDTO convertToMaintenanceRequestDTO(MaintenanceRequest request) {
        MaintenanceRequestDTO dto = new MaintenanceRequestDTO();
        dto.setId(request.getId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setCategory(request.getCategory());
        dto.setPriority(request.getPriority());
        dto.setStatus(request.getStatus());
        dto.setEstimatedCost(request.getEstimatedCost());
        dto.setActualCost(request.getActualCost());
        dto.setEstimatedDurationHours(request.getEstimatedDurationHours());
        dto.setActualDurationHours(request.getActualDurationHours());
        dto.setScheduledDate(request.getScheduledDate());
        dto.setAssignedAt(request.getAssignedAt());
        dto.setStartedAt(request.getStartedAt());
        dto.setCompletedAt(request.getCompletedAt());
        dto.setCreatedAt(request.getCreatedAt());

        // Extract room and hotel details safely
        if (request.getRoom() != null) {
            dto.setRoomId(request.getRoom().getId());
            dto.setRoomNumber(request.getRoom().getRoomNumber());
            dto.setRoomType(
                    request.getRoom().getRoomType() != null ? request.getRoom().getRoomType().toString() : null);

            if (request.getRoom().getHotel() != null) {
                dto.setHotelName(request.getRoom().getHotel().getName());
            }
        }

        // Extract requested by details safely
        if (request.getRequestedBy() != null) {
            dto.setRequestedByName(
                    request.getRequestedBy().getFirstName() + " " + request.getRequestedBy().getLastName());
            dto.setRequestedByEmail(request.getRequestedBy().getEmail());
        }

        // Extract assigned staff details safely
        if (request.getAssignedTo() != null) {
            dto.setAssignedToName(request.getAssignedTo().getFirstName() + " " + request.getAssignedTo().getLastName());
            dto.setAssignedToEmail(request.getAssignedTo().getEmail());
        }

        return dto;
    }
}
