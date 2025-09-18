package com.bookmyhotel.dto;

import com.bookmyhotel.entity.StaffSchedule;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating staff schedule status
 */
public class ScheduleStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private StaffSchedule.ScheduleStatus status;

    private String notes;

    // Constructors
    public ScheduleStatusUpdateRequest() {}

    public ScheduleStatusUpdateRequest(StaffSchedule.ScheduleStatus status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    // Getters and Setters
    public StaffSchedule.ScheduleStatus getStatus() {
        return status;
    }

    public void setStatus(StaffSchedule.ScheduleStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "ScheduleStatusUpdateRequest{" +
                "status=" + status +
                ", notes='" + notes + '\'' +
                '}';
    }
}
