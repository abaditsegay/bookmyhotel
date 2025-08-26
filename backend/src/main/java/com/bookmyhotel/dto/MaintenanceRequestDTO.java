package com.bookmyhotel.dto;

import java.time.LocalDateTime;

import com.bookmyhotel.entity.MaintenanceRequest.MaintenanceStatus;
import com.bookmyhotel.enums.MaintenanceCategory;
import com.bookmyhotel.enums.MaintenancePriority;

/**
 * DTO for MaintenanceRequest to avoid JSON serialization issues with Hibernate proxies
 */
public class MaintenanceRequestDTO {
    
    private Long id;
    private String title;
    private String description;
    private MaintenanceCategory category;
    private MaintenancePriority priority;
    private MaintenanceStatus status;
    private Double estimatedCost;
    private Double actualCost;
    private Integer estimatedDurationHours;
    private Integer actualDurationHours;
    private LocalDateTime scheduledDate;
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    
    // Room details
    private Long roomId;
    private String roomNumber;
    private String roomType;
    
    // Hotel details
    private String hotelName;
    
    // Requested by details
    private String requestedByName;
    private String requestedByEmail;
    
    // Assigned staff details
    private String assignedToName;
    private String assignedToEmail;
    
    // Constructors
    public MaintenanceRequestDTO() {}
    
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getRoomId() {
        return roomId;
    }
    
    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }
    
    public String getRoomNumber() {
        return roomNumber;
    }
    
    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }
    
    public String getRoomType() {
        return roomType;
    }
    
    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }
    
    public String getHotelName() {
        return hotelName;
    }
    
    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }
    
    public String getRequestedByName() {
        return requestedByName;
    }
    
    public void setRequestedByName(String requestedByName) {
        this.requestedByName = requestedByName;
    }
    
    public String getRequestedByEmail() {
        return requestedByEmail;
    }
    
    public void setRequestedByEmail(String requestedByEmail) {
        this.requestedByEmail = requestedByEmail;
    }
    
    public String getAssignedToName() {
        return assignedToName;
    }
    
    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }
    
    public String getAssignedToEmail() {
        return assignedToEmail;
    }
    
    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }
}
