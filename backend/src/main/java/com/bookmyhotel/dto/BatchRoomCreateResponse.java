package com.bookmyhotel.dto;

import java.util.List;

public class BatchRoomCreateResponse {

    private int totalRequested;
    private int created;
    private int failed;
    private List<RoomDTO> createdRooms;
    private List<FailedRoom> failedRooms;

    public static class FailedRoom {
        private String roomNumber;
        private String error;

        public FailedRoom(String roomNumber, String error) {
            this.roomNumber = roomNumber;
            this.error = error;
        }

        public String getRoomNumber() {
            return roomNumber;
        }

        public void setRoomNumber(String roomNumber) {
            this.roomNumber = roomNumber;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }

    // Getters and setters
    public int getTotalRequested() {
        return totalRequested;
    }

    public void setTotalRequested(int totalRequested) {
        this.totalRequested = totalRequested;
    }

    public int getCreated() {
        return created;
    }

    public void setCreated(int created) {
        this.created = created;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }

    public List<RoomDTO> getCreatedRooms() {
        return createdRooms;
    }

    public void setCreatedRooms(List<RoomDTO> createdRooms) {
        this.createdRooms = createdRooms;
    }

    public List<FailedRoom> getFailedRooms() {
        return failedRooms;
    }

    public void setFailedRooms(List<FailedRoom> failedRooms) {
        this.failedRooms = failedRooms;
    }
}
