package com.bookmyhotel.entity;

import com.bookmyhotel.enums.ImageCategory;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Entity representing hotel and room type images stored in AWS S3
 * Supports multi-tenant architecture with proper isolation
 */
@Entity
@Table(name = "hotel_images", indexes = {
        @Index(name = "idx_tenant_hotel", columnList = "tenantId, hotelId"),
        @Index(name = "idx_room_type", columnList = "roomTypeId"),
        @Index(name = "idx_image_category", columnList = "imageCategory"),
        @Index(name = "idx_display_order", columnList = "displayOrder")
})
public class HotelImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tenant ID cannot be blank")
    @Size(max = 100, message = "Tenant ID cannot exceed 100 characters")
    @Column(name = "tenant_id", nullable = false, length = 100)
    private String tenantId;

    @NotNull(message = "Hotel ID cannot be null")
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "room_type_id")
    private Long roomTypeId; // NULL for hotel images, NOT NULL for room type images

    @NotNull(message = "Image category cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "image_category", nullable = false, length = 50)
    private ImageCategory imageCategory;

    @NotBlank(message = "File name cannot be blank")
    @Size(max = 255, message = "File name cannot exceed 255 characters")
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotBlank(message = "File path cannot be blank")
    @Size(max = 500, message = "File path cannot exceed 500 characters")
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath; // S3 URL or path

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Size(max = 255, message = "Alt text cannot exceed 255 characters")
    @Column(name = "alt_text")
    private String altText;

    @Column(name = "file_size")
    private Long fileSize; // in bytes

    @Size(max = 100, message = "MIME type cannot exceed 100 characters")
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "width")
    private Integer width; // image width in pixels

    @Column(name = "height")
    private Integer height; // image height in pixels

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    // Constructors
    public HotelImage() {
    }

    public HotelImage(String tenantId, Long hotelId, ImageCategory imageCategory,
            String fileName, String filePath) {
        this.tenantId = tenantId;
        this.hotelId = hotelId;
        this.imageCategory = imageCategory;
        this.fileName = fileName;
        this.filePath = filePath;
        this.displayOrder = 0;
        this.isActive = true;
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
    }

    public ImageCategory getImageCategory() {
        return imageCategory;
    }

    public void setImageCategory(ImageCategory imageCategory) {
        this.imageCategory = imageCategory;
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

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    // Business logic methods

    /**
     * Check if this is a hotel image (not associated with a room type)
     */
    public boolean isHotelImage() {
        return roomTypeId == null;
    }

    /**
     * Check if this is a room type image
     */
    public boolean isRoomTypeImage() {
        return roomTypeId != null;
    }

    /**
     * Check if this is a hero image (main image)
     */
    public boolean isHeroImage() {
        return imageCategory == ImageCategory.HOTEL_HERO ||
                imageCategory == ImageCategory.ROOM_TYPE_HERO;
    }

    /**
     * Check if this is a gallery image
     */
    public boolean isGalleryImage() {
        return imageCategory == ImageCategory.HOTEL_GALLERY ||
                imageCategory == ImageCategory.ROOM_TYPE_GALLERY;
    }

    /**
     * Get full S3 URL (assumes filePath contains the full URL)
     */
    public String getFullUrl() {
        return filePath;
    }

    /**
     * Generate a descriptive alt text if none provided
     */
    public String getEffectiveAltText() {
        if (altText != null && !altText.trim().isEmpty()) {
            return altText;
        }

        // Generate default alt text based on image type
        StringBuilder defaultAlt = new StringBuilder();

        if (isHotelImage()) {
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

    @PrePersist
    @PreUpdate
    private void validateImageType() {
        // Ensure room type images have a room type ID
        if ((imageCategory == ImageCategory.ROOM_TYPE_HERO ||
                imageCategory == ImageCategory.ROOM_TYPE_GALLERY) &&
                roomTypeId == null) {
            throw new IllegalStateException("Room type images must have a room type ID");
        }

        // Ensure hotel images don't have a room type ID
        if ((imageCategory == ImageCategory.HOTEL_HERO ||
                imageCategory == ImageCategory.HOTEL_GALLERY) &&
                roomTypeId != null) {
            throw new IllegalStateException("Hotel images should not have a room type ID");
        }
    }
}