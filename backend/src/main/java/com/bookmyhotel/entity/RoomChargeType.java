package com.bookmyhotel.entity;

/**
 * Room charge type enumeration
 */
public enum RoomChargeType {
    SHOP_PURCHASE("Shop Purchase"),
    MINIBAR("Minibar"),
    LAUNDRY("Laundry Service"),
    TELEPHONE("Telephone"),
    RESTAURANT("Restaurant"),
    SPA("Spa Services"),
    ROOM_SERVICE("Room Service"),
    INTERNET("Internet Access"),
    PARKING("Parking"),
    BUSINESS_CENTER("Business Center"),
    FITNESS_CENTER("Fitness Center"),
    CONFERENCE_ROOM("Conference Room"),
    EARLY_CHECKIN("Early Check-in"),
    LATE_CHECKOUT("Late Check-out"),
    DAMAGE("Damage Charge"),
    CLEANING("Additional Cleaning"),
    INCIDENTAL("Incidental Charge"),
    OTHER("Other");

    private final String displayName;

    RoomChargeType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
