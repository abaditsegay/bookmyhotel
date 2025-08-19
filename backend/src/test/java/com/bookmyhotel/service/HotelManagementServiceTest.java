package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class HotelManagementServiceTest {

    @Mock
    private HotelRepository hotelRepository;
    
    @Mock
    private RoomRepository roomRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private HotelManagementService hotelManagementService;
    
    private Hotel testHotel;
    private Room testRoom;
    private User testUser;
    private HotelDTO testHotelDTO;
    private RoomDTO testRoomDTO;
    
    @BeforeEach
    void setUp() {
        testHotel = new Hotel();
        testHotel.setId(1L);
        testHotel.setName("Test Hotel");
        testHotel.setAddress("Test Address");
        testHotel.setCity("Test City");
        testHotel.setCountry("Test Country");
        testHotel.setDescription("Test Description");
        testHotel.setIsActive(true); // Set hotel as initially active
        
        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setRoomNumber("101");
        testRoom.setCapacity(2);
        testRoom.setPricePerNight(BigDecimal.valueOf(100.00));
        testRoom.setIsAvailable(true);
        testRoom.setHotel(testHotel);
        
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("owner@hotel.com");
        
        testHotelDTO = new HotelDTO();
        testHotelDTO.setName("Test Hotel DTO");
        testHotelDTO.setAddress("Test Address DTO");
        testHotelDTO.setCity("Test City DTO");
        testHotelDTO.setCountry("Test Country DTO");
        testHotelDTO.setDescription("Test Description DTO");
        
        testRoomDTO = new RoomDTO();
        testRoomDTO.setRoomNumber("102");
        testRoomDTO.setCapacity(3);
        testRoomDTO.setPricePerNight(BigDecimal.valueOf(150.00));
    }
    
    @Test
    void createHotel_Success() {
        when(hotelRepository.save(any(Hotel.class))).thenReturn(testHotel);
        
        HotelDTO result = hotelManagementService.createHotel(testHotelDTO);
        
        assertNotNull(result);
        verify(hotelRepository).save(any(Hotel.class));
    }
    
    @Test
    void getHotelById_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(testHotel));
        
        HotelDTO result = hotelManagementService.getHotelById(1L);
        
        assertNotNull(result);
        verify(hotelRepository).findById(1L);
    }
    
    @Test
    void getHotelById_NotFound() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.empty());
        
        assertThrows(ResourceNotFoundException.class, () -> {
            hotelManagementService.getHotelById(1L);
        });
        
        verify(hotelRepository).findById(1L);
    }
    
    @Test
    void getAllHotels_Success() {
        List<Hotel> hotels = Arrays.asList(testHotel);
        Page<Hotel> hotelPage = new PageImpl<>(hotels);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(hotelRepository.findAll(pageable)).thenReturn(hotelPage);
        
        Page<HotelDTO> result = hotelManagementService.getAllHotels(pageable);
        
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(hotelRepository).findAll(pageable);
    }
    
    @Test
    void updateHotel_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(testHotel));
        when(hotelRepository.save(any(Hotel.class))).thenReturn(testHotel);
        
        HotelDTO result = hotelManagementService.updateHotel(1L, testHotelDTO);
        
        assertNotNull(result);
        verify(hotelRepository).findById(1L);
        verify(hotelRepository).save(any(Hotel.class));
    }
    
    @Test
    void deleteHotel_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(testHotel));
        when(hotelRepository.save(any(Hotel.class))).thenReturn(testHotel);
        
        hotelManagementService.deleteHotel(1L);
        
        verify(hotelRepository).findById(1L);
        verify(hotelRepository).save(testHotel);
        // Verify that the hotel is marked as inactive (soft delete)
        assertFalse(testHotel.getIsActive());
    }
    
    @Test
    void getHotelRooms_Success() {
        List<Room> rooms = Arrays.asList(testRoom);
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(testHotel));
        when(roomRepository.findByHotelId(1L)).thenReturn(rooms);
        
        List<RoomDTO> result = hotelManagementService.getHotelRooms(1L);
        
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testRoom.getRoomNumber(), result.get(0).getRoomNumber());
        verify(hotelRepository).findById(1L);
        verify(roomRepository).findByHotelId(1L);
    }
    
    @Test
    void addRoomToHotel_Success() {
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(testHotel));
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);
        
        RoomDTO result = hotelManagementService.addRoomToHotel(1L, testRoomDTO);
        
        assertNotNull(result);
        verify(hotelRepository).findById(1L);
        verify(roomRepository).save(any(Room.class));
    }
}
