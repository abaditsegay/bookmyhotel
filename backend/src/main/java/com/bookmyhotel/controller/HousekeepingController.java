package com.bookmyhotel.controller;

import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.enums.WorkShift;
import com.bookmyhotel.service.HousekeepingService;
import com.bookmyhotel.tenant.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/housekeeping")
public class HousekeepingController {

    @Autowired
    private HousekeepingService housekeepingService;

    // Task endpoints
    @PostMapping("/tasks")
    public ResponseEntity<HousekeepingTask> createTask(@RequestBody HousekeepingTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask task = housekeepingService.createTask(
            tenantId,
            request.getRoomId(),
            request.getTaskType(),
            request.getPriority(),
            request.getDescription(),
            request.getSpecialInstructions()
        );
        return ResponseEntity.ok(task);
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<HousekeepingTask>> getAllTasks() {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingTask> tasks = housekeepingService.getAllTasks(tenantId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<HousekeepingTask> getTaskById(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingTask> tasks = housekeepingService.getAllTasks(tenantId);
        HousekeepingTask task = tasks.stream()
            .filter(t -> t.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Task not found"));
        return ResponseEntity.ok(task);
    }

    @GetMapping("/tasks/hotel/{hotelId}")
    public ResponseEntity<List<HousekeepingTask>> getTasksByHotel(@PathVariable Long hotelId) {
        String tenantId = TenantContext.getTenantId();
        // Filter by hotel through room relationship
        List<HousekeepingTask> allTasks = housekeepingService.getAllTasks(tenantId);
        List<HousekeepingTask> hotelTasks = allTasks.stream()
            .filter(task -> task.getRoom() != null && task.getRoom().getHotel() != null && 
                           task.getRoom().getHotel().getId().equals(hotelId))
            .toList();
        return ResponseEntity.ok(hotelTasks);
    }

    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<HousekeepingTask>> getTasksByStatus(@PathVariable HousekeepingTaskStatus status) {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingTask> tasks = housekeepingService.getTasksByStatus(tenantId, status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/tasks/assigned/{staffId}")
    public ResponseEntity<List<HousekeepingTask>> getTasksByAssignedUser(@PathVariable Long staffId) {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingTask> tasks = housekeepingService.getTasksByStaff(tenantId, staffId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/tasks/{id}/assign")
    public ResponseEntity<HousekeepingTask> assignTask(@PathVariable Long id, @RequestBody AssignTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask task = housekeepingService.assignTask(tenantId, id, request.getStaffId());
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{id}/start")
    public ResponseEntity<HousekeepingTask> startTask(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask task = housekeepingService.startTask(tenantId, id);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{id}/complete")
    public ResponseEntity<HousekeepingTask> completeTask(@PathVariable Long id, @RequestBody CompleteTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask task = housekeepingService.completeTask(tenantId, id, request.getNotes(), request.getQualityScore());
        return ResponseEntity.ok(task);
    }

    @PostMapping("/tasks/{id}/complete-with-issues")
    public ResponseEntity<HousekeepingTask> completeTaskWithIssues(@PathVariable Long id, @RequestBody CompleteTaskWithIssuesRequest request) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask task = housekeepingService.completeTaskWithIssues(tenantId, id, request.getNotes(), request.getIssueDescription());
        return ResponseEntity.ok(task);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<HousekeepingTask> updateTask(@PathVariable Long id, @RequestBody HousekeepingTask task) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask updatedTask = housekeepingService.updateTask(tenantId, id, task);
        return ResponseEntity.ok(updatedTask);
    }

    @PostMapping("/tasks/{id}/cancel")
    public ResponseEntity<HousekeepingTask> cancelTask(@PathVariable Long id, @RequestBody CancelTaskRequest request) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingTask task = housekeepingService.cancelTask(tenantId, id, request.getReason());
        return ResponseEntity.ok(task);
    }

    // Staff endpoints
    @PostMapping("/staff")
    public ResponseEntity<HousekeepingStaff> createStaff(@RequestBody HousekeepingStaffRequest request) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingStaff staff = housekeepingService.createStaff(
            tenantId,
            request.getEmail(),
            request.getHotelId(),
            request.getShiftType(),
            request.getEmployeeId()
        );
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/staff")
    public ResponseEntity<List<HousekeepingStaff>> getAllStaff() {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingStaff> staff = housekeepingService.getAllStaff(tenantId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/staff/hotel/{hotelId}")
    public ResponseEntity<List<HousekeepingStaff>> getStaffByHotel(@PathVariable Long hotelId) {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingStaff> staff = housekeepingService.getStaffByHotel(tenantId, hotelId);
        return ResponseEntity.ok(staff);
    }

    @GetMapping("/staff/{id}")
    public ResponseEntity<HousekeepingStaff> getStaffById(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        List<HousekeepingStaff> allStaff = housekeepingService.getAllStaff(tenantId);
        HousekeepingStaff staff = allStaff.stream()
            .filter(s -> s.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Staff not found"));
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/staff/{id}")
    public ResponseEntity<HousekeepingStaff> updateStaff(@PathVariable Long id, @RequestBody HousekeepingStaff staff) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingStaff updatedStaff = housekeepingService.updateStaff(tenantId, id, staff);
        return ResponseEntity.ok(updatedStaff);
    }

    @PostMapping("/staff/{id}/deactivate")
    public ResponseEntity<HousekeepingStaff> deactivateStaff(@PathVariable Long id) {
        String tenantId = TenantContext.getTenantId();
        HousekeepingStaff staff = housekeepingService.deactivateStaff(tenantId, id);
        return ResponseEntity.ok(staff);
    }

    // Statistics endpoints
    @GetMapping("/stats/tasks/status/{status}/count")
    public ResponseEntity<Long> getTaskCountByStatus(@PathVariable HousekeepingTaskStatus status) {
        String tenantId = TenantContext.getTenantId();
        long count = housekeepingService.getTaskCountByStatus(tenantId, status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/quality-score")
    public ResponseEntity<Double> getAverageQualityScore() {
        String tenantId = TenantContext.getTenantId();
        Double score = housekeepingService.getAverageQualityScore(tenantId);
        return ResponseEntity.ok(score);
    }

    @GetMapping("/stats/staff/count")
    public ResponseEntity<Long> getActiveStaffCount() {
        String tenantId = TenantContext.getTenantId();
        Long count = housekeepingService.getActiveStaffCount(tenantId);
        return ResponseEntity.ok(count);
    }

    // DTO Classes
    public static class HousekeepingTaskRequest {
        private Long roomId;
        private HousekeepingTaskType taskType;
        private TaskPriority priority;
        private String description;
        private String specialInstructions;

        // Getters and setters
        public Long getRoomId() { return roomId; }
        public void setRoomId(Long roomId) { this.roomId = roomId; }
        public HousekeepingTaskType getTaskType() { return taskType; }
        public void setTaskType(HousekeepingTaskType taskType) { this.taskType = taskType; }
        public TaskPriority getPriority() { return priority; }
        public void setPriority(TaskPriority priority) { this.priority = priority; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    }

    public static class HousekeepingStaffRequest {
        private String email;
        private Long hotelId;
        private com.bookmyhotel.enums.WorkShift shiftType;
        private String employeeId;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Long getHotelId() { return hotelId; }
        public void setHotelId(Long hotelId) { this.hotelId = hotelId; }
        public com.bookmyhotel.enums.WorkShift getShiftType() { return shiftType; }
        public void setShiftType(com.bookmyhotel.enums.WorkShift shiftType) { this.shiftType = shiftType; }
        public String getEmployeeId() { return employeeId; }
        public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    }

    public static class AssignTaskRequest {
        private Long staffId;

        public Long getStaffId() { return staffId; }
        public void setStaffId(Long staffId) { this.staffId = staffId; }
    }

    public static class CompleteTaskRequest {
        private String notes;
        private Integer qualityScore;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Integer getQualityScore() { return qualityScore; }
        public void setQualityScore(Integer qualityScore) { this.qualityScore = qualityScore; }
    }

    public static class CompleteTaskWithIssuesRequest {
        private String notes;
        private String issueDescription;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public String getIssueDescription() { return issueDescription; }
        public void setIssueDescription(String issueDescription) { this.issueDescription = issueDescription; }
    }

    public static class CancelTaskRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
