package com.bookmyhotel.service.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.dto.payment.PaymentCallbackRequest;
import com.bookmyhotel.entity.PaymentCallbackEvent;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.repository.PaymentCallbackEventRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.service.HotelActivityAuditService;

@ExtendWith(MockitoExtension.class)
class EthiopianMobilePaymentServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PaymentCallbackEventRepository paymentCallbackEventRepository;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    private EthiopianMobilePaymentService service;

    @BeforeEach
    void setUp() {
        service = new EthiopianMobilePaymentService(reservationRepository, paymentCallbackEventRepository,
                hotelActivityAuditService);
        ReflectionTestUtils.setField(service, "callbackMaxSkewSeconds", 300L);
    }

    @Test
    void shouldIgnoreCallbackWhenIdempotencyKeyAlreadyExists() {
        PaymentCallbackRequest callback = callback("txn-1", "SUCCESS");
        when(paymentCallbackEventRepository.existsByIdempotencyKey(any())).thenReturn(true);

        boolean processed = service.processPaymentCallback("MBIRR", callback);

        assertTrue(processed);
        verify(reservationRepository, never()).findByPaymentIntentIdForUpdate(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void shouldIgnoreCallbackOnUniqueConstraintRace() {
        PaymentCallbackRequest callback = callback("txn-2", "SUCCESS");
        when(paymentCallbackEventRepository.existsByIdempotencyKey(any())).thenReturn(false);
        when(paymentCallbackEventRepository.save(any(PaymentCallbackEvent.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate"));

        boolean processed = service.processPaymentCallback("MBIRR", callback);

        assertTrue(processed);
        verify(reservationRepository, never()).findByPaymentIntentIdForUpdate(any());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void shouldMarkReservationBookedWhenCallbackIsSuccessful() {
        PaymentCallbackRequest callback = callback("txn-3", "SUCCESS");
        callback.setProviderTransactionId("provider-ref-1");

        Hotel hotel = new Hotel();
        hotel.setId(1L);
        Reservation reservation = new Reservation();
        reservation.setId(33L);
        reservation.setHotel(hotel);
        reservation.setPaymentIntentId("txn-3");
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setPaymentStatus(PaymentStatus.PENDING);

        when(paymentCallbackEventRepository.existsByIdempotencyKey(any())).thenReturn(false);
        when(reservationRepository.findByPaymentIntentIdForUpdate("txn-3")).thenReturn(Optional.of(reservation));

        boolean processed = service.processPaymentCallback("TELEBIRR", callback);

        assertTrue(processed);
        assertEquals(PaymentStatus.COMPLETED, reservation.getPaymentStatus());
        assertEquals(ReservationStatus.BOOKED, reservation.getStatus());
        assertEquals("provider-ref-1", reservation.getPaymentReference());
        verify(reservationRepository).save(reservation);
        verify(hotelActivityAuditService).logActivity(
            eq(hotel),
            eq("PAYMENT"),
            eq(33L),
            eq("PAYMENT_CALLBACK"),
            any(),
            any(),
            any(),
            eq("Processed TELEBIRR payment callback"),
            eq(true),
            eq("FINANCIAL"));
    }

    @Test
    void shouldCancelPendingReservationWhenCallbackFails() {
        PaymentCallbackRequest callback = callback("txn-4", "FAILED");

        Reservation reservation = new Reservation();
        reservation.setPaymentIntentId("txn-4");
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setPaymentStatus(PaymentStatus.PROCESSING);

        when(paymentCallbackEventRepository.existsByIdempotencyKey(any())).thenReturn(false);
        when(reservationRepository.findByPaymentIntentIdForUpdate("txn-4")).thenReturn(Optional.of(reservation));

        boolean processed = service.processPaymentCallback("MBIRR", callback);

        assertTrue(processed);
        assertEquals(PaymentStatus.FAILED, reservation.getPaymentStatus());
        assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
        verify(reservationRepository).save(reservation);
    }

    @Test
    void shouldNotPersistReservationAgainWhenStatusAlreadyApplied() {
        PaymentCallbackRequest callback = callback("txn-5", "SUCCESS");

        Reservation reservation = new Reservation();
        reservation.setPaymentIntentId("txn-5");
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setPaymentStatus(PaymentStatus.COMPLETED);

        when(paymentCallbackEventRepository.existsByIdempotencyKey(any())).thenReturn(false);
        when(reservationRepository.findByPaymentIntentIdForUpdate("txn-5")).thenReturn(Optional.of(reservation));

        boolean processed = service.processPaymentCallback("MBIRR", callback);

        assertTrue(processed);
        verify(reservationRepository, never()).save(any(Reservation.class));
    }

    @Test
    void shouldPersistCallbackEventMetadata() {
        PaymentCallbackRequest callback = callback("txn-6", "PROCESSING");
        callback.setEventId("evt-6");
        callback.setProviderTransactionId("provider-6");

        Reservation reservation = new Reservation();
        reservation.setPaymentIntentId("txn-6");
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setPaymentStatus(PaymentStatus.PENDING);

        when(paymentCallbackEventRepository.existsByIdempotencyKey(any())).thenReturn(false);
        when(reservationRepository.findByPaymentIntentIdForUpdate("txn-6")).thenReturn(Optional.of(reservation));

        service.processPaymentCallback("MBIRR", callback);

        ArgumentCaptor<PaymentCallbackEvent> captor = ArgumentCaptor.forClass(PaymentCallbackEvent.class);
        verify(paymentCallbackEventRepository).save(captor.capture());
        PaymentCallbackEvent saved = captor.getValue();
        assertEquals("MBIRR", saved.getProvider());
        assertEquals("txn-6", saved.getTransactionId());
        assertEquals("evt-6", saved.getEventId());
        assertEquals("provider-6", saved.getProviderTransactionId());
        assertEquals("PROCESSING", saved.getCallbackStatus());
    }

    @Test
    void shouldVerifyMbirrCallbackSignatureUsingRawPayload() throws Exception {
        ReflectionTestUtils.setField(service, "mbirrWebhookSecret", "mbirr-secret");

        PaymentCallbackRequest callback = callback("txn-7", "SUCCESS");
        callback.setRawPayload("{\"transactionId\":\"txn-7\",\"status\":\"SUCCESS\"}");

        String signature = hmac(callback.getRawPayload(), "mbirr-secret");

        boolean verified = service.verifyCallbackSignature("MBIRR", callback, signature);

        assertTrue(verified);
    }

    @Test
    void shouldRejectInvalidTelebirrCallbackSignature() {
        ReflectionTestUtils.setField(service, "telebirrWebhookSecret", "tele-secret");

        PaymentCallbackRequest callback = callback("txn-8", "FAILED");

        boolean verified = service.verifyCallbackSignature("TELEBIRR", callback, "deadbeef");

        assertEquals(false, verified);
    }

    @Test
    void shouldRejectStaleCallbackSignatureEvenWhenHmacMatches() throws Exception {
        ReflectionTestUtils.setField(service, "mbirrWebhookSecret", "mbirr-secret");
        ReflectionTestUtils.setField(service, "callbackMaxSkewSeconds", 60L);

        PaymentCallbackRequest callback = callback("txn-9", "SUCCESS");
        long staleSeconds = (System.currentTimeMillis() / 1000L) - 3600L;
        callback.setCallbackTimestamp(staleSeconds);

        String signature = hmac(payloadFrom(callback), "mbirr-secret");

        boolean verified = service.verifyCallbackSignature("MBIRR", callback, signature);

        assertEquals(false, verified);
    }

    private PaymentCallbackRequest callback(String transactionId, String status) {
        PaymentCallbackRequest callback = new PaymentCallbackRequest();
        callback.setTransactionId(transactionId);
        callback.setStatus(status);
        callback.setCallbackTimestamp(System.currentTimeMillis() / 1000L);
        return callback;
    }

    private String payloadFrom(PaymentCallbackRequest callback) {
        if (callback.getRawPayload() != null && !callback.getRawPayload().isBlank()) {
            return callback.getRawPayload();
        }

        return String.join("|",
                callback.getTransactionId() != null ? callback.getTransactionId() : "",
                callback.getStatus() != null ? callback.getStatus() : "",
                callback.getProviderTransactionId() != null ? callback.getProviderTransactionId() : "",
                callback.getEventId() != null ? callback.getEventId() : "",
                callback.getNonce() != null ? callback.getNonce() : "",
                callback.getCallbackTimestamp() != null ? callback.getCallbackTimestamp().toString() : "");
    }

    private String hmac(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte value : bytes) {
            sb.append(String.format("%02x", value));
        }
        return sb.toString();
    }
}
