package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Entity representing hotel-specific pricing and tax configuration
 * This allows each hotel to have their own tax rates, pricing strategies, and business rules
 */
@Entity
@Table(name = "hotel_pricing_config")
public class HotelPricingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @NotNull
    private Hotel hotel;

    // Tax Configuration
    @Column(name = "service_tax_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "Service tax rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "Service tax rate cannot exceed 100%")
    private BigDecimal serviceTaxRate = BigDecimal.ZERO; // Default 0%

    @Column(name = "vat_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "VAT rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "VAT rate cannot exceed 100%")
    private BigDecimal vatRate = BigDecimal.ZERO; // Default 0%

    @Column(name = "city_tax_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "City tax rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "City tax rate cannot exceed 100%")
    private BigDecimal cityTaxRate = BigDecimal.ZERO; // Default 0%

    // Pricing Strategy Configuration
    @Enumerated(EnumType.STRING)
    @Column(name = "pricing_strategy", length = 50)
    private PricingStrategy pricingStrategy = PricingStrategy.FIXED;

    @Column(name = "dynamic_pricing_enabled")
    private Boolean dynamicPricingEnabled = false;

    @Column(name = "peak_season_multiplier", precision = 4, scale = 2)
    @DecimalMin(value = "0.50", message = "Peak season multiplier cannot be less than 0.50")
    @DecimalMax(value = "5.00", message = "Peak season multiplier cannot exceed 5.00")
    private BigDecimal peakSeasonMultiplier = BigDecimal.ONE; // Default 1.0x

    @Column(name = "off_season_multiplier", precision = 4, scale = 2)
    @DecimalMin(value = "0.30", message = "Off season multiplier cannot be less than 0.30")
    @DecimalMax(value = "2.00", message = "Off season multiplier cannot exceed 2.00")
    private BigDecimal offSeasonMultiplier = BigDecimal.ONE; // Default 1.0x

    @Column(name = "weekend_multiplier", precision = 4, scale = 2)
    @DecimalMin(value = "0.50", message = "Weekend multiplier cannot be less than 0.50")
    @DecimalMax(value = "3.00", message = "Weekend multiplier cannot exceed 3.00")
    private BigDecimal weekendMultiplier = BigDecimal.ONE; // Default 1.0x

    @Column(name = "holiday_multiplier", precision = 4, scale = 2)
    @DecimalMin(value = "0.50", message = "Holiday multiplier cannot be less than 0.50")
    @DecimalMax(value = "3.00", message = "Holiday multiplier cannot exceed 3.00")
    private BigDecimal holidayMultiplier = BigDecimal.ONE; // Default 1.0x

    // Booking Policy Configuration
    @Column(name = "cancellation_fee_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "Cancellation fee rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "Cancellation fee rate cannot exceed 100%")
    private BigDecimal cancellationFeeRate = BigDecimal.ZERO; // Default 0%

    @Column(name = "modification_fee_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "Modification fee rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "Modification fee rate cannot exceed 100%")
    private BigDecimal modificationFeeRate = BigDecimal.ZERO; // Default 0%

    @Column(name = "no_show_penalty_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "No show penalty rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "No show penalty rate cannot exceed 100%")
    private BigDecimal noShowPenaltyRate = BigDecimal.ZERO; // Default 0%

    // Currency and Locale Settings
    @Column(name = "currency_code", length = 3)
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currencyCode = "ETB"; // Default Ethiopian Birr

    @Column(name = "tax_inclusive_pricing")
    private Boolean taxInclusivePricing = false; // Default tax-exclusive

    // Minimum Stay and Advance Booking Rules
    @Column(name = "minimum_stay_nights")
    private Integer minimumStayNights = 1; // Default 1 night

    @Column(name = "maximum_advance_booking_days")
    private Integer maximumAdvanceBookingDays = 365; // Default 1 year

    @Column(name = "minimum_advance_booking_hours")
    private Integer minimumAdvanceBookingHours = 2; // Default 2 hours

    // Discount Configuration
    @Column(name = "loyalty_discount_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "Loyalty discount rate cannot be negative")
    @DecimalMax(value = "0.5000", message = "Loyalty discount rate cannot exceed 50%")
    private BigDecimal loyaltyDiscountRate = BigDecimal.ZERO; // Default 0%

    @Column(name = "early_booking_discount_rate", precision = 5, scale = 4)
    @DecimalMin(value = "0.0000", message = "Early booking discount rate cannot be negative")
    @DecimalMax(value = "0.3000", message = "Early booking discount rate cannot exceed 30%")
    private BigDecimal earlyBookingDiscountRate = BigDecimal.ZERO; // Default 0%

    @Column(name = "early_booking_days_threshold")
    private Integer earlyBookingDaysThreshold = 30; // Default 30 days

    // Configuration Status - Using version for optimistic locking and change tracking
    @Column(name = "version")
    private Integer version = 1;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_until")
    private LocalDateTime effectiveUntil;

    // Audit fields
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "notes", length = 1000)
    private String notes;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (effectiveFrom == null) {
            effectiveFrom = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        version++;
    }

    // Enum for pricing strategies
    public enum PricingStrategy {
        FIXED("Fixed pricing - same rate year round"),
        SEASONAL("Seasonal pricing - different rates for peak/off seasons"),
        DYNAMIC("Dynamic pricing - rates adjust based on demand"),
        TIERED("Tiered pricing - rates based on booking advance time"),
        CUSTOM("Custom pricing - hotel-specific pricing rules");

        private final String description;

        PricingStrategy(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Constructors
    public HotelPricingConfig() {}

    public HotelPricingConfig(Hotel hotel) {
        this.hotel = hotel;
        this.effectiveFrom = LocalDateTime.now();
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
    }

    public BigDecimal getServiceTaxRate() {
        return serviceTaxRate;
    }

    public void setServiceTaxRate(BigDecimal serviceTaxRate) {
        this.serviceTaxRate = serviceTaxRate;
    }

    public BigDecimal getVatRate() {
        return vatRate;
    }

    public void setVatRate(BigDecimal vatRate) {
        this.vatRate = vatRate;
    }

    public BigDecimal getCityTaxRate() {
        return cityTaxRate;
    }

    public void setCityTaxRate(BigDecimal cityTaxRate) {
        this.cityTaxRate = cityTaxRate;
    }

    public PricingStrategy getPricingStrategy() {
        return pricingStrategy;
    }

    public void setPricingStrategy(PricingStrategy pricingStrategy) {
        this.pricingStrategy = pricingStrategy;
    }

    public Boolean getDynamicPricingEnabled() {
        return dynamicPricingEnabled;
    }

    public void setDynamicPricingEnabled(Boolean dynamicPricingEnabled) {
        this.dynamicPricingEnabled = dynamicPricingEnabled;
    }

    public BigDecimal getPeakSeasonMultiplier() {
        return peakSeasonMultiplier;
    }

    public void setPeakSeasonMultiplier(BigDecimal peakSeasonMultiplier) {
        this.peakSeasonMultiplier = peakSeasonMultiplier;
    }

    public BigDecimal getOffSeasonMultiplier() {
        return offSeasonMultiplier;
    }

    public void setOffSeasonMultiplier(BigDecimal offSeasonMultiplier) {
        this.offSeasonMultiplier = offSeasonMultiplier;
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

    public BigDecimal getCancellationFeeRate() {
        return cancellationFeeRate;
    }

    public void setCancellationFeeRate(BigDecimal cancellationFeeRate) {
        this.cancellationFeeRate = cancellationFeeRate;
    }

    public BigDecimal getModificationFeeRate() {
        return modificationFeeRate;
    }

    public void setModificationFeeRate(BigDecimal modificationFeeRate) {
        this.modificationFeeRate = modificationFeeRate;
    }

    public BigDecimal getNoShowPenaltyRate() {
        return noShowPenaltyRate;
    }

    public void setNoShowPenaltyRate(BigDecimal noShowPenaltyRate) {
        this.noShowPenaltyRate = noShowPenaltyRate;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    public Boolean getTaxInclusivePricing() {
        return taxInclusivePricing;
    }

    public void setTaxInclusivePricing(Boolean taxInclusivePricing) {
        this.taxInclusivePricing = taxInclusivePricing;
    }

    public Integer getMinimumStayNights() {
        return minimumStayNights;
    }

    public void setMinimumStayNights(Integer minimumStayNights) {
        this.minimumStayNights = minimumStayNights;
    }

    public Integer getMaximumAdvanceBookingDays() {
        return maximumAdvanceBookingDays;
    }

    public void setMaximumAdvanceBookingDays(Integer maximumAdvanceBookingDays) {
        this.maximumAdvanceBookingDays = maximumAdvanceBookingDays;
    }

    public Integer getMinimumAdvanceBookingHours() {
        return minimumAdvanceBookingHours;
    }

    public void setMinimumAdvanceBookingHours(Integer minimumAdvanceBookingHours) {
        this.minimumAdvanceBookingHours = minimumAdvanceBookingHours;
    }

    public BigDecimal getLoyaltyDiscountRate() {
        return loyaltyDiscountRate;
    }

    public void setLoyaltyDiscountRate(BigDecimal loyaltyDiscountRate) {
        this.loyaltyDiscountRate = loyaltyDiscountRate;
    }

    public BigDecimal getEarlyBookingDiscountRate() {
        return earlyBookingDiscountRate;
    }

    public void setEarlyBookingDiscountRate(BigDecimal earlyBookingDiscountRate) {
        this.earlyBookingDiscountRate = earlyBookingDiscountRate;
    }

    public Integer getEarlyBookingDaysThreshold() {
        return earlyBookingDaysThreshold;
    }

    public void setEarlyBookingDaysThreshold(Integer earlyBookingDaysThreshold) {
        this.earlyBookingDaysThreshold = earlyBookingDaysThreshold;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDateTime effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDateTime getEffectiveUntil() {
        return effectiveUntil;
    }

    public void setEffectiveUntil(LocalDateTime effectiveUntil) {
        this.effectiveUntil = effectiveUntil;
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

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Utility methods
    public BigDecimal getTotalTaxRate() {
        BigDecimal total = BigDecimal.ZERO;
        if (serviceTaxRate != null) total = total.add(serviceTaxRate);
        if (vatRate != null) total = total.add(vatRate);
        if (cityTaxRate != null) total = total.add(cityTaxRate);
        return total;
    }

    public boolean isCurrentlyActive() {
        LocalDateTime now = LocalDateTime.now();
        return (effectiveFrom == null || !now.isBefore(effectiveFrom)) &&
               (effectiveUntil == null || !now.isAfter(effectiveUntil));
    }

    @Override
    public String toString() {
        return "HotelPricingConfig{" +
                "id=" + id +
                ", hotel=" + (hotel != null ? hotel.getName() : "null") +
                ", serviceTaxRate=" + serviceTaxRate +
                ", vatRate=" + vatRate +
                ", pricingStrategy=" + pricingStrategy +
                ", currencyCode='" + currencyCode + '\'' +
                ", version=" + version +
                '}';
    }
}