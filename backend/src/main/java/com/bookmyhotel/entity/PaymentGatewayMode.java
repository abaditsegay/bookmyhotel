package com.bookmyhotel.entity;

public enum PaymentGatewayMode {
    MOCK,
    REAL;

    public static PaymentGatewayMode fromValue(String value) {
        if (value == null || value.isBlank()) {
            return MOCK;
        }

        return PaymentGatewayMode.valueOf(value.trim().toUpperCase());
    }

    public String toApiValue() {
        return name().toLowerCase();
    }
}