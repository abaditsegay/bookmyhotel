package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.HotelSearchRequest;
import com.bookmyhotel.dto.HotelSearchResult;
import com.bookmyhotel.dto.RoomTypeAvailabilityDto;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;

/**
 * Hotel search service
 */
@Service
@Transactional(readOnly = true)
public class HotelSearchService {
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    /**
     * Search hotels based on criteria
     */
    public List<HotelSearchResult> searchHotels(HotelSearchRequest request) {
        // Convert roomType string to enum if provided
        RoomType roomTypeEnum = null;
        if (request.getRoomType() != null && !request.getRoomType().trim().isEmpty()) {
            try {
                roomTypeEnum = RoomType.valueOf(request.getRoomType().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid room type provided, ignore filter
                roomTypeEnum = null;
            }
        }
        
        // Find hotels with available rooms
        List<Hotel> hotels = hotelRepository.findAvailableHotels(
            request.getLocation(),
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getGuests(),
            roomTypeEnum,
            request.getMinPrice(),
            request.getMaxPrice()
        );
        
        // Convert to DTOs with available rooms
        return hotels.stream()
            .map(hotel -> convertToSearchResult(hotel, request))
            .collect(Collectors.toList());
    }
    
    /**
     * Get hotel details by ID
     */
    public HotelSearchResult getHotelDetails(Long hotelId, HotelSearchRequest request) {
        Hotel hotel = hotelRepository.findByIdAndIsActiveTrue(hotelId)
            .orElseThrow(() -> new RuntimeException("Hotel not found or not available"));
        
        return convertToSearchResult(hotel, request);
    }
    
    /**
     * Get available rooms for a hotel
     */
    public List<HotelSearchResult.AvailableRoomDto> getAvailableRooms(
            Long hotelId, HotelSearchRequest request) {
        
        // Convert roomType string to enum if provided
        RoomType roomTypeEnum = null;
        if (request.getRoomType() != null && !request.getRoomType().trim().isEmpty()) {
            try {
                roomTypeEnum = RoomType.valueOf(request.getRoomType().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid room type provided, ignore filter
                roomTypeEnum = null;
            }
        }
        
        List<Room> availableRooms = roomRepository.findAvailableRooms(
            hotelId,
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getGuests(),
            roomTypeEnum
        );
        
        return availableRooms.stream()
            .filter(room -> isRoomInPriceRange(room, request))
            .map(this::convertToAvailableRoomDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get room type availability for a hotel (new approach)
     */
    public List<RoomTypeAvailabilityDto> getRoomTypeAvailability(
            Long hotelId, HotelSearchRequest request) {
        
        // Get distinct room types for the hotel
        List<RoomType> roomTypes = roomRepository.findDistinctRoomTypesByHotel(hotelId);
        
        return roomTypes.stream()
            .map(roomType -> createRoomTypeAvailability(hotelId, roomType, request))
            .filter(availability -> availability.getTotalCount() > 0)
            .filter(availability -> isRoomTypeInPriceRange(availability, request))
            .collect(Collectors.toList());
    }
    
    /**
     * Create room type availability DTO
     */
    private RoomTypeAvailabilityDto createRoomTypeAvailability(
            Long hotelId, RoomType roomType, HotelSearchRequest request) {
        
        long availableCount = roomRepository.countAvailableRoomsByType(
            hotelId,
            roomType,
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getGuests()
        );
        
        long totalCount = roomRepository.countTotalRoomsByType(hotelId, roomType);
        
        // Get a sample room for pricing and details
        Room sampleRoom = roomRepository.findAvailableRooms(
            hotelId,
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getGuests(),
            roomType
        ).stream()
            .filter(room -> room.getRoomType() == roomType)
            .findFirst()
            .orElse(null);
        
        if (sampleRoom == null) {
            // Get any room of this type for pricing info
            sampleRoom = roomRepository.findByHotelIdAndRoomType(hotelId, roomType)
                .stream()
                .findFirst()
                .orElse(null);
        }
        
        RoomTypeAvailabilityDto dto = new RoomTypeAvailabilityDto(
            roomType,
            (int) availableCount,
            (int) totalCount,
            sampleRoom != null ? sampleRoom.getPricePerNight() : BigDecimal.ZERO,
            sampleRoom != null ? sampleRoom.getCapacity() : 1
        );
        
        // Set description separately
        if (sampleRoom != null) {
            dto.setDescription(sampleRoom.getDescription());
        }
        
        return dto;
    }
    
    /**
     * Convert Hotel entity to HotelSearchResult DTO
     */
    private HotelSearchResult convertToSearchResult(Hotel hotel, HotelSearchRequest request) {
        HotelSearchResult result = new HotelSearchResult();
        result.setId(hotel.getId());
        result.setName(hotel.getName());
        result.setDescription(hotel.getDescription());
        result.setAddress(hotel.getAddress());
        result.setCity(hotel.getCity());
        result.setCountry(hotel.getCountry());
        result.setPhone(hotel.getPhone());
        result.setEmail(hotel.getEmail());
        
        // Get room type availability instead of individual rooms
        List<RoomTypeAvailabilityDto> roomTypeAvailability = getRoomTypeAvailability(hotel.getId(), request);
        result.setRoomTypeAvailability(roomTypeAvailability);
        
        // Calculate price range from room types
        if (!roomTypeAvailability.isEmpty()) {
            BigDecimal minPrice = roomTypeAvailability.stream()
                .map(RoomTypeAvailabilityDto::getPricePerNight)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
                
            BigDecimal maxPrice = roomTypeAvailability.stream()
                .map(RoomTypeAvailabilityDto::getPricePerNight)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
                
            result.setMinPrice(minPrice);
            result.setMaxPrice(maxPrice);
        }
        
        return result;
    }
    
    /**
     * Convert Room entity to AvailableRoomDto
     */
    private HotelSearchResult.AvailableRoomDto convertToAvailableRoomDto(Room room) {
        HotelSearchResult.AvailableRoomDto dto = new HotelSearchResult.AvailableRoomDto();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType().name());
        dto.setPricePerNight(room.getPricePerNight());
        dto.setCapacity(room.getCapacity());
        dto.setDescription(room.getDescription());
        return dto;
    }
    
    /**
     * Check if room is within price range
     */
    private boolean isRoomInPriceRange(Room room, HotelSearchRequest request) {
        BigDecimal price = room.getPricePerNight();
        
        if (request.getMinPrice() != null && price.compareTo(BigDecimal.valueOf(request.getMinPrice())) < 0) {
            return false;
        }
        
        if (request.getMaxPrice() != null && price.compareTo(BigDecimal.valueOf(request.getMaxPrice())) > 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if room type is within price range
     */
    private boolean isRoomTypeInPriceRange(RoomTypeAvailabilityDto availability, HotelSearchRequest request) {
        BigDecimal price = availability.getPricePerNight();
        
        if (request.getMinPrice() != null && price.compareTo(BigDecimal.valueOf(request.getMinPrice())) < 0) {
            return false;
        }
        
        if (request.getMaxPrice() != null && price.compareTo(BigDecimal.valueOf(request.getMaxPrice())) > 0) {
            return false;
        }
        
        return true;
    }
}
