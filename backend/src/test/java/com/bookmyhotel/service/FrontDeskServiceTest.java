package com.bookmyhotel.service;

import java.time.LocalDate;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.FrontDeskStats;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.tenant.TenantContext;

@ExtendWith(MockitoExtension.class)
class FrontDeskServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelService hotelService;

    @InjectMocks
    private FrontDeskService frontDeskService;

    private static final String TEST_TENANT_ID = "test-tenant-123";
    private static final Long TEST_HOTEL_ID = 1L;

    @BeforeEach
    void setUp() {
        // Setup is handled by Mockito annotations
    }

    @Test
    void getFrontDeskStats_ShouldUseHotelAwareRoomCounting() {
        // Given
        LocalDate today = LocalDate.now();
        
        // Mock hotel service to return hotel ID for tenant
        when(hotelService.getHotelIdByTenantId(TEST_TENANT_ID)).thenReturn(TEST_HOTEL_ID);
        
        // Mock reservation data
        when(reservationRepository.findUpcomingCheckInsByHotelId(today, TEST_HOTEL_ID))
            .thenReturn(new ArrayList<>() {{ 
                // Simulate 3 arrivals today
                add(null); add(null); add(null);
            }});
            
        when(reservationRepository.findUpcomingCheckOutsByHotelId(today, TEST_HOTEL_ID))
            .thenReturn(new ArrayList<>() {{ 
                // Simulate 2 departures today
                add(null); add(null);
            }});
            
        when(reservationRepository.findByStatusAndHotelId(ReservationStatus.CHECKED_IN, TEST_HOTEL_ID))
            .thenReturn(new ArrayList<>() {{ 
                // Simulate 5 current guests
                add(null); add(null); add(null); add(null); add(null);
            }});

        // Mock hotel-aware room counting (these should be called)
        when(roomRepository.countByHotelId(TEST_HOTEL_ID)).thenReturn(10L);
        when(roomRepository.countByStatusAndHotelId(RoomStatus.AVAILABLE, TEST_HOTEL_ID)).thenReturn(4L);
        when(roomRepository.countByStatusAndHotelId(RoomStatus.OUT_OF_ORDER, TEST_HOTEL_ID)).thenReturn(1L);
        when(roomRepository.countByStatusAndHotelId(RoomStatus.MAINTENANCE, TEST_HOTEL_ID)).thenReturn(0L);

        // When
        FrontDeskStats stats;
        try (MockedStatic<TenantContext> mockedTenantContext = Mockito.mockStatic(TenantContext.class)) {
            mockedTenantContext.when(TenantContext::getTenantId).thenReturn(TEST_TENANT_ID);
            stats = frontDeskService.getFrontDeskStats();
        }

        // Then
        assertEquals(3L, stats.getTodaysArrivals(), "Arrivals should be hotel-specific");
        assertEquals(2L, stats.getTodaysDepartures(), "Departures should be hotel-specific");
        assertEquals(5L, stats.getCurrentOccupancy(), "Occupancy should be hotel-specific");
        assertEquals(4L, stats.getAvailableRooms(), "Available rooms should be hotel-specific");
        assertEquals(1L, stats.getRoomsOutOfOrder(), "Out of order rooms should be hotel-specific");
        assertEquals(0L, stats.getRoomsUnderMaintenance(), "Maintenance rooms should be hotel-specific");

        // Verify that hotel-aware methods were called (not the global ones)
        Mockito.verify(roomRepository).countByHotelId(TEST_HOTEL_ID);
        Mockito.verify(roomRepository).countByStatusAndHotelId(RoomStatus.AVAILABLE, TEST_HOTEL_ID);
        Mockito.verify(roomRepository).countByStatusAndHotelId(RoomStatus.OUT_OF_ORDER, TEST_HOTEL_ID);
        Mockito.verify(roomRepository).countByStatusAndHotelId(RoomStatus.MAINTENANCE, TEST_HOTEL_ID);

        // Verify that non-hotel-aware methods were NOT called
        Mockito.verify(roomRepository, Mockito.never()).count();
        Mockito.verify(roomRepository, Mockito.never()).countByStatus(Mockito.any());
    }

    @Test
    void getFrontDeskStats_ShouldThrowExceptionWhenTenantContextNotSet() {
        // When & Then
        try (MockedStatic<TenantContext> mockedTenantContext = Mockito.mockStatic(TenantContext.class)) {
            mockedTenantContext.when(TenantContext::getTenantId).thenReturn(null);
            
            org.junit.jupiter.api.Assertions.assertThrows(
                IllegalStateException.class, 
                () -> frontDeskService.getFrontDeskStats(),
                "Should throw IllegalStateException when tenant context is not set"
            );
        }
    }
}
