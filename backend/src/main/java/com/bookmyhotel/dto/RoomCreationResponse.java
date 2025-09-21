package com.bookmyhotel.dto;

import java.util.List;

/**
 * Response DTO for room creation with uploaded images
 */
public class RoomCreationResponse {

    private RoomDTO room;
    private List<HotelImageDTO> uploadedImages;
    private String message;
    private boolean success;

    // Constructors
    public RoomCreationResponse() {
    }

    public RoomCreationResponse(RoomDTO room, List<HotelImageDTO> uploadedImages,
            String message, boolean success) {
        this.room = room;
        this.uploadedImages = uploadedImages;
        this.message = message;
        this.success = success;
    }

    // Static factory methods
    public static RoomCreationResponse success(RoomDTO room, List<HotelImageDTO> uploadedImages) {
        return new RoomCreationResponse(room, uploadedImages, "Room created successfully", true);
    }

    public static RoomCreationResponse success(RoomDTO room, List<HotelImageDTO> uploadedImages, String message) {
        return new RoomCreationResponse(room, uploadedImages, message, true);
    }

    public static RoomCreationResponse error(String message) {
        return new RoomCreationResponse(null, null, message, false);
    }

    // Getters and Setters
    public RoomDTO getRoom() {
        return room;
    }

    public void setRoom(RoomDTO room) {
        this.room = room;
    }

    public List<HotelImageDTO> getUploadedImages() {
        return uploadedImages;
    }

    public void setUploadedImages(List<HotelImageDTO> uploadedImages) {
        this.uploadedImages = uploadedImages;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    /**
     * Get count of uploaded images
     */
    public int getUploadedImageCount() {
        return uploadedImages != null ? uploadedImages.size() : 0;
    }

    /**
     * Check if any images were uploaded
     */
    public boolean hasUploadedImages() {
        return uploadedImages != null && !uploadedImages.isEmpty();
    }

    @Override
    public String toString() {
        return "RoomCreationResponse{" +
                "room=" + room +
                ", uploadedImageCount=" + getUploadedImageCount() +
                ", message='" + message + '\'' +
                ", success=" + success +
                '}';
    }
}