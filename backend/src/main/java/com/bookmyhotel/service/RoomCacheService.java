package com.bookmyhotel.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import com.bookmyhotel.config.CacheConfig;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.repository.RoomRepository;

/**
 * Service for room caching operations
 * Provides high-performance cached access to frequently queried room data
 */
@Service
public class RoomCacheService {

    private static final Logger logger = LoggerFactory.getLogger(RoomCacheService.class);

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Get available rooms with caching
     * Cache key includes all parameters to ensure proper cache segmentation
     */
    @Cacheable(value = CacheConfig.AVAILABLE_ROOMS_CACHE, key = "'hotel:' + #hotelId + ':checkin:' + #checkInDate + ':checkout:' + #checkOutDate + ':guests:' + #guests + ':type:' + (#roomType != null ? #roomType.name() : 'all')")
    public List<Room> findAvailableRooms(Long hotelId, LocalDate checkInDate, LocalDate checkOutDate,
            Integer guests, RoomType roomType) {
        logger.debug("Cache miss - fetching available rooms for hotel: {}, dates: {} to {}, guests: {}, type: {}",
                hotelId, checkInDate, checkOutDate, guests, roomType);
        return roomRepository.findAvailableRooms(hotelId, checkInDate, checkOutDate, guests, roomType);
    }

