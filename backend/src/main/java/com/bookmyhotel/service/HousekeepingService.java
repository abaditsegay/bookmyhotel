package com.bookmyhotel.service;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.repository.HousekeepingStaffRepository;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing housekeeping operations
 */
@Service
@Transactional
public class HousekeepingService {

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @Autowired
    private HousekeepingStaffRepository housekeepingStaffRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    // ===== TASK MANAGEMENT METHODS =====

    /**
     * Create a new housekeeping task
     */
    public HousekeepingTask createTask(String tenantId, Long roomId, HousekeepingTaskType taskType, 
                                      TaskPriority priority, String description, String specialInstructions) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

        HousekeepingTask task = new HousekeepingTask();
        task.setTenantId(tenantId);
        task.setRoom(room);
        task.setTaskType(taskType);
        task.setStatus(HousekeepingTaskStatus.PENDING);
        task.setPriority(priority);
        task.setDescription(description);
        task.setSpecialInstructions(specialInstructions);
        task.setCreatedAt(LocalDateTime.now());

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Get all tasks for a tenant
     */
    public List<HousekeepingTask> getAllTasks(String tenantId) {
        return housekeepingTaskRepository.findByTenantId(tenantId);
    }

    /**
     * Get tasks with pagination
     */
    public Page<HousekeepingTask> getAllTasks(String tenantId, Pageable pageable) {
        return housekeepingTaskRepository.findByTenantId(tenantId, pageable);
    }

    /**
     * Get tasks by status
     */
    public List<HousekeepingTask> getTasksByStatus(String tenantId, HousekeepingTaskStatus status) {
        return housekeepingTaskRepository.findByTenantIdAndStatus(tenantId, status);
    }

    /**
     * Get tasks assigned to a specific staff member
     */
    public List<HousekeepingTask> getTasksByStaff(String tenantId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff member not found"));
        return housekeepingTaskRepository.findByTenantIdAndAssignedStaff(tenantId, staff);
    }

