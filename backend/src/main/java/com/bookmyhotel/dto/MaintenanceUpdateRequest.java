package com.bookmyhotel.dto;

public class MaintenanceUpdateRequest {
    private String status;
    private String notes;
    private String completedAt;

    public MaintenanceUpdateRequest() {}

    public MaintenanceUpdateRequest(String status, String notes, String completedAt) {
        this.status = status;
        this.notes = notes;
        this.completedAt = completedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(String completedAt) {
        this.completedAt = completedAt;
    }
}
