package com.bookmyhotel.repository;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.RoomTypePricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for RoomTypePricing entity
 */
@Repository
public interface RoomTypePricingRepository extends JpaRepository<RoomTypePricing, Long> {

    /**
     * Find room type pricing by hotel and room type
     */
    Optional<RoomTypePricing> findByHotelAndRoomType(Hotel hotel, RoomType roomType);

    /**
     * Find all room type pricing for a hotel
     */
    List<RoomTypePricing> findByHotelAndIsActiveTrue(Hotel hotel);

    /**
     * Find all room type pricing for a hotel (including inactive)
     */
    List<RoomTypePricing> findByHotel(Hotel hotel);

    /**
     * Find room type pricing by hotel ID and room type
     */
    @Query("SELECT rtp FROM RoomTypePricing rtp WHERE rtp.hotel.id = :hotelId AND rtp.roomType = :roomType AND rtp.isActive = true")
    Optional<RoomTypePricing> findByHotelIdAndRoomType(@Param("hotelId") Long hotelId,
            @Param("roomType") RoomType roomType);

    /**
     * Find all active room type pricing for a hotel by hotel ID
     */
    @Query("SELECT rtp FROM RoomTypePricing rtp WHERE rtp.hotel.id = :hotelId AND rtp.isActive = true ORDER BY rtp.roomType")
    List<RoomTypePricing> findActiveByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Check if room type pricing exists for hotel and room type
     */
    boolean existsByHotelAndRoomType(Hotel hotel, RoomType roomType);
}
