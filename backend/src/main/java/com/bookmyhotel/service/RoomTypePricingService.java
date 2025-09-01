package com.bookmyhotel.service;

import com.bookmyhotel.dto.RoomTypePricingDTO;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.RoomTypePricing;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomTypePricingRepository;
import com.bookmyhotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing room type pricing
 */
@Service
@Transactional
public class RoomTypePricingService {

    @Autowired
    private RoomTypePricingRepository roomTypePricingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Get all room type pricing for a hotel admin's hotel
     */
    public List<RoomTypePricingDTO> getRoomTypePricing(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        List<RoomTypePricing> pricingList = roomTypePricingRepository.findByHotel(hotel);
        return pricingList.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create or update room type pricing
     */
    public RoomTypePricingDTO saveRoomTypePricing(RoomTypePricingDTO dto, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        // Check if pricing already exists for this room type
        RoomTypePricing pricing = roomTypePricingRepository
                .findByHotelAndRoomType(hotel, dto.getRoomType())
                .orElse(new RoomTypePricing());

        // Update or set new values
        pricing.setHotel(hotel);
        pricing.setRoomType(dto.getRoomType());
        pricing.setBasePricePerNight(dto.getBasePricePerNight());
        pricing.setWeekendPrice(dto.getWeekendPrice());
        pricing.setHolidayPrice(dto.getHolidayPrice());
        pricing.setPeakSeasonPrice(dto.getPeakSeasonPrice());
        pricing.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        pricing.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "USD");
        pricing.setDescription(dto.getDescription());

        if (pricing.getId() == null) {
            pricing.setCreatedAt(LocalDateTime.now());
        }
        pricing.setUpdatedAt(LocalDateTime.now());

        RoomTypePricing saved = roomTypePricingRepository.save(pricing);
        return convertToDTO(saved);
    }

    /**
     * Delete room type pricing
     */
    public void deleteRoomTypePricing(Long pricingId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        RoomTypePricing pricing = roomTypePricingRepository.findById(pricingId)
                .orElseThrow(() -> new RuntimeException("Room type pricing not found"));

        // Verify the pricing belongs to the admin's hotel
        if (!pricing.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room type pricing does not belong to your hotel");
        }

        roomTypePricingRepository.delete(pricing);
    }

    /**
     * Get room type pricing by room type for a hotel
     */
    public RoomTypePricingDTO getRoomTypePricing(String adminEmail, RoomType roomType) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        return roomTypePricingRepository.findByHotelAndRoomType(hotel, roomType)
                .map(this::convertToDTO)
                .orElse(null);
    }

    /**
     * Initialize default pricing for all room types
     */
    public void initializeDefaultPricing(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        // Default pricing for different room types
        BigDecimal[] defaultPrices = {
                BigDecimal.valueOf(100), // SINGLE
                BigDecimal.valueOf(150), // DOUBLE
                BigDecimal.valueOf(300), // SUITE
                BigDecimal.valueOf(200), // DELUXE
                BigDecimal.valueOf(500) // PRESIDENTIAL
        };

        RoomType[] roomTypes = RoomType.values();

        for (int i = 0; i < roomTypes.length; i++) {
            RoomType roomType = roomTypes[i];

            // Only create if doesn't exist
            if (!roomTypePricingRepository.existsByHotelAndRoomType(hotel, roomType)) {
                RoomTypePricing pricing = new RoomTypePricing(hotel, roomType, defaultPrices[i]);
                pricing.setDescription("Default pricing for " + roomType.name().toLowerCase() + " rooms");
                roomTypePricingRepository.save(pricing);
            }
        }
    }

    /**
     * Get base price for a room type (used when creating new rooms)
     */
    public BigDecimal getBasePriceForRoomType(Long hotelId, RoomType roomType) {
        return roomTypePricingRepository.findByHotelIdAndRoomType(hotelId, roomType)
                .map(RoomTypePricing::getBasePricePerNight)
                .orElse(BigDecimal.valueOf(100)); // Default fallback price
    }

    /**
     * Get RoomTypePricing entity by hotel ID and room type
     */
    public RoomTypePricing getRoomTypePricing(Long hotelId, RoomType roomType) {
        return roomTypePricingRepository.findByHotelIdAndRoomType(hotelId, roomType)
                .orElse(null);
    }

    /**
     * Convert entity to DTO
     */
    private RoomTypePricingDTO convertToDTO(RoomTypePricing pricing) {
        RoomTypePricingDTO dto = new RoomTypePricingDTO();
        dto.setId(pricing.getId());
        dto.setRoomType(pricing.getRoomType());
        dto.setBasePricePerNight(pricing.getBasePricePerNight());
        dto.setWeekendPrice(pricing.getWeekendPrice());
        dto.setHolidayPrice(pricing.getHolidayPrice());
        dto.setPeakSeasonPrice(pricing.getPeakSeasonPrice());
        dto.setIsActive(pricing.getIsActive());
        dto.setCurrency(pricing.getCurrency());
        dto.setDescription(pricing.getDescription());
        dto.setCreatedAt(pricing.getCreatedAt());
        dto.setUpdatedAt(pricing.getUpdatedAt());
        return dto;
    }

    /**
     * Get user by email
     */
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
