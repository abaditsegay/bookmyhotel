package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Detailed breakdown of pricing components for enhanced cost calculation
 */
public class PricingBreakdown {
    
    // Base pricing information
    private BigDecimal baseRatePerNight;
    private Integer numberOfNights;
    private BigDecimal baseTotal;
    
    // Applied adjustments
    private List<String> appliedPricingStrategies;
    private List<String> appliedSeasonalRates;
    private List<String> dayOfWeekAdjustments;
    
    // Promotional code information
    private String promotionalCodeApplied;
    private BigDecimal promotionalCodeDiscount;
    private String promotionalCodeDescription;
    private String promotionalCodeError;
    
    // Taxes and fees
    private BigDecimal taxesAndFees;
    
    // Final totals
    private BigDecimal finalTotal;
    private BigDecimal totalSavings;
    private BigDecimal savingsPercentage;
    
    // Modification comparison (for booking changes)
    private BigDecimal originalTotal;
    private BigDecimal costDifference;
    
    // Additional fees breakdown
    private BigDecimal breakfastFee;
    private BigDecimal parkingFee;
    private BigDecimal serviceFee;
    private BigDecimal resortFee;
    
    // Constructors
    public PricingBreakdown() {}
    
    // Getters and Setters
    public BigDecimal getBaseRatePerNight() {
        return baseRatePerNight;
    }
    
    public void setBaseRatePerNight(BigDecimal baseRatePerNight) {
        this.baseRatePerNight = baseRatePerNight;
    }
    
    public Integer getNumberOfNights() {
        return numberOfNights;
    }
    
    public void setNumberOfNights(Integer numberOfNights) {
        this.numberOfNights = numberOfNights;
    }
    
    public BigDecimal getBaseTotal() {
        return baseTotal;
    }
    
    public void setBaseTotal(BigDecimal baseTotal) {
        this.baseTotal = baseTotal;
    }
    
    public List<String> getAppliedPricingStrategies() {
        return appliedPricingStrategies;
    }
    
    public void setAppliedPricingStrategies(List<String> appliedPricingStrategies) {
        this.appliedPricingStrategies = appliedPricingStrategies;
    }
    
    public List<String> getAppliedSeasonalRates() {
        return appliedSeasonalRates;
    }
    
    public void setAppliedSeasonalRates(List<String> appliedSeasonalRates) {
        this.appliedSeasonalRates = appliedSeasonalRates;
    }
    
    public List<String> getDayOfWeekAdjustments() {
        return dayOfWeekAdjustments;
    }
    
    public void setDayOfWeekAdjustments(List<String> dayOfWeekAdjustments) {
        this.dayOfWeekAdjustments = dayOfWeekAdjustments;
    }
    
    public String getPromotionalCodeApplied() {
        return promotionalCodeApplied;
    }
    
    public void setPromotionalCodeApplied(String promotionalCodeApplied) {
        this.promotionalCodeApplied = promotionalCodeApplied;
    }
    
    public BigDecimal getPromotionalCodeDiscount() {
        return promotionalCodeDiscount;
    }
    
    public void setPromotionalCodeDiscount(BigDecimal promotionalCodeDiscount) {
        this.promotionalCodeDiscount = promotionalCodeDiscount;
    }
    
    public String getPromotionalCodeDescription() {
        return promotionalCodeDescription;
    }
    
    public void setPromotionalCodeDescription(String promotionalCodeDescription) {
        this.promotionalCodeDescription = promotionalCodeDescription;
    }
    
    public String getPromotionalCodeError() {
        return promotionalCodeError;
    }
    
    public void setPromotionalCodeError(String promotionalCodeError) {
        this.promotionalCodeError = promotionalCodeError;
    }
    
    public BigDecimal getTaxesAndFees() {
        return taxesAndFees;
    }
    
    public void setTaxesAndFees(BigDecimal taxesAndFees) {
        this.taxesAndFees = taxesAndFees;
    }
    
    public BigDecimal getFinalTotal() {
        return finalTotal;
    }
    
    public void setFinalTotal(BigDecimal finalTotal) {
        this.finalTotal = finalTotal;
    }
    
    public BigDecimal getTotalSavings() {
        return totalSavings;
    }
    
    public void setTotalSavings(BigDecimal totalSavings) {
        this.totalSavings = totalSavings;
    }
    
    public BigDecimal getSavingsPercentage() {
        return savingsPercentage;
    }
    
    public void setSavingsPercentage(BigDecimal savingsPercentage) {
        this.savingsPercentage = savingsPercentage;
    }
    
    public BigDecimal getOriginalTotal() {
        return originalTotal;
    }
    
    public void setOriginalTotal(BigDecimal originalTotal) {
        this.originalTotal = originalTotal;
    }
    
    public BigDecimal getCostDifference() {
        return costDifference;
    }
    
    public void setCostDifference(BigDecimal costDifference) {
        this.costDifference = costDifference;
    }
    
    public BigDecimal getBreakfastFee() {
        return breakfastFee;
    }
    
    public void setBreakfastFee(BigDecimal breakfastFee) {
        this.breakfastFee = breakfastFee;
    }
    
    public BigDecimal getParkingFee() {
        return parkingFee;
    }
    
    public void setParkingFee(BigDecimal parkingFee) {
        this.parkingFee = parkingFee;
    }
    
    public BigDecimal getServiceFee() {
        return serviceFee;
    }
    
    public void setServiceFee(BigDecimal serviceFee) {
        this.serviceFee = serviceFee;
    }
    
    public BigDecimal getResortFee() {
        return resortFee;
    }
    
    public void setResortFee(BigDecimal resortFee) {
        this.resortFee = resortFee;
    }
}
