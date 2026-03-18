package com.bookmyhotel.dto;

import com.bookmyhotel.enums.ImageCategory;

import java.time.LocalDateTime;

/**
 * DTO for HotelImage responses
 * Used for API responses to provide complete image information
 */
public class HotelImageDTO {

    private Long id;
    private String tenantId;
    private Long hotelId;
    private Long roomTypeId;
    private ImageCategory imageCategory;
    private String fileName;
    private String filePath;
    private Integer displayOrder;
    private String altText;
    private Long fileSize;
    private String mimeType;
    private Integer width;
    private Integer height;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Derived fields for convenience
    private String categoryCode;
    private String categoryDisplayName;
    private boolean isHotelImage;
    private boolean isRoomTypeImage;
    private boolean isHeroImage;
    private boolean isGalleryImage;
    private String effectiveAltText;
    private String fullUrl;

    // Constructors
    public HotelImageDTO() {
    }

    public HotelImageDTO(Long id, String tenantId, Long hotelId, Long roomTypeId,
            ImageCategory imageCategory, String fileName, String filePath,
            Integer displayOrder, String altText, Long fileSize, String mimeType,
            Integer width, Integer height, Boolean isActive,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.hotelId = hotelId;
        this.roomTypeId = roomTypeId;
        this.imageCategory = imageCategory;
        this.fileName = fileName;
        this.filePath = filePath;
        this.displayOrder = displayOrder;
        this.altText = altText;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.width = width;
        this.height = height;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        // Set derived fields
        this.categoryCode = imageCategory.getCode();
        this.categoryDisplayName = imageCategory.getDisplayName();
        this.isHotelImage = roomTypeId == null;
        this.isRoomTypeImage = roomTypeId != null;
        this.isHeroImage = imageCategory.isHeroImage();
        this.isGalleryImage = imageCategory.isGalleryImage();
        this.fullUrl = filePath; // Assuming filePath contains full URL

        // Generate effective alt text
        this.effectiveAltText = generateEffectiveAltText();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public Long getRoomTypeId() {
        return roomTypeId;
    }

    public void setRoomTypeId(Long roomTypeId) {
        this.roomTypeId = roomTypeId;
        this.isHotelImage = roomTypeId == null;
        this.isRoomTypeImage = roomTypeId != null;
    }

    public ImageCategory getImageCategory() {
        return imageCategory;
    }

    public void setImageCategory(ImageCategory imageCategory) {
        this.imageCategory = imageCategory;
        if (imageCategory != null) {
            this.categoryCode = imageCategory.getCode();
            this.categoryDisplayName = imageCategory.getDisplayName();
            this.isHeroImage = imageCategory.isHeroImage();
            this.isGalleryImage = imageCategory.isGalleryImage();
        }
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
        this.fullUrl = filePath;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getAltText() {
        return altText;
    }

    public void setAltText(String altText) {
        this.altText = altText;
        this.effectiveAltText = generateEffectiveAltText();
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    // Derived field getters
    public String getCategoryCode() {
        return categoryCode;
    }

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public boolean getIsHotelImage() {
        return isHotelImage;
    }

    public boolean getIsRoomTypeImage() {
        return isRoomTypeImage;
    }

    public boolean getIsHeroImage() {
        return isHeroImage;
    }

    public boolean getIsGalleryImage() {
        return isGalleryImage;
    }

    public String getEffectiveAltText() {
        return effectiveAltText;
    }

    public String getFullUrl() {
        return fullUrl;
    }

    // Helper methods
    private String generateEffectiveAltText() {
        if (altText != null && !altText.trim().isEmpty()) {
            return altText;
        }

        // Generate default alt text based on image type
        StringBuilder defaultAlt = new StringBuilder();

        if (isHotelImage) {
            defaultAlt.append("Hotel");
            if (imageCategory == ImageCategory.HOTEL_HERO) {
                defaultAlt.append(" main");
            } else {
                defaultAlt.append(" gallery");
            }
            defaultAlt.append(" image");
        } else {
            defaultAlt.append("Room type");
            if (imageCategory == ImageCategory.ROOM_TYPE_HERO) {
                defaultAlt.append(" main");
            } else {
                defaultAlt.append(" gallery");
            }
            defaultAlt.append(" image");
        }

        return defaultAlt.toString();
    }
}