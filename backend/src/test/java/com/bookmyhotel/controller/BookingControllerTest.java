package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.security.BookingSecurity;
import com.bookmyhotel.service.BookingService;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingSecurity bookingSecurity;

    @InjectMocks
    private BookingController bookingController;

    @Test
    void searchBookingShouldRequireConfirmationAndEmail() {
        ResponseEntity<BookingResponse> missingEmail = bookingController.searchBooking("BK00001234", null, null);
        ResponseEntity<BookingResponse> missingConfirmation = bookingController.searchBooking(null, "a@b.com", null);

        assertEquals(HttpStatus.BAD_REQUEST, missingEmail.getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, missingConfirmation.getStatusCode());
        verifyNoInteractions(bookingService);
    }

    @Test
    void searchBookingShouldUseConfirmationAndEmailLookup() {
        BookingResponse expected = new BookingResponse();
        expected.setConfirmationNumber("BK00005678");

        when(bookingService.findByConfirmationNumberAndEmailPublic("BK00005678", "guest@example.com"))
                .thenReturn(expected);

        ResponseEntity<BookingResponse> response = bookingController.searchBooking(
                " BK00005678 ",
                " guest@example.com ",
                null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        BookingResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("BK00005678", body.getConfirmationNumber());
        verify(bookingService).findByConfirmationNumberAndEmailPublic("BK00005678", "guest@example.com");
    }

    @Test
    void getBookingShouldReturnForbiddenWhenReservationAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(88L)).thenReturn(false);

        ResponseEntity<BookingResponse> response = bookingController.getBooking(88L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(bookingService);
    }

    @Test
    void cancelBookingShouldReturnForbiddenWhenReservationAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(89L)).thenReturn(false);

        ResponseEntity<BookingResponse> response = bookingController.cancelBooking(89L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(bookingService);
    }

    @Test
    void sendBookingEmailShouldReturnForbiddenWhenReservationAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(90L)).thenReturn(false);

        ResponseEntity<Map<String, String>> response = bookingController.sendBookingEmail(90L, Map.of(
                "emailAddress", "guest@example.com",
                "includeItinerary", true));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verifyNoInteractions(bookingService);
    }

    @Test
    void getBookingShouldDelegateWhenReservationAccessIsAllowed() {
        BookingResponse expected = new BookingResponse();
        expected.setReservationId(91L);

        when(bookingSecurity.canAccessReservation(91L)).thenReturn(true);
        when(bookingService.getBooking(91L)).thenReturn(expected);

        ResponseEntity<BookingResponse> response = bookingController.getBooking(91L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        BookingResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(91L, body.getReservationId());
        verify(bookingService).getBooking(91L);
    }

    @Test
    void findByPaymentReferenceShouldReturnForbiddenWhenReservationAccessIsDenied() {
        BookingResponse booking = new BookingResponse();
        booking.setReservationId(92L);

        when(bookingService.findByPaymentReferencePublic("PAY-001")).thenReturn(booking);
        when(bookingSecurity.canAccessReservation(92L)).thenReturn(false);

        ResponseEntity<BookingResponse> response = bookingController.findByPaymentReference("PAY-001");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(bookingService).findByPaymentReferencePublic("PAY-001");
    }

    @Test
    void findByPaymentReferenceShouldReturnBookingWhenReservationAccessIsAllowed() {
        BookingResponse booking = new BookingResponse();
        booking.setReservationId(93L);
        booking.setConfirmationNumber("BK000093");

        when(bookingService.findByPaymentReferencePublic("PAY-002")).thenReturn(booking);
        when(bookingSecurity.canAccessReservation(93L)).thenReturn(true);

        ResponseEntity<BookingResponse> response = bookingController.findByPaymentReference("PAY-002");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("BK000093", response.getBody().getConfirmationNumber());
        verify(bookingSecurity).canAccessReservation(93L);
    }
}
