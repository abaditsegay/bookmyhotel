package com.bookmyhotel.dto;

/**
 * DTO for front desk statistics
 */
public class FrontDeskStats {
    private long todaysArrivals;
    private long todaysDepartures;
    private long currentOccupancy;
    private long availableRooms;
    private long roomsOutOfOrder;
    private long roomsUnderMaintenance;
    
    // Constructors
    public FrontDeskStats() {}
    
    public FrontDeskStats(long todaysArrivals, long todaysDepartures, 
                         long currentOccupancy, long availableRooms,
                         long roomsOutOfOrder, long roomsUnderMaintenance) {
        this.todaysArrivals = todaysArrivals;
        this.todaysDepartures = todaysDepartures;
        this.currentOccupancy = currentOccupancy;
        this.availableRooms = availableRooms;
        this.roomsOutOfOrder = roomsOutOfOrder;
        this.roomsUnderMaintenance = roomsUnderMaintenance;
    }
    
    // Getters and Setters
    public long getTodaysArrivals() { return todaysArrivals; }
    public void setTodaysArrivals(long todaysArrivals) { this.todaysArrivals = todaysArrivals; }
    
    public long getTodaysDepartures() { return todaysDepartures; }
    public void setTodaysDepartures(long todaysDepartures) { this.todaysDepartures = todaysDepartures; }
    
    public long getCurrentOccupancy() { return currentOccupancy; }
    public void setCurrentOccupancy(long currentOccupancy) { this.currentOccupancy = currentOccupancy; }
    
    public long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }
    
    public long getRoomsOutOfOrder() { return roomsOutOfOrder; }
    public void setRoomsOutOfOrder(long roomsOutOfOrder) { this.roomsOutOfOrder = roomsOutOfOrder; }
    
    public long getRoomsUnderMaintenance() { return roomsUnderMaintenance; }
    public void setRoomsUnderMaintenance(long roomsUnderMaintenance) { this.roomsUnderMaintenance = roomsUnderMaintenance; }
}
