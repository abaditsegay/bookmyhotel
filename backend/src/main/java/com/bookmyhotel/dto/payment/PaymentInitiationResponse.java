package com.bookmyhotel.dto.payment;

import java.time.LocalDateTime;

/**
 * Response DTO for Ethiopian mobile payment initiation
 */
public class PaymentInitiationResponse {
    
    private boolean success;
    private String transactionId;
    private String paymentUrl;
    private String qrCode;
    private LocalDateTime expiresAt;
    private String instructions;
    private String errorMessage;
    private String paymentProvider;
    
    // Default constructor
    public PaymentInitiationResponse() {}
    
    // Constructor for successful response
    public PaymentInitiationResponse(boolean success, String transactionId, String paymentUrl) {
        this.success = success;
        this.transactionId = transactionId;
        this.paymentUrl = paymentUrl;
    }
    
    // Constructor for error response
    public PaymentInitiationResponse(boolean success, String errorMessage) {
        this.success = success;
        this.errorMessage = errorMessage;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private PaymentInitiationResponse response = new PaymentInitiationResponse();
        
        public Builder success(boolean success) {
            response.success = success;
            return this;
        }
        
        public Builder transactionId(String transactionId) {
            response.transactionId = transactionId;
            return this;
        }
        
        public Builder paymentUrl(String paymentUrl) {
            response.paymentUrl = paymentUrl;
            return this;
        }
        
        public Builder qrCode(String qrCode) {
            response.qrCode = qrCode;
            return this;
        }
        
        public Builder expiresAt(LocalDateTime expiresAt) {
            response.expiresAt = expiresAt;
            return this;
        }
        
        public Builder instructions(String instructions) {
            response.instructions = instructions;
            return this;
        }
        
        public Builder errorMessage(String errorMessage) {
            response.errorMessage = errorMessage;
            return this;
        }
        
        public Builder paymentProvider(String paymentProvider) {
            response.paymentProvider = paymentProvider;
            return this;
        }
        
        public PaymentInitiationResponse build() {
            return response;
        }
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
    
    public String getPaymentUrl() {
        return paymentUrl;
    }
    
    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public String getInstructions() {
        return instructions;
    }
    
    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getPaymentProvider() {
        return paymentProvider;
    }
    
    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
    }
}
