package com.bookmyhotel.service;

import com.bookmyhotel.audit.AuditTaxonomy;
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
import java.util.Map;
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

    @Autowired
    private HotelActivityAuditService hotelActivityAuditService;

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.CREATE,
            null,
            createTaskSnapshot(savedTask),
            List.of("roomNumber", "title", "taskType", "status", "priority", "description",
                "specialInstructions", "estimatedDurationMinutes", "assignedUserId"),
            "Housekeeping task created",
            false,
            null);
        return savedTask;
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
        Map<String, Object> oldSnapshot = createTaskSnapshot(task);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.ASSIGN,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("assignedUserId", "status", "assignedAt"),
            "Housekeeping task assigned",
            false,
            null);
        return savedTask;
    }

    /**
     * Start a task (staff member begins work)
     */
    public HousekeepingTask startTask(Long hotelId, Long taskId) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Map<String, Object> oldSnapshot = createTaskSnapshot(task);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.START,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("status", "startedAt"),
            "Housekeeping task started",
            false,
            null);
        return savedTask;
    }

    /**
     * Complete a task
     */
    public HousekeepingTask completeTask(Long hotelId, Long taskId, String notes, Integer qualityScore) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Map<String, Object> oldSnapshot = createTaskSnapshot(task);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.COMPLETE,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("status", "completedAt", "inspectorNotes", "qualityScore", "actualDurationMinutes"),
            notes != null && !notes.isBlank() ? notes : "Housekeeping task completed",
            false,
            null);
        return savedTask;
    }

    /**
     * Complete a task with issues
     */
    public HousekeepingTask completeTaskWithIssues(Long hotelId, Long taskId, String notes, String issueDescription) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Map<String, Object> oldSnapshot = createTaskSnapshot(task);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.COMPLETE_WITH_ISSUES,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("status", "completedAt", "inspectorNotes", "specialInstructions", "actualDurationMinutes"),
            issueDescription != null && !issueDescription.isBlank() ? issueDescription
                : "Housekeeping task completed with issues",
            false,
            null);
        return savedTask;
    }

    /**
     * Cancel a task
     */
    public HousekeepingTask cancelTask(Long hotelId, Long taskId, String reason) {
        HousekeepingTask task = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Map<String, Object> oldSnapshot = createTaskSnapshot(task);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.CANCEL,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("status", "inspectorNotes"),
            reason,
            false,
            null);
        return savedTask;
    }

    /**
     * Update task details
     */
    public HousekeepingTask updateTask(Long hotelId, Long taskId, HousekeepingTask updatedTask) {
        HousekeepingTask existingTask = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Map<String, Object> oldSnapshot = createTaskSnapshot(existingTask);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(existingTask);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.UPDATE,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("description", "specialInstructions", "priority", "taskType"),
            "Housekeeping task updated",
            false,
            null);
        return savedTask;
    }

    /**
     * Update task status and notes
     */
    public HousekeepingTask updateTaskStatus(Long hotelId, Long taskId, String status, String notes) {
        HousekeepingTask existingTask = housekeepingTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Map<String, Object> oldSnapshot = createTaskSnapshot(existingTask);

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

        HousekeepingTask savedTask = housekeepingTaskRepository.save(existingTask);
        hotelActivityAuditService.logActivity(
            savedTask.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
            savedTask.getId(),
            AuditTaxonomy.Action.STATUS_CHANGE,
            oldSnapshot,
            createTaskSnapshot(savedTask),
            List.of("status", "startedAt", "completedAt", "inspectorNotes"),
            notes != null && !notes.isBlank() ? notes : "Housekeeping task status updated",
            false,
            null);
        return savedTask;
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

        HousekeepingStaff savedStaff = housekeepingStaffRepository.save(staff);
        hotelActivityAuditService.logActivity(
            savedStaff.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_STAFF,
            savedStaff.getId(),
            AuditTaxonomy.Action.CREATE,
            null,
            createStaffSnapshot(savedStaff),
            List.of("employeeId", "firstName", "lastName", "email", "phone", "shift", "isActive"),
            "Housekeeping staff created",
            true,
            AuditTaxonomy.ComplianceCategory.ACCESS_CONTROL);
        return savedStaff;
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
        Map<String, Object> oldSnapshot = createStaffSnapshot(existingStaff);

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

        HousekeepingStaff savedStaff = housekeepingStaffRepository.save(existingStaff);
        hotelActivityAuditService.logActivity(
            savedStaff.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_STAFF,
            savedStaff.getId(),
            AuditTaxonomy.Action.UPDATE,
            oldSnapshot,
            createStaffSnapshot(savedStaff),
            List.of("shift", "hourlyRate", "isActive", "firstName", "lastName", "phone"),
            "Housekeeping staff updated",
            true,
            AuditTaxonomy.ComplianceCategory.ACCESS_CONTROL);
        return savedStaff;
    }

    /**
     * Deactivate a staff member
     */
    public HousekeepingStaff deactivateStaff(Long hotelId, Long staffId) {
        HousekeepingStaff staff = housekeepingStaffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));
        Map<String, Object> oldSnapshot = createStaffSnapshot(staff);

        // Verify staff belongs to the specified hotel
        if (!staff.getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Staff member not found for this hotel");
        }

        staff.setIsActive(false);
        HousekeepingStaff savedStaff = housekeepingStaffRepository.save(staff);
        hotelActivityAuditService.logActivity(
            savedStaff.getHotel(),
            AuditTaxonomy.EntityType.HOUSEKEEPING_STAFF,
            savedStaff.getId(),
            AuditTaxonomy.Action.DEACTIVATE,
            oldSnapshot,
            createStaffSnapshot(savedStaff),
            List.of("isActive"),
            "Housekeeping staff deactivated",
            true,
            AuditTaxonomy.ComplianceCategory.ACCESS_CONTROL);
        return savedStaff;
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
        Map<String, Object> oldSnapshot = createTaskSnapshot(task);

        // Find available users with HOUSEKEEPING role (simplistic algorithm)
        List<User> availableUsers = userRepository.findByHotelIdAndRole(hotelId, UserRole.HOUSEKEEPING);

        if (!availableUsers.isEmpty()) {
            User assignedUser = availableUsers.get(0); // Take first available
            task.setAssignedUser(assignedUser);
            task.setStatus(HousekeepingTaskStatus.IN_PROGRESS);
            task.setStartedAt(LocalDateTime.now());
            HousekeepingTask savedTask = housekeepingTaskRepository.save(task);
            hotelActivityAuditService.logActivity(
                    savedTask.getHotel(),
                    AuditTaxonomy.EntityType.HOUSEKEEPING_TASK,
                    savedTask.getId(),
                    AuditTaxonomy.Action.AUTO_ASSIGN,
                    oldSnapshot,
                    createTaskSnapshot(savedTask),
                    List.of("assignedUserId", "status", "startedAt"),
                    "Housekeeping task auto-assigned",
                    false,
                    null);
            return savedTask;
        } else {
            throw new RuntimeException("No available staff found for automatic assignment");
        }
    }

    private Map<String, Object> createTaskSnapshot(HousekeepingTask task) {
        return hotelActivityAuditService.createSnapshot(
                "id", task.getId(),
                "hotelId", task.getHotel() != null ? task.getHotel().getId() : null,
                "roomNumber", task.getRoomNumber(),
                "title", task.getTitle(),
                "taskType", task.getTaskType(),
                "status", task.getStatus(),
                "priority", task.getPriority(),
                "description", task.getDescription(),
                "specialInstructions", task.getSpecialInstructions(),
                "assignedUserId", task.getAssignedUser() != null ? task.getAssignedUser().getId() : null,
                "createdAt", task.getCreatedAt(),
                "assignedAt", task.getAssignedAt(),
                "startedAt", task.getStartedAt(),
                "completedAt", task.getCompletedAt(),
                "estimatedDurationMinutes", task.getEstimatedDurationMinutes(),
                "actualDurationMinutes", task.getActualDurationMinutes(),
                "qualityScore", task.getQualityScore(),
                "inspectorNotes", task.getInspectorNotes());
    }

    private Map<String, Object> createStaffSnapshot(HousekeepingStaff staff) {
        return hotelActivityAuditService.createSnapshot(
                "id", staff.getId(),
                "hotelId", staff.getHotel() != null ? staff.getHotel().getId() : null,
                "employeeId", staff.getEmployeeId(),
                "firstName", staff.getFirstName(),
                "lastName", staff.getLastName(),
                "email", staff.getEmail(),
                "phone", staff.getPhone(),
                "role", staff.getRole(),
                "shift", staff.getShift(),
                "status", staff.getStatus(),
                "hourlyRate", staff.getHourlyRate(),
                "isActive", staff.getIsActive(),
                "currentWorkload", staff.getCurrentWorkload(),
                "averageRating", staff.getAverageRating());
    }
}
