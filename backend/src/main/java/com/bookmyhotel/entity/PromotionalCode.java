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
 * Entity representing promotional codes and discount offers
 */
@Entity
@Table(name = "promotional_codes")
public class PromotionalCode {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;
    
    @Column(name = "discount_value", precision = 10, scale = 2, nullable = false)
    private BigDecimal discountValue;
    
    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;
    
    @Column(name = "min_booking_amount", precision = 10, scale = 2)
    private BigDecimal minBookingAmount;
    
    @Column(name = "valid_from", nullable = false)
    private LocalDate validFrom;
    
    @Column(name = "valid_to", nullable = false)
    private LocalDate validTo;
    
    @Column(name = "usage_limit")
    private Integer usageLimit;
    
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;
    
    @Column(name = "per_customer_limit")
    private Integer perCustomerLimit;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "applicable_room_type")
    private RoomType applicableRoomType;
    
    @Column(name = "first_time_customer_only", nullable = false)
    private Boolean firstTimeCustomerOnly = false;
    
    @Column(name = "min_nights")
    private Integer minNights;
    
    @Column(name = "max_nights")
    private Integer maxNights;
    
    @Column(name = "advance_booking_days")
    private Integer advanceBookingDays;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
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
    public PromotionalCode() {}
    
    public PromotionalCode(Long hotelId, String code, String name, DiscountType discountType, 
                          BigDecimal discountValue, LocalDate validFrom, LocalDate validTo) {
        this.hotelId = hotelId;
        this.code = code;
        this.name = name;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.validFrom = validFrom;
        this.validTo = validTo;
    }
    
    // Business Methods
    
    /**
     * Check if the promotional code is currently valid
     */
    public boolean isValidForDate(LocalDate bookingDate) {
        if (!isActive) return false;
        if (bookingDate.isBefore(validFrom) || bookingDate.isAfter(validTo)) return false;
        if (usageLimit != null && usageCount >= usageLimit) return false;
        return true;
    }
    
    /**
     * Check if the promotional code can be used for the given booking amount
     */
    public boolean isValidForAmount(BigDecimal bookingAmount) {
        if (minBookingAmount != null && bookingAmount.compareTo(minBookingAmount) < 0) {
            return false;
        }
        return true;
    }
    
    /**
     * Calculate the discount amount for a given booking amount
     */
    public BigDecimal calculateDiscountAmount(BigDecimal bookingAmount) {
        BigDecimal discountAmount;
        
        if (discountType == DiscountType.PERCENTAGE) {
            discountAmount = bookingAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
        } else {
            discountAmount = discountValue;
        }
        
        // Apply maximum discount limit if set
        if (maxDiscountAmount != null && discountAmount.compareTo(maxDiscountAmount) > 0) {
            discountAmount = maxDiscountAmount;
        }
        
        return discountAmount;
    }
    
    /**
     * Increment usage count
     */
    public void incrementUsageCount() {
        this.usageCount++;
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
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
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
    
    public DiscountType getDiscountType() {
        return discountType;
    }
    
    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }
    
    public BigDecimal getDiscountValue() {
        return discountValue;
    }
    
    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }
    
    public BigDecimal getMaxDiscountAmount() {
        return maxDiscountAmount;
    }
    
    public void setMaxDiscountAmount(BigDecimal maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }
    
    public BigDecimal getMinBookingAmount() {
        return minBookingAmount;
    }
    
    public void setMinBookingAmount(BigDecimal minBookingAmount) {
        this.minBookingAmount = minBookingAmount;
    }
    
    public LocalDate getValidFrom() {
        return validFrom;
    }
    
    public void setValidFrom(LocalDate validFrom) {
        this.validFrom = validFrom;
    }
    
    public LocalDate getValidTo() {
        return validTo;
    }
    
    public void setValidTo(LocalDate validTo) {
        this.validTo = validTo;
    }
    
    public Integer getUsageLimit() {
        return usageLimit;
    }
    
    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }
    
    public Integer getUsageCount() {
        return usageCount;
    }
    
    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }
    
    public Integer getPerCustomerLimit() {
        return perCustomerLimit;
    }
    
    public void setPerCustomerLimit(Integer perCustomerLimit) {
        this.perCustomerLimit = perCustomerLimit;
    }
    
    public RoomType getApplicableRoomType() {
        return applicableRoomType;
    }
    
    public void setApplicableRoomType(RoomType applicableRoomType) {
        this.applicableRoomType = applicableRoomType;
    }
    
    public Boolean getFirstTimeCustomerOnly() {
        return firstTimeCustomerOnly;
    }
    
    public void setFirstTimeCustomerOnly(Boolean firstTimeCustomerOnly) {
        this.firstTimeCustomerOnly = firstTimeCustomerOnly;
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
    
    public Integer getAdvanceBookingDays() {
        return advanceBookingDays;
    }
    
    public void setAdvanceBookingDays(Integer advanceBookingDays) {
        this.advanceBookingDays = advanceBookingDays;
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
    
    public String getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
}
