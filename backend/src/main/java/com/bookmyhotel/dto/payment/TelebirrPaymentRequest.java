package com.bookmyhotel.dto.payment;

import java.math.BigDecimal;

public class TelebirrPaymentRequest {
    private BigDecimal amount;
    private String phoneNumber;
    private String bookingReference;
    private String customerName;
    private String customerEmail;
    private String returnUrl;
    private String currency;
    private String description;
    private String merchantReference;
    private String notifyUrl;
    
    public TelebirrPaymentRequest() {}
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private TelebirrPaymentRequest request = new TelebirrPaymentRequest();
        
        public Builder amount(BigDecimal amount) {
            request.amount = amount;
            return this;
        }
        
        public Builder phoneNumber(String phoneNumber) {
            request.phoneNumber = phoneNumber;
            return this;
        }
        
        public Builder bookingReference(String bookingReference) {
            request.bookingReference = bookingReference;
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
        
        public Builder returnUrl(String returnUrl) {
            request.returnUrl = returnUrl;
            return this;
        }
        
        public Builder currency(String currency) {
            request.currency = currency;
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
        
        public Builder notifyUrl(String notifyUrl) {
            request.notifyUrl = notifyUrl;
            return this;
        }
        
        public TelebirrPaymentRequest build() {
            return request;
        }
    }
    
    // Getters and setters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getBookingReference() {
        return bookingReference;
    }
    
    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
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
    
    public String getReturnUrl() {
        return returnUrl;
    }
    
    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
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
    
    public String getMerchantReference() {
        return merchantReference;
    }
    
    public void setMerchantReference(String merchantReference) {
        this.merchantReference = merchantReference;
    }
    
    public String getNotifyUrl() {
        return notifyUrl;
    }
    
    public void setNotifyUrl(String notifyUrl) {
        this.notifyUrl = notifyUrl;
    }
}
