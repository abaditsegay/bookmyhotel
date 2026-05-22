package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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

import com.bookmyhotel.entity.BookingModificationHistory;
import com.bookmyhotel.security.BookingSecurity;
import com.bookmyhotel.service.BookingModificationHistoryService;

@ExtendWith(MockitoExtension.class)
class BookingModificationHistoryControllerTest {

    @Mock
    private BookingModificationHistoryService historyService;

    @Mock
    private BookingSecurity bookingSecurity;

    @InjectMocks
    private BookingModificationHistoryController controller;

    @Test
    void getHistoryByReservationIdShouldReturnForbiddenWhenAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(42L)).thenReturn(false);

        ResponseEntity<List<BookingModificationHistory>> response = controller.getHistoryByReservationId(42L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(historyService, never()).getHistoryByReservationId(42L);
    }

    @Test
    void getHistoryByReservationIdShouldReturnHistoryWhenAccessIsAllowed() {
        BookingModificationHistory history = new BookingModificationHistory();
        history.setModificationType("DATE_CHANGE");

        when(bookingSecurity.canAccessReservation(42L)).thenReturn(true);
        when(historyService.getHistoryByReservationId(42L)).thenReturn(List.of(history));

        ResponseEntity<List<BookingModificationHistory>> response = controller.getHistoryByReservationId(42L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<BookingModificationHistory> body = response.getBody();
        assertNotNull(body);
        assertEquals(1, body.size());
        verify(historyService).getHistoryByReservationId(42L);
    }
}