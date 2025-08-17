package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.HotelSearchRequest;
import com.bookmyhotel.dto.HotelSearchResult;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
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
        // Find hotels with available rooms
        List<Hotel> hotels = hotelRepository.findAvailableHotels(
            request.getLocation(),
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getGuests(),
            request.getRoomType(),
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
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + hotelId));
        
        return convertToSearchResult(hotel, request);
    }
    
    /**
     * Get available rooms for a hotel
     */
    public List<HotelSearchResult.AvailableRoomDto> getAvailableRooms(
            Long hotelId, HotelSearchRequest request) {
        
        List<Room> availableRooms = roomRepository.findAvailableRooms(
            hotelId,
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getGuests(),
            request.getRoomType()
        );
        
        return availableRooms.stream()
            .filter(room -> isRoomInPriceRange(room, request))
            .map(this::convertToAvailableRoomDto)
            .collect(Collectors.toList());
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
        
        // Get available rooms for this hotel
        List<HotelSearchResult.AvailableRoomDto> availableRooms = getAvailableRooms(hotel.getId(), request);
        result.setAvailableRooms(availableRooms);
        
        // Calculate price range
        if (!availableRooms.isEmpty()) {
            BigDecimal minPrice = availableRooms.stream()
                .map(HotelSearchResult.AvailableRoomDto::getPricePerNight)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
                
            BigDecimal maxPrice = availableRooms.stream()
                .map(HotelSearchResult.AvailableRoomDto::getPricePerNight)
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
}
