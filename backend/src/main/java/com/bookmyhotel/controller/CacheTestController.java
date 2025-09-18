package com.bookmyhotel.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.service.RoomCacheService;

/**
 * Controller for testing cache functionality
 * Provides endpoints to test cache hits/misses and cache operations
 */
@RestController
@RequestMapping("/api/cache-test")
public class CacheTestController {

    private static final Logger logger = LoggerFactory.getLogger(CacheTestController.class);

    @Autowired
    private RoomCacheService roomCacheService;

    @Autowired
    private CacheManager cacheManager;

    /**
     * Test cache functionality by fetching rooms multiple times
     * First call should be a cache miss, subsequent calls should be cache hits
     */
    @GetMapping("/rooms/{hotelId}")
    public ResponseEntity<Map<String, Object>> testRoomCaching(
            @PathVariable Long hotelId,
            @RequestParam(required = false) String checkInDate,
            @RequestParam(required = false) String checkOutDate,
            @RequestParam(required = false, defaultValue = "2") Integer guests,
            @RequestParam(required = false) RoomType roomType) {

        logger.info("Testing cache for hotel: {}, checkIn: {}, checkOut: {}, guests: {}, roomType: {}",
                hotelId, checkInDate, checkOutDate, guests, roomType);

        Map<String, Object> response = new HashMap<>();

        try {
            // Record start time for first call
            long startTime1 = System.currentTimeMillis();
            List<Room> rooms1;

            if (checkInDate != null && checkOutDate != null) {
                LocalDate checkIn = LocalDate.parse(checkInDate);
                LocalDate checkOut = LocalDate.parse(checkOutDate);
                rooms1 = roomCacheService.findAvailableRooms(hotelId, checkIn, checkOut, guests, roomType);
            } else {
                rooms1 = roomCacheService.findByHotelId(hotelId);
            }

            long duration1 = System.currentTimeMillis() - startTime1;

            // Second call - should be cached
            long startTime2 = System.currentTimeMillis();
            List<Room> rooms2;

            if (checkInDate != null && checkOutDate != null) {
                LocalDate checkIn = LocalDate.parse(checkInDate);
                LocalDate checkOut = LocalDate.parse(checkOutDate);
                rooms2 = roomCacheService.findAvailableRooms(hotelId, checkIn, checkOut, guests, roomType);
            } else {
                rooms2 = roomCacheService.findByHotelId(hotelId);
            }

            long duration2 = System.currentTimeMillis() - startTime2;

            // Third call - should also be cached
            long startTime3 = System.currentTimeMillis();
            List<Room> rooms3;

            if (checkInDate != null && checkOutDate != null) {
                LocalDate checkIn = LocalDate.parse(checkInDate);
                LocalDate checkOut = LocalDate.parse(checkOutDate);
                rooms3 = roomCacheService.findAvailableRooms(hotelId, checkIn, checkOut, guests, roomType);
            } else {
                rooms3 = roomCacheService.findByHotelId(hotelId);
            }

            long duration3 = System.currentTimeMillis() - startTime3;

            response.put("success", true);
            response.put("roomCount", rooms1.size());
            response.put("firstCallDuration", duration1 + "ms");
            response.put("secondCallDuration", duration2 + "ms");
            response.put("thirdCallDuration", duration3 + "ms");
            response.put("cacheWorking", duration2 < duration1 && duration3 < duration1);
            response.put("averageCachedCallDuration", ((duration2 + duration3) / 2) + "ms");

            // Performance improvement calculation
            if (duration1 > 0) {
                double improvement = ((double) (duration1 - ((duration2 + duration3) / 2)) / duration1) * 100;
                response.put("performanceImprovement", String.format("%.1f%%", improvement));
            }

            logger.info("Cache test results - First call: {}ms, Second call: {}ms, Third call: {}ms",
                    duration1, duration2, duration3);

        } catch (Exception e) {
            logger.error("Error testing cache: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Test room types caching
     */
    @GetMapping("/room-types/{hotelId}")
    public ResponseEntity<Map<String, Object>> testRoomTypesCaching(@PathVariable Long hotelId) {

        logger.info("Testing room types cache for hotel: {}", hotelId);

        Map<String, Object> response = new HashMap<>();

        try {
            // First call
            long startTime1 = System.currentTimeMillis();
            List<RoomType> types1 = roomCacheService.findDistinctRoomTypesByHotel(hotelId);
            long duration1 = System.currentTimeMillis() - startTime1;

            // Second call - should be cached
            long startTime2 = System.currentTimeMillis();
            List<RoomType> types2 = roomCacheService.findDistinctRoomTypesByHotel(hotelId);
            long duration2 = System.currentTimeMillis() - startTime2;

            response.put("success", true);
            response.put("roomTypesCount", types1.size());
            response.put("roomTypes", types1);
            response.put("firstCallDuration", duration1 + "ms");
            response.put("secondCallDuration", duration2 + "ms");
            response.put("cacheWorking", duration2 < duration1);

            logger.info("Room types cache test - First call: {}ms, Second call: {}ms", duration1, duration2);

        } catch (Exception e) {
            logger.error("Error testing room types cache: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get cache statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("success", true);
            response.put("cacheManagerType", cacheManager.getClass().getSimpleName());

            // Get cache names
            response.put("cacheNames", cacheManager.getCacheNames());

            // Get cache details
            Map<String, Object> cacheDetails = new HashMap<>();
            for (String cacheName : cacheManager.getCacheNames()) {
                org.springframework.cache.Cache cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    Map<String, Object> cacheInfo = new HashMap<>();
                    cacheInfo.put("cacheType", cache.getClass().getSimpleName());
                    cacheInfo.put("nativeCache", cache.getNativeCache().getClass().getSimpleName());
                    cacheDetails.put(cacheName, cacheInfo);
                }
            }
            response.put("cacheDetails", cacheDetails);

        } catch (Exception e) {
            logger.error("Error getting cache stats: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Clear specific cache
     */
    @PostMapping("/clear/{cacheName}")
    public ResponseEntity<Map<String, Object>> clearCache(@PathVariable String cacheName) {
        Map<String, Object> response = new HashMap<>();

        try {
            org.springframework.cache.Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                response.put("success", true);
                response.put("message", "Cache '" + cacheName + "' cleared successfully");
                logger.info("Cleared cache: {}", cacheName);
            } else {
                response.put("success", false);
                response.put("message", "Cache '" + cacheName + "' not found");
            }
        } catch (Exception e) {
            logger.error("Error clearing cache: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Clear all caches
     */
    @PostMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllCaches() {
        Map<String, Object> response = new HashMap<>();

        try {
            roomCacheService.clearAllRoomCaches();
            response.put("success", true);
            response.put("message", "All room caches cleared successfully");
            logger.info("Cleared all room caches");
        } catch (Exception e) {
            logger.error("Error clearing all caches: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Test cache eviction for a hotel
     */
    @PostMapping("/evict-hotel/{hotelId}")
    public ResponseEntity<Map<String, Object>> evictHotelCache(@PathVariable Long hotelId) {
        Map<String, Object> response = new HashMap<>();

        try {
            roomCacheService.evictHotelRoomCaches(hotelId);
            response.put("success", true);
            response.put("message", "Hotel " + hotelId + " caches evicted successfully");
            logger.info("Evicted caches for hotel: {}", hotelId);
        } catch (Exception e) {
            logger.error("Error evicting hotel cache: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }
}
