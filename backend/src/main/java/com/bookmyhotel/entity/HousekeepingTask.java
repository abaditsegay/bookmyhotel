package com.bookmyhotel.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Housekeeping task entity for managing room cleaning and maintenance tasks
 */
@Entity
@Table(name = "housekeeping_tasks")
public class HousekeepingTask extends HotelScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private HousekeepingStaff assignedStaff;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false)
    private HousekeepingTaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HousekeepingTaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private TaskPriority priority;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "actual_duration_minutes")
    private Integer actualDurationMinutes;

    @Column(name = "quality_score")
    private Integer qualityScore; // 1-5 rating from inspection

    @Column(name = "inspector_notes", columnDefinition = "TEXT")
    private String inspectorNotes;

    // Constructors
    public HousekeepingTask() {
    }

    public HousekeepingTask(Room room, HousekeepingTaskType taskType, HousekeepingTaskStatus status,
            TaskPriority priority, String description) {
        this.room = room;
        this.taskType = taskType;
        this.status = status;
        this.priority = priority;
        this.description = description;
        this.createdAt = LocalDateTime.now();

        // Set hotel from room
        if (room != null) {
            setHotel(room.getHotel());
        }

        // Set estimated duration based on task type
        if (taskType != null) {
            this.estimatedDurationMinutes = taskType.getEstimatedDurationMinutes();
        }
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public HousekeepingStaff getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(HousekeepingStaff assignedStaff) {
        this.assignedStaff = assignedStaff;
        if (assignedStaff != null && this.assignedAt == null) {
            this.assignedAt = LocalDateTime.now();
        }
    }

    public HousekeepingTaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(HousekeepingTaskType taskType) {
        this.taskType = taskType;
        if (taskType != null) {
            this.estimatedDurationMinutes = taskType.getEstimatedDurationMinutes();
        }
    }

    public HousekeepingTaskStatus getStatus() {
        return status;
    }

    public void setStatus(HousekeepingTaskStatus status) {
        HousekeepingTaskStatus oldStatus = this.status;
        this.status = status;

        // Auto-set timestamps based on status changes
        if (status != null && oldStatus != status) {
            LocalDateTime now = LocalDateTime.now();
            switch (status) {
                case IN_PROGRESS:
                    if (this.startedAt == null) {
                        this.startedAt = now;
                    }
                    break;
                case COMPLETED:
                case COMPLETED_WITH_ISSUES:
                    if (this.completedAt == null) {
                        this.completedAt = now;
                        // Calculate actual duration
                        if (this.startedAt != null) {
                            this.actualDurationMinutes = (int) java.time.Duration.between(this.startedAt, now)
                                    .toMinutes();
                        }
                    }
                    break;
                default:
                    break;
            }
        }
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }

    public Integer getActualDurationMinutes() {
        return actualDurationMinutes;
    }

    public void setActualDurationMinutes(Integer actualDurationMinutes) {
        this.actualDurationMinutes = actualDurationMinutes;
    }

    public Integer getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Integer qualityScore) {
        this.qualityScore = qualityScore;
    }

    public String getInspectorNotes() {
        return inspectorNotes;
    }

    public void setInspectorNotes(String inspectorNotes) {
        this.inspectorNotes = inspectorNotes;
    }

    // Business methods
    public boolean isOverdue() {
        if (status == HousekeepingTaskStatus.COMPLETED ||
                status == HousekeepingTaskStatus.COMPLETED_WITH_ISSUES ||
                status == HousekeepingTaskStatus.CANCELLED) {
            return false;
        }

        LocalDateTime deadline = getExpectedCompletionTime();
        return deadline != null && LocalDateTime.now().isAfter(deadline);
    }

    public LocalDateTime getExpectedCompletionTime() {
        if (startedAt != null && estimatedDurationMinutes != null) {
            return startedAt.plusMinutes(estimatedDurationMinutes);
        } else if (assignedAt != null && estimatedDurationMinutes != null) {
            return assignedAt.plusMinutes(estimatedDurationMinutes + 30); // 30 min buffer for starting
        }
        return null;
    }

    public boolean requiresInspection() {
        return taskType != null && taskType.requiresInspection();
    }

    public boolean isHighPriority() {
        return priority == TaskPriority.HIGH || priority == TaskPriority.URGENT;
    }

    public int getEfficiencyScore() {
        if (actualDurationMinutes == null || estimatedDurationMinutes == null || estimatedDurationMinutes == 0) {
            return 0;
        }

        // Score based on how close actual duration was to estimated
        double ratio = (double) actualDurationMinutes / estimatedDurationMinutes;
        if (ratio <= 0.8)
            return 5; // Completed 20% faster
        if (ratio <= 1.0)
            return 4; // Completed on time or faster
        if (ratio <= 1.2)
            return 3; // 20% over estimate
        if (ratio <= 1.5)
            return 2; // 50% over estimate
        return 1; // More than 50% over estimate
    }

    // Assignment method for service compatibility
    public void assignToStaff(HousekeepingStaff staff) {
        this.assignedStaff = staff;
        this.assignedAt = LocalDateTime.now();
        if (this.status == HousekeepingTaskStatus.PENDING) {
            this.status = HousekeepingTaskStatus.ASSIGNED;
        }
    }
}
