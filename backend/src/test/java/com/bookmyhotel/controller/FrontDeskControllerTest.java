package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.WalkInBookingRequest;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.security.BookingSecurity;
import com.bookmyhotel.security.HotelSecurity;
import com.bookmyhotel.service.BookingService;
import com.bookmyhotel.service.CheckoutReceiptService;
import com.bookmyhotel.service.FrontDeskService;

@ExtendWith(MockitoExtension.class)
class FrontDeskControllerTest {

    private static final Long RESERVATION_ID = 41L;

    private static final Long ROOM_ID = 12L;

    @Mock
    private FrontDeskService frontDeskService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private CheckoutReceiptService checkoutReceiptService;

    @Mock
    private BookingSecurity bookingSecurity;

    @Mock
    private HotelSecurity hotelSecurity;

    @InjectMocks
    private FrontDeskController frontDeskController;

    @BeforeEach
    void setUp() {
        lenient().when(bookingSecurity.canAccessReservation(anyLong())).thenReturn(true);
    }

    @Test
    void checkInWithRoomAssignmentShouldForwardReservationRoomAndRoomType() {
        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setReservationId(RESERVATION_ID);
        bookingResponse.setStatus("CHECKED_IN");
        bookingResponse.setRoomNumber("408");

        when(frontDeskService.checkInWithRoomAssignment(RESERVATION_ID, ROOM_ID, "DELUXE")).thenReturn(
            bookingResponse);

        ResponseEntity<BookingResponse> response = frontDeskController.checkInWithRoomAssignment(RESERVATION_ID,
            ROOM_ID, "DELUXE");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        BookingResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(RESERVATION_ID, body.getReservationId());
        assertEquals("CHECKED_IN", body.getStatus());
        assertEquals("408", body.getRoomNumber());
        verify(frontDeskService).checkInWithRoomAssignment(RESERVATION_ID, ROOM_ID, "DELUXE");
        }

        @Test
        void bookingMutationEndpointsShouldForwardReservationAndStatusValues() {
        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setReservationId(RESERVATION_ID);
        bookingResponse.setStatus("CHECKED_IN");
        bookingResponse.setPaymentStatus("COMPLETED");
        bookingResponse.setPaymentType("MOBILE");
        bookingResponse.setRoomNumber("305");

        when(frontDeskService.updateBookingRoomAssignment(RESERVATION_ID, ROOM_ID, "SUITE")).thenReturn(
            bookingResponse);
        when(frontDeskService.updateBookingStatus(RESERVATION_ID, "CHECKED_IN")).thenReturn(bookingResponse);
        when(frontDeskService.updateBookingPaymentStatus(RESERVATION_ID, "COMPLETED")).thenReturn(bookingResponse);
        when(frontDeskService.updateBookingPaymentType(RESERVATION_ID, "MOBILE")).thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> roomAssignmentResponse = frontDeskController.updateBookingRoomAssignment(
            RESERVATION_ID, ROOM_ID, "SUITE");
        ResponseEntity<BookingResponse> statusResponse = frontDeskController.updateBookingStatus(RESERVATION_ID,
            "CHECKED_IN");
        ResponseEntity<BookingResponse> paymentStatusResponse = frontDeskController.updateBookingPaymentStatus(
            RESERVATION_ID, "COMPLETED");
        ResponseEntity<BookingResponse> paymentTypeResponse = frontDeskController.updateBookingPaymentType(
            RESERVATION_ID, "MOBILE");

        assertEquals(HttpStatus.OK, roomAssignmentResponse.getStatusCode());
        assertEquals(HttpStatus.OK, statusResponse.getStatusCode());
        assertEquals(HttpStatus.OK, paymentStatusResponse.getStatusCode());
        assertEquals(HttpStatus.OK, paymentTypeResponse.getStatusCode());
        assertNotNull(roomAssignmentResponse.getBody());
        assertNotNull(statusResponse.getBody());
        assertNotNull(paymentStatusResponse.getBody());
        assertNotNull(paymentTypeResponse.getBody());

        verify(frontDeskService).updateBookingRoomAssignment(RESERVATION_ID, ROOM_ID, "SUITE");
        verify(frontDeskService).updateBookingStatus(RESERVATION_ID, "CHECKED_IN");
        verify(frontDeskService).updateBookingPaymentStatus(RESERVATION_ID, "COMPLETED");
        verify(frontDeskService).updateBookingPaymentType(RESERVATION_ID, "MOBILE");
        }

        @Test
        void searchByPaymentReferenceShouldReturnBookingWhenFound() {
        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setReservationId(RESERVATION_ID);
        bookingResponse.setPaymentReference("PAY-1001");
            bookingResponse.setHotelId(7L);

        when(bookingService.findByPaymentReferencePublic("PAY-1001")).thenReturn(bookingResponse);
            when(hotelSecurity.canAccessHotel(7L)).thenReturn(true);

        ResponseEntity<BookingResponse> response = frontDeskController.searchByPaymentReference("PAY-1001");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        BookingResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("PAY-1001", body.getPaymentReference());
        verify(bookingService).findByPaymentReferencePublic("PAY-1001");
        }

        @Test
        void searchByPaymentReferenceShouldReturnForbiddenWhenBookingHotelIsNotAccessible() {
        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setReservationId(RESERVATION_ID);
        bookingResponse.setPaymentReference("PAY-2002");
        bookingResponse.setHotelId(8L);

        when(bookingService.findByPaymentReferencePublic("PAY-2002")).thenReturn(bookingResponse);
        when(hotelSecurity.canAccessHotel(8L)).thenReturn(false);

        ResponseEntity<BookingResponse> response = frontDeskController.searchByPaymentReference("PAY-2002");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(bookingService).findByPaymentReferencePublic("PAY-2002");
        }

        @Test
        void searchByPaymentReferenceShouldReturnNotFoundWhenBookingIsMissing() {
        doThrow(new ResourceNotFoundException("Payment reference not found"))
            .when(bookingService)
            .findByPaymentReferencePublic("MISSING-REF");

        ResponseEntity<BookingResponse> response = frontDeskController.searchByPaymentReference("MISSING-REF");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(bookingService).findByPaymentReferencePublic("MISSING-REF");
    }

    @Test
    void getBookingDetailsShouldReturnForbiddenWhenReservationAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(RESERVATION_ID)).thenReturn(false);

        ResponseEntity<BookingResponse> response = frontDeskController.getBookingDetails(RESERVATION_ID);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void createWalkInBookingShouldUseCurrentUserHotelScope() {
        WalkInBookingRequest request = new WalkInBookingRequest();
        request.setHotelId(99L);
        request.setRoomId(ROOM_ID);
        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setReservationId(RESERVATION_ID);

        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(7L);
        when(bookingService.createBooking(any(), argThat(userEmail -> userEmail == null)))
                .thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> response = frontDeskController.createWalkInBooking(request, null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(bookingService).createBooking(argThat(bookingRequest -> bookingRequest.getHotelId().equals(7L)), argThat(userEmail -> userEmail == null));
    }

    @Test
    void getAvailableRoomsForCheckinShouldReturnForbiddenWhenHotelIsNotAccessible() {
        when(hotelSecurity.canAccessHotel(8L)).thenReturn(false);

        ResponseEntity<?> response = frontDeskController.getAvailableRoomsForCheckin(8L, null, null, 1);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void getAvailableRoomsForCheckinShouldReturnBadRequestForInvalidDateRange() {
        when(hotelSecurity.canAccessHotel(7L)).thenReturn(true);

        ResponseEntity<?> response = frontDeskController.getAvailableRoomsForCheckin(7L, "2026-06-15", "2026-06-15", 1);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}