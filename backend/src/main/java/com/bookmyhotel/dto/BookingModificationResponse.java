package com.bookmyhotel.dto;

import java.math.BigDecimal;

/**
 * Booking modification response DTO
 */
public class BookingModificationResponse {
    
    private boolean success;
    private String message;
    private BookingResponse updatedBooking;
    private BigDecimal additionalCharges;
    private BigDecimal refundAmount;
    private String paymentIntentId; // For additional payments if needed
    
    // Constructors
    public BookingModificationResponse() {}
    
    public BookingModificationResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public BookingModificationResponse(boolean success, String message, BookingResponse updatedBooking) {
        this.success = success;
        this.message = message;
        this.updatedBooking = updatedBooking;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public BookingResponse getUpdatedBooking() {
        return updatedBooking;
    }
    
    public void setUpdatedBooking(BookingResponse updatedBooking) {
        this.updatedBooking = updatedBooking;
    }
    
    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }
    
    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }
    
    public BigDecimal getRefundAmount() {
        return refundAmount;
    }
    
    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }
    
    public String getPaymentIntentId() {
        return paymentIntentId;
    }
    
    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
}
