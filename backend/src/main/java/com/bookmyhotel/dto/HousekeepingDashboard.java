package com.bookmyhotel.dto;

/**
 * DTO for housekeeping dashboard summary data
 */
public class HousekeepingDashboard {
    private int pendingTasks;
    private int inProgressTasks;
    private int completedTasks;
    private int urgentTasks;
    private int availableStaff;
    private int workingStaff;
    private int openMaintenanceRequests;
    private int urgentMaintenanceRequests;

    public HousekeepingDashboard() {}

    public int getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(int pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public int getInProgressTasks() {
        return inProgressTasks;
    }

    public void setInProgressTasks(int inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }

    public int getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(int completedTasks) {
        this.completedTasks = completedTasks;
    }

    public int getUrgentTasks() {
        return urgentTasks;
    }

    public void setUrgentTasks(int urgentTasks) {
        this.urgentTasks = urgentTasks;
    }

    public int getAvailableStaff() {
        return availableStaff;
    }

    public void setAvailableStaff(int availableStaff) {
        this.availableStaff = availableStaff;
    }

    public int getWorkingStaff() {
        return workingStaff;
    }

    public void setWorkingStaff(int workingStaff) {
        this.workingStaff = workingStaff;
    }

    public int getOpenMaintenanceRequests() {
        return openMaintenanceRequests;
    }

    public void setOpenMaintenanceRequests(int openMaintenanceRequests) {
        this.openMaintenanceRequests = openMaintenanceRequests;
    }

    public int getUrgentMaintenanceRequests() {
        return urgentMaintenanceRequests;
    }

    public void setUrgentMaintenanceRequests(int urgentMaintenanceRequests) {
        this.urgentMaintenanceRequests = urgentMaintenanceRequests;
    }
}
