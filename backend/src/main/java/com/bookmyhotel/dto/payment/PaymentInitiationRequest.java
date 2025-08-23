package com.bookmyhotel.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request DTO for initiating Ethiopian mobile payments
 */
public class PaymentInitiationRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+251[0-9]{9}$|^0[0-9]{9}$", message = "Please provide a valid Ethiopian phone number")
    private String phoneNumber;
    
    @NotBlank(message = "Booking reference is required")
    private String bookingReference;
    
    @NotBlank(message = "Payment provider is required")
    @Pattern(regexp = "^(MBIRR|TELEBIRR)$", message = "Payment provider must be MBIRR or TELEBIRR")
    private String paymentProvider;
    
    private String customerName;
    private String customerEmail;
    private String returnUrl;
    private String description;
    
    // Default constructor
    public PaymentInitiationRequest() {}
    
    // Constructor
    public PaymentInitiationRequest(BigDecimal amount, String phoneNumber, String bookingReference, String paymentProvider) {
        this.amount = amount;
        this.phoneNumber = phoneNumber;
        this.bookingReference = bookingReference;
        this.paymentProvider = paymentProvider;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private PaymentInitiationRequest request = new PaymentInitiationRequest();
        
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
        
        public Builder paymentProvider(String paymentProvider) {
            request.paymentProvider = paymentProvider;
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
        
        public Builder description(String description) {
            request.description = description;
            return this;
        }
        
        public PaymentInitiationRequest build() {
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
    
    public String getPaymentProvider() {
        return paymentProvider;
    }
    
    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
