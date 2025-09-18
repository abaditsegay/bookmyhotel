package com.bookmyhotel.dto;

import java.util.List;

/**
 * Response DTO for enhanced cost calculation
 */
public class CostCalculationResponse {
    
    private boolean success;
    private String errorMessage;
    private PricingBreakdown pricingBreakdown;
    private List<String> recommendations;
    private List<String> warnings;
    
    // Constructors
    public CostCalculationResponse() {}
    
    public CostCalculationResponse(boolean success) {
        this.success = success;
    }
    
    public CostCalculationResponse(boolean success, String errorMessage) {
        this.success = success;
        this.errorMessage = errorMessage;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public PricingBreakdown getPricingBreakdown() {
        return pricingBreakdown;
    }
    
    public void setPricingBreakdown(PricingBreakdown pricingBreakdown) {
        this.pricingBreakdown = pricingBreakdown;
    }
    
    public List<String> getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
    
    public List<String> getWarnings() {
        return warnings;
    }
    
    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
