package com.bookmyhotel.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for hotel management by admin
 */
@Service
@Transactional
public class HotelManagementService {
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get all hotels with pagination
     */
    @Transactional(readOnly = true)
    public Page<HotelDTO> getAllHotels(Pageable pageable) {
        Page<Hotel> hotels = hotelRepository.findAll(pageable);
        return hotels.map(this::convertToDTO);
    }
    
    /**
     * Search hotels by name, address, or description
     */
    @Transactional(readOnly = true)
    public Page<HotelDTO> searchHotels(String searchTerm, Pageable pageable) {
        Page<Hotel> hotels = hotelRepository.searchHotels(searchTerm, pageable);
        return hotels.map(this::convertToDTO);
    }
    
    /**
     * Get hotels by tenant
     */
    @Transactional(readOnly = true)
    public Page<HotelDTO> getHotelsByTenant(String tenantId, Pageable pageable) {
        // Since we don't have findByTenantId method yet, we'll get all hotels for now
        Page<Hotel> hotels = hotelRepository.findAll(pageable);
        return hotels.map(this::convertToDTO);
    }
    
    /**
     * Get hotel by ID with full details
     */
    @Transactional(readOnly = true)
    public HotelDTO getHotelById(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        return convertToDTO(hotel);
    }
    
    /**
     * Create a new hotel
     */
    public HotelDTO createHotel(HotelDTO hotelDTO) {
        // Simple validation for now - can be enhanced later
        Hotel hotel = new Hotel();
        updateHotelFromDTO(hotel, hotelDTO);
        
        hotel = hotelRepository.save(hotel);
        return convertToDTO(hotel);
    }
    
    /**
     * Update hotel information
     */
    public HotelDTO updateHotel(Long hotelId, HotelDTO hotelDTO) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        
        updateHotelFromDTO(hotel, hotelDTO);
        hotel = hotelRepository.save(hotel);
        
        return convertToDTO(hotel);
    }
    
    /**
     * Delete hotel (soft delete by setting inactive)
     */
    public void deleteHotel(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        
        // Soft delete by setting inactive
        hotel.setIsActive(false);
        hotelRepository.save(hotel);
    }
    
    /**
     * Toggle hotel active status
     */
    public HotelDTO toggleHotelStatus(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        
        // Toggle the active status
        hotel.setIsActive(!Boolean.TRUE.equals(hotel.getIsActive()));
        hotel = hotelRepository.save(hotel);
        
        return convertToDTO(hotel);
    }
    
    /**
     * Get rooms for a hotel
     */
    @Transactional(readOnly = true)
    public List<RoomDTO> getHotelRooms(Long hotelId) {
        // Verify hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        
        List<Room> rooms = roomRepository.findByHotelId(hotelId);
        return rooms.stream()
                .map(this::convertRoomToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Add room to hotel
     */
    public RoomDTO addRoomToHotel(Long hotelId, RoomDTO roomDTO) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setRoomType(roomDTO.getRoomType());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setCapacity(roomDTO.getCapacity());
        room.setDescription(roomDTO.getDescription());
        room.setIsAvailable(true);
        room.setTenantId(hotel.getTenantId());
        
        room = roomRepository.save(room);
        return convertRoomToDTO(room);
    }
    
    /**
     * Update room in hotel
     */
    public RoomDTO updateRoom(Long roomId, RoomDTO roomDTO) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setRoomType(roomDTO.getRoomType());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setCapacity(roomDTO.getCapacity());
        room.setDescription(roomDTO.getDescription());
        
        room = roomRepository.save(room);
        return convertRoomToDTO(room);
    }
    
    /**
     * Delete room from hotel
     */
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        
        room.setIsAvailable(false);
        roomRepository.save(room);
    }
    
    /**
     * Get hotel statistics
     */
    @Transactional(readOnly = true)
    public HotelStatistics getHotelStatistics() {
        HotelStatistics stats = new HotelStatistics();
        stats.setTotalHotels(hotelRepository.count());
        stats.setActiveHotels(hotelRepository.countByIsActiveTrue());
        stats.setInactiveHotels(hotelRepository.countByIsActiveFalse());
        stats.setTotalRooms(roomRepository.count());
        stats.setActiveRooms(roomRepository.countByIsAvailable(true));
        
        return stats;
    }
    
    /**
     * Assign hotel admin to hotel
     */
    public HotelDTO assignHotelAdmin(Long hotelId, Long userId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + hotelId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Set the user's tenant to match the hotel's tenant
        user.setTenantId(hotel.getTenantId());
        userRepository.save(user);
        
        return convertToDTO(hotel);
    }
    
    /**
     * Convert Hotel entity to DTO
     */
    private HotelDTO convertToDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setDescription(hotel.getDescription());
        dto.setAddress(hotel.getAddress());
        dto.setCity(hotel.getCity());
        dto.setCountry(hotel.getCountry());
        dto.setPhone(hotel.getPhone());
        dto.setEmail(hotel.getEmail());
        dto.setIsActive(hotel.getIsActive());
        dto.setTenantId(hotel.getTenantId());
        dto.setCreatedAt(hotel.getCreatedAt());
        dto.setUpdatedAt(hotel.getUpdatedAt());
        
        // Get room count
        long roomCount = roomRepository.countByHotel(hotel);
        dto.setRoomCount((int) roomCount);
        
        return dto;
    }
    
    /**
     * Convert Room entity to DTO
     */
    private RoomDTO convertRoomToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setPricePerNight(room.getPricePerNight());
        dto.setCapacity(room.getCapacity());
        dto.setDescription(room.getDescription());
        dto.setIsAvailable(room.getIsAvailable());
        dto.setHotelId(room.getHotel().getId());
        dto.setHotelName(room.getHotel().getName());
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * Update hotel entity from DTO
     */
    private void updateHotelFromDTO(Hotel hotel, HotelDTO dto) {
        hotel.setName(dto.getName());
        hotel.setDescription(dto.getDescription());
        hotel.setAddress(dto.getAddress());
        hotel.setCity(dto.getCity());
        hotel.setCountry(dto.getCountry());
        hotel.setPhone(dto.getPhone());
        hotel.setEmail(dto.getEmail());
        hotel.setTenantId(dto.getTenantId());
        if (dto.getIsActive() != null) {
            hotel.setIsActive(dto.getIsActive());
        }
    }
    
    /**
     * Inner class for hotel statistics
     */
    public static class HotelStatistics {
        private long totalHotels;
        private long activeHotels;
        private long inactiveHotels;
        private long totalRooms;
        private long activeRooms;
        
        // Getters and Setters
        public long getTotalHotels() { return totalHotels; }
        public void setTotalHotels(long totalHotels) { this.totalHotels = totalHotels; }
        
        public long getActiveHotels() { return activeHotels; }
        public void setActiveHotels(long activeHotels) { this.activeHotels = activeHotels; }
        
        public long getInactiveHotels() { return inactiveHotels; }
        public void setInactiveHotels(long inactiveHotels) { this.inactiveHotels = inactiveHotels; }
        
        public long getTotalRooms() { return totalRooms; }
        public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }
        
        public long getActiveRooms() { return activeRooms; }
        public void setActiveRooms(long activeRooms) { this.activeRooms = activeRooms; }
    }
}
