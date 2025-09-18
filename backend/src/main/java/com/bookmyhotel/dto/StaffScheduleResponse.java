package com.bookmyhotel.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.bookmyhotel.entity.StaffSchedule;

/**
 * DTO for staff schedule response
 */
public class StaffScheduleResponse {

    private Long id;
    private Long staffId;
    private String staffName;
    private String staffEmail;
    private Long hotelId;
    private String hotelName;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private StaffSchedule.ShiftType shiftType;
    private StaffSchedule.Department department;
    private String notes;
    private StaffSchedule.ScheduleStatus status;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public StaffScheduleResponse() {}

    public StaffScheduleResponse(Long id, Long staffId, String staffName, String staffEmail,
                                Long hotelId, String hotelName, LocalDate scheduleDate,
                                LocalTime startTime, LocalTime endTime,
                                StaffSchedule.ShiftType shiftType, StaffSchedule.Department department,
                                String notes, StaffSchedule.ScheduleStatus status,
                                String createdByName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.staffId = staffId;
        this.staffName = staffName;
        this.staffEmail = staffEmail;
        this.hotelId = hotelId;
        this.hotelName = hotelName;
        this.scheduleDate = scheduleDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.shiftType = shiftType;
        this.department = department;
        this.notes = notes;
        this.status = status;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStaffEmail() {
        return staffEmail;
    }

    public void setStaffEmail(String staffEmail) {
        this.staffEmail = staffEmail;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public LocalDate getScheduleDate() {
        return scheduleDate;
    }

    public void setScheduleDate(LocalDate scheduleDate) {
        this.scheduleDate = scheduleDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public StaffSchedule.ShiftType getShiftType() {
        return shiftType;
    }

    public void setShiftType(StaffSchedule.ShiftType shiftType) {
        this.shiftType = shiftType;
    }

    public StaffSchedule.Department getDepartment() {
        return department;
    }

    public void setDepartment(StaffSchedule.Department department) {
        this.department = department;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public StaffSchedule.ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(StaffSchedule.ScheduleStatus status) {
        this.status = status;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
