package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
import org.springframework.mock.web.MockHttpServletRequest;

import com.bookmyhotel.dto.payment.PaymentCallbackRequest;
import com.bookmyhotel.dto.payment.PaymentInitiationRequest;
import com.bookmyhotel.exception.ErrorResponse;
import com.bookmyhotel.exception.PaymentException;
import com.bookmyhotel.service.payment.EthiopianMobilePaymentService;

@ExtendWith(MockitoExtension.class)
class EthiopianPaymentControllerTest {

    @Mock
    private EthiopianMobilePaymentService paymentService;

    @InjectMocks
    private EthiopianPaymentController controller;

        @Test
        void shouldPropagatePaymentExceptionDuringMbirrInitiation() {
        PaymentInitiationRequest request = new PaymentInitiationRequest();
        request.setAmount(java.math.BigDecimal.valueOf(100));
        request.setBookingReference("BOOK-123");

        when(paymentService.initiateMbirrPayment(request))
            .thenThrow(new PaymentException("M-birr payment gateway is not configured"));

        PaymentException exception = org.junit.jupiter.api.Assertions.assertThrows(
            PaymentException.class,
            () -> controller.initiateMbirrPayment(request, requestFor("/api/payments/ethiopian/mbirr/initiate")));

        assertInstanceOf(PaymentException.class, exception);
        assertEquals("M-birr payment gateway is not configured", exception.getMessage());
        }

    @Test
    void shouldRejectMbirrCallbackWhenSignatureIsInvalid() {
        PaymentCallbackRequest callback = new PaymentCallbackRequest();
        callback.setTransactionId("txn-cb-1");
        callback.setStatus("SUCCESS");

        when(paymentService.verifyCallbackSignature("MBIRR", callback, "invalid")).thenReturn(false);

        ResponseEntity<?> response = controller.handleMbirrCallback(
            callback,
            requestFor("/api/payments/ethiopian/callback/mbirr"),
            "invalid");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        ErrorResponse errorResponse = assertInstanceOf(ErrorResponse.class, response.getBody());
        assertEquals("Invalid Callback Signature", errorResponse.getError());
        assertEquals("/api/payments/ethiopian/callback/mbirr", errorResponse.getPath());
        verify(paymentService, never()).processPaymentCallback("MBIRR", callback);
    }

    @Test
    void shouldProcessTelebirrCallbackWhenSignatureIsValid() {
        PaymentCallbackRequest callback = new PaymentCallbackRequest();
        callback.setTransactionId("txn-cb-2");
        callback.setStatus("SUCCESS");

        when(paymentService.verifyCallbackSignature("TELEBIRR", callback, "valid")).thenReturn(true);

        ResponseEntity<?> response = controller.handleTelebirrCallback(
                callback,
                requestFor("/api/payments/ethiopian/callback/telebirr"),
                "valid");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(paymentService).processPaymentCallback("TELEBIRR", callback);
    }

    @Test
    void shouldReturnStructuredErrorWhenMbirrAmountIsTooLow() {
        PaymentInitiationRequest request = new PaymentInitiationRequest();
        request.setAmount(java.math.BigDecimal.valueOf(5));
        request.setBookingReference("BOOK-LOW");

        ResponseEntity<?> response = controller.initiateMbirrPayment(
                request,
                requestFor("/api/payments/ethiopian/mbirr/initiate"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse errorResponse = assertInstanceOf(ErrorResponse.class, response.getBody());
        assertEquals("Invalid Payment Amount", errorResponse.getError());
        assertEquals("Minimum payment amount is 10 ETB", errorResponse.getDetails());
        assertNotNull(errorResponse.getUserFriendlyMessage());
    }

    private MockHttpServletRequest requestFor(String path) {
        return new MockHttpServletRequest("POST", path);
    }
}
