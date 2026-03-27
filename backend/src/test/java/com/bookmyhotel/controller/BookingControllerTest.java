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
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.BookingService;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    @Mock
    private BookingService bookingService;

    @Mock
    private UserRepository userRepository;

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
        assertNotNull(response.getBody());
        assertEquals("BK00005678", response.getBody().getConfirmationNumber());
        verify(bookingService).findByConfirmationNumberAndEmailPublic("BK00005678", "guest@example.com");
    }
}
