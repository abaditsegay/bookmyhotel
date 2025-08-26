package com.bookmyhotel.controller;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.enums.*;
import com.bookmyhotel.service.HousekeepingService;
import com.bookmyhotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.ArrayList;

/**
 * Simplified Supervisor Controller for dashboard operations
 * Handles hotel-based operations (not tenant-based)
 */
@RestController
@RequestMapping("/api/supervisor")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
public class SupervisorController {
    
    @Autowired
    private HousekeepingService housekeepingService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get current authenticated user's hotel ID and tenant ID
     */
    private String getCurrentUserTenantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return null;
        }
        
        return user.getTenantId();
    }

    private Long getCurrentUserHotelId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            return null;
        }
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || user.getHotel() == null) {
            return null;
        }
        
        return user.getHotel().getId();
    }

    /**
     * Get supervisor dashboard overview - simplified version without circular references
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            String tenantId = getCurrentUserTenantId();
            Long hotelId = getCurrentUserHotelId();
            
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            if (hotelId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a hotel"));
            }
            
            // Create simple dashboard with basic counts - no complex objects
            Map<String, Object> dashboard = new HashMap<>();
            
            // Add basic metrics - only primitive types and simple objects
            dashboard.put("hotelId", hotelId);
            dashboard.put("tenantId", tenantId);
            
            try {
                // Get simple counts safely
                // Simple dashboard response - temporarily disabled full functionality
                dashboard.put("totalStaff", 0);
                dashboard.put("pendingTasks", 0);
                dashboard.put("inProgressTasks", 0);
                dashboard.put("completedTasks", 0);
                dashboard.put("staffSummary", new ArrayList<>());
                
                // Get completed tasks for recent tasks display
                List<HousekeepingTask> completedTasks = housekeepingService.getTasksByStatus(tenantId, HousekeepingTaskStatus.COMPLETED);
                
                // Simple task summary
                List<Map<String, Object>> recentTasks = new ArrayList<>();
                for (HousekeepingTask task : completedTasks) {
                    if (recentTasks.size() >= 10) break;
                    Map<String, Object> taskMap = new HashMap<>();
                    taskMap.put("id", task.getId());
                    taskMap.put("type", task.getTaskType() != null ? task.getTaskType().toString() : "UNKNOWN");
                    taskMap.put("status", task.getStatus() != null ? task.getStatus().toString() : "UNKNOWN");
                    taskMap.put("priority", task.getPriority() != null ? task.getPriority().toString() : "NORMAL");
                    taskMap.put("description", task.getDescription() != null ? task.getDescription() : "");
                    
                    // Safely get room number
                    String roomNumber = "Unknown";
                    try {
                        if (task.getRoom() != null && task.getRoom().getRoomNumber() != null) {
                            roomNumber = task.getRoom().getRoomNumber();
                        }
                    } catch (Exception roomError) {
                        // Ignore room access errors
                    }
                    taskMap.put("roomNumber", roomNumber);
                    
                    String completedAt = null;
                    if (task.getCompletedAt() != null) {
                        completedAt = task.getCompletedAt().toString();
                    }
                    taskMap.put("completedAt", completedAt);
                    
                    recentTasks.add(taskMap);
                }
                dashboard.put("recentTasks", recentTasks);
                
            } catch (Exception serviceError) {
                dashboard.put("error", "Service error: " + serviceError.getMessage());
                dashboard.put("totalStaff", 0);
                dashboard.put("pendingTasks", 0);
                dashboard.put("inProgressTasks", 0);
                dashboard.put("completedTasks", 0);
                dashboard.put("staffSummary", List.of());
                dashboard.put("recentTasks", List.of());
            }
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get recent activity for dashboard
     */
    @GetMapping("/dashboard/recent-activity")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getRecentActivity() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            String tenantId = user.getTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Get recent tasks (same as in dashboard but more detailed)
            List<HousekeepingTask> completedTasks = housekeepingService.getTasksByStatus(tenantId, HousekeepingTaskStatus.COMPLETED);
            List<HousekeepingTask> inProgressTasks = housekeepingService.getTasksByStatus(tenantId, HousekeepingTaskStatus.IN_PROGRESS);
            
            List<Map<String, Object>> recentTasks = new ArrayList<>();
            
            // Add completed tasks
            for (HousekeepingTask task : completedTasks) {
                if (recentTasks.size() >= 10) break;
                Map<String, Object> taskMap = new HashMap<>();
                taskMap.put("id", task.getId());
                taskMap.put("type", task.getTaskType() != null ? task.getTaskType().toString() : "UNKNOWN");
                taskMap.put("status", task.getStatus() != null ? task.getStatus().toString() : "UNKNOWN");
                taskMap.put("priority", task.getPriority() != null ? task.getPriority().toString() : "NORMAL");
                taskMap.put("description", task.getDescription() != null ? task.getDescription() : "");
                taskMap.put("completedAt", task.getCompletedAt() != null ? task.getCompletedAt().toString() : null);
                
                // Safely get room number
                String roomNumber = "Unknown";
                try {
                    if (task.getRoom() != null && task.getRoom().getRoomNumber() != null) {
                        roomNumber = task.getRoom().getRoomNumber();
                    }
                } catch (Exception e) {
                    // Ignore room access errors
                }
                taskMap.put("roomNumber", roomNumber);
                
                // Safely get assigned staff info
                if (task.getAssignedStaff() != null) {
                    taskMap.put("assignedStaffName", 
                        (task.getAssignedStaff().getFirstName() != null ? task.getAssignedStaff().getFirstName() : "") + " " + 
                        (task.getAssignedStaff().getLastName() != null ? task.getAssignedStaff().getLastName() : ""));
                } else {
                    taskMap.put("assignedStaffName", "Unassigned");
                }
                
                recentTasks.add(taskMap);
            }
            
            // Add in-progress tasks
            for (HousekeepingTask task : inProgressTasks) {
                if (recentTasks.size() >= 15) break;
                Map<String, Object> taskMap = new HashMap<>();
                taskMap.put("id", task.getId());
                taskMap.put("type", task.getTaskType() != null ? task.getTaskType().toString() : "UNKNOWN");
                taskMap.put("status", task.getStatus() != null ? task.getStatus().toString() : "UNKNOWN");
                taskMap.put("priority", task.getPriority() != null ? task.getPriority().toString() : "NORMAL");
                taskMap.put("description", task.getDescription() != null ? task.getDescription() : "");
                taskMap.put("startedAt", task.getStartedAt() != null ? task.getStartedAt().toString() : null);
                
                // Safely get room number
                String roomNumber = "Unknown";
                try {
                    if (task.getRoom() != null && task.getRoom().getRoomNumber() != null) {
                        roomNumber = task.getRoom().getRoomNumber();
                    }
                } catch (Exception e) {
                    // Ignore room access errors
                }
                taskMap.put("roomNumber", roomNumber);
                
                // Safely get assigned staff info
                if (task.getAssignedStaff() != null) {
                    taskMap.put("assignedStaffName", 
                        (task.getAssignedStaff().getFirstName() != null ? task.getAssignedStaff().getFirstName() : "") + " " + 
                        (task.getAssignedStaff().getLastName() != null ? task.getAssignedStaff().getLastName() : ""));
                } else {
                    taskMap.put("assignedStaffName", "Unassigned");
                }
                
                recentTasks.add(taskMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("recentTasks", recentTasks);
            response.put("recentMaintenance", new ArrayList<>()); // Empty for now since we don't have maintenance data
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get staff list - organized by role for frontend
     * Includes staff from both users table (created by hotel admin) and housekeeping_staff table
     */
    @GetMapping("/staff")
    public ResponseEntity<?> getStaff() {
        try {
            String tenantId = getCurrentUserTenantId();
            Long hotelId = getCurrentUserHotelId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Separate staff by role for frontend consumption
            List<Map<String, Object>> operationsSupervisorStaff = new ArrayList<>();
            List<Map<String, Object>> housekeepingStaff = new ArrayList<>();
            List<Map<String, Object>> maintenanceStaff = new ArrayList<>();
            
            // 1. Get staff from users table (created by hotel admin)
            List<UserRole> staffRoles = Arrays.asList(UserRole.OPERATIONS_SUPERVISOR, UserRole.HOUSEKEEPING, UserRole.MAINTENANCE);
            
            List<User> allUsers = new ArrayList<>();
            // Get users for each role separately since we need to find by roles containing
            for (UserRole role : staffRoles) {
                List<User> usersWithRole = userRepository.findTenantBoundUsersByRole(tenantId, role);
                allUsers.addAll(usersWithRole);
            }
            
            for (User user : allUsers) {
                // Only include users from the same hotel or if hotelId is null (system-wide access)
                if (hotelId != null && user.getHotel() != null && !user.getHotel().getId().equals(hotelId)) {
                    continue; // Skip users from different hotels
                }
                
                Map<String, Object> staffMap = new HashMap<>();
                staffMap.put("id", user.getId());
                staffMap.put("firstName", user.getFirstName() != null ? user.getFirstName() : "");
                staffMap.put("lastName", user.getLastName() != null ? user.getLastName() : "");
                staffMap.put("email", user.getEmail() != null ? user.getEmail() : "");
                staffMap.put("phone", user.getPhone() != null ? user.getPhone() : "");
                staffMap.put("isActive", user.getIsActive() != null ? user.getIsActive() : false);
                staffMap.put("source", "users"); // Indicate this is from users table
                
                // Get the primary role (assuming one primary role per user for staff)
                UserRole primaryRole = null;
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    // Find the staff role (prioritize OPERATIONS_SUPERVISOR, then HOUSEKEEPING, then MAINTENANCE)
                    if (user.getRoles().contains(UserRole.OPERATIONS_SUPERVISOR)) {
                        primaryRole = UserRole.OPERATIONS_SUPERVISOR;
                    } else if (user.getRoles().contains(UserRole.HOUSEKEEPING)) {
                        primaryRole = UserRole.HOUSEKEEPING;
                    } else if (user.getRoles().contains(UserRole.MAINTENANCE)) {
                        primaryRole = UserRole.MAINTENANCE;
                    } else {
                        primaryRole = user.getRoles().iterator().next(); // Get first role as fallback
                    }
                }
                
                if (primaryRole != null) {
                    staffMap.put("role", primaryRole.toString());
                    
                    switch (primaryRole) {
                        case OPERATIONS_SUPERVISOR:
                            operationsSupervisorStaff.add(staffMap);
                            break;
                        case HOUSEKEEPING:
                            housekeepingStaff.add(staffMap);
                            break;
                        case MAINTENANCE:
                            maintenanceStaff.add(staffMap);
                            break;
                        default:
                            // Skip other roles
                            break;
                    }
                }
            }
            
            // 2. Get additional staff from housekeeping_staff table (if any)
            try {
                List<HousekeepingStaff> housekeepingStaffEntries = housekeepingService.getAllActiveStaff(tenantId, Pageable.unpaged()).getContent();
                
                for (HousekeepingStaff staff : housekeepingStaffEntries) {
                    Map<String, Object> staffMap = new HashMap<>();
                    staffMap.put("id", staff.getId());
                    staffMap.put("firstName", staff.getFirstName());
                    staffMap.put("lastName", staff.getLastName());
                    staffMap.put("email", staff.getEmail() != null ? staff.getEmail() : "");
                    staffMap.put("phone", staff.getPhone() != null ? staff.getPhone() : "");
                    staffMap.put("role", staff.getRole().toString());
                    staffMap.put("isActive", "ACTIVE".equals(staff.getStatus().toString()));
                    staffMap.put("source", "housekeeping_staff"); // Indicate this is from housekeeping_staff table
                    
                    if (staff.getRole().toString().equals("HOUSEKEEPING")) {
                        housekeepingStaff.add(staffMap);
                    } else if (staff.getRole().toString().equals("MAINTENANCE")) {
                        maintenanceStaff.add(staffMap);
                    }
                }
            } catch (Exception housekeepingError) {
                // Log but don't fail if housekeeping_staff table has issues
                System.err.println("Warning: Could not fetch from housekeeping_staff table: " + housekeepingError.getMessage());
            }
            
            return ResponseEntity.ok(Map.of(
                "operationsSupervisor", operationsSupervisorStaff,
                "housekeeping", housekeepingStaff,
                "maintenance", maintenanceStaff
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get tasks list - simplified version
     */
    @GetMapping("/tasks")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getTasks(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            User user = userOpt.get();
            String tenantId = user.getTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Get all housekeeping tasks for the tenant
            List<HousekeepingTask> pendingTasks = housekeepingService.getTasksByStatus(tenantId, HousekeepingTaskStatus.PENDING);
            List<HousekeepingTask> inProgressTasks = housekeepingService.getTasksByStatus(tenantId, HousekeepingTaskStatus.IN_PROGRESS);
            List<HousekeepingTask> completedTasks = housekeepingService.getTasksByStatus(tenantId, HousekeepingTaskStatus.COMPLETED);
            
            List<HousekeepingTask> allTasks = new ArrayList<>();
            allTasks.addAll(pendingTasks);
            allTasks.addAll(inProgressTasks);
            allTasks.addAll(completedTasks);
            
            // Convert to simplified format to avoid circular references
            List<Map<String, Object>> tasksData = allTasks.stream()
                .map(task -> {
                    Map<String, Object> taskMap = new HashMap<>();
                    taskMap.put("id", task.getId());
                    taskMap.put("taskType", task.getTaskType() != null ? task.getTaskType().toString() : "UNKNOWN");
                    taskMap.put("status", task.getStatus() != null ? task.getStatus().toString() : "UNKNOWN");
                    taskMap.put("priority", task.getPriority() != null ? task.getPriority().toString() : "NORMAL");
                    taskMap.put("description", task.getDescription() != null ? task.getDescription() : "");
                    taskMap.put("estimatedDuration", task.getEstimatedDurationMinutes() != null ? task.getEstimatedDurationMinutes().intValue() : 0);
                    taskMap.put("actualDuration", task.getActualDurationMinutes() != null ? task.getActualDurationMinutes().intValue() : 0);
                    taskMap.put("createdAt", task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
                    taskMap.put("assignedAt", task.getAssignedAt() != null ? task.getAssignedAt().toString() : null);
                    taskMap.put("completedAt", task.getCompletedAt() != null ? task.getCompletedAt().toString() : null);
                    
                    // Safely get room number
                    String roomNumber = "Unknown";
                    try {
                        if (task.getRoom() != null && task.getRoom().getRoomNumber() != null) {
                            roomNumber = task.getRoom().getRoomNumber();
                        }
                    } catch (Exception e) {
                        // Ignore room access errors
                    }
                    taskMap.put("roomNumber", roomNumber);
                    
                    // Safely get assigned staff info
                    if (task.getAssignedStaff() != null) {
                        taskMap.put("assignedStaffId", task.getAssignedStaff().getId());
                        taskMap.put("assignedStaffName", 
                            (task.getAssignedStaff().getFirstName() != null ? task.getAssignedStaff().getFirstName() : "") + " " + 
                            (task.getAssignedStaff().getLastName() != null ? task.getAssignedStaff().getLastName() : ""));
                    } else {
                        taskMap.put("assignedStaffId", null);
                        taskMap.put("assignedStaffName", "Unassigned");
                    }
                    
                    return taskMap;
                }).toList();
            
            // Apply pagination manually
            int start = page * size;
            int end = Math.min(start + size, tasksData.size());
            List<Map<String, Object>> paginatedTasks = tasksData.subList(Math.min(start, tasksData.size()), end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", paginatedTasks);
            response.put("totalElements", tasksData.size());
            response.put("totalPages", (int) Math.ceil((double) tasksData.size() / size));
            response.put("size", size);
            response.put("number", page);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get maintenance requests - simplified version
     */
    @GetMapping("/maintenance")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getMaintenance(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Create pageable object
            Pageable pageable = PageRequest.of(page, size);
            
            // TODO: Fetch maintenance requests using a proper maintenance service
            // Page<MaintenanceRequest> maintenanceRequests = maintenanceService.getAllMaintenanceRequests(tenantId, pageable);
            
            // Temporarily return empty list until MaintenanceService is implemented
            List<Map<String, Object>> maintenanceData = new ArrayList<>();
            /*
            for (MaintenanceRequest request : maintenanceRequests.getContent()) {
                Map<String, Object> requestMap = new HashMap<>();
                requestMap.put("id", request.getId());
                requestMap.put("title", request.getTitle());
                requestMap.put("description", request.getDescription());
                requestMap.put("category", request.getCategory().toString());
                requestMap.put("priority", request.getPriority().toString());
                requestMap.put("status", request.getStatus().toString());
                requestMap.put("createdAt", request.getCreatedAt().toString());
                
                // Safely get room number
                String roomNumber = "Unknown";
                try {
                    if (request.getRoom() != null && request.getRoom().getRoomNumber() != null) {
                        roomNumber = request.getRoom().getRoomNumber();
                    }
                } catch (Exception roomError) {
                    // Ignore room access errors
                }
                requestMap.put("roomNumber", roomNumber);
                
                // Add due date if available
                if (request.getDueDate() != null) {
                    requestMap.put("dueDate", request.getDueDate().toString());
                }
                
                // Add assigned staff info if available
                try {
                    if (request.getAssignedStaff() != null) {
                        requestMap.put("assignedStaffName", request.getAssignedStaff().getFirstName() + " " + request.getAssignedStaff().getLastName());
                    }
                } catch (Exception staffError) {
                    // Ignore staff access errors
                }
                
                maintenanceData.add(requestMap);
            }
            */
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", maintenanceData);
            response.put("totalElements", 0); // maintenanceRequests.getTotalElements()
            response.put("totalPages", 0); // maintenanceRequests.getTotalPages()
            response.put("size", size);
            response.put("number", page);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Create new maintenance request
     */
    @PostMapping("/maintenance")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> createMaintenanceRequest(@RequestBody CreateMaintenanceRequest request) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // TODO: Create maintenance request using a proper maintenance service
            // MaintenanceRequest maintenanceRequest = maintenanceService.createMaintenanceRequest(
            //     tenantId,
            //     request.getRoomId(),
            //     request.getTitle(),
            //     request.getDescription(),
            //     request.getCategory(),
            //     request.getPriority()
            // );
            
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of("error", "Maintenance request creation not yet implemented - MaintenanceService needed"));
            
            /*
            // Convert to simplified format to avoid circular references
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("id", maintenanceRequest.getId());
            responseMap.put("title", maintenanceRequest.getTitle());
            responseMap.put("description", maintenanceRequest.getDescription());
            responseMap.put("category", maintenanceRequest.getCategory().toString());
            responseMap.put("priority", maintenanceRequest.getPriority().toString());
            responseMap.put("status", maintenanceRequest.getStatus().toString());
            responseMap.put("createdAt", maintenanceRequest.getCreatedAt().toString());
            
            // Safely get room number
            String roomNumber = "Unknown";
            try {
                if (maintenanceRequest.getRoom() != null && maintenanceRequest.getRoom().getRoomNumber() != null) {
                    roomNumber = maintenanceRequest.getRoom().getRoomNumber();
                }
            } catch (Exception e) {
                // Ignore room access errors
            }
            responseMap.put("roomNumber", roomNumber);
            
            return ResponseEntity.ok(responseMap);
            */
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error creating maintenance request: " + e.getMessage()));
        }
    }

    /**
     * Create new housekeeping task
     */
    @PostMapping("/tasks/housekeeping")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN')")
    public ResponseEntity<?> createHousekeepingTask(@RequestBody CreateTaskRequest request) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Convert string task type and priority to enums
            HousekeepingTaskType taskType;
            TaskPriority priority;
            
            try {
                taskType = HousekeepingTaskType.valueOf(request.getTaskType().toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid task type: " + request.getTaskType()));
            }
            
            try {
                priority = TaskPriority.valueOf(request.getPriority().toUpperCase());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid priority: " + request.getPriority()));
            }
            
            HousekeepingTask task;
            
            // Handle special case for "Other" areas (roomId = 999)
            if (request.getRoomId() == 999) {
                // For "Other" areas, we'll create a task without a specific room
                task = housekeepingService.createTaskWithoutRoom(
                    tenantId,
                    taskType,
                    priority,
                    request.getDescription(),
                    request.getSpecialInstructions()
                );
            } else {
                // Normal room-based task
                task = housekeepingService.createTask(
                    tenantId,
                    request.getRoomId(),
                    taskType,
                    priority,
                    request.getDescription(),
                    request.getSpecialInstructions()
                );
            }
            
            // Convert to simplified format to avoid circular references
            Map<String, Object> taskMap = new HashMap<>();
            taskMap.put("id", task.getId());
            taskMap.put("taskType", task.getTaskType().toString());
            taskMap.put("status", task.getStatus().toString());
            taskMap.put("priority", task.getPriority().toString());
            taskMap.put("description", task.getDescription());
            taskMap.put("specialInstructions", task.getSpecialInstructions());
            taskMap.put("estimatedDuration", task.getEstimatedDurationMinutes());
            taskMap.put("createdAt", task.getCreatedAt().toString());
            
            // Safely get room number
            String roomNumber = "Unknown";
            try {
                if (task.getRoom() != null && task.getRoom().getRoomNumber() != null) {
                    roomNumber = task.getRoom().getRoomNumber();
                }
            } catch (Exception e) {
                // Ignore room access errors
            }
            taskMap.put("roomNumber", roomNumber);
            
            return ResponseEntity.ok(taskMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * CreateTaskRequest DTO for creating housekeeping tasks
     */
    public static class CreateTaskRequest {
        private Long roomId;
        private String taskType;
        private String priority;
        private String description;
        private String specialInstructions;
        
        // Getters and setters
        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }
        
        public String getTaskType() { return taskType; }
        public void setTaskType(String taskType) { this.taskType = taskType; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    }

    /**
     * Get tasks assigned to a specific staff member
     */
    @GetMapping("/staff/{staffId}/tasks")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getStaffTasks(@PathVariable Long staffId,
                                           @RequestParam(defaultValue = "ALL") String timeFilter,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            List<HousekeepingTask> tasks;
            
            // Get tasks based on time filter
            if ("TODAY".equals(timeFilter)) {
                tasks = housekeepingService.getTodaysTasksForStaff(staffId, tenantId);
            } else {
                // Get all tasks for the staff member
                Pageable pageable = PageRequest.of(page, size);
                Page<HousekeepingTask> taskPage = housekeepingService.getTasksForStaff(tenantId, staffId, pageable);
                tasks = taskPage.getContent();
            }
            
            // Convert to simplified format to avoid circular references
            List<Map<String, Object>> tasksData = new ArrayList<>();
            for (HousekeepingTask task : tasks) {
                Map<String, Object> taskMap = new HashMap<>();
                taskMap.put("id", task.getId());
                taskMap.put("taskType", task.getTaskType() != null ? task.getTaskType().toString() : "UNKNOWN");
                taskMap.put("status", task.getStatus() != null ? task.getStatus().toString() : "UNKNOWN");
                taskMap.put("priority", task.getPriority() != null ? task.getPriority().toString() : "NORMAL");
                taskMap.put("description", task.getDescription() != null ? task.getDescription() : "");
                taskMap.put("specialInstructions", task.getSpecialInstructions() != null ? task.getSpecialInstructions() : "");
                taskMap.put("estimatedDuration", task.getEstimatedDurationMinutes() != null ? task.getEstimatedDurationMinutes().intValue() : 0);
                taskMap.put("actualDuration", task.getActualDurationMinutes() != null ? task.getActualDurationMinutes().intValue() : 0);
                taskMap.put("qualityScore", task.getQualityScore() != null ? task.getQualityScore() : 0);
                taskMap.put("createdAt", task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
                taskMap.put("assignedAt", task.getAssignedAt() != null ? task.getAssignedAt().toString() : null);
                taskMap.put("startedAt", task.getStartedAt() != null ? task.getStartedAt().toString() : null);
                taskMap.put("completedAt", task.getCompletedAt() != null ? task.getCompletedAt().toString() : null);
                
                // Safely get room number
                String roomNumber = "Unknown";
                try {
                    if (task.getRoom() != null && task.getRoom().getRoomNumber() != null) {
                        roomNumber = task.getRoom().getRoomNumber();
                    }
                } catch (Exception e) {
                    // Ignore room access errors
                }
                taskMap.put("roomNumber", roomNumber);
                
                tasksData.add(taskMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("tasks", tasksData);
            response.put("staffId", staffId);
            response.put("timeFilter", timeFilter);
            response.put("totalTasks", tasksData.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Get staff performance summary
     */
    @GetMapping("/staff/{staffId}/performance")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> getStaffPerformance(@PathVariable Long staffId) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Get staff performance metrics
            Map<String, Object> performance = new HashMap<>();
            
            // Get all tasks for the staff member
            List<HousekeepingTask> allTasks = housekeepingService.getTasksForStaff(tenantId, staffId, Pageable.unpaged()).getContent();
            List<HousekeepingTask> todaysTasks = housekeepingService.getTodaysTasksForStaff(staffId, tenantId);
            
            // Calculate statistics
            long completedTasks = allTasks.stream().filter(t -> t.getStatus() == HousekeepingTaskStatus.COMPLETED).count();
            long pendingTasks = allTasks.stream().filter(t -> t.getStatus() == HousekeepingTaskStatus.PENDING).count();
            long inProgressTasks = allTasks.stream().filter(t -> t.getStatus() == HousekeepingTaskStatus.IN_PROGRESS).count();
            
            // Calculate average metrics
            double avgDuration = allTasks.stream()
                .filter(t -> t.getActualDurationMinutes() != null)
                .mapToDouble(t -> t.getActualDurationMinutes().doubleValue())
                .average()
                .orElse(0.0);
            
            double avgQuality = allTasks.stream()
                .filter(t -> t.getQualityScore() != null)
                .mapToDouble(HousekeepingTask::getQualityScore)
                .average()
                .orElse(0.0);
            
            performance.put("staffId", staffId);
            performance.put("totalTasks", allTasks.size());
            performance.put("completedTasks", completedTasks);
            performance.put("pendingTasks", pendingTasks);
            performance.put("inProgressTasks", inProgressTasks);
            performance.put("todaysTaskCount", todaysTasks.size());
            performance.put("averageDurationMinutes", Math.round(avgDuration * 100.0) / 100.0);
            performance.put("averageQualityScore", Math.round(avgQuality * 100.0) / 100.0);
            performance.put("completionRate", allTasks.size() > 0 ? Math.round((completedTasks * 100.0 / allTasks.size()) * 100.0) / 100.0 : 0.0);
            
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    /**
     * Assign housekeeping task to staff member
     */
    @PutMapping("/tasks/housekeeping/{taskId}/assign/{staffId}")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> assignHousekeepingTask(@PathVariable Long taskId, @PathVariable Long staffId) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // Use the simplified service that supports both housekeeping_staff and users table assignments
            HousekeepingTask assignedTask = housekeepingService.assignTask(tenantId, taskId, staffId);
            
            // Convert to simplified format to avoid circular references
            Map<String, Object> taskMap = new HashMap<>();
            taskMap.put("id", assignedTask.getId());
            taskMap.put("taskType", assignedTask.getTaskType() != null ? assignedTask.getTaskType().toString() : "UNKNOWN");
            taskMap.put("status", assignedTask.getStatus() != null ? assignedTask.getStatus().toString() : "UNKNOWN");
            taskMap.put("priority", assignedTask.getPriority() != null ? assignedTask.getPriority().toString() : "NORMAL");
            taskMap.put("description", assignedTask.getDescription() != null ? assignedTask.getDescription() : "");
            taskMap.put("assignedAt", assignedTask.getAssignedAt() != null ? assignedTask.getAssignedAt().toString() : null);
            
            // Safely get room number
            String roomNumber = "Unknown";
            try {
                if (assignedTask.getRoom() != null && assignedTask.getRoom().getRoomNumber() != null) {
                    roomNumber = assignedTask.getRoom().getRoomNumber();
                }
            } catch (Exception e) {
                // Ignore room access errors
            }
            taskMap.put("roomNumber", roomNumber);
            
            // Add assigned staff info
            if (assignedTask.getAssignedStaff() != null) {
                taskMap.put("assignedStaffId", assignedTask.getAssignedStaff().getId());
                taskMap.put("assignedStaffName", 
                    (assignedTask.getAssignedStaff().getFirstName() != null ? assignedTask.getAssignedStaff().getFirstName() : "") + " " + 
                    (assignedTask.getAssignedStaff().getLastName() != null ? assignedTask.getAssignedStaff().getLastName() : ""));
            }
            
            return ResponseEntity.ok(taskMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to assign task: " + e.getMessage()));
        }
    }

    /**
     * Assign maintenance request to staff member
     */
    @PutMapping("/maintenance/{requestId}/assign/{staffId}")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> assignMaintenanceRequest(@PathVariable Long requestId, @PathVariable Long staffId) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            // TODO: Assign maintenance request using a proper maintenance service
            // MaintenanceRequest assignedRequest = maintenanceService.assignMaintenanceRequest(requestId, staffId, tenantId);
            
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of("error", "Maintenance request assignment not yet implemented - MaintenanceService needed"));
            
            /*
            // Convert to simplified format to avoid circular references
            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("id", assignedRequest.getId());
            requestMap.put("title", assignedRequest.getTitle());
            requestMap.put("description", assignedRequest.getDescription());
            requestMap.put("category", assignedRequest.getCategory().toString());
            requestMap.put("priority", assignedRequest.getPriority().toString());
            requestMap.put("status", assignedRequest.getStatus().toString());
            requestMap.put("createdAt", assignedRequest.getCreatedAt().toString());
            
            // Safely get room number
            String roomNumber = "Unknown";
            try {
                if (assignedRequest.getRoom() != null && assignedRequest.getRoom().getRoomNumber() != null) {
                    roomNumber = assignedRequest.getRoom().getRoomNumber();
                }
            } catch (Exception e) {
                // Ignore room access errors
            }
            requestMap.put("roomNumber", roomNumber);
            
            // Add assigned staff info
            if (assignedRequest.getAssignedStaff() != null) {
                requestMap.put("assignedStaffId", assignedRequest.getAssignedStaff().getId());
                requestMap.put("assignedStaffName", 
                    (assignedRequest.getAssignedStaff().getFirstName() != null ? assignedRequest.getAssignedStaff().getFirstName() : "") + " " + 
                    (assignedRequest.getAssignedStaff().getLastName() != null ? assignedRequest.getAssignedStaff().getLastName() : ""));
            }
            
            return ResponseEntity.ok(requestMap);
            */
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to assign maintenance request: " + e.getMessage()));
        }
    }

    /**
     * Auto-assign housekeeping task to available staff
     */
    @PutMapping("/tasks/housekeeping/{taskId}/auto-assign")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR')")
    public ResponseEntity<?> autoAssignHousekeepingTask(@PathVariable Long taskId) {
        try {
            String tenantId = getCurrentUserTenantId();
            if (tenantId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Operations supervisor must be associated with a tenant"));
            }
            
            HousekeepingTask assignedTask = housekeepingService.assignTaskAutomatically(taskId, tenantId);
            
            // Convert to simplified format to avoid circular references
            Map<String, Object> taskMap = new HashMap<>();
            taskMap.put("id", assignedTask.getId());
            taskMap.put("taskType", assignedTask.getTaskType() != null ? assignedTask.getTaskType().toString() : "UNKNOWN");
            taskMap.put("status", assignedTask.getStatus() != null ? assignedTask.getStatus().toString() : "UNKNOWN");
            taskMap.put("priority", assignedTask.getPriority() != null ? assignedTask.getPriority().toString() : "NORMAL");
            taskMap.put("description", assignedTask.getDescription() != null ? assignedTask.getDescription() : "");
            taskMap.put("assignedAt", assignedTask.getAssignedAt() != null ? assignedTask.getAssignedAt().toString() : null);
            
            // Safely get room number
            String roomNumber = "Unknown";
            try {
                if (assignedTask.getRoom() != null && assignedTask.getRoom().getRoomNumber() != null) {
                    roomNumber = assignedTask.getRoom().getRoomNumber();
                }
            } catch (Exception e) {
                // Ignore room access errors
            }
            taskMap.put("roomNumber", roomNumber);
            
            // Add assigned staff info
            if (assignedTask.getAssignedStaff() != null) {
                taskMap.put("assignedStaffId", assignedTask.getAssignedStaff().getId());
                taskMap.put("assignedStaffName", 
                    (assignedTask.getAssignedStaff().getFirstName() != null ? assignedTask.getAssignedStaff().getFirstName() : "") + " " + 
                    (assignedTask.getAssignedStaff().getLastName() != null ? assignedTask.getAssignedStaff().getLastName() : ""));
            }
            
            return ResponseEntity.ok(taskMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to auto-assign task: " + e.getMessage()));
        }
    }

    /**
     * CreateMaintenanceRequest DTO for creating maintenance requests
     */
    public static class CreateMaintenanceRequest {
        private Long roomId;
        private String title;
        private String description;
        private MaintenanceCategory category;
        private MaintenancePriority priority;
        
        // Getters and setters
        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public MaintenanceCategory getCategory() { return category; }
        public void setCategory(MaintenanceCategory category) { this.category = category; }
        
        public MaintenancePriority getPriority() { return priority; }
        public void setPriority(MaintenancePriority priority) { this.priority = priority; }
    }
}
