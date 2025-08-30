package com.bookmyhotel.service;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.repository.MaintenanceTaskRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.HousekeepingStaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for managing maintenance operations
 */
@Service
@Transactional
public class MaintenanceService {

    @Autowired
    private MaintenanceTaskRepository maintenanceTaskRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private HousekeepingStaffRepository housekeepingStaffRepository;

    // ===== MAINTENANCE TASK MANAGEMENT METHODS =====

    /**
     * Create a new maintenance task
     */
    public MaintenanceTask createTask(String tenantId, Long hotelId, Long roomId, String taskType,
            String title, String description, TaskPriority priority,
            Long createdByUserId, String location, String equipmentType) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("Creator user not found"));

        MaintenanceTask task = new MaintenanceTask();
        task.setTenantId(tenantId);
        task.setHotel(hotel);
        task.setTaskType(taskType);
        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(priority);
        task.setCreatedBy(createdBy);
        task.setLocation(location);
        task.setEquipmentType(equipmentType);
        task.setStatus(TaskStatus.OPEN);
        task.setCreatedAt(LocalDateTime.now());

        if (roomId != null) {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            task.setRoom(room);
        }

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Get all maintenance tasks for a tenant
     */
    public List<MaintenanceTask> getAllTasks(String tenantId) {
        return maintenanceTaskRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    /**
     * Get maintenance tasks with pagination
     */
    public Page<MaintenanceTask> getAllTasks(String tenantId, Pageable pageable) {
        return maintenanceTaskRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    /**
     * Get tasks assigned to a specific user by email
     */
    public List<MaintenanceTask> getTasksAssignedToUser(String tenantId, String userEmail) {
        return maintenanceTaskRepository.findByTenantIdAndAssignedTo_EmailOrderByCreatedAtDesc(tenantId, userEmail);
    }

    /**
     * Get tasks by hotel
     */
    public List<MaintenanceTask> getTasksByHotel(String tenantId, Long hotelId) {
        return maintenanceTaskRepository.findByTenantIdAndHotelIdOrderByCreatedAtDesc(tenantId, hotelId);
    }

    /**
     * Get tasks by status
     */
    public List<MaintenanceTask> getTasksByStatus(String tenantId, TaskStatus status) {
        return maintenanceTaskRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status);
    }

    /**
     * Get tasks by priority
     */
    public List<MaintenanceTask> getTasksByPriority(String tenantId, TaskPriority priority) {
        return maintenanceTaskRepository.findByTenantIdAndPriorityOrderByCreatedAtDesc(tenantId, priority);
    }

    /**
     * Get tasks by task type
     */
    public List<MaintenanceTask> getTasksByType(String tenantId, String taskType) {
        return maintenanceTaskRepository.findByTenantIdAndTaskTypeOrderByCreatedAtDesc(tenantId, taskType);
    }

    /**
     * Get tasks by equipment type
     */
    public List<MaintenanceTask> getTasksByEquipmentType(String tenantId, String equipmentType) {
        return maintenanceTaskRepository.findByTenantIdAndEquipmentTypeOrderByCreatedAtDesc(tenantId, equipmentType);
    }

    /**
     * Get tasks assigned to a specific housekeeping staff member
     */
    public List<MaintenanceTask> getTasksByAssignedStaff(String tenantId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Housekeeping staff not found"));
        return maintenanceTaskRepository.findByTenantIdAndAssignedTo(tenantId, staff);
    }

    /**
     * Assign a maintenance task to a housekeeping staff member
     */
    public MaintenanceTask assignTask(String tenantId, Long taskId, Long staffId) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Housekeeping staff not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        task.setAssignedTo(staff);
        task.setStatus(TaskStatus.ASSIGNED);

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Start a maintenance task
     */
    public MaintenanceTask startTask(String tenantId, Long taskId) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getAssignedTo() == null) {
            throw new RuntimeException("Task must be assigned before starting");
        }

        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new RuntimeException("Task can only be started from ASSIGNED status");
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setActualStartTime(LocalDateTime.now());

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Complete a maintenance task
     */
    public MaintenanceTask completeTask(String tenantId, Long taskId, String workPerformed, String partsUsed,
            Double actualCost) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new RuntimeException("Task can only be completed from IN_PROGRESS status");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setActualEndTime(LocalDateTime.now());
        task.setWorkPerformed(workPerformed);
        task.setPartsUsed(partsUsed);
        task.setActualCost(actualCost);

        // Calculate actual duration
        if (task.getActualStartTime() != null) {
            long minutes = java.time.Duration.between(task.getActualStartTime(), task.getActualEndTime()).toMinutes();
            task.setActualDurationMinutes((int) minutes);
        }

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Cancel a maintenance task
     */
    public MaintenanceTask cancelTask(String tenantId, Long taskId, String reason) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        if (!task.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed task");
        }

        task.setStatus(TaskStatus.CANCELLED);
        task.setVerificationNotes(reason);

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Update maintenance task details
     */
    public MaintenanceTask updateTask(String tenantId, Long taskId, MaintenanceTask updatedTask) {
        MaintenanceTask existingTask = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        if (!existingTask.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Task not found for this tenant");
        }

        // Update allowed fields
        if (updatedTask.getDescription() != null) {
            existingTask.setDescription(updatedTask.getDescription());
        }
        if (updatedTask.getLocation() != null) {
            existingTask.setLocation(updatedTask.getLocation());
        }
        if (updatedTask.getPriority() != null) {
            existingTask.setPriority(updatedTask.getPriority());
        }
        if (updatedTask.getTaskType() != null) {
            existingTask.setTaskType(updatedTask.getTaskType());
        }
        if (updatedTask.getEstimatedDurationMinutes() != null) {
            existingTask.setEstimatedDurationMinutes(updatedTask.getEstimatedDurationMinutes());
        }

        return maintenanceTaskRepository.save(existingTask);
    }

    // ===== QUERY METHODS =====

    /**
     * Get unassigned maintenance tasks
     */
    public List<MaintenanceTask> getUnassignedTasks(String tenantId) {
        return maintenanceTaskRepository.findByTenantIdAndAssignedToIsNull(tenantId);
    }

    /**
     * Get overdue maintenance tasks
     */
    public List<MaintenanceTask> getOverdueTasks(String tenantId) {
        return maintenanceTaskRepository.findOverdueTasks(tenantId, LocalDateTime.now());
    }

    /**
     * Get urgent maintenance tasks
     */
    public List<MaintenanceTask> getUrgentTasks(String tenantId) {
        return maintenanceTaskRepository.findByTenantIdAndPriorityOrderByCreatedAtAsc(tenantId, TaskPriority.URGENT);
    }

    /**
     * Get tasks for a specific room
     */
    public List<MaintenanceTask> getTasksByRoom(String tenantId, Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return maintenanceTaskRepository.findByTenantIdAndRoom(tenantId, room);
    }

    /**
     * Get tasks within a date range
     */
    public List<MaintenanceTask> getTasksByDateRange(String tenantId, LocalDateTime start, LocalDateTime end) {
        return maintenanceTaskRepository.findByTenantIdAndCreatedAtBetween(tenantId, start, end);
    }

    // ===== STATISTICS METHODS =====

    /**
     * Get task count by status
     */
    public long getTaskCountByStatus(String tenantId, TaskStatus status) {
        return maintenanceTaskRepository.countByTenantIdAndStatus(tenantId, status);
    }

    /**
     * Get task count by priority
     */
    public long getTaskCountByPriority(String tenantId, TaskPriority priority) {
        return maintenanceTaskRepository.countByTenantIdAndPriority(tenantId, priority);
    }

    /**
     * Get average completion time by category
     */
    public Double getAverageCompletionTimeByCategory(String tenantId, String category) {
        return maintenanceTaskRepository.findAverageDurationByCategory(tenantId, category);
    }

    /**
     * Get task completion rate
     */
    public Double getTaskCompletionRate(String tenantId, LocalDateTime start, LocalDateTime end) {
        long totalTasks = maintenanceTaskRepository.countByTenantIdAndCreatedAtBetween(tenantId, start, end);
        long completedTasks = maintenanceTaskRepository.countByTenantIdAndStatusAndActualEndTimeBetween(
                tenantId, TaskStatus.COMPLETED, start, end);

        if (totalTasks == 0) {
            return 0.0;
        }

        return (double) completedTasks / totalTasks * 100.0;
    }

    /**
     * Get most common maintenance categories
     */
    public List<Object[]> getMostCommonCategories(String tenantId, int limit) {
        return maintenanceTaskRepository.findMostCommonCategories(tenantId);
    }

    /**
     * Get staff workload statistics
     */
    public List<Object[]> getStaffWorkloadStats(String tenantId, LocalDateTime start, LocalDateTime end) {
        return maintenanceTaskRepository.findStaffWorkloadStats(tenantId, start, end);
    }
}
