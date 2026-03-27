package com.bookmyhotel.dto.payment;

import jakarta.validation.constraints.NotBlank;

/**
 * Generic callback request payload for Ethiopian payment providers.
 */
public class PaymentCallbackRequest {

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    @NotBlank(message = "Payment status is required")
    private String status;

    private String providerTransactionId;
    private String eventId;
    private String nonce;
    private Long callbackTimestamp;
    private String rawPayload;

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProviderTransactionId() {
        return providerTransactionId;
    }

    public void setProviderTransactionId(String providerTransactionId) {
        this.providerTransactionId = providerTransactionId;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getNonce() {
        return nonce;
    }

    public void setNonce(String nonce) {
        this.nonce = nonce;
    }

    public Long getCallbackTimestamp() {
        return callbackTimestamp;
    }

    public void setCallbackTimestamp(Long callbackTimestamp) {
        this.callbackTimestamp = callbackTimestamp;
    }

    public String getRawPayload() {
        return rawPayload;
    }

    public void setRawPayload(String rawPayload) {
        this.rawPayload = rawPayload;
    }
}