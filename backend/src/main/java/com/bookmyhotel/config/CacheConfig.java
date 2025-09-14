package com.bookmyhotel.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring cache configuration for room caching
 * Provides in-memory caching for frequently accessed room data
 */
@Configuration
@EnableCaching
public class CacheConfig {

    // Cache names for different types of room data
    public static final String AVAILABLE_ROOMS_CACHE = "availableRooms";
    public static final String ROOMS_BY_HOTEL_CACHE = "roomsByHotel";
    public static final String ROOM_TYPES_CACHE = "roomTypes";
    public static final String ROOM_AVAILABILITY_CACHE = "roomAvailability";
    public static final String ROOM_COUNTS_CACHE = "roomCounts";
    public static final String ROOM_PRICING_CACHE = "roomPricing";

    /**
     * Simple in-memory cache manager using ConcurrentHashMap
     * Suitable for single-instance applications
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();

        // Pre-define cache names for better performance
        cacheManager.setCacheNames(java.util.Arrays.asList(
                AVAILABLE_ROOMS_CACHE,
                ROOMS_BY_HOTEL_CACHE,
                ROOM_TYPES_CACHE,
                ROOM_AVAILABILITY_CACHE,
                ROOM_COUNTS_CACHE,
                ROOM_PRICING_CACHE));

        // Don't cache null values
        cacheManager.setAllowNullValues(false);

        return cacheManager;
    }
}
