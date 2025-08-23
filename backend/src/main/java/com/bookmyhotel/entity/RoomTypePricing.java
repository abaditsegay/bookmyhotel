package com.bookmyhotel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity for managing room type pricing
 * Allows hotel admins to set default prices per room type
 */
@Entity
@Table(name = "room_type_pricing",
       indexes = {
           @Index(name = "idx_room_type_pricing_tenant", columnList = "tenant_id"),
           @Index(name = "idx_room_type_pricing_hotel", columnList = "hotel_id"),
           @Index(name = "idx_room_type_pricing_room_type", columnList = "room_type")
       },
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_room_type_pricing_hotel_type", 
                           columnNames = {"hotel_id", "room_type"})
       })
public class RoomTypePricing extends TenantEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @NotNull
    private Hotel hotel;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    @NotNull
    private RoomType roomType;
    
    @Column(name = "base_price_per_night", nullable = false, precision = 10, scale = 2)
    @NotNull
    @Positive
    private BigDecimal basePricePerNight;
    
    @Column(name = "weekend_multiplier", precision = 5, scale = 2)
    private BigDecimal weekendMultiplier = BigDecimal.valueOf(1.2); // 20% increase for weekends
    
    @Column(name = "holiday_multiplier", precision = 5, scale = 2)
    private BigDecimal holidayMultiplier = BigDecimal.valueOf(1.5); // 50% increase for holidays
    
    @Column(name = "peak_season_multiplier", precision = 5, scale = 2)
    private BigDecimal peakSeasonMultiplier = BigDecimal.valueOf(1.3); // 30% increase for peak season
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
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
    public RoomTypePricing() {}
    
    public RoomTypePricing(Hotel hotel, RoomType roomType, BigDecimal basePricePerNight) {
        this.hotel = hotel;
        this.roomType = roomType;
        this.basePricePerNight = basePricePerNight;
        this.setTenantId(hotel.getTenantId());
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Hotel getHotel() {
        return hotel;
    }
    
    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
        if (hotel != null) {
            this.setTenantId(hotel.getTenantId());
        }
    }
    
    public RoomType getRoomType() {
        return roomType;
    }
    
    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }
    
    public BigDecimal getBasePricePerNight() {
        return basePricePerNight;
    }
    
    public void setBasePricePerNight(BigDecimal basePricePerNight) {
        this.basePricePerNight = basePricePerNight;
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
    
    public BigDecimal getPeakSeasonMultiplier() {
        return peakSeasonMultiplier;
    }
    
    public void setPeakSeasonMultiplier(BigDecimal peakSeasonMultiplier) {
        this.peakSeasonMultiplier = peakSeasonMultiplier;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    /**
     * Calculate price for a specific date (considering weekend/holiday multipliers)
     */
    public BigDecimal calculatePrice(boolean isWeekend, boolean isHoliday, boolean isPeakSeason) {
        BigDecimal price = basePricePerNight;
        
        if (isHoliday && holidayMultiplier != null) {
            price = price.multiply(holidayMultiplier);
        } else if (isWeekend && weekendMultiplier != null) {
            price = price.multiply(weekendMultiplier);
        }
        
        if (isPeakSeason && peakSeasonMultiplier != null) {
            price = price.multiply(peakSeasonMultiplier);
        }
        
        return price;
    }
}
