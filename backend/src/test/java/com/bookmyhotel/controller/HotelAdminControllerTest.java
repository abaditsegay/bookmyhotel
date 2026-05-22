package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.dto.WalkInBookingRequest;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.service.BookingService;
import com.bookmyhotel.service.HotelAdminService;
import com.bookmyhotel.service.HotelImageService;
import com.bookmyhotel.service.RoomTypePricingService;

@ExtendWith(MockitoExtension.class)
class HotelAdminControllerTest {

    @Mock
    private HotelAdminService hotelAdminService;

    @Mock
    private RoomTypePricingService roomTypePricingService;

    @Mock
    private BookingService bookingService;

    @Mock
    private HotelImageService hotelImageService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private HotelAdminController controller;

    @Test
    void updateBookingStatusShouldPassCurrentHotelId() {
        HotelDTO hotel = new HotelDTO();
        hotel.setId(7L);
        BookingResponse booking = new BookingResponse();

        when(authentication.getName()).thenReturn("admin@example.com");
        when(hotelAdminService.getMyHotel("admin@example.com")).thenReturn(hotel);
        when(hotelAdminService.updateBookingStatus(91L, ReservationStatus.BOOKED, 7L)).thenReturn(booking);

        ResponseEntity<BookingResponse> response = controller.updateBookingStatus(91L, "booked", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(hotelAdminService).updateBookingStatus(91L, ReservationStatus.BOOKED, 7L);
    }

    @Test
    void updateBookingPaymentStatusShouldPassCurrentHotelId() {
        HotelDTO hotel = new HotelDTO();
        hotel.setId(7L);
        BookingResponse booking = new BookingResponse();

        when(authentication.getName()).thenReturn("admin@example.com");
        when(hotelAdminService.getMyHotel("admin@example.com")).thenReturn(hotel);
        when(hotelAdminService.updateBookingPaymentStatus(91L, "COMPLETED", 7L)).thenReturn(booking);

        ResponseEntity<BookingResponse> response = controller.updateBookingPaymentStatus(91L, "COMPLETED",
                authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(hotelAdminService).updateBookingPaymentStatus(91L, "COMPLETED", 7L);
    }

    @Test
    void updateBookingPaymentTypeShouldPassCurrentHotelId() {
        HotelDTO hotel = new HotelDTO();
        hotel.setId(7L);
        BookingResponse booking = new BookingResponse();

        when(authentication.getName()).thenReturn("admin@example.com");
        when(hotelAdminService.getMyHotel("admin@example.com")).thenReturn(hotel);
        when(hotelAdminService.updateBookingPaymentType(91L, "cash", 7L)).thenReturn(booking);

        ResponseEntity<BookingResponse> response = controller.updateBookingPaymentType(91L, "cash", authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(hotelAdminService).updateBookingPaymentType(91L, "cash", 7L);
    }

    @Test
    void createWalkInBookingShouldScopeRequestToCurrentHotel() {
        HotelDTO hotel = new HotelDTO();
        hotel.setId(7L);
        WalkInBookingRequest request = new WalkInBookingRequest();
        request.setHotelId(99L);
        request.setRoomId(12L);
        BookingResponse booking = new BookingResponse();

        when(authentication.getName()).thenReturn("admin@example.com");
        when(hotelAdminService.getMyHotel("admin@example.com")).thenReturn(hotel);
        when(bookingService.createBooking(argThat(bookingRequest -> bookingRequest.getHotelId().equals(7L)), argThat(userEmail -> userEmail == null)))
                .thenReturn(booking);

        ResponseEntity<BookingResponse> response = controller.createWalkInBooking(request, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(bookingService).createBooking(argThat(bookingRequest -> bookingRequest.getHotelId().equals(7L)), argThat(userEmail -> userEmail == null));
    }

    @Test
    void getAvailableRoomsShouldReturnBadRequestForInvalidDateRange() {
        ResponseEntity<List<RoomDTO>> response = controller.getAvailableRooms(
                "2026-06-15",
                "2026-06-15",
                1,
                0,
                100,
                authentication);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(hotelAdminService, never()).getAvailableRoomsForDateRange("admin@example.com", null, null, 1, 0, 100);
    }
}