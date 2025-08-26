package com.bookmyhotel.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

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

import com.bookmyhotel.dto.MaintenanceUpdateRequest;
import com.bookmyhotel.dto.TaskUpdateRequest;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.MaintenanceRequest;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.MaintenanceRequestRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.HousekeepingServiceSimple;
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
    private HousekeepingServiceSimple housekeepingService;

    @Autowired
    private MaintenanceRequestRepository maintenanceRequestRepository;

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

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
            profile.put("role", user.getRoles() != null && !user.getRoles().isEmpty() ? 
                       user.getRoles().iterator().next().name() : "STAFF");
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
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByUserId(user.getId());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Housekeeping staff record not found");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<HousekeepingTask> tasks = housekeepingTaskRepository.findByAssignedStaffId(staffOpt.get().getId(), pageable);
            
            return ResponseEntity.ok(tasks);
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Task not found");
            }

            HousekeepingTask task = taskOpt.get();
            
            // Verify the task is assigned to this user
            if (task.getAssignedStaff() == null || !task.getAssignedStaff().getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            housekeepingService.updateTaskStatus(taskId, updateRequest.getStatus(), updateRequest.getNotes());
            
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Task not found");
            }

            HousekeepingTask task = taskOpt.get();
            
            // Verify the task is assigned to this user
            if (task.getAssignedStaff() == null || !task.getAssignedStaff().getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            housekeepingService.updateTaskStatus(taskId, "IN_PROGRESS", "Task started by staff");
            
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            Optional<HousekeepingTask> taskOpt = housekeepingTaskRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Task not found");
            }

            HousekeepingTask task = taskOpt.get();
            
            // Verify the task is assigned to this user
            if (task.getAssignedStaff() == null || !task.getAssignedStaff().getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Task not assigned to you");
            }

            String notes = request != null ? request.get("notes") : "Task completed by staff";
            housekeepingService.updateTaskStatus(taskId, "COMPLETED", notes);
            
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<MaintenanceRequest> tasks = maintenanceRequestRepository.findByAssignedToUserId(user.getId(), pageable);
            
            return ResponseEntity.ok(tasks);
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            Optional<MaintenanceRequest> taskOpt = maintenanceRequestRepository.findById(taskId);
            if (!taskOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Maintenance task not found");
            }

            MaintenanceRequest task = taskOpt.get();
            
            // Verify the task is assigned to this user
            if (task.getAssignedTo() == null || !task.getAssignedTo().getUser().getId().equals(user.getId())) {
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
            task.setUpdatedAt(LocalDateTime.now());
            
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            Optional<HousekeepingStaff> staffOpt = housekeepingService.findStaffByUserId(user.getId());
            if (!staffOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Housekeeping staff record not found");
            }

            Long staffId = staffOpt.get().getId();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", housekeepingTaskRepository.countByAssignedStaffId(staffId));
            stats.put("pendingTasks", housekeepingTaskRepository.countByAssignedStaffIdAndStatus(staffId, "PENDING"));
            stats.put("inProgressTasks", housekeepingTaskRepository.countByAssignedStaffIdAndStatus(staffId, "IN_PROGRESS"));
            stats.put("completedTasks", housekeepingTaskRepository.countByAssignedStaffIdAndStatus(staffId, "COMPLETED"));
            
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
            Optional<User> userOpt = userRepository.findByEmail(username); if (!userOpt.isPresent()) { return ResponseEntity.badRequest().body("User not found"); } User user = userOpt.get();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", maintenanceRequestRepository.countByAssignedToUserId(user.getId()));
            stats.put("pendingTasks", maintenanceRequestRepository.countByAssignedToUserIdAndStatus(user.getId(), "PENDING"));
            stats.put("inProgressTasks", maintenanceRequestRepository.countByAssignedToUserIdAndStatus(user.getId(), "IN_PROGRESS"));
            stats.put("completedTasks", maintenanceRequestRepository.countByAssignedToUserIdAndStatus(user.getId(), "COMPLETED"));
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting maintenance stats: " + e.getMessage());
        }
    }
}
