package com.bookmyhotel.dto.payment;

public class TelebirrPaymentResponse {
    private String paymentId;
    private String status;
    private String message;
    private String transactionId;
    private String paymentUrl;
    private String sessionId;
    private String qrCode;
    
    public TelebirrPaymentResponse() {}
    
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private TelebirrPaymentResponse response = new TelebirrPaymentResponse();
        
        public Builder paymentId(String paymentId) {
            response.paymentId = paymentId;
            return this;
        }
        
        public Builder status(String status) {
            response.status = status;
            return this;
        }
        
        public Builder message(String message) {
            response.message = message;
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
        
        public Builder sessionId(String sessionId) {
            response.sessionId = sessionId;
            return this;
        }
        
        public Builder qrCode(String qrCode) {
            response.qrCode = qrCode;
            return this;
        }
        
        public TelebirrPaymentResponse build() {
            return response;
        }
    }
    
    // Getters and setters
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
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
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getQrCode() {
        return qrCode;
    }
    
    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }
}
