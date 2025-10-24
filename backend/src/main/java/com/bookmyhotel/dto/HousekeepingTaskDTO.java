package com.bookmyhotel.dto;

import java.time.LocalDateTime;

import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;

/**
 * DTO for HousekeepingTask to avoid JSON serialization issues
 */
public class HousekeepingTaskDTO {
    
    private Long id;
    private HousekeepingTaskType taskType;
    private HousekeepingTaskStatus status;
    private TaskPriority priority;
    private String description;
    private String specialInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer estimatedDurationMinutes;
    private Integer actualDurationMinutes;
    private Integer qualityScore;
    private String inspectorNotes;
    
    // Room details
    private Long roomId;
    private String roomNumber;
    private String roomType;
    
    // Hotel details
    private String hotelName;
    
    // Assigned user details
    private Long assignedUserId;
    private AssignedUser assignedUser;
    
    // Inner class for assigned user
    public static class AssignedUser {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        
        public AssignedUser() {}
        
        public AssignedUser(Long id, String firstName, String lastName, String email) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    // Constructors
    public HousekeepingTaskDTO() {}
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public HousekeepingTaskType getTaskType() {
        return taskType;
    }
    
    public void setTaskType(HousekeepingTaskType taskType) {
        this.taskType = taskType;
    }
    
    public HousekeepingTaskStatus getStatus() {
        return status;
    }
    
    public void setStatus(HousekeepingTaskStatus status) {
        this.status = status;
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
    
    public Long getAssignedUserId() {
        return assignedUserId;
    }
    
    public void setAssignedUserId(Long assignedUserId) {
        this.assignedUserId = assignedUserId;
    }
    
    public AssignedUser getAssignedUser() {
        return assignedUser;
    }
    
    public void setAssignedUser(AssignedUser assignedUser) {
        this.assignedUser = assignedUser;
    }
}
