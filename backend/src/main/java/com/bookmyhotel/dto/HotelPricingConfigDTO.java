package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookmyhotel.entity.HotelPricingConfig.PricingStrategy;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

/**
 * DTO for hotel pricing configuration requests
 * Provides a simplified interface for creating and updating pricing configurations
 */
public class HotelPricingConfigDTO {

    // Tax Configuration
    @DecimalMin(value = "0.0000", message = "Service tax rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "Service tax rate cannot exceed 100%")
    private BigDecimal serviceTaxRate;

    @DecimalMin(value = "0.0000", message = "VAT rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "VAT rate cannot exceed 100%")
    private BigDecimal vatRate;

    @DecimalMin(value = "0.0000", message = "City tax rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "City tax rate cannot exceed 100%")
    private BigDecimal cityTaxRate;

    // Pricing Strategy Configuration
    private PricingStrategy pricingStrategy;
    private Boolean dynamicPricingEnabled;

    @DecimalMin(value = "0.50", message = "Peak season multiplier cannot be less than 0.50")
    @DecimalMax(value = "5.00", message = "Peak season multiplier cannot exceed 5.00")
    private BigDecimal peakSeasonMultiplier;

    @DecimalMin(value = "0.30", message = "Off season multiplier cannot be less than 0.30")
    @DecimalMax(value = "2.00", message = "Off season multiplier cannot exceed 2.00")
    private BigDecimal offSeasonMultiplier;

    // Booking Policy Configuration
    @DecimalMin(value = "0.0000", message = "Cancellation fee rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "Cancellation fee rate cannot exceed 100%")
    private BigDecimal cancellationFeeRate;

    @DecimalMin(value = "0.0000", message = "Modification fee rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "Modification fee rate cannot exceed 100%")
    private BigDecimal modificationFeeRate;

    @DecimalMin(value = "0.0000", message = "No show penalty rate cannot be negative")
    @DecimalMax(value = "1.0000", message = "No show penalty rate cannot exceed 100%")
    private BigDecimal noShowPenaltyRate;

    // Currency and Locale Settings
    @Size(min = 3, max = 3, message = "Currency code must be 3 characters")
    private String currencyCode;

    private Boolean taxInclusivePricing;

    // Booking Rules
    @Min(value = 1, message = "Minimum stay nights must be at least 1")
    private Integer minimumStayNights;

    @Min(value = 1, message = "Maximum advance booking days must be at least 1")
    @Max(value = 3650, message = "Maximum advance booking days cannot exceed 10 years")
    private Integer maximumAdvanceBookingDays;

    @Min(value = 0, message = "Minimum advance booking hours cannot be negative")
    @Max(value = 720, message = "Minimum advance booking hours cannot exceed 30 days")
    private Integer minimumAdvanceBookingHours;

    // Discount Configuration
    @DecimalMin(value = "0.0000", message = "Loyalty discount rate cannot be negative")
    @DecimalMax(value = "0.5000", message = "Loyalty discount rate cannot exceed 50%")
    private BigDecimal loyaltyDiscountRate;

    @DecimalMin(value = "0.0000", message = "Early booking discount rate cannot be negative")
    @DecimalMax(value = "0.3000", message = "Early booking discount rate cannot exceed 30%")
    private BigDecimal earlyBookingDiscountRate;

    @Min(value = 1, message = "Early booking days threshold must be at least 1")
    @Max(value = 365, message = "Early booking days threshold cannot exceed 1 year")
    private Integer earlyBookingDaysThreshold;

    // Configuration Status
    private Boolean isActive;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveUntil;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    // Constructors
    public HotelPricingConfigDTO() {}

    // Getters and Setters
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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

    @Override
    public String toString() {
        return "HotelPricingConfigDTO{" +
                "serviceTaxRate=" + serviceTaxRate +
                ", vatRate=" + vatRate +
                ", pricingStrategy=" + pricingStrategy +
                ", currencyCode='" + currencyCode + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}