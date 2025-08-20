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
 * Entity representing different pricing strategies for hotels
 * Supports dynamic pricing, seasonal adjustments, and demand-based pricing
 */
@Entity
@Table(name = "pricing_strategies")
public class PricingStrategy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "strategy_type", nullable = false)
    private PricingStrategyType strategyType;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "base_rate_multiplier", precision = 5, scale = 3, nullable = false)
    private BigDecimal baseRateMultiplier;
    
    @Column(name = "min_occupancy_threshold", precision = 5, scale = 2)
    private BigDecimal minOccupancyThreshold;
    
    @Column(name = "max_occupancy_threshold", precision = 5, scale = 2)
    private BigDecimal maxOccupancyThreshold;
    
    @Column(name = "advance_booking_days")
    private Integer advanceBookingDays;
    
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;
    
    @Column(name = "effective_to")
    private LocalDate effectiveTo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    private RoomType roomType;
    
    @Column(name = "weekday_multiplier", precision = 5, scale = 3)
    private BigDecimal weekdayMultiplier;
    
    @Column(name = "weekend_multiplier", precision = 5, scale = 3)
    private BigDecimal weekendMultiplier;
    
    @Column(name = "holiday_multiplier", precision = 5, scale = 3)
    private BigDecimal holidayMultiplier;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "priority", nullable = false)
    private Integer priority = 0;
    
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
    public PricingStrategy() {}
    
    public PricingStrategy(Long hotelId, PricingStrategyType strategyType, String name, 
                          BigDecimal baseRateMultiplier, LocalDate effectiveFrom) {
        this.hotelId = hotelId;
        this.strategyType = strategyType;
        this.name = name;
        this.baseRateMultiplier = baseRateMultiplier;
        this.effectiveFrom = effectiveFrom;
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
    
    public PricingStrategyType getStrategyType() {
        return strategyType;
    }
    
    public void setStrategyType(PricingStrategyType strategyType) {
        this.strategyType = strategyType;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public BigDecimal getBaseRateMultiplier() {
        return baseRateMultiplier;
    }
    
    public void setBaseRateMultiplier(BigDecimal baseRateMultiplier) {
        this.baseRateMultiplier = baseRateMultiplier;
    }
    
    public BigDecimal getMinOccupancyThreshold() {
        return minOccupancyThreshold;
    }
    
    public void setMinOccupancyThreshold(BigDecimal minOccupancyThreshold) {
        this.minOccupancyThreshold = minOccupancyThreshold;
    }
    
    public BigDecimal getMaxOccupancyThreshold() {
        return maxOccupancyThreshold;
    }
    
    public void setMaxOccupancyThreshold(BigDecimal maxOccupancyThreshold) {
        this.maxOccupancyThreshold = maxOccupancyThreshold;
    }
    
    public Integer getAdvanceBookingDays() {
        return advanceBookingDays;
    }
    
    public void setAdvanceBookingDays(Integer advanceBookingDays) {
        this.advanceBookingDays = advanceBookingDays;
    }
    
    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }
    
    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }
    
    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }
    
    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }
    
    public RoomType getRoomType() {
        return roomType;
    }
    
    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }
    
    public BigDecimal getWeekdayMultiplier() {
        return weekdayMultiplier;
    }
    
    public void setWeekdayMultiplier(BigDecimal weekdayMultiplier) {
        this.weekdayMultiplier = weekdayMultiplier;
    }
    
    public BigDecimal getWeekendMultiplier() {
        return weekendMultiplier;
    }
    
    public void setWeekendMultiplier(BigDecimal weekendMultiplier) {
        this.weekendMultiplier = weekendMultiplier;
    }
    
    public BigDecimal getHolidayMultiplier() {
        return holidayMultiplier;
    }
    
    public void setHolidayMultiplier(BigDecimal holidayMultiplier) {
        this.holidayMultiplier = holidayMultiplier;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Integer getPriority() {
        return priority;
    }
    
    public void setPriority(Integer priority) {
        this.priority = priority;
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
