package com.bookmyhotel.dto.payment;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * M-birr payment request DTO
 */
public class MobirrPaymentRequest {
    
    @JsonProperty("amount")
    private BigDecimal amount;
    
    @JsonProperty("currency")
    private String currency;
    
    @JsonProperty("phone_number")
    private String phoneNumber;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("merchant_reference")
    private String merchantReference;
    
    @JsonProperty("callback_url")
    private String callbackUrl;
    
    @JsonProperty("customer_name")
    private String customerName;
    
    @JsonProperty("customer_email")
    private String customerEmail;
    
    // Default constructor
    public MobirrPaymentRequest() {}
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private MobirrPaymentRequest request = new MobirrPaymentRequest();
        
        public Builder amount(BigDecimal amount) {
            request.amount = amount;
            return this;
        }
        
        public Builder currency(String currency) {
            request.currency = currency;
            return this;
        }
        
        public Builder phoneNumber(String phoneNumber) {
            request.phoneNumber = phoneNumber;
            return this;
        }
        
        public Builder description(String description) {
            request.description = description;
            return this;
        }
        
        public Builder merchantReference(String merchantReference) {
            request.merchantReference = merchantReference;
            return this;
        }
        
        public Builder callbackUrl(String callbackUrl) {
            request.callbackUrl = callbackUrl;
            return this;
        }
        
        public Builder customerName(String customerName) {
            request.customerName = customerName;
            return this;
        }
        
        public Builder customerEmail(String customerEmail) {
            request.customerEmail = customerEmail;
            return this;
        }
        
        public MobirrPaymentRequest build() {
            return request;
        }
    }
    
    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getMerchantReference() {
        return merchantReference;
    }
    
    public void setMerchantReference(String merchantReference) {
        this.merchantReference = merchantReference;
    }
    
    public String getCallbackUrl() {
        return callbackUrl;
    }
    
    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public String getCustomerEmail() {
        return customerEmail;
    }
    
    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
}
