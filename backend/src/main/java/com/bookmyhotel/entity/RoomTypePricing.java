package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Entity for managing room type pricing
 * Allows hotel admins to set default prices per room type
 */
@Entity
@Table(name = "room_type_pricing", indexes = {
        @Index(name = "idx_room_type_pricing_hotel", columnList = "hotel_id"),
        @Index(name = "idx_room_type_pricing_room_type", columnList = "room_type")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_room_type_pricing_hotel_type", columnNames = { "hotel_id", "room_type" })
})
public class RoomTypePricing extends HotelScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type", nullable = false)
    @NotNull
    private RoomType roomType;

    @Column(name = "base_price_per_night", nullable = false, precision = 10, scale = 2)
    @NotNull
    @Positive
    private BigDecimal basePricePerNight;

    @Column(name = "weekend_price", precision = 10, scale = 2)
    private BigDecimal weekendPrice;

    @Column(name = "holiday_price", precision = 10, scale = 2)
    private BigDecimal holidayPrice;

    @Column(name = "peak_season_price", precision = 10, scale = 2)
    private BigDecimal peakSeasonPrice;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "currency", length = 3)
    private String currency = "ETB";

    @Column(name = "effective_from")
    private java.time.LocalDate effectiveFrom;

    @Column(name = "effective_until")
    private java.time.LocalDate effectiveUntil;

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
    public RoomTypePricing() {
    }

    public RoomTypePricing(Hotel hotel, RoomType roomType, BigDecimal basePricePerNight) {
        this.setHotel(hotel);
        this.roomType = roomType;
        this.basePricePerNight = basePricePerNight;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public BigDecimal getWeekendPrice() {
        return weekendPrice;
    }

    public void setWeekendPrice(BigDecimal weekendPrice) {
        this.weekendPrice = weekendPrice;
    }

    public BigDecimal getHolidayPrice() {
        return holidayPrice;
    }

    public void setHolidayPrice(BigDecimal holidayPrice) {
        this.holidayPrice = holidayPrice;
    }

    public BigDecimal getPeakSeasonPrice() {
        return peakSeasonPrice;
    }

    public void setPeakSeasonPrice(BigDecimal peakSeasonPrice) {
        this.peakSeasonPrice = peakSeasonPrice;
    }

    public java.time.LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(java.time.LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public java.time.LocalDate getEffectiveUntil() {
        return effectiveUntil;
    }

    public void setEffectiveUntil(java.time.LocalDate effectiveUntil) {
        this.effectiveUntil = effectiveUntil;
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
     * Calculate price for a specific date (considering weekend/holiday pricing)
     */
    public BigDecimal calculatePrice(boolean isWeekend, boolean isHoliday, boolean isPeakSeason) {
        BigDecimal price = basePricePerNight;

        if (isHoliday && holidayPrice != null) {
            price = holidayPrice;
        } else if (isWeekend && weekendPrice != null) {
            price = weekendPrice;
        } else if (isPeakSeason && peakSeasonPrice != null) {
            price = peakSeasonPrice;
        }

        return price;
    }
}
