package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * Entity representing seasonal rate adjustments for hotels
 */
@Entity
@Table(name = "seasonal_rates")
public class SeasonalRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Column(name = "season_name", nullable = false, length = 100)
    private String seasonName;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    private RoomType roomType;
    
    @Column(name = "rate_multiplier", precision = 5, scale = 3, nullable = false)
    private BigDecimal rateMultiplier;
    
    @Column(name = "fixed_rate_adjustment", precision = 10, scale = 2)
    private BigDecimal fixedRateAdjustment;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "adjustment_type", nullable = false)
    private RateAdjustmentType adjustmentType;
    
    @Column(name = "applies_to_weekends_only", nullable = false)
    private Boolean appliesToWeekendsOnly = false;
    
    @Column(name = "applies_to_weekdays_only", nullable = false)
    private Boolean appliesToWeekdaysOnly = false;
    
    @Column(name = "min_nights")
    private Integer minNights;
    
    @Column(name = "max_nights")
    private Integer maxNights;
    
    @Column(name = "priority", nullable = false)
    private Integer priority = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public SeasonalRate() {}
    
    public SeasonalRate(Long hotelId, String seasonName, LocalDate startDate, LocalDate endDate, 
                       BigDecimal rateMultiplier, RateAdjustmentType adjustmentType) {
        this.hotelId = hotelId;
        this.seasonName = seasonName;
        this.startDate = startDate;
        this.endDate = endDate;
        this.rateMultiplier = rateMultiplier;
        this.adjustmentType = adjustmentType;
    }
    
    // Business Methods
    
    /**
     * Check if this seasonal rate applies to the given date
     */
    public boolean isApplicableForDate(LocalDate date) {
        if (!isActive) return false;
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }
    
    /**
     * Check if this seasonal rate applies to the given room type
     */
    public boolean isApplicableForRoomType(RoomType targetRoomType) {
        return roomType == null || roomType.equals(targetRoomType);
    }
    
    /**
     * Calculate the adjusted rate based on the original rate
     */
    public BigDecimal calculateAdjustedRate(BigDecimal originalRate) {
        if (adjustmentType == RateAdjustmentType.MULTIPLIER) {
            return originalRate.multiply(rateMultiplier);
        } else if (adjustmentType == RateAdjustmentType.FIXED_ADJUSTMENT && fixedRateAdjustment != null) {
            return originalRate.add(fixedRateAdjustment);
        }
        return originalRate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }
    
    public String getSeasonName() {
        return seasonName;
    }
    
    public void setSeasonName(String seasonName) {
        this.seasonName = seasonName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public RoomType getRoomType() {
        return roomType;
    }
    
    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }
    
    public BigDecimal getRateMultiplier() {
        return rateMultiplier;
    }
    
    public void setRateMultiplier(BigDecimal rateMultiplier) {
        this.rateMultiplier = rateMultiplier;
    }
    
    public BigDecimal getFixedRateAdjustment() {
        return fixedRateAdjustment;
    }
    
    public void setFixedRateAdjustment(BigDecimal fixedRateAdjustment) {
        this.fixedRateAdjustment = fixedRateAdjustment;
    }
    
    public RateAdjustmentType getAdjustmentType() {
        return adjustmentType;
    }
    
    public void setAdjustmentType(RateAdjustmentType adjustmentType) {
        this.adjustmentType = adjustmentType;
    }
    
    public Boolean getAppliesToWeekendsOnly() {
        return appliesToWeekendsOnly;
    }
    
    public void setAppliesToWeekendsOnly(Boolean appliesToWeekendsOnly) {
        this.appliesToWeekendsOnly = appliesToWeekendsOnly;
    }
    
    public Boolean getAppliesToWeekdaysOnly() {
        return appliesToWeekdaysOnly;
    }
    
    public void setAppliesToWeekdaysOnly(Boolean appliesToWeekdaysOnly) {
        this.appliesToWeekdaysOnly = appliesToWeekdaysOnly;
    }
    
    public Integer getMinNights() {
        return minNights;
    }
    
    public void setMinNights(Integer minNights) {
        this.minNights = minNights;
    }
    
    public Integer getMaxNights() {
        return maxNights;
    }
    
    public void setMaxNights(Integer maxNights) {
        this.maxNights = maxNights;
    }
    
    public Integer getPriority() {
        return priority;
    }
    
    public void setPriority(Integer priority) {
        this.priority = priority;
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
}
