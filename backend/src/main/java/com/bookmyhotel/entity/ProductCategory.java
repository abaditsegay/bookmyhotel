package com.bookmyhotel.entity;

/**
 * Product categories for hotel shop
 */
public enum ProductCategory {
    DRINKS("Drinks"),
    SNACKS("Snacks"),
    CULTURAL_CLOTHES("Cultural Clothes"),
    SOUVENIRS("Souvenirs"),
    PERSONAL_CARE("Personal Care"),
    OTHER("Other");
    
    private final String displayName;
    
    ProductCategory(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
