package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.bookmyhotel.entity.RoomType;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for room creation with image uploads
 */
public class RoomCreationRequest {

    @NotBlank(message = "Room number is required")
    @Size(max = 10, message = "Room number must not exceed 10 characters")
    private String roomNumber;

    @NotNull(message = "Room type is required")
    private RoomType roomType;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price per night must be greater than 0")
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    // Image upload fields
    private MultipartFile heroImage;

    private List<MultipartFile> galleryImages;

    private String heroImageAltText;

    private List<String> galleryImageAltTexts;

    // Constructors
    public RoomCreationRequest() {
    }

    public RoomCreationRequest(String roomNumber, RoomType roomType, BigDecimal pricePerNight,
            Integer capacity, String description) {
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.description = description;
    }

    // Getters and Setters
    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MultipartFile getHeroImage() {
        return heroImage;
    }

    public void setHeroImage(MultipartFile heroImage) {
        this.heroImage = heroImage;
    }

    public List<MultipartFile> getGalleryImages() {
        return galleryImages;
    }

    public void setGalleryImages(List<MultipartFile> galleryImages) {
        this.galleryImages = galleryImages;
    }

    public String getHeroImageAltText() {
        return heroImageAltText;
    }

    public void setHeroImageAltText(String heroImageAltText) {
        this.heroImageAltText = heroImageAltText;
    }

    public List<String> getGalleryImageAltTexts() {
        return galleryImageAltTexts;
    }

    public void setGalleryImageAltTexts(List<String> galleryImageAltTexts) {
        this.galleryImageAltTexts = galleryImageAltTexts;
    }

    /**
     * Convert to RoomDTO for service layer processing
     */
    public RoomDTO toRoomDTO() {
        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setRoomNumber(this.roomNumber);
        roomDTO.setRoomType(this.roomType);
        roomDTO.setPricePerNight(this.pricePerNight);
        roomDTO.setCapacity(this.capacity);
        roomDTO.setDescription(this.description);
        return roomDTO;
    }

    /**
     * Check if any images are provided
     */
    public boolean hasImages() {
        return (heroImage != null && !heroImage.isEmpty()) ||
                (galleryImages != null && !galleryImages.isEmpty() &&
                        galleryImages.stream().anyMatch(img -> img != null && !img.isEmpty()));
    }

    /**
     * Check if hero image is provided
     */
    public boolean hasHeroImage() {
        return heroImage != null && !heroImage.isEmpty();
    }

    /**
     * Check if gallery images are provided
     */
    public boolean hasGalleryImages() {
        return galleryImages != null && !galleryImages.isEmpty() &&
                galleryImages.stream().anyMatch(img -> img != null && !img.isEmpty());
    }

    @Override
    public String toString() {
        return "RoomCreationRequest{" +
                "roomNumber='" + roomNumber + '\'' +
                ", roomType=" + roomType +
                ", pricePerNight=" + pricePerNight +
                ", capacity=" + capacity +
                ", description='" + description + '\'' +
                ", hasHeroImage=" + hasHeroImage() +
                ", galleryImagesCount=" + (galleryImages != null ? galleryImages.size() : 0) +
                '}';
    }
}