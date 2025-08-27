package com.bookmyhotel.entity;

/**
 * Enum for payment methods supported by the hotel shop system
 */
public enum PaymentMethod {
    CREDIT_CARD("Credit Card"),
    MOBILE_MONEY("Mobile Money"), 
    PAY_AT_FRONT_DESK("Pay at Front Desk"),
    MBIRR("M-Birr"),
    TELEBIRR("Telebirr"),
    CASH("Cash");
    
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
            return null;
        }
        
        return switch (paymentMethodId.toLowerCase()) {
            case "pay_at_frontdesk" -> PAY_AT_FRONT_DESK;
            case "mbirr" -> MBIRR;
            case "telebirr" -> TELEBIRR;
            case "cash" -> CASH;
            case "mobile_money" -> MOBILE_MONEY;
            default -> CREDIT_CARD; // Default to credit card for other payment methods
        };
    }
    
    /**
     * Convert to string payment method ID for booking system compatibility
     */
    public String toStringId() {
        return switch (this) {
            case PAY_AT_FRONT_DESK -> "pay_at_frontdesk";
            case MBIRR -> "mbirr";
            case TELEBIRR -> "telebirr";
            case CASH -> "cash";
            case MOBILE_MONEY -> "mobile_money";
            case CREDIT_CARD -> "credit_card";
        };
    }
}
