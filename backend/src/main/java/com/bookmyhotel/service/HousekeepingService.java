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
     * Create a new housekeeping task (legacy method - delegates to
     * createTaskEnhanced)
     */
    public HousekeepingTask createTask(Long hotelId, Long roomId, HousekeepingTaskType taskType,
            TaskPriority priority, String description, String specialInstructions) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Verify room belongs to the specified hotel
        if (!room.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Room does not belong to the specified hotel");
        }

        // Delegate to enhanced method using room number
        return createTaskEnhanced(hotelId, room.getRoomNumber(), description, taskType, priority, null,
                specialInstructions, null, null);
    }

    /**
     * Create a housekeeping task with enhanced parameters
     */
    public HousekeepingTask createTaskEnhanced(Long hotelId, String roomNumber, String title,
            HousekeepingTaskType taskType,
            TaskPriority priority, String description, String specialInstructions,
            Integer estimatedDuration, Long assignedStaffId) {

        // Room number is optional - tasks can be for general areas or non-room specific

        HousekeepingTask task = new HousekeepingTask();

        // Set hotel
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        task.setHotel(hotel);

        // Set room number directly (room can be optional for non-room tasks)
        if (roomNumber != null && !roomNumber.trim().isEmpty()) {
            task.setRoomNumber(roomNumber.trim());
        }

        // Set basic task properties
        task.setTitle(title);
        task.setTaskType(taskType);
        task.setStatus(HousekeepingTaskStatus.PENDING);
        task.setPriority(priority);
        task.setDescription(description);
        task.setSpecialInstructions(specialInstructions);
        task.setCreatedAt(LocalDateTime.now());

        // Set estimated duration if provided
        if (estimatedDuration != null && estimatedDuration > 0) {
            task.setEstimatedDurationMinutes(estimatedDuration);
        }

        // Assign user if provided
        if (assignedStaffId != null) {
            User user = userRepository.findById(assignedStaffId)
                    .orElse(null); // Allow tasks without immediate assignment
            if (user != null && user.getHotel().getId().equals(hotelId) &&
                    user.getRoles() != null && user.getRoles().contains(UserRole.HOUSEKEEPING)) {
                task.setAssignedUser(user);
                task.setStatus(HousekeepingTaskStatus.ASSIGNED);
                task.setAssignedAt(LocalDateTime.now());
            }
        }

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
     * Get tasks assigned to a specific user
     */
    public List<HousekeepingTask> getTasksByStaff(Long hotelId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user belongs to the specified hotel
        if (!user.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("User does not belong to the specified hotel");
        }

        return housekeepingTaskRepository.findByHotelIdAndAssignedUser(hotelId, user);
    }

    /**
     * Get tasks assigned to a specific user with status filter
     */
    public List<HousekeepingTask> getTasksByStaffAndStatus(Long hotelId, Long userId, HousekeepingTaskStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user belongs to the specified hotel
        if (!user.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("User does not belong to the specified hotel");
        }

        return housekeepingTaskRepository.findByHotelIdAndAssignedUserAndStatus(hotelId, user, status);
    }

    /**
     * Assign a task to a staff member
     */
    public HousekeepingTask assignTask(Long hotelId, Long taskId, Long userId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user has HOUSEKEEPING role
        if (user.getRoles() == null || !user.getRoles().contains(UserRole.HOUSEKEEPING)) {
            throw new RuntimeException("User is not a housekeeping staff member");
        }

        // Verify task belongs to the specified hotel
        if (!task.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
        }

        // Verify user belongs to the same hotel
        if (!user.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("User does not belong to this hotel");
        }

        task.setAssignedUser(user);
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

        if (task.getAssignedUser() == null) {
            throw new RuntimeException("Task must be assigned to a user before starting");
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

    /**
     * Update task status and notes
     */
    public HousekeepingTask updateTaskStatus(Long hotelId, Long taskId, String status, String notes) {
        HousekeepingTask existingTask = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Verify task belongs to the specified hotel
        if (!existingTask.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Task not found for this hotel");
        }

        // Update task status
        if (status.equals("IN_PROGRESS")) {
            existingTask.setStatus(HousekeepingTaskStatus.IN_PROGRESS);
            existingTask.setStartedAt(LocalDateTime.now());
        } else if (status.equals("COMPLETED")) {
            existingTask.setStatus(HousekeepingTaskStatus.COMPLETED);
            existingTask.setCompletedAt(LocalDateTime.now());
        } else if (status.equals("COMPLETED_WITH_ISSUES")) {
            existingTask.setStatus(HousekeepingTaskStatus.COMPLETED_WITH_ISSUES);
            existingTask.setCompletedAt(LocalDateTime.now());
        }

        // Update notes if provided
        if (notes != null) {
            existingTask.setInspectorNotes(notes);
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
        return housekeepingTaskRepository.findByHotelIdAndAssignedUserIsNull(hotelId);
    }

    /**
     * Get active tasks for a user
     */
    public List<HousekeepingTask> getActiveTasksByStaff(Long hotelId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify user belongs to the specified hotel
        if (!user.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("User does not belong to the specified hotel");
        }

        return housekeepingTaskRepository.findActiveTasksByUser(hotelId, user);
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
        return housekeepingTaskRepository.findUserPerformanceMetrics(hotelId, start, end);
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
        // Delegate to enhanced method with null room number for general tasks
        return createTaskEnhanced(hotelId, null, description, taskType, priority, null,
                specialInstructions, null, null);
    }

    /**
     * Get tasks for specific user with pagination
     */
    public Page<HousekeepingTask> getTasksForStaff(Long hotelId, Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return housekeepingTaskRepository.findByHotelIdAndAssignedUser(hotelId, user, pageable);
    }

    /**
     * Get today's tasks for specific user
     */
    public List<HousekeepingTask> getTodaysTasksForStaff(Long userId, Long hotelId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

        return housekeepingTaskRepository.findByHotelIdAndAssignedUserAndCreatedAtBetween(
                hotelId, user, startOfDay, endOfDay);
    }

    /**
     * Assign task automatically to available staff
     */
    public HousekeepingTask assignTaskAutomatically(Long taskId, Long hotelId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Find available users with HOUSEKEEPING role (simplistic algorithm)
        List<User> availableUsers = userRepository.findByHotelIdAndRole(hotelId, UserRole.HOUSEKEEPING);

        if (!availableUsers.isEmpty()) {
            User assignedUser = availableUsers.get(0); // Take first available
            task.setAssignedUser(assignedUser);
            task.setStatus(HousekeepingTaskStatus.IN_PROGRESS);
            task.setStartedAt(LocalDateTime.now());
            return housekeepingTaskRepository.save(task);
        } else {
            throw new RuntimeException("No available staff found for automatic assignment");
        }
    }
}
