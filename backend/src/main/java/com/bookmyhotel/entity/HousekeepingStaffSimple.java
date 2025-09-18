package com.bookmyhotel.entity;

import jakarta.persistence.*;
import com.bookmyhotel.enums.HousekeepingRole;
import com.bookmyhotel.enums.StaffStatus;
import com.bookmyhotel.enums.WorkShift;

/**
 * Simplified Housekeeping staff entity that matches the current database schema
 */
@Entity
@Table(name = "housekeeping_staff")
public class HousekeepingStaffSimple {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "employee_id", nullable = false)
    private String employeeId;
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(name = "email")
    private String email;
    
    @Column(name = "phone")
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private HousekeepingRole role;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "shift", nullable = false)
    private WorkShift shift;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StaffStatus status;
    
    @Column(name = "hourly_rate")
    private Double hourlyRate;
    
    @Column(name = "performance_rating")
    private Double performanceRating;
    
    @Column(name = "tasks_completed_today")
    private Integer tasksCompletedToday;
    
    @Column(name = "average_task_duration")
    private Double averageTaskDuration;
    
    @Column(name = "quality_score_average")
    private Double qualityScoreAverage;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "current_workload")
    private Integer currentWorkload;
    
    @Column(name = "average_rating")
    private Double averageRating;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    // Default constructor
    public HousekeepingStaffSimple() {
        this.isActive = true;
        this.tasksCompletedToday = 0;
        this.currentWorkload = 0;
        this.performanceRating = 3.0;
        this.qualityScoreAverage = 3.0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public HousekeepingRole getRole() {
        return role;
    }

    public void setRole(HousekeepingRole role) {
        this.role = role;
    }

    public WorkShift getShift() {
        return shift;
    }

    public void setShift(WorkShift shift) {
        this.shift = shift;
    }

    public StaffStatus getStatus() {
        return status;
    }

    public void setStatus(StaffStatus status) {
        this.status = status;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Double getPerformanceRating() {
        return performanceRating;
    }

    public void setPerformanceRating(Double performanceRating) {
        this.performanceRating = performanceRating;
    }

    public Integer getTasksCompletedToday() {
        return tasksCompletedToday;
    }

    public void setTasksCompletedToday(Integer tasksCompletedToday) {
        this.tasksCompletedToday = tasksCompletedToday;
    }

    public Double getAverageTaskDuration() {
        return averageTaskDuration;
    }

    public void setAverageTaskDuration(Double averageTaskDuration) {
        this.averageTaskDuration = averageTaskDuration;
    }

    public Double getQualityScoreAverage() {
        return qualityScoreAverage;
    }

    public void setQualityScoreAverage(Double qualityScoreAverage) {
        this.qualityScoreAverage = qualityScoreAverage;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getCurrentWorkload() {
        return currentWorkload;
    }

    public void setCurrentWorkload(Integer currentWorkload) {
        this.currentWorkload = currentWorkload;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
