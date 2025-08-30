package com.bookmyhotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Response DTO for checkout operations that includes both booking data and
 * receipt
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CheckoutResponse {

    private BookingResponse booking;
    private ConsolidatedReceiptResponse receipt;
    private boolean receiptGenerated;
    private String message;

    public CheckoutResponse() {
    }

    public CheckoutResponse(BookingResponse booking) {
        this.booking = booking;
        this.receiptGenerated = false;
    }

    public CheckoutResponse(BookingResponse booking, ConsolidatedReceiptResponse receipt) {
        this.booking = booking;
        this.receipt = receipt;
        this.receiptGenerated = true;
    }

    public CheckoutResponse(BookingResponse booking, ConsolidatedReceiptResponse receipt, String message) {
        this.booking = booking;
        this.receipt = receipt;
        this.receiptGenerated = true;
        this.message = message;
    }

    // Getters and setters
    public BookingResponse getBooking() {
        return booking;
    }

    public void setBooking(BookingResponse booking) {
        this.booking = booking;
    }

    public ConsolidatedReceiptResponse getReceipt() {
        return receipt;
    }

    public void setReceipt(ConsolidatedReceiptResponse receipt) {
        this.receipt = receipt;
        this.receiptGenerated = receipt != null;
    }

    public boolean isReceiptGenerated() {
        return receiptGenerated;
    }

    public void setReceiptGenerated(boolean receiptGenerated) {
        this.receiptGenerated = receiptGenerated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
