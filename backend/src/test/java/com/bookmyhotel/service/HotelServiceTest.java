package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.repository.HotelRepository;

@ExtendWith(MockitoExtension.class)
class HotelServiceTest {

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private HotelService hotelService;

    @Test
    void getHotelIdByTenantIdShouldReturnNullWhenNoActiveHotelExists() {
        when(hotelRepository.findByTenant_IdAndIsActiveTrue("tenant-a")).thenReturn(List.of());

        assertNull(hotelService.getHotelIdByTenantId("tenant-a"));
    }

    @Test
    void getHotelIdByTenantIdShouldReturnSingleHotelId() {
        when(hotelRepository.findByTenant_IdAndIsActiveTrue("tenant-a")).thenReturn(List.of(hotel(11L)));

        assertEquals(11L, hotelService.getHotelIdByTenantId("tenant-a"));
    }

    @Test
    void getHotelIdByTenantIdShouldFailClosedForMultiHotelTenant() {
        when(hotelRepository.findByTenant_IdAndIsActiveTrue("tenant-a"))
                .thenReturn(List.of(hotel(11L), hotel(12L)));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> hotelService.getHotelIdByTenantId("tenant-a"));

        assertEquals("Explicit hotel context is required for multi-hotel tenants", exception.getMessage());
    }

    private Hotel hotel(Long id) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        return hotel;
    }
}