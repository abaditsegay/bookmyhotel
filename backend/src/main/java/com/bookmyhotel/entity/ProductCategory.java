package com.bookmyhotel.entity;

/**
 * Product categories for hotel shop
 */
public enum ProductCategory {
    BEVERAGES("Beverages"),
    SNACKS("Snacks"),
    CULTURAL_CLOTHING("Cultural Clothing"),
    SOUVENIRS("Souvenirs"),
    TOILETRIES("Toiletries"),
    OTHER("Other");

    private final String displayName;

    ProductCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
