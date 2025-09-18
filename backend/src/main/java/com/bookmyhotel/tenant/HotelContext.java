package com.bookmyhotel.tenant;

/**
 * Hotel context for managing hotel-scoped operations
 * This complements TenantContext for hotel-level operations
 */
public class HotelContext {

    private static final ThreadLocal<Long> hotelIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> hotelNameHolder = new ThreadLocal<>();

    /**
     * Set hotel ID for current thread
     */
    public static void setHotelId(Long hotelId) {
        hotelIdHolder.set(hotelId);
    }

    /**
     * Get hotel ID for current thread
     */
    public static Long getHotelId() {
        return hotelIdHolder.get();
    }

    /**
     * Set hotel name for current thread
     */
    public static void setHotelName(String hotelName) {
        hotelNameHolder.set(hotelName);
    }

    /**
     * Get hotel name for current thread
     */
    public static String getHotelName() {
        return hotelNameHolder.get();
    }

    /**
     * Clear hotel context
     */
    public static void clear() {
        hotelIdHolder.remove();
        hotelNameHolder.remove();
    }

    /**
     * Check if hotel context is set
     */
    public static boolean hasHotelContext() {
        return hotelIdHolder.get() != null;
    }
}
