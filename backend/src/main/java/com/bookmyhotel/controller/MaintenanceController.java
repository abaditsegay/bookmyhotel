package com.bookmyhotel.controller;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.service.MaintenanceService;
import com.bookmyhotel.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for Maintenance Management
 * Provides endpoints for maintenance task operations
 */
@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    // ===== MAINTENANCE TASK ENDPOINTS =====

    /**
     * Create a new maintenance task
     */
    @PostMapping("/tasks")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> createTask(@Valid @RequestBody CreateMaintenanceTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        
        MaintenanceTask task = maintenanceService.createTask(
            tenantId,
            request.getHotelId(),
            request.getRoomId(),
            request.getTaskType(),
            request.getTitle(),
            request.getDescription(),
            request.getPriority(),
            request.getCreatedByUserId(),
            request.getLocation(),
            request.getEquipmentType()
        );
        
        return ResponseEntity.ok(task);
    }

    /**
     * Get all maintenance tasks
     */
    @GetMapping("/tasks")
    @PreAuthorize("hasRole('MAINTENANCE') or hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<MaintenanceTask>> getAllTasks() {
        String tenantId = TenantContext.getTenantId();
        List<MaintenanceTask> tasks = maintenanceService.getAllTasks(tenantId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Get task by ID
     */
    @GetMapping("/tasks/{taskId}")
    @PreAuthorize("hasRole('MAINTENANCE') or hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> getTaskById(@PathVariable Long taskId) {
        String tenantId = TenantContext.getTenantId();
        List<MaintenanceTask> tasks = maintenanceService.getAllTasks(tenantId);
        MaintenanceTask task = tasks.stream()
            .filter(t -> t.getId().equals(taskId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Task not found"));
        return ResponseEntity.ok(task);
    }

    /**
     * Assign task to maintenance staff
     */
    @PutMapping("/tasks/{taskId}/assign/{userId}")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> assignTask(@PathVariable Long taskId, @PathVariable Long userId) {
        String tenantId = TenantContext.getTenantId();
        MaintenanceTask task = maintenanceService.assignTask(tenantId, taskId, userId);
        return ResponseEntity.ok(task);
    }

    /**
     * Start a maintenance task
     */
    @PutMapping("/tasks/{taskId}/start")
    @PreAuthorize("hasRole('MAINTENANCE') or hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> startTask(@PathVariable Long taskId) {
        String tenantId = TenantContext.getTenantId();
        MaintenanceTask task = maintenanceService.startTask(tenantId, taskId);
        return ResponseEntity.ok(task);
    }

    /**
     * Complete a maintenance task
     */
    @PutMapping("/tasks/{taskId}/complete")
    @PreAuthorize("hasRole('MAINTENANCE') or hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> completeTask(@PathVariable Long taskId, 
                                                       @RequestBody CompleteMaintenanceTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        MaintenanceTask task = maintenanceService.completeTask(
            tenantId, 
            taskId, 
            request.getWorkPerformed(), 
            request.getPartsUsed(),
            request.getActualCost()
        );
        return ResponseEntity.ok(task);
    }

    /**
     * Update task details
     */
    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> updateTask(@PathVariable Long taskId, 
                                                     @Valid @RequestBody MaintenanceTask updatedTask) {
        String tenantId = TenantContext.getTenantId();
        MaintenanceTask task = maintenanceService.updateTask(tenantId, taskId, updatedTask);
        return ResponseEntity.ok(task);
    }

    /**
     * Cancel a maintenance task
     */
    @PutMapping("/tasks/{taskId}/cancel")
    @PreAuthorize("hasRole('OPERATIONS_SUPERVISOR') or hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<MaintenanceTask> cancelTask(@PathVariable Long taskId, 
                                                     @RequestBody CancelMaintenanceTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        MaintenanceTask task = maintenanceService.cancelTask(tenantId, taskId, request.getReason());
        return ResponseEntity.ok(task);
    }

    // ===== REQUEST/RESPONSE DTOs =====

    public static class CreateMaintenanceTaskRequest {
        private Long hotelId;
        private Long roomId;
        private String taskType;
        private String title;
        private String description;
        private TaskPriority priority;
        private Long createdByUserId;
        private String location;
        private String equipmentType;

        // Getters and setters
        public Long getHotelId() { return hotelId; }
        public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
        
        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }
        
        public String getTaskType() { return taskType; }
        public void setTaskType(String taskType) { this.taskType = taskType; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public TaskPriority getPriority() { return priority; }
        public void setPriority(TaskPriority priority) { this.priority = priority; }
        
        public Long getCreatedByUserId() { return createdByUserId; }
        public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public String getEquipmentType() { return equipmentType; }
        public void setEquipmentType(String equipmentType) { this.equipmentType = equipmentType; }
    }

    public static class CompleteMaintenanceTaskRequest {
        private String workPerformed;
        private String partsUsed;
        private Double actualCost;

        public String getWorkPerformed() { return workPerformed; }
        public void setWorkPerformed(String workPerformed) { this.workPerformed = workPerformed; }
        
        public String getPartsUsed() { return partsUsed; }
        public void setPartsUsed(String partsUsed) { this.partsUsed = partsUsed; }
        
        public Double getActualCost() { return actualCost; }
        public void setActualCost(Double actualCost) { this.actualCost = actualCost; }
    }

    public static class CancelMaintenanceTaskRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
