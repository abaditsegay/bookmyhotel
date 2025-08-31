package com.bookmyhotel.entity;

import java.time.LocalDateTime;

import com.bookmyhotel.enums.MaintenanceCategory;
import com.bookmyhotel.enums.MaintenancePriority;

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
 * Maintenance request entity for tracking maintenance issues and repairs
 */
@Entity
@Table(name = "maintenance_requests")
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private MaintenanceCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private MaintenancePriority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MaintenanceStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id")
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedTo;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(name = "actual_cost")
    private Double actualCost;

    @Column(name = "estimated_duration_hours")
    private Integer estimatedDurationHours;

    @Column(name = "actual_duration_hours")
    private Integer actualDurationHours;

    @Column(name = "due_date")
    private LocalDateTime scheduledDate;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Enum for maintenance status
    public enum MaintenanceStatus {
        PENDING("Pending"),
        ASSIGNED("Assigned"),
        IN_PROGRESS("In Progress"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        ON_HOLD("On Hold");

        private final String displayName;

        MaintenanceStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Constructors
    public MaintenanceRequest() {
    }

    public MaintenanceRequest(String title, String description, MaintenanceCategory category,
            MaintenancePriority priority, User requestedBy, String tenantId) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.priority = priority;
        this.status = MaintenanceStatus.PENDING;
        this.requestedBy = requestedBy;
        this.tenantId = tenantId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MaintenanceCategory getCategory() {
        return category;
    }

    public void setCategory(MaintenanceCategory category) {
        this.category = category;
    }

    public MaintenancePriority getPriority() {
        return priority;
    }

    public void setPriority(MaintenancePriority priority) {
        this.priority = priority;
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public void setStatus(MaintenanceStatus status) {
        this.status = status;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public User getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(User requestedBy) {
        this.requestedBy = requestedBy;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    // Convenience method for controller compatibility
    public User getAssignedStaff() {
        return assignedTo;
    }

    // Additional missing methods for controller compatibility
    public LocalDateTime getDueDate() {
        return scheduledDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.scheduledDate = dueDate;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public Double getActualCost() {
        return actualCost;
    }

    public void setActualCost(Double actualCost) {
        this.actualCost = actualCost;
    }

    public Integer getEstimatedDurationHours() {
        return estimatedDurationHours;
    }

    public void setEstimatedDurationHours(Integer estimatedDurationHours) {
        this.estimatedDurationHours = estimatedDurationHours;
    }

    public Integer getActualDurationHours() {
        return actualDurationHours;
    }

    public void setActualDurationHours(Integer actualDurationHours) {
        this.actualDurationHours = actualDurationHours;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
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

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Business methods
    public boolean canBeAssigned() {
        return status == MaintenanceStatus.PENDING;
    }

    public boolean canBeStarted() {
        return status == MaintenanceStatus.ASSIGNED;
    }

    public boolean canBeCompleted() {
        return status == MaintenanceStatus.IN_PROGRESS;
    }

    public void assignTo(User staff) {
        if (!canBeAssigned()) {
            throw new IllegalStateException("Maintenance request cannot be assigned in current status: " + status);
        }
        this.assignedTo = staff;
        this.status = MaintenanceStatus.ASSIGNED;
        this.assignedAt = LocalDateTime.now();
    }

    public void start() {
        if (!canBeStarted()) {
            throw new IllegalStateException("Maintenance request cannot be started in current status: " + status);
        }
        this.status = MaintenanceStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }

    public void complete(Double actualCost, Integer actualDurationHours) {
        if (!canBeCompleted()) {
            throw new IllegalStateException("Maintenance request cannot be completed in current status: " + status);
        }
        this.status = MaintenanceStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
        this.actualCost = actualCost;
        this.actualDurationHours = actualDurationHours;
    }

    public boolean isOverdue() {
        if (scheduledDate == null || status == MaintenanceStatus.COMPLETED || status == MaintenanceStatus.CANCELLED) {
            return false;
        }
        return LocalDateTime.now().isAfter(scheduledDate);
    }

    public boolean isHighPriority() {
        return priority == MaintenancePriority.HIGH ||
                priority == MaintenancePriority.URGENT ||
                priority == MaintenancePriority.EMERGENCY;
    }
}
