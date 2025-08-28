package com.bookmyhotel.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating and updating ads
 */
public class AdRequest {

    @NotNull(message = "Hotel ID is required")
    private Long hotelId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Original price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Invalid price format")
    private BigDecimal originalPrice;

    @DecimalMax(value = "100.0", message = "Discount percentage cannot exceed 100%")
    @DecimalMin(value = "0.0", inclusive = true, message = "Discount percentage cannot be negative")
    private BigDecimal discountPercentage;

    @NotNull(message = "Valid until date is required")
    private LocalDate validUntil;

    private Boolean isActive = true;

    @Min(value = 1, message = "Priority level must be at least 1")
    @Max(value = 10, message = "Priority level cannot exceed 10")
    private Integer priorityLevel = 5;

    // Constructors
    public AdRequest() {
    }

    public AdRequest(Long hotelId, String title, String description, String imageUrl,
            BigDecimal originalPrice, BigDecimal discountPercentage,
            LocalDate validUntil, Boolean isActive, Integer priorityLevel) {
        this.hotelId = hotelId;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.originalPrice = originalPrice;
        this.discountPercentage = discountPercentage;
        this.validUntil = validUntil;
        this.isActive = isActive;
        this.priorityLevel = priorityLevel;
    }

    // Getters and Setters
    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public LocalDate getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDate validUntil) {
        this.validUntil = validUntil;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getPriorityLevel() {
        return priorityLevel;
    }

    public void setPriorityLevel(Integer priorityLevel) {
        this.priorityLevel = priorityLevel;
    }
}
