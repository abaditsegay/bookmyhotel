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
    public MaintenanceTask createTask(Long hotelId, Long roomId, String taskType,
            String title, String description, TaskPriority priority,
            Long createdByUserId, String location, String equipmentType) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        User createdBy = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("Creator user not found"));

        MaintenanceTask task = new MaintenanceTask();
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

            // Verify room belongs to the specified hotel
            if (!room.getHotel().getId().equals(hotelId)) {
                throw new RuntimeException("Room does not belong to the specified hotel");
            }

            task.setRoom(room);
        }

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Get all maintenance tasks for a hotel
     */
    public List<MaintenanceTask> getAllTasks(Long hotelId) {
        return maintenanceTaskRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
    }

    /**
     * Get maintenance tasks with pagination
     */
    public Page<MaintenanceTask> getAllTasks(Long hotelId, Pageable pageable) {
        return maintenanceTaskRepository.findByHotelIdOrderByCreatedAtDesc(hotelId, pageable);
    }

    /**
     * Get tasks assigned to a specific user by email
     */
    public List<MaintenanceTask> getTasksAssignedToUser(Long hotelId, String userEmail) {
        return maintenanceTaskRepository.findByHotelIdAndAssignedTo_EmailOrderByCreatedAtDesc(hotelId, userEmail);
    }

    /**
     * Get tasks by status
     */
    public List<MaintenanceTask> getTasksByStatus(Long hotelId, TaskStatus status) {
        return maintenanceTaskRepository.findByHotelIdAndStatusOrderByCreatedAtDesc(hotelId, status);
    }

    /**
     * Get tasks by priority
     */
    public List<MaintenanceTask> getTasksByPriority(Long hotelId, TaskPriority priority) {
        return maintenanceTaskRepository.findByHotelIdAndPriorityOrderByCreatedAtDesc(hotelId, priority);
    }

    /**
     * Get tasks by task type
     */
    public List<MaintenanceTask> getTasksByType(Long hotelId, String taskType) {
        return maintenanceTaskRepository.findByHotelIdAndTaskTypeOrderByCreatedAtDesc(hotelId, taskType);
    }

    /**
     * Get tasks by equipment type
     */
    public List<MaintenanceTask> getTasksByEquipmentType(Long hotelId, String equipmentType) {
        return maintenanceTaskRepository.findByHotelIdAndEquipmentTypeOrderByCreatedAtDesc(hotelId, equipmentType);
    }

    /**
     * Get tasks assigned to a specific housekeeping staff member
     */
    public List<MaintenanceTask> getTasksByAssignedStaff(Long hotelId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Housekeeping staff not found"));

        // Verify staff belongs to the specified hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member does not belong to this hotel");
        }

        return maintenanceTaskRepository.findByHotelIdAndAssignedTo(hotelId, staff);
    }

    /**
     * Assign a maintenance task to a housekeeping staff member
     */
    public MaintenanceTask assignTask(Long hotelId, Long taskId, Long staffId) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Housekeeping staff not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
        }

        // Verify staff belongs to the same hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member does not belong to this hotel");
        }

        task.setAssignedTo(staff);
        task.setStatus(TaskStatus.ASSIGNED);

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Start a maintenance task
     */
    public MaintenanceTask startTask(Long hotelId, Long taskId) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public MaintenanceTask completeTask(Long hotelId, Long taskId, String workPerformed, String partsUsed,
            Double actualCost) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public MaintenanceTask cancelTask(Long hotelId, Long taskId, String reason) {
        MaintenanceTask task = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public MaintenanceTask updateTask(Long hotelId, Long taskId, MaintenanceTask updatedTask) {
        MaintenanceTask existingTask = maintenanceTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Maintenance task not found"));

        // Verify task belongs to the specified hotel
        if (!existingTask.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public List<MaintenanceTask> getUnassignedTasks(Long hotelId) {
        return maintenanceTaskRepository.findByHotelIdAndAssignedToIsNull(hotelId);
    }

    /**
     * Get overdue maintenance tasks
     */
    public List<MaintenanceTask> getOverdueTasks(Long hotelId) {
        return maintenanceTaskRepository.findOverdueTasks(hotelId, LocalDateTime.now());
    }

    /**
     * Get urgent maintenance tasks
     */
    public List<MaintenanceTask> getUrgentTasks(Long hotelId) {
        return maintenanceTaskRepository.findByHotelIdAndPriorityOrderByCreatedAtDesc(hotelId, TaskPriority.URGENT);
    }

    /**
     * Get tasks for a specific room
     */
    public List<MaintenanceTask> getTasksByRoom(Long hotelId, Long roomId) {
        return maintenanceTaskRepository.findByHotelIdAndRoomIdOrderByCreatedAtDesc(hotelId, roomId);
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
     * Get tasks within a date range
     */
    public List<MaintenanceTask> getTasksByDateRange(Long hotelId, LocalDateTime start, LocalDateTime end) {
        return maintenanceTaskRepository.findByHotelIdAndCreatedAtBetween(hotelId, start, end);
    }

    // ===== STATISTICS METHODS =====

    /**
     * Get task count by status
     */
    public long getTaskCountByStatus(Long hotelId, TaskStatus status) {
        return maintenanceTaskRepository.countByHotelIdAndStatus(hotelId, status);
    }

    /**
     * Get task count by priority
     */
    public long getTaskCountByPriority(Long hotelId, TaskPriority priority) {
        return maintenanceTaskRepository.countByHotelIdAndPriority(hotelId, priority);
    }

    /**
     * Get average completion time by category
     */
    public Double getAverageCompletionTimeByCategory(Long hotelId, String category) {
        return maintenanceTaskRepository.findAverageDurationByCategory(hotelId, category);
    }

    /**
     * Get task completion rate
     */
    public Double getTaskCompletionRate(Long hotelId, LocalDateTime start, LocalDateTime end) {
        long totalTasks = maintenanceTaskRepository.countByHotelIdAndCreatedAtBetween(hotelId, start, end);
        long completedTasks = maintenanceTaskRepository.countByHotelIdAndStatusAndActualEndTimeBetween(
                hotelId, TaskStatus.COMPLETED, start, end);

        if (totalTasks == 0) {
            return 0.0;
        }

        return (double) completedTasks / totalTasks * 100.0;
    }

    /**
     * Get most common maintenance categories
     */
    public List<Object[]> getMostCommonCategories(Long hotelId, int limit) {
        return maintenanceTaskRepository.findMostCommonCategories(hotelId);
    }

    /**
     * Get staff workload statistics
     */
    public List<Object[]> getStaffWorkloadStats(Long hotelId, LocalDateTime start, LocalDateTime end) {
        return maintenanceTaskRepository.findStaffWorkloadStats(hotelId, start, end);
    }
}