    /**
     * Get rooms by hotel with caching
     */
    @Cacheable(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId")
    public List<Room> findByHotelId(Long hotelId) {
        logger.debug("Cache miss - fetching all rooms for hotel: {}", hotelId);
        return roomRepository.findByHotelId(hotelId);
    }

    /**
     * Get rooms by hotel ordered by room number with caching
     */
    @Cacheable(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId + ':ordered'")
    public List<Room> findByHotelIdOrderByRoomNumber(Long hotelId) {
        logger.debug("Cache miss - fetching ordered rooms for hotel: {}", hotelId);
        return roomRepository.findByHotelIdOrderByRoomNumber(hotelId);
    }

    /**
     * Get distinct room types for a hotel with caching
     */
    @Cacheable(value = CacheConfig.ROOM_TYPES_CACHE, key = "'hotel:' + #hotelId + ':types'")
    public List<RoomType> findDistinctRoomTypesByHotel(Long hotelId) {
        logger.debug("Cache miss - fetching room types for hotel: {}", hotelId);
        return roomRepository.findDistinctRoomTypesByHotel(hotelId);
    }

    /**
     * Check room availability with caching
     */
    @Cacheable(value = CacheConfig.ROOM_AVAILABILITY_CACHE, key = "'room:' + #roomId + ':checkin:' + #checkInDate + ':checkout:' + #checkOutDate")
    public boolean isRoomAvailable(Long roomId, LocalDate checkInDate, LocalDate checkOutDate) {
        logger.debug("Cache miss - checking availability for room: {}, dates: {} to {}",
                roomId, checkInDate, checkOutDate);
        return roomRepository.isRoomAvailable(roomId, checkInDate, checkOutDate);
    }

    /**
     * Count available rooms by type with caching
     */
    @Cacheable(value = CacheConfig.ROOM_COUNTS_CACHE, key = "'hotel:' + #hotelId + ':type:' + #roomType.name() + ':count:' + #checkInDate + ':' + #checkOutDate + ':guests:' + #guests")
    public long countAvailableRoomsByType(Long hotelId, RoomType roomType, LocalDate checkInDate,
            LocalDate checkOutDate, Integer guests) {
        logger.debug("Cache miss - counting available rooms for hotel: {}, type: {}, dates: {} to {}, guests: {}",
                hotelId, roomType, checkInDate, checkOutDate, guests);
        return roomRepository.countAvailableRoomsByType(hotelId, roomType, checkInDate, checkOutDate, guests);
    }

    /**
     * Get first available room of type with caching
     */
    @Cacheable(value = CacheConfig.AVAILABLE_ROOMS_CACHE, key = "'hotel:' + #hotelId + ':first:' + #roomType.name() + ':' + #checkInDate + ':' + #checkOutDate")
    public Optional<Room> findFirstAvailableRoomOfType(Long hotelId, RoomType roomType,
            LocalDate checkInDate, LocalDate checkOutDate) {
        logger.debug("Cache miss - finding first available room for hotel: {}, type: {}, dates: {} to {}",
                hotelId, roomType, checkInDate, checkOutDate);
        return roomRepository.findFirstAvailableRoomOfType(hotelId, roomType, checkInDate, checkOutDate);
    }

    /**
     * Check if hotel has available rooms of type with caching
     */
    @Cacheable(value = CacheConfig.ROOM_AVAILABILITY_CACHE, key = "'hotel:' + #hotelId + ':has:' + #roomType.name() + ':' + #checkInDate + ':' + #checkOutDate")
    public boolean hasAvailableRoomsOfType(Long hotelId, RoomType roomType,
            LocalDate checkInDate, LocalDate checkOutDate) {
        logger.debug("Cache miss - checking if hotel {} has available {} rooms for dates: {} to {}",
                hotelId, roomType, checkInDate, checkOutDate);
        return roomRepository.hasAvailableRoomsOfType(hotelId, roomType, checkInDate, checkOutDate);
    }

    /**
     * Get available rooms by hotel and status with caching
     */
    @Cacheable(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId + ':available:' + #status.name()")
    public List<Room> findByHotelIdAndIsAvailableTrueAndStatus(Long hotelId, RoomStatus status) {
        logger.debug("Cache miss - fetching available rooms for hotel: {}, status: {}", hotelId, status);
        return roomRepository.findByHotelIdAndIsAvailableTrueAndStatus(hotelId, status);
    }

    /**
     * Get available rooms by hotel with caching
     */
    @Cacheable(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId + ':available'")
    public List<Room> findByHotelIdAndIsAvailableTrue(Long hotelId) {
        logger.debug("Cache miss - fetching available rooms for hotel: {}", hotelId);
        return roomRepository.findByHotelIdAndIsAvailableTrue(hotelId);
    }

    // Cache Invalidation Methods

    /**
     * Invalidate all caches for a specific hotel
     * Called when hotel rooms are modified
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId"),
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId + ':ordered'"),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, key = "'hotel:' + #hotelId + ':types'"),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_COUNTS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true)
    })
    public void evictHotelRoomCaches(Long hotelId) {
        logger.info("Evicted all room caches for hotel: {}", hotelId);
    }

    /**
     * Invalidate caches for a specific room
     * Called when a room is updated or its availability changes
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_COUNTS_CACHE, allEntries = true)
    })
    public void evictRoomSpecificCaches(Long roomId, Long hotelId) {
        logger.info("Evicted room-specific caches for room: {} in hotel: {}", roomId, hotelId);
        // Also evict hotel-specific caches
        evictHotelStaticCaches(hotelId);
    }

    /**
     * Invalidate static hotel caches (room types, hotel rooms)
     * Called when rooms are added, removed, or their static properties change
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId"),
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'hotel:' + #hotelId + ':ordered'"),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, key = "'hotel:' + #hotelId + ':types'")
    })
    public void evictHotelStaticCaches(Long hotelId) {
        logger.info("Evicted static caches for hotel: {}", hotelId);
    }

    /**
     * Invalidate availability caches when reservations change
     * Called when new reservations are made, cancelled, or modified
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_COUNTS_CACHE, allEntries = true)
    })
    public void evictAvailabilityCaches() {
        logger.info("Evicted all availability caches due to reservation changes");
    }

    /**
     * Clear all room-related caches
     * For administrative use or when major changes occur
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_COUNTS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_PRICING_CACHE, allEntries = true)
    })
    public void clearAllRoomCaches() {
        logger.warn("Cleared all room caches - this should be used sparingly");
    }
}
