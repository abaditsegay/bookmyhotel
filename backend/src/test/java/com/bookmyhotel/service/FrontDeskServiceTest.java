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

    @InjectMocks
    private FrontDeskService frontDeskService;

    private static final String TEST_TENANT_ID = "test-tenant-123";

    @BeforeEach
    void setUp() {
        // Setup is handled by Mockito annotations
    }

    @Test
    void getFrontDeskStats_ShouldUseTenantAwareRoomCounting() {
        // Given
        LocalDate today = LocalDate.now();
        
        // Mock reservation data
        when(reservationRepository.findUpcomingCheckInsByTenantId(today, TEST_TENANT_ID))
            .thenReturn(new ArrayList<>() {{ 
                // Simulate 3 arrivals today
                add(null); add(null); add(null);
            }});
            
        when(reservationRepository.findUpcomingCheckOutsByTenantId(today, TEST_TENANT_ID))
            .thenReturn(new ArrayList<>() {{ 
                // Simulate 2 departures today
                add(null); add(null);
            }});
            
        when(reservationRepository.findByStatusAndTenantId(ReservationStatus.CHECKED_IN, TEST_TENANT_ID))
            .thenReturn(new ArrayList<>() {{ 
                // Simulate 5 current guests
                add(null); add(null); add(null); add(null); add(null);
            }});

        // Mock tenant-aware room counting (these should be called)
        when(roomRepository.countByTenantId(TEST_TENANT_ID)).thenReturn(10L);
        when(roomRepository.countByStatusAndTenantId(RoomStatus.AVAILABLE, TEST_TENANT_ID)).thenReturn(4L);
        when(roomRepository.countByStatusAndTenantId(RoomStatus.OUT_OF_ORDER, TEST_TENANT_ID)).thenReturn(1L);
        when(roomRepository.countByStatusAndTenantId(RoomStatus.MAINTENANCE, TEST_TENANT_ID)).thenReturn(0L);

        // When
        FrontDeskStats stats;
        try (MockedStatic<TenantContext> mockedTenantContext = Mockito.mockStatic(TenantContext.class)) {
            mockedTenantContext.when(TenantContext::getTenantId).thenReturn(TEST_TENANT_ID);
            stats = frontDeskService.getFrontDeskStats();
        }

        // Then
        assertEquals(3L, stats.getTodaysArrivals(), "Arrivals should be tenant-specific");
        assertEquals(2L, stats.getTodaysDepartures(), "Departures should be tenant-specific");
        assertEquals(5L, stats.getCurrentOccupancy(), "Occupancy should be tenant-specific");
        assertEquals(4L, stats.getAvailableRooms(), "Available rooms should be tenant-specific");
        assertEquals(1L, stats.getRoomsOutOfOrder(), "Out of order rooms should be tenant-specific");
        assertEquals(0L, stats.getRoomsUnderMaintenance(), "Maintenance rooms should be tenant-specific");

        // Verify that tenant-aware methods were called (not the global ones)
        Mockito.verify(roomRepository).countByTenantId(TEST_TENANT_ID);
        Mockito.verify(roomRepository).countByStatusAndTenantId(RoomStatus.AVAILABLE, TEST_TENANT_ID);
        Mockito.verify(roomRepository).countByStatusAndTenantId(RoomStatus.OUT_OF_ORDER, TEST_TENANT_ID);
        Mockito.verify(roomRepository).countByStatusAndTenantId(RoomStatus.MAINTENANCE, TEST_TENANT_ID);

        // Verify that non-tenant-aware methods were NOT called
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
