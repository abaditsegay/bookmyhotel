package com.bookmyhotel.dto.payment;

import java.math.BigDecimal;

public class MobirrPaymentResponse {
    private boolean success;
    private String transactionId;
    private String paymentUrl;
    private String qrCode;
    private String expiresAt;
    private String instructions;
    private String errorMessage;
    private BigDecimal amount;
    private String customerPhone;
    private String status;
    
    public MobirrPaymentResponse() {}
    
    public MobirrPaymentResponse(boolean success, String transactionId) {
        this.success = success;
        this.transactionId = transactionId;
    }
    
    public static MobirrPaymentResponse success(String transactionId, String paymentUrl, String qrCode) {
        MobirrPaymentResponse response = new MobirrPaymentResponse(true, transactionId);
        response.setPaymentUrl(paymentUrl);
        response.setQrCode(qrCode);
        return response;
    }
    
    public static MobirrPaymentResponse failure(String errorMessage) {
        MobirrPaymentResponse response = new MobirrPaymentResponse(false, null);
        response.setErrorMessage(errorMessage);
        return response;
    }
    
    // Getters and setters
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
    
    public String getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(String expiresAt) {
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
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getCustomerPhone() {
        return customerPhone;
    }
    
    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
