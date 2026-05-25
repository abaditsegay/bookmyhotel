package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.ConsolidatedReceiptResponse;
import com.bookmyhotel.security.BookingSecurity;
import com.bookmyhotel.service.CheckoutReceiptService;

@ExtendWith(MockitoExtension.class)
class CheckoutReceiptControllerTest {

    @Mock
    private CheckoutReceiptService checkoutReceiptService;

    @Mock
    private BookingSecurity bookingSecurity;

    @InjectMocks
    private CheckoutReceiptController controller;

    @Test
    void generateReceiptPreviewShouldReturnForbiddenWhenAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(55L)).thenReturn(false);

        ResponseEntity<ConsolidatedReceiptResponse> response = controller.generateReceiptPreview(55L);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(checkoutReceiptService, never()).generateCheckoutReceipt(55L, "system");
    }

    @Test
    void generateCheckoutReceiptShouldDelegateWhenAccessIsAllowed() {
        ConsolidatedReceiptResponse receipt = new ConsolidatedReceiptResponse();
        receipt.setReservationId(55L);

        when(bookingSecurity.canAccessReservation(55L)).thenReturn(true);
        when(checkoutReceiptService.generateFinalReceipt(55L, "system")).thenReturn(receipt);

        ResponseEntity<ConsolidatedReceiptResponse> response = controller.generateCheckoutReceipt(55L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        ConsolidatedReceiptResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(55L, body.getReservationId());
        verify(checkoutReceiptService).generateFinalReceipt(55L, "system");
    }

    @Test
    void emailReceiptShouldReturnForbiddenWhenAccessIsDenied() {
        when(bookingSecurity.canAccessReservation(55L)).thenReturn(false);

        ResponseEntity<String> response = controller.emailReceipt(55L, Map.of("email", "guest@example.com"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        verify(checkoutReceiptService, never()).emailReceipt(55L, "system", "guest@example.com");
    }
}