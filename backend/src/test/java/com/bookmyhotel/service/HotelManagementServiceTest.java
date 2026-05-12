package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class HotelManagementServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private HotelManagementService hotelManagementService;

    @Test
    void createHotelShouldResolveTenantAndPersistMappedFields() {
        Tenant tenant = tenant("tenant-1", "Grand Plaza Tenant");
        HotelDTO request = hotelDto("Grand Plaza", "tenant-1");

        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(tenant));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel hotel = invocation.getArgument(0);
            hotel.setId(100L);
            hotel.setCreatedAt(LocalDateTime.now());
            hotel.setUpdatedAt(LocalDateTime.now());
            return hotel;
        });
        when(roomRepository.countByHotel(any(Hotel.class))).thenReturn(4L);
        when(roomRepository.findByHotelIdAndIsAvailableTrue(100L)).thenReturn(List.of(room(1L), room(2L)));

        HotelDTO result = hotelManagementService.createHotel(request);

        ArgumentCaptor<Hotel> hotelCaptor = ArgumentCaptor.forClass(Hotel.class);
        verify(hotelRepository).save(hotelCaptor.capture());
        Hotel savedHotel = hotelCaptor.getValue();

        assertEquals("Grand Plaza", savedHotel.getName());
        assertEquals("Downtown avenue", savedHotel.getAddress());
        assertEquals("Addis Ababa", savedHotel.getCity());
        assertEquals("Ethiopia", savedHotel.getCountry());
        assertEquals("tenant-1", savedHotel.getTenantId());
        assertTrue(savedHotel.getIsActive());
        assertEquals(100L, result.getId());
        assertEquals(4, result.getRoomCount());
        assertEquals(2, result.getAvailableRooms());
    }

    @Test
    void createHotelShouldRejectMissingTenant() {
        HotelDTO request = hotelDto("Grand Plaza", "missing-tenant");
        when(tenantRepository.findById("missing-tenant")).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> hotelManagementService.createHotel(request));

        assertTrue(exception.getMessage().contains("Tenant not found"));
        verify(hotelRepository, never()).save(any(Hotel.class));
    }

    @Test
    void toggleHotelStatusShouldDeactivateHotelUnpublishItAndDeactivateUsers() {
        Hotel hotel = hotel(101L, true, true);
        User activeUser = user(1L, true);
        User inactiveUser = user(2L, false);

        when(hotelRepository.findById(101L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByHotel_Id(101L)).thenReturn(List.of(activeUser, inactiveUser));
        when(roomRepository.countByHotel(hotel)).thenReturn(3L);
        when(roomRepository.findByHotelIdAndIsAvailableTrue(101L)).thenReturn(List.of(room(1L)));

        HotelDTO result = hotelManagementService.toggleHotelStatus(101L, "compliance hold");

        assertFalse(hotel.getIsActive());
        assertFalse(hotel.getIsPubliclyListed());
        assertFalse(activeUser.getIsActive());
        assertFalse(inactiveUser.getIsActive());
        assertFalse(result.getIsActive());
        verify(userRepository).saveAll(List.of(activeUser, inactiveUser));
    }

    @Test
    void toggleHotelStatusShouldReactivateUsersWhenHotelIsReenabled() {
        Hotel hotel = hotel(101L, false, false);
        User inactiveUser = user(1L, false);
        User alreadyActiveUser = user(2L, true);

        when(hotelRepository.findById(101L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByHotel_Id(101L)).thenReturn(List.of(inactiveUser, alreadyActiveUser));
        when(roomRepository.countByHotel(hotel)).thenReturn(2L);
        when(roomRepository.findByHotelIdAndIsAvailableTrue(101L)).thenReturn(List.of(room(1L), room(2L)));

        HotelDTO result = hotelManagementService.toggleHotelStatus(101L, "reactivation approved");

        assertTrue(hotel.getIsActive());
        assertTrue(inactiveUser.getIsActive());
        assertTrue(alreadyActiveUser.getIsActive());
        assertTrue(result.getIsActive());
        verify(userRepository).saveAll(List.of(inactiveUser, alreadyActiveUser));
    }

    @Test
    void togglePublicListingShouldRejectInactiveHotel() {
        Hotel hotel = hotel(101L, false, false);
        when(hotelRepository.findById(101L)).thenReturn(Optional.of(hotel));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> hotelManagementService.togglePublicListing(101L, "publish request"));

        assertTrue(exception.getMessage().contains("Cannot publish an inactive hotel"));
        verify(hotelRepository, never()).save(any(Hotel.class));
    }

    @Test
    void togglePublicListingShouldFlipListingForActiveHotel() {
        Hotel hotel = hotel(101L, true, false);
        when(hotelRepository.findById(101L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomRepository.countByHotel(hotel)).thenReturn(5L);
        when(roomRepository.findByHotelIdAndIsAvailableTrue(101L)).thenReturn(List.of(room(1L), room(2L), room(3L)));

        HotelDTO result = hotelManagementService.togglePublicListing(101L, "publish request");

        assertTrue(hotel.getIsPubliclyListed());
        assertTrue(result.getIsPubliclyListed());
        assertEquals(5, result.getTotalRooms());
        assertEquals(3, result.getAvailableRooms());
    }

    @Test
    void deleteHotelShouldSoftDeleteAndDeactivateHotelUsers() {
        Hotel hotel = hotel(101L, true, true);
        User activeUser = user(1L, true);
        User inactiveUser = user(2L, false);

        when(hotelRepository.findById(101L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByHotel_Id(101L)).thenReturn(List.of(activeUser, inactiveUser));

        hotelManagementService.deleteHotel(101L);

        assertFalse(hotel.getIsActive());
        assertFalse(activeUser.getIsActive());
        assertFalse(inactiveUser.getIsActive());
        verify(hotelRepository).save(hotel);
        verify(userRepository).saveAll(List.of(activeUser, inactiveUser));
    }

    @Test
    void getHotelStatisticsShouldReflectRepositoryCounts() {
        when(hotelRepository.count()).thenReturn(9L);
        when(hotelRepository.countByIsActiveTrue()).thenReturn(7L);
        when(hotelRepository.countByIsActiveFalse()).thenReturn(2L);
        when(roomRepository.count()).thenReturn(40L);
        when(roomRepository.countByIsAvailable(true)).thenReturn(31L);

        HotelManagementService.HotelStatistics result = hotelManagementService.getHotelStatistics();

        assertEquals(9L, result.getTotalHotels());
        assertEquals(7L, result.getActiveHotels());
        assertEquals(2L, result.getInactiveHotels());
        assertEquals(40L, result.getTotalRooms());
        assertEquals(31L, result.getActiveRooms());
    }

    private HotelDTO hotelDto(String name, String tenantId) {
        HotelDTO dto = new HotelDTO();
        dto.setName(name);
        dto.setDescription(name + " description");
        dto.setAddress("Downtown avenue");
        dto.setCity("Addis Ababa");
        dto.setCountry("Ethiopia");
        dto.setPhone("+251900000000");
        dto.setEmail("hotel@example.com");
        dto.setTenantId(tenantId);
        dto.setIsActive(true);
        return dto;
    }

    private Hotel hotel(Long id, boolean active, boolean publiclyListed) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Grand Plaza");
        hotel.setDescription("Grand Plaza description");
        hotel.setAddress("Downtown avenue");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251900000000");
        hotel.setEmail("hotel@example.com");
        hotel.setTenant(tenant("tenant-1", "Grand Plaza Tenant"));
        hotel.setIsActive(active);
        hotel.setIsPubliclyListed(publiclyListed);
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());
        return hotel;
    }

    private Tenant tenant(String id, String name) {
        Tenant tenant = new Tenant(id, name);
        tenant.setCreatedAt(LocalDateTime.now());
        tenant.setUpdatedAt(LocalDateTime.now());
        return tenant;
    }

    private User user(Long id, boolean isActive) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@example.com");
        user.setFirstName("User");
        user.setLastName(String.valueOf(id));
        user.setIsActive(isActive);
        return user;
    }

    private Room room(Long id) {
        Room room = new Room();
        room.setId(id);
        return room;
    }
}