package com.bookmyhotel.entity;

/**
 * Comprehensive payment methods for hotel shop system
 * Includes all payment methods from the main booking system
 */
public enum PaymentMethod {
    ROOM_CHARGE("Room Charge"),
    CASH("Cash"),
    CARD("Card"),
    MOBILE("Mobile Payment"),
    CREDIT_CARD("Credit Card"),
    MOBILE_MONEY("Mobile Money"),
    PAY_AT_FRONTDESK("Pay at Front Desk");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Convert from string payment method ID used in booking system
     */
    public static PaymentMethod fromString(String paymentMethodId) {
        if (paymentMethodId == null) {
            return CASH; // Default to cash
        }

        return switch (paymentMethodId.toLowerCase()) {
            case "room_charge" -> ROOM_CHARGE;
            case "cash" -> CASH;
            case "card", "card_payment" -> CARD;
            case "mobile", "mbirr", "telebirr" -> MOBILE;
            case "credit_card" -> CREDIT_CARD;
            case "mobile_money" -> MOBILE_MONEY;
            case "pay_at_frontdesk" -> PAY_AT_FRONTDESK;
            default -> CASH; // Default to cash
        };
    }

    /**
     * Convert to string payment method ID for booking system compatibility
     */
    public String toStringId() {
        return switch (this) {
            case ROOM_CHARGE -> "room_charge";
            case CASH -> "cash";
            case CARD -> "card";
            case MOBILE -> "mobile";
            case CREDIT_CARD -> "credit_card";
            case MOBILE_MONEY -> "mobile_money";
            case PAY_AT_FRONTDESK -> "pay_at_frontdesk";
        };
    }
}
