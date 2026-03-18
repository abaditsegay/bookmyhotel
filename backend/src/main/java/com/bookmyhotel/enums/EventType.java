package com.bookmyhotel.enums;

/**
 * Event types for process monitoring and audit trails
 */
public enum EventType {
    // Guest Activity Events
    CHECK_IN("Guest Check-in"),
    CHECK_OUT("Guest Check-out"),
    EARLY_CHECK_IN("Early Check-in"),
    LATE_CHECK_OUT("Late Check-out"),
    NO_SHOW("Guest No-show"),
    CANCELLATION("Booking Cancellation"),

    // Room Assignment Events
    ROOM_ASSIGNED("Room Assigned"),
    ROOM_CHANGED("Room Changed"),
    ROOM_UPGRADE("Room Upgrade"),
    ROOM_DOWNGRADE("Room Downgrade"),

    // Payment Events
    PAYMENT_RECEIVED("Payment Received"),
    PAYMENT_FAILED("Payment Failed"),
    PAYMENT_REFUND("Payment Refund"),
    PAYMENT_PARTIAL("Partial Payment"),
    PAYMENT_OVERRIDE("Payment Override"),

    // Staff Activity Events
    STAFF_LOGIN("Staff Login"),
    STAFF_LOGOUT("Staff Logout"),
    STAFF_ACTION("Staff Action"),
    BOOKING_CREATED("Booking Created"),
    BOOKING_MODIFIED("Booking Modified"),
    BOOKING_CANCELLED("Booking Cancelled"),

    // System Events
    SYSTEM_ERROR("System Error"),
    SECURITY_ALERT("Security Alert"),
    DATA_EXPORT("Data Export"),
    REPORT_GENERATED("Report Generated"),

    // Exception Events
    MULTIPLE_NO_SHOWS("Multiple No-shows Pattern"),
    FREQUENT_CANCELLATIONS("Frequent Cancellations Pattern"),
    UNUSUAL_PAYMENT_PATTERN("Unusual Payment Pattern"),
    SUSPICIOUS_ACTIVITY("Suspicious Activity"),

    // Audit Events
    AUDIT_LOG_CREATED("Audit Log Created"),
    COMPLIANCE_REPORT("Compliance Report"),
    FINANCIAL_RECONCILIATION("Financial Reconciliation");

    private final String displayName;

    EventType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Check if this event type is considered an exception
     */
    public boolean isException() {
        return this == MULTIPLE_NO_SHOWS ||
                this == FREQUENT_CANCELLATIONS ||
                this == UNUSUAL_PAYMENT_PATTERN ||
                this == SUSPICIOUS_ACTIVITY ||
                this == SYSTEM_ERROR ||
                this == SECURITY_ALERT;
    }

    /**
     * Check if this event type is related to payments
     */
    public boolean isPaymentRelated() {
        return this == PAYMENT_RECEIVED ||
                this == PAYMENT_FAILED ||
                this == PAYMENT_REFUND ||
                this == PAYMENT_PARTIAL ||
                this == PAYMENT_OVERRIDE ||
                this == UNUSUAL_PAYMENT_PATTERN;
    }

    /**
     * Check if this event type is related to guest activities
     */
    public boolean isGuestActivity() {
        return this == CHECK_IN ||
                this == CHECK_OUT ||
                this == EARLY_CHECK_IN ||
                this == LATE_CHECK_OUT ||
                this == NO_SHOW ||
                this == CANCELLATION;
    }
}