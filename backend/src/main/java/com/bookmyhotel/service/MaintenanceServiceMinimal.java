package com.bookmyhotel.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.MaintenanceTask;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.TaskStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.MaintenanceTaskRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.repository.HousekeepingStaffRepository;

/**
 * Minimal working service class for managing maintenance operations
 */
@Service
@Transactional
public class MaintenanceServiceMinimal {

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

        if (roomId != null) {
            Room room = roomRepository.findById(roomId).orElse(null);
            task.setRoom(room);
        }

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Get all maintenance tasks for a tenant
     */
    public List<MaintenanceTask> getAllTasks(String tenantId) {
        return maintenanceTaskRepository.findByTenantId(tenantId);
    }

    /**
     * Get task by ID
     */
    public MaintenanceTask getTaskById(String tenantId, Long taskId) {
        return maintenanceTaskRepository.findById(taskId)
                .filter(task -> task.getTenantId().equals(tenantId))
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    /**
     * Assign task to maintenance staff
     */
    public MaintenanceTask assignTask(String tenantId, Long taskId, Long staffId) {
        MaintenanceTask task = getTaskById(tenantId, taskId);
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Housekeeping staff not found"));

        task.setAssignedTo(staff);
        task.setStatus(TaskStatus.ASSIGNED);

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Start a maintenance task
     */
    public MaintenanceTask startTask(String tenantId, Long taskId) {
        MaintenanceTask task = getTaskById(tenantId, taskId);

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
    public MaintenanceTask completeTask(String tenantId, Long taskId, String workPerformed,
            String partsUsed, Double actualCost) {
        MaintenanceTask task = getTaskById(tenantId, taskId);

        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new RuntimeException("Task can only be completed from IN_PROGRESS status");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setActualEndTime(LocalDateTime.now());
        task.setWorkPerformed(workPerformed);
        task.setPartsUsed(partsUsed);

        if (actualCost != null) {
            task.setActualCost(actualCost);
        }

        // Calculate actual duration
        if (task.getActualStartTime() != null) {
            long minutes = java.time.Duration.between(task.getActualStartTime(), task.getActualEndTime()).toMinutes();
            task.setActualDurationMinutes((int) minutes);
        }

        return maintenanceTaskRepository.save(task);
    }

    /**
     * Update task details
     */
    public MaintenanceTask updateTask(String tenantId, Long taskId, MaintenanceTask updatedTask) {
        MaintenanceTask existingTask = getTaskById(tenantId, taskId);

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

    /**
     * Cancel a maintenance task
     */
    public MaintenanceTask cancelTask(String tenantId, Long taskId, String reason) {
        MaintenanceTask task = getTaskById(tenantId, taskId);

        if (task.getStatus() == TaskStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed task");
        }

        task.setStatus(TaskStatus.CANCELLED);
        task.setWorkPerformed("Task cancelled: " + reason);

        return maintenanceTaskRepository.save(task);
    }
}
