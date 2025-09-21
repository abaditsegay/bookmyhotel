package com.bookmyhotel.enums;

/**
 * Enum representing different categories of hotel and room type images
 * Used to organize images in the storage system and UI display
 */
public enum ImageCategory {
    /**
     * Main hero image for the hotel (displayed prominently on hotel pages)
     */
    HOTEL_HERO("hotel_hero", "Hotel Hero Image"),

    /**
     * Gallery images for the hotel (additional photos showcasing hotel facilities)
     */
    HOTEL_GALLERY("hotel_gallery", "Hotel Gallery Image"),

    /**
     * Main hero image for a specific room type
     */
    ROOM_TYPE_HERO("room_type_hero", "Room Type Hero Image"),

    /**
     * Gallery images for a specific room type
     */
    ROOM_TYPE_GALLERY("room_type_gallery", "Room Type Gallery Image");

    private final String code;
    private final String displayName;

    ImageCategory(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Check if this category is for hotel images
     */
    public boolean isHotelImage() {
        return this == HOTEL_HERO || this == HOTEL_GALLERY;
    }

    /**
     * Check if this category is for room type images
     */
    public boolean isRoomTypeImage() {
        return this == ROOM_TYPE_HERO || this == ROOM_TYPE_GALLERY;
    }

    /**
     * Check if this category is for hero images
     */
    public boolean isHeroImage() {
        return this == HOTEL_HERO || this == ROOM_TYPE_HERO;
    }

    /**
     * Check if this category is for gallery images
     */
    public boolean isGalleryImage() {
        return this == HOTEL_GALLERY || this == ROOM_TYPE_GALLERY;
    }

    /**
     * Get enum from code string
     */
    public static ImageCategory fromCode(String code) {
        for (ImageCategory category : values()) {
            if (category.code.equals(code)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown image category code: " + code);
    }
}