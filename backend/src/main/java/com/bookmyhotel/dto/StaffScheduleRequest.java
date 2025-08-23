package com.bookmyhotel.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.bookmyhotel.entity.StaffSchedule;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a new staff schedule
 */
public class StaffScheduleRequest {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotNull(message = "Schedule date is required")
    private LocalDate scheduleDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Shift type is required")
    private StaffSchedule.ShiftType shiftType;

    @NotNull(message = "Department is required")
    private StaffSchedule.Department department;

    private String notes;

    // Constructors
    public StaffScheduleRequest() {}

    public StaffScheduleRequest(Long staffId, Long hotelId, LocalDate scheduleDate, 
                               LocalTime startTime, LocalTime endTime, 
                               StaffSchedule.ShiftType shiftType, 
                               StaffSchedule.Department department, String notes) {
        this.staffId = staffId;
        this.hotelId = hotelId;
        this.scheduleDate = scheduleDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.shiftType = shiftType;
        this.department = department;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
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

    @Override
    public String toString() {
        return "StaffScheduleRequest{" +
                "staffId=" + staffId +
                ", hotelId=" + hotelId +
                ", scheduleDate=" + scheduleDate +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", shiftType=" + shiftType +
                ", department=" + department +
                ", notes='" + notes + '\'' +
                '}';
    }
}
