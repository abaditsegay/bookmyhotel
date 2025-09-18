package com.bookmyhotel.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.bookmyhotel.service.RoomCacheService;

/**
 * Event listener for cache invalidation when reservations change
 */
@Component
public class CacheInvalidationEventListener {

    private static final Logger logger = LoggerFactory.getLogger(CacheInvalidationEventListener.class);

    @Autowired
    private RoomCacheService roomCacheService;

    /**
     * Handle reservation availability changes by invalidating relevant caches
     */
    @EventListener
    public void handleReservationAvailabilityChanged(ReservationAvailabilityChangedEvent event) {
        logger.info("Handling reservation availability change: {} for hotel: {}, reservation: {}",
                event.getOperation(), event.getHotelId(), event.getReservationId());

        try {
            // Invalidate availability-related caches
            roomCacheService.evictAvailabilityCaches();

            logger.debug("Successfully invalidated room availability caches for reservation change");
        } catch (Exception e) {
            logger.error("Failed to invalidate caches for reservation change: {}", e.getMessage(), e);
        }
    }
}