    /**
     * Get tasks assigned to a specific staff member with status filter
     */
    public List<HousekeepingTask> getTasksByStaffAndStatus(String tenantId, Long staffId, HousekeepingTaskStatus status) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff member not found"));
        return housekeepingTaskRepository.findByTenantIdAndAssignedStaffAndStatus(tenantId, staff, status);
    }

    /**
     * Assign a task to a staff member
     */
    public HousekeepingTask assignTask(String tenantId, Long taskId, Long staffId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));
        
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff member not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        task.setAssignedStaff(staff);
        task.setStatus(HousekeepingTaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Start a task (staff member begins work)
     */
    public HousekeepingTask startTask(String tenantId, Long taskId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getAssignedStaff() == null) {
            throw new RuntimeException("Task must be assigned to a staff member before starting");
        }

        if (task.getStatus() != HousekeepingTaskStatus.ASSIGNED) {
            throw new RuntimeException("Task can only be started from ASSIGNED status");
        }

        task.setStatus(HousekeepingTaskStatus.IN_PROGRESS);
        task.setStartedAt(LocalDateTime.now());

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Complete a task
     */
    public HousekeepingTask completeTask(String tenantId, Long taskId, String notes, Integer qualityScore) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getStatus() != HousekeepingTaskStatus.IN_PROGRESS) {
            throw new RuntimeException("Task can only be completed from IN_PROGRESS status");
        }

        task.setStatus(HousekeepingTaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        task.setInspectorNotes(notes);
        
        if (qualityScore != null) {
            task.setQualityScore(qualityScore);
        }

        // Calculate actual duration
        if (task.getStartedAt() != null) {
            long minutes = java.time.Duration.between(task.getStartedAt(), task.getCompletedAt()).toMinutes();
            task.setActualDurationMinutes((int) minutes);
        }

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Complete a task with issues
     */
    public HousekeepingTask completeTaskWithIssues(String tenantId, Long taskId, String notes, String issueDescription) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getStatus() != HousekeepingTaskStatus.IN_PROGRESS) {
            throw new RuntimeException("Task can only be completed from IN_PROGRESS status");
        }

        task.setStatus(HousekeepingTaskStatus.COMPLETED_WITH_ISSUES);
        task.setCompletedAt(LocalDateTime.now());
        task.setInspectorNotes(notes);
        task.setSpecialInstructions(issueDescription); // Store issue description in special instructions

        // Calculate actual duration
        if (task.getStartedAt() != null) {
            long minutes = java.time.Duration.between(task.getStartedAt(), task.getCompletedAt()).toMinutes();
            task.setActualDurationMinutes((int) minutes);
        }

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Cancel a task
     */
    public HousekeepingTask cancelTask(String tenantId, Long taskId, String reason) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getStatus() == HousekeepingTaskStatus.COMPLETED || 
            task.getStatus() == HousekeepingTaskStatus.COMPLETED_WITH_ISSUES) {
            throw new RuntimeException("Cannot cancel a completed task");
        }

        task.setStatus(HousekeepingTaskStatus.CANCELLED);
        task.setInspectorNotes(reason);

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Update task details
     */
    public HousekeepingTask updateTask(String tenantId, Long taskId, HousekeepingTask updatedTask) {
        HousekeepingTask existingTask = housekeepingTaskRepository.findById(taskId)
            .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!existingTask.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        // Update allowed fields
        if (updatedTask.getDescription() != null) {
            existingTask.setDescription(updatedTask.getDescription());
        }
        if (updatedTask.getSpecialInstructions() != null) {
            existingTask.setSpecialInstructions(updatedTask.getSpecialInstructions());
        }
        if (updatedTask.getPriority() != null) {
            existingTask.setPriority(updatedTask.getPriority());
        }
        if (updatedTask.getTaskType() != null) {
            existingTask.setTaskType(updatedTask.getTaskType());
        }

        return housekeepingTaskRepository.save(existingTask);
    }

    // ===== TASK QUERY METHODS =====

    /**
     * Get overdue tasks
     */
    public List<HousekeepingTask> getOverdueTasks(String tenantId) {
        List<HousekeepingTaskStatus> pendingStatuses = List.of(
            HousekeepingTaskStatus.PENDING,
            HousekeepingTaskStatus.ASSIGNED,
            HousekeepingTaskStatus.IN_PROGRESS
        );
        return housekeepingTaskRepository.findOverdueTasks(tenantId, pendingStatuses, LocalDateTime.now().minusHours(24));
    }

    /**
     * Get high priority pending tasks
     */
    public List<HousekeepingTask> getHighPriorityPendingTasks(String tenantId) {
        return housekeepingTaskRepository.findHighPriorityPendingTasks(tenantId);
    }

    /**
     * Get tasks requiring follow-up
     */
    public List<HousekeepingTask> getTasksRequiringFollowUp(String tenantId) {
        return housekeepingTaskRepository.findTasksRequiringFollowUp(tenantId);
    }

    /**
     * Get unassigned tasks
     */
    public List<HousekeepingTask> getUnassignedTasks(String tenantId) {
        return housekeepingTaskRepository.findByTenantIdAndAssignedStaffIsNull(tenantId);
    }

    /**
     * Get active tasks for a staff member
     */
    public List<HousekeepingTask> getActiveTasksByStaff(String tenantId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff member not found"));
        return housekeepingTaskRepository.findActiveTasksByStaff(tenantId, staff);
    }

    // ===== STAFF MANAGEMENT METHODS =====

    /**
     * Create a new housekeeping staff member
     */
    public HousekeepingStaff createStaff(String tenantId, Long userId, Long hotelId, HousekeepingStaff.ShiftType shiftType, String employeeId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if staff already exists for this user
        Optional<HousekeepingStaff> existingStaff = housekeepingStaffRepository.findByTenantIdAndUserId(tenantId, userId);
        if (existingStaff.isPresent()) {
            throw new RuntimeException("Housekeeping staff already exists for this user");
        }

        HousekeepingStaff staff = new HousekeepingStaff();
        staff.setTenantId(tenantId);
        staff.setUser(user);
        // Note: Hotel field requires Hotel entity, not just ID - leaving null for now
        staff.setShiftType(shiftType);
        staff.setEmployeeId(employeeId != null ? employeeId : "EMP" + System.currentTimeMillis());
        staff.setIsActive(true);
        staff.setMaxConcurrentTasks(3);
        staff.setPerformanceRating(3.0);
        staff.setTotalTasksCompleted(0);
        staff.setCreatedAt(LocalDateTime.now());

        return housekeepingStaffRepository.save(staff);
    }

    /**
     * Get all staff members for a tenant
     */
    public List<HousekeepingStaff> getAllStaff(String tenantId) {
        return housekeepingStaffRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    /**
     * Get staff members with pagination
     */
    public Page<HousekeepingStaff> getAllStaff(String tenantId, Pageable pageable) {
        return housekeepingStaffRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    /**
     * Get staff members by hotel
     */
    public List<HousekeepingStaff> getStaffByHotel(String tenantId, Long hotelId) {
        return housekeepingStaffRepository.findByTenantIdAndHotel_IdOrderByCreatedAtDesc(tenantId, hotelId);
    }

    /**
     * Get active staff members
     */
    public List<HousekeepingStaff> getActiveStaff(String tenantId) {
        return housekeepingStaffRepository.findByTenantIdAndIsActiveTrue(tenantId);
    }

    /**
     * Get available staff members (with low workload)
     */
    public List<HousekeepingStaff> getAvailableStaff(String tenantId, Integer maxWorkload) {
        return housekeepingStaffRepository.findAvailableStaff(tenantId, maxWorkload);
    }

    /**
     * Get staff members by shift type
     */
    public List<HousekeepingStaff> getStaffByShift(String tenantId, HousekeepingStaff.ShiftType shiftType) {
        // Note: The repository method expects ShiftType, but entity uses HousekeepingStaff.ShiftType
        // We need to convert or create a compatible method
        return housekeepingStaffRepository.findByTenantIdAndIsActiveTrue(tenantId).stream()
            .filter(staff -> staff.getShiftType() == shiftType)
            .toList();
    }

    /**
     * Update staff member information
     */
    public HousekeepingStaff updateStaff(String tenantId, Long staffId, HousekeepingStaff updatedStaff) {
        HousekeepingStaff existingStaff = housekeepingStaffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff member not found"));

        if (!existingStaff.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Staff member not found for this tenant");
        }

        // Update allowed fields
        if (updatedStaff.getShiftType() != null) {
            existingStaff.setShiftType(updatedStaff.getShiftType());
        }
        if (updatedStaff.getHourlyRate() != null) {
            existingStaff.setHourlyRate(updatedStaff.getHourlyRate());
        }
        if (updatedStaff.getIsActive() != null) {
            existingStaff.setIsActive(updatedStaff.getIsActive());
        }
        if (updatedStaff.getHotel() != null) {
            existingStaff.setHotel(updatedStaff.getHotel());
        }

        return housekeepingStaffRepository.save(existingStaff);
    }

    /**
     * Deactivate a staff member
     */
    public HousekeepingStaff deactivateStaff(String tenantId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
            .orElseThrow(() -> new RuntimeException("Staff member not found"));

        if (!staff.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Staff member not found for this tenant");
        }

        staff.setIsActive(false);
        return housekeepingStaffRepository.save(staff);
    }

    // ===== STATISTICS AND REPORTING METHODS =====

    /**
     * Get task count by status
     */
    public long getTaskCountByStatus(String tenantId, HousekeepingTaskStatus status) {
        return housekeepingTaskRepository.countByTenantIdAndStatus(tenantId, status);
    }

    /**
     * Get average quality score for a tenant
     */
    public Double getAverageQualityScore(String tenantId) {
        return housekeepingTaskRepository.findAverageQualityScoreByTenantId(tenantId).orElse(0.0);
    }

    /**
     * Get average task duration by task type
     */
    public Double getAverageDurationByTaskType(String tenantId, HousekeepingTaskType taskType) {
        return housekeepingTaskRepository.findAverageDurationByTenantIdAndTaskType(tenantId, taskType).orElse(0.0);
    }

    /**
     * Get staff performance metrics
     */
    public List<Object[]> getStaffPerformanceMetrics(String tenantId, LocalDateTime start, LocalDateTime end) {
        return housekeepingTaskRepository.findStaffPerformanceMetrics(tenantId, start, end);
    }

    /**
     * Get daily task summary
     */
    public List<Object[]> getDailyTaskSummary(String tenantId, LocalDateTime date) {
        return housekeepingTaskRepository.findDailyTaskSummary(tenantId, date);
    }

    /**
     * Get top performing staff members
     */
    public List<HousekeepingStaff> getTopPerformers(String tenantId, Double minRating) {
        return housekeepingStaffRepository.findTopPerformers(tenantId, minRating);
    }

    /**
     * Get active staff count
     */
    public Long getActiveStaffCount(String tenantId) {
        return housekeepingStaffRepository.countActiveStaff(tenantId);
    }

    /**
     * Get average staff rating
     */
    public Double getAverageStaffRating(String tenantId) {
        return housekeepingStaffRepository.getAverageStaffRating(tenantId);
    }
}
