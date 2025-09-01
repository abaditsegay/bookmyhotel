package com.bookmyhotel.service;

import com.bookmyhotel.entity.*;
import com.bookmyhotel.enums.WorkShift;
import com.bookmyhotel.repository.HousekeepingStaffRepository;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.repository.HotelRepository;
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

    @Autowired
    private HotelRepository hotelRepository;

    // ===== TASK MANAGEMENT METHODS =====

    /**
     * Create a new housekeeping task
     */
    public HousekeepingTask createTask(Long hotelId, Long roomId, HousekeepingTaskType taskType,
            TaskPriority priority, String description, String specialInstructions) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Verify room belongs to the specified hotel
        if (!room.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Room does not belong to the specified hotel");
        }

        HousekeepingTask task = new HousekeepingTask();
        task.setHotel(room.getHotel());
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
     * Get all tasks for a hotel
     */
    public List<HousekeepingTask> getAllTasks(Long hotelId) {
        return housekeepingTaskRepository.findByHotelId(hotelId);
    }

    /**
     * Get tasks with pagination
     */
    public Page<HousekeepingTask> getAllTasks(Long hotelId, Pageable pageable) {
        return housekeepingTaskRepository.findByHotelId(hotelId, pageable);
    }

    /**
     * Get tasks by status
     */
    public List<HousekeepingTask> getTasksByStatus(Long hotelId, HousekeepingTaskStatus status) {
        return housekeepingTaskRepository.findByHotelIdAndStatus(hotelId, status);
    }

    /**
     * Get tasks assigned to a specific staff member
     */
    public List<HousekeepingTask> getTasksByStaff(Long hotelId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify staff belongs to the specified hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member does not belong to the specified hotel");
        }

        return housekeepingTaskRepository.findByHotelIdAndAssignedStaff(hotelId, staff);
    }

    /**
     * Get tasks assigned to a specific staff member with status filter
     */
    public List<HousekeepingTask> getTasksByStaffAndStatus(Long hotelId, Long staffId, HousekeepingTaskStatus status) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify staff belongs to the specified hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member does not belong to the specified hotel");
        }

        return housekeepingTaskRepository.findByHotelIdAndAssignedStaffAndStatus(hotelId, staff, status);
    }

    /**
     * Assign a task to a staff member
     */
    public HousekeepingTask assignTask(Long hotelId, Long taskId, Long staffId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
        }

        // Verify staff belongs to the same hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member does not belong to this hotel");
        }

        task.setAssignedStaff(staff);
        task.setStatus(HousekeepingTaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Start a task (staff member begins work)
     */
    public HousekeepingTask startTask(Long hotelId, Long taskId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public HousekeepingTask completeTask(Long hotelId, Long taskId, String notes, Integer qualityScore) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public HousekeepingTask completeTaskWithIssues(Long hotelId, Long taskId, String notes, String issueDescription) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public HousekeepingTask cancelTask(Long hotelId, Long taskId, String reason) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public HousekeepingTask updateTask(Long hotelId, Long taskId, HousekeepingTask updatedTask) {
        HousekeepingTask existingTask = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to the specified hotel
        if (!existingTask.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
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
    public List<HousekeepingTask> getOverdueTasks(Long hotelId) {
        List<HousekeepingTaskStatus> pendingStatuses = List.of(
                HousekeepingTaskStatus.PENDING,
                HousekeepingTaskStatus.ASSIGNED,
                HousekeepingTaskStatus.IN_PROGRESS);
        return housekeepingTaskRepository.findOverdueTasks(hotelId, pendingStatuses,
                LocalDateTime.now().minusHours(24));
    }

    /**
     * Get high priority pending tasks
     */
    public List<HousekeepingTask> getHighPriorityPendingTasks(Long hotelId) {
        return housekeepingTaskRepository.findHighPriorityPendingTasks(hotelId);
    }

    /**
     * Get tasks requiring follow-up
     */
    public List<HousekeepingTask> getTasksRequiringFollowUp(Long hotelId) {
        return housekeepingTaskRepository.findTasksRequiringFollowUp(hotelId);
    }

    /**
     * Get unassigned tasks
     */
    public List<HousekeepingTask> getUnassignedTasks(Long hotelId) {
        return housekeepingTaskRepository.findByHotelIdAndAssignedStaffIsNull(hotelId);
    }

    /**
     * Get active tasks for a staff member
     */
    public List<HousekeepingTask> getActiveTasksByStaff(Long hotelId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify staff belongs to the specified hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member does not belong to the specified hotel");
        }

        return housekeepingTaskRepository.findActiveTasksByStaff(hotelId, staff);
    }

    // ===== STAFF MANAGEMENT METHODS =====

    /**
     * Find staff member by email and hotel
     */
    public Optional<HousekeepingStaff> findStaffByEmailAndHotel(String email, Long hotelId) {
        return housekeepingStaffRepository.findByHotelIdAndEmail(hotelId, email);
    }

    /**
     * Create a new housekeeping staff member
     */
    public HousekeepingStaff createStaff(Long hotelId, String email, WorkShift shiftType, String employeeId,
            String firstName, String lastName, String phone) {
        // Check if staff already exists for this email in this hotel
        Optional<HousekeepingStaff> existingStaff = housekeepingStaffRepository.findByHotelIdAndEmail(hotelId, email);
        if (existingStaff.isPresent()) {
            throw new RuntimeException("Housekeeping staff already exists for this email in this hotel");
        }

        // Get the hotel
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        HousekeepingStaff staff = new HousekeepingStaff();
        staff.setHotel(hotel);
        staff.setEmail(email);
        staff.setFirstName(firstName);
        staff.setLastName(lastName);
        staff.setPhone(phone);
        staff.setShift(shiftType);
        staff.setEmployeeId(employeeId != null ? employeeId : "EMP" + System.currentTimeMillis());
        staff.setIsActive(true);

        return housekeepingStaffRepository.save(staff);
    }

    /**
     * Get all staff members for a hotel
     */
    public List<HousekeepingStaff> getAllStaff(Long hotelId) {
        return housekeepingStaffRepository.findByHotelIdOrderByIdDesc(hotelId);
    }

    /**
     * Get staff members with pagination
     */
    public Page<HousekeepingStaff> getAllStaff(Long hotelId, Pageable pageable) {
        return housekeepingStaffRepository.findByHotelIdOrderByIdDesc(hotelId, pageable);
    }

    /**
     * Get active staff members
     */
    public List<HousekeepingStaff> getActiveStaff(Long hotelId) {
        return housekeepingStaffRepository.findByHotelIdAndIsActiveTrue(hotelId);
    }

    /**
     * Get available staff members
     */
    public List<HousekeepingStaff> getAvailableStaff(Long hotelId, Integer maxWorkload) {
        // Get active staff with workload under maxWorkload
        return housekeepingStaffRepository.findAvailableStaff(hotelId);
    }

    /**
     * Get staff members by shift type
     */
    public List<HousekeepingStaff> getStaffByShift(Long hotelId, WorkShift shiftType) {
        return housekeepingStaffRepository.findActiveStaffByShift(hotelId, shiftType);
    }

    /**
     * Update staff member information
     */
    public HousekeepingStaff updateStaff(Long hotelId, Long staffId, HousekeepingStaff updatedStaff) {
        HousekeepingStaff existingStaff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify staff belongs to the specified hotel
        if (!existingStaff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member not found for this hotel");
        }

        // Update allowed fields
        if (updatedStaff.getShift() != null) {
            existingStaff.setShift(updatedStaff.getShift());
        }
        if (updatedStaff.getHourlyRate() != null) {
            existingStaff.setHourlyRate(updatedStaff.getHourlyRate());
        }
        if (updatedStaff.getIsActive() != null) {
            existingStaff.setIsActive(updatedStaff.getIsActive());
        }
        if (updatedStaff.getFirstName() != null) {
            existingStaff.setFirstName(updatedStaff.getFirstName());
        }
        if (updatedStaff.getLastName() != null) {
            existingStaff.setLastName(updatedStaff.getLastName());
        }
        if (updatedStaff.getPhone() != null) {
            existingStaff.setPhone(updatedStaff.getPhone());
        }

        return housekeepingStaffRepository.save(existingStaff);
    }

    /**
     * Deactivate a staff member
     */
    public HousekeepingStaff deactivateStaff(Long hotelId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify staff belongs to the specified hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member not found for this hotel");
        }

        staff.setIsActive(false);
        return housekeepingStaffRepository.save(staff);
    }

    // ===== STATISTICS AND REPORTING METHODS =====

    /**
     * Get task count by status
     */
    public long getTaskCountByStatus(Long hotelId, HousekeepingTaskStatus status) {
        return housekeepingTaskRepository.countByHotelIdAndStatus(hotelId, status);
    }

    /**
     * Get average quality score for a hotel
     */
    public Double getAverageQualityScore(Long hotelId) {
        return housekeepingTaskRepository.findAverageQualityScoreByHotelId(hotelId).orElse(0.0);
    }

    /**
     * Get average task duration by task type
     */
    public Double getAverageDurationByTaskType(Long hotelId, HousekeepingTaskType taskType) {
        return housekeepingTaskRepository.findAverageDurationByHotelIdAndTaskType(hotelId, taskType).orElse(0.0);
    }

    /**
     * Get staff performance metrics
     */
    public List<Object[]> getStaffPerformanceMetrics(Long hotelId, LocalDateTime start, LocalDateTime end) {
        return housekeepingTaskRepository.findStaffPerformanceMetrics(hotelId, start, end);
    }

    /**
     * Get daily task summary
     */
    public List<Object[]> getDailyTaskSummary(Long hotelId, LocalDateTime date) {
        return housekeepingTaskRepository.findDailyTaskSummary(hotelId, date);
    }

    /**
     * Get top performing staff members
     */
    public List<HousekeepingStaff> getTopPerformers(Long hotelId, Double minRating) {
        return housekeepingStaffRepository.findTopPerformers(hotelId, minRating);
    }

    /**
     * Get active staff count
     */
    public Long getActiveStaffCount(Long hotelId) {
        return housekeepingStaffRepository.countActiveStaff(hotelId);
    }

    /**
     * Get average staff rating
     */
    public Double getAverageStaffRating(Long hotelId) {
        return housekeepingStaffRepository.getAverageStaffRating(hotelId);
    }

    // ===== MISSING METHODS FOR SUPERVISOR CONTROLLER =====

    /**
     * Get all active staff with pagination
     */
    public Page<HousekeepingStaff> getAllActiveStaff(Long hotelId, Pageable pageable) {
        return housekeepingStaffRepository.findByHotelIdAndIsActive(hotelId, true, pageable);
    }

    /**
     * Create task without room
     */
    public HousekeepingTask createTaskWithoutRoom(Long hotelId, HousekeepingTaskType taskType,
            TaskPriority priority, String description, String specialInstructions) {
        HousekeepingTask task = new HousekeepingTask();
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        task.setHotel(hotel);
        // No room assigned
        task.setTaskType(taskType);
        task.setStatus(HousekeepingTaskStatus.PENDING);
        task.setPriority(priority);
        task.setDescription(description);
        task.setSpecialInstructions(specialInstructions);
        task.setCreatedAt(LocalDateTime.now());

        return housekeepingTaskRepository.save(task);
    }

    /**
     * Get tasks for specific staff member with pagination
     */
    public Page<HousekeepingTask> getTasksForStaff(Long hotelId, Long staffId, Pageable pageable) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        return housekeepingTaskRepository.findByHotelIdAndAssignedStaff(hotelId, staff, pageable);
    }

    /**
     * Get today's tasks for specific staff member
     */
    public List<HousekeepingTask> getTodaysTasksForStaff(Long staffId, Long hotelId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        return housekeepingTaskRepository.findByHotelIdAndAssignedStaffAndCreatedAtBetween(
                hotelId, staff, startOfDay, endOfDay);
    }

    /**
     * Assign task automatically to available staff
     */
    public HousekeepingTask assignTaskAutomatically(Long taskId, Long hotelId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Find available staff (simplistic algorithm)
        List<HousekeepingStaff> availableStaff = housekeepingStaffRepository.findAvailableStaff(hotelId);

        if (!availableStaff.isEmpty()) {
            HousekeepingStaff assignedStaff = availableStaff.get(0); // Take first available
            task.setAssignedStaff(assignedStaff);
            task.setStatus(HousekeepingTaskStatus.IN_PROGRESS);
            task.setStartedAt(LocalDateTime.now());
            return housekeepingTaskRepository.save(task);
        } else {
            throw new RuntimeException("No available staff found for automatic assignment");
        }
    }
}
