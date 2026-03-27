package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.payment.PaymentCallbackRequest;
import com.bookmyhotel.service.payment.EthiopianMobilePaymentService;

@ExtendWith(MockitoExtension.class)
class EthiopianPaymentControllerTest {

    @Mock
    private EthiopianMobilePaymentService paymentService;

    @InjectMocks
    private EthiopianPaymentController controller;

    @Test
    void shouldRejectMbirrCallbackWhenSignatureIsInvalid() {
        PaymentCallbackRequest callback = new PaymentCallbackRequest();
        callback.setTransactionId("txn-cb-1");
        callback.setStatus("SUCCESS");

        when(paymentService.verifyCallbackSignature("MBIRR", callback, "invalid")).thenReturn(false);

        ResponseEntity<?> response = controller.handleMbirrCallback(callback, "invalid");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        verify(paymentService, never()).processPaymentCallback("MBIRR", callback);
    }

    @Test
    void shouldProcessTelebirrCallbackWhenSignatureIsValid() {
        PaymentCallbackRequest callback = new PaymentCallbackRequest();
        callback.setTransactionId("txn-cb-2");
        callback.setStatus("SUCCESS");

        when(paymentService.verifyCallbackSignature("TELEBIRR", callback, "valid")).thenReturn(true);

        ResponseEntity<?> response = controller.handleTelebirrCallback(callback, "valid");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(paymentService).processPaymentCallback("TELEBIRR", callback);
    }
}
