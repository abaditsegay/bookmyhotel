package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.payment.PaymentCallbackRequest;
import com.bookmyhotel.dto.payment.PaymentInitiationResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentCallbackEvent;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.PaymentCallbackEventRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.service.payment.EthiopianMobilePaymentService;
import com.bookmyhotel.support.MySqlIntegrationTestSupport;

@Testcontainers
@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-booking-concurrency-test.sql"
})
@SuppressWarnings("removal")
class BookingPaymentCallbackIntegrationTest extends MySqlIntegrationTestSupport {

    @Container
    static final org.testcontainers.containers.MySQLContainer<?> MYSQL = MySqlIntegrationTestSupport.MYSQL;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EthiopianMobilePaymentService ethiopianPaymentService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PaymentCallbackEventRepository paymentCallbackEventRepository;

        @MockitoBean
    private EmailService emailService;

        @MockitoBean
    private BookingTokenService bookingTokenService;

        @MockitoBean
    private RoomTypePricingService roomTypePricingService;

        @MockitoBean
    private HotelPricingConfigService hotelPricingConfigService;

        @MockitoBean
    private HotelActivityAuditService hotelActivityAuditService;

        @MockitoBean
    private SystemSettingsService systemSettingsService;

        @MockitoSpyBean
    private EthiopianMobilePaymentService paymentServiceSpy;

    @BeforeEach
    void setup() {
        when(bookingTokenService.generateManagementUrl(anyLong(), anyString(), anyString()))
                .thenReturn("http://localhost:3000/manage/mock-token");
        when(roomTypePricingService.getBasePriceForRoomType(anyLong(), eq(RoomType.STANDARD)))
                .thenReturn(BigDecimal.valueOf(1500));
        when(hotelPricingConfigService.getActiveConfiguration(anyLong())).thenReturn(null);
        when(systemSettingsService.isRealPaymentGatewayEnabled()).thenReturn(true);
        doNothing().when(emailService).sendBookingConfirmationEmail(any(), anyString(), anyBoolean());
    }

    @Test
    void shouldPersistTelebirrBookingAndMarkReservationBookedWhenCallbackSucceeds() {
        Hotel hotel = createHotelWithSingleRoom(RoomType.STANDARD, "telebirr-success");
        doReturn(PaymentInitiationResponse.builder()
                .success(true)
                .transactionId("txn-telebirr-success")
                .paymentUrl("https://telebirr.test/pay/txn-telebirr-success")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .instructions("Complete payment in Telebirr")
                .paymentProvider("TELEBIRR")
                .build())
                .when(paymentServiceSpy)
                .initiateTelebirrPayment(any());

        BookingResponse bookingResponse = bookingService.createBookingByRoomType(
                buildTelebirrRequest(hotel.getId(), "guest-success@example.com", "+251900000011"),
                null);

        assertEquals("PENDING", bookingResponse.getStatus());
        assertEquals("PROCESSING", bookingResponse.getPaymentStatus());
        assertEquals("txn-telebirr-success", bookingResponse.getPaymentIntentId());
        assertEquals("txn-telebirr-success", bookingResponse.getPaymentReference());
        assertEquals("TELEBIRR", bookingResponse.getPaymentProvider());
        assertEquals("http://localhost:3000/manage/mock-token", bookingResponse.getManagementUrl());
        assertNotNull(bookingResponse.getConfirmationNumber());

        Reservation pendingReservation = reservationRepository.findByPaymentIntentId("txn-telebirr-success")
                .orElseThrow();
        assertEquals(ReservationStatus.PENDING, pendingReservation.getStatus());
        assertEquals(PaymentStatus.PROCESSING, pendingReservation.getPaymentStatus());

        long eventsBefore = paymentCallbackEventRepository.count();
        PaymentCallbackRequest callbackRequest = callback("txn-telebirr-success", "SUCCESS", "provider-success-1",
                "evt-telebirr-success");

        boolean processed = ethiopianPaymentService.processPaymentCallback("TELEBIRR", callbackRequest);

        assertTrue(processed);
        Reservation completedReservation = reservationRepository.findById(pendingReservation.getId()).orElseThrow();
        assertEquals(ReservationStatus.BOOKED, completedReservation.getStatus());
        assertEquals(PaymentStatus.COMPLETED, completedReservation.getPaymentStatus());
        assertEquals("txn-telebirr-success", completedReservation.getPaymentReference());

        assertEquals(eventsBefore + 1, paymentCallbackEventRepository.count());
        PaymentCallbackEvent callbackEvent = paymentCallbackEventRepository.findAll().stream()
                .filter(event -> "txn-telebirr-success".equals(event.getTransactionId()))
                .findFirst()
                .orElseThrow();
        assertEquals("SUCCESS", callbackEvent.getCallbackStatus());
    }

    @Test
    void shouldCancelReservationWhenTelebirrCallbackFails() {
        Hotel hotel = createHotelWithSingleRoom(RoomType.STANDARD, "telebirr-failed");
        doReturn(PaymentInitiationResponse.builder()
                .success(true)
                .transactionId("txn-telebirr-failed")
                .paymentUrl("https://telebirr.test/pay/txn-telebirr-failed")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .instructions("Complete payment in Telebirr")
                .paymentProvider("TELEBIRR")
                .build())
                .when(paymentServiceSpy)
                .initiateTelebirrPayment(any());

        bookingService.createBookingByRoomType(
                buildTelebirrRequest(hotel.getId(), "guest-failed@example.com", "+251900000022"),
                null);

        Reservation pendingReservation = reservationRepository.findByPaymentIntentId("txn-telebirr-failed")
                .orElseThrow();
        assertEquals(ReservationStatus.PENDING, pendingReservation.getStatus());
        assertEquals(PaymentStatus.PROCESSING, pendingReservation.getPaymentStatus());

        long eventsBefore = paymentCallbackEventRepository.count();
        PaymentCallbackRequest callbackRequest = callback("txn-telebirr-failed", "FAILED", "provider-failed-1",
                "evt-telebirr-failed");

        boolean processed = ethiopianPaymentService.processPaymentCallback("TELEBIRR", callbackRequest);

        assertTrue(processed);
        Reservation failedReservation = reservationRepository.findById(pendingReservation.getId()).orElseThrow();
        assertEquals(ReservationStatus.CANCELLED, failedReservation.getStatus());
        assertEquals(PaymentStatus.FAILED, failedReservation.getPaymentStatus());
        assertEquals("txn-telebirr-failed", failedReservation.getPaymentReference());
        assertEquals(eventsBefore + 1, paymentCallbackEventRepository.count());
    }

    @Test
    void shouldIgnoreDuplicateTelebirrCallbackAfterFirstSuccessfulProcessing() {
        Hotel hotel = createHotelWithSingleRoom(RoomType.STANDARD, "telebirr-dup");
        doReturn(PaymentInitiationResponse.builder()
                .success(true)
                .transactionId("txn-telebirr-duplicate")
                .paymentUrl("https://telebirr.test/pay/txn-telebirr-duplicate")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .instructions("Complete payment in Telebirr")
                .paymentProvider("TELEBIRR")
                .build())
                .when(paymentServiceSpy)
                .initiateTelebirrPayment(any());

        bookingService.createBookingByRoomType(
                buildTelebirrRequest(hotel.getId(), "guest-dup@example.com", "+251900000033"),
                null);

        Reservation pendingReservation = reservationRepository.findByPaymentIntentId("txn-telebirr-duplicate")
                .orElseThrow();
        PaymentCallbackRequest callbackRequest = callback(
                "txn-telebirr-duplicate",
                "SUCCESS",
                "provider-dup-1",
                "evt-telebirr-dup");

        boolean firstProcessed = ethiopianPaymentService.processPaymentCallback("TELEBIRR", callbackRequest);
        long eventCountAfterFirstCallback = paymentCallbackEventRepository.count();

        boolean secondProcessed = ethiopianPaymentService.processPaymentCallback("TELEBIRR", callbackRequest);

        assertTrue(firstProcessed);
        assertTrue(secondProcessed);
        Reservation completedReservation = reservationRepository.findById(pendingReservation.getId()).orElseThrow();
        assertEquals(ReservationStatus.BOOKED, completedReservation.getStatus());
        assertEquals(PaymentStatus.COMPLETED, completedReservation.getPaymentStatus());
        assertEquals(eventCountAfterFirstCallback, paymentCallbackEventRepository.count());
    }

    private Hotel createHotelWithSingleRoom(RoomType roomType, String suffix) {
        String tenantToken = UUID.randomUUID().toString().substring(0, 8);
        Tenant tenant = new Tenant();
        tenant.setId("tenant-" + suffix + "-" + tenantToken);
        tenant.setName("Tenant " + suffix);
        tenant.setSubdomain("tenant-" + suffix + "-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Payment Test Hotel " + suffix);
        hotel.setAddress("Addis Ababa");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251911000000");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(true);
        hotel = hotelRepository.save(hotel);

        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber("101-" + suffix.substring(0, Math.min(4, suffix.length())));
        room.setRoomType(roomType);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);
        room.setCapacity(2);
        room.setPricePerNight(BigDecimal.valueOf(1500));
        roomRepository.save(room);

        return hotel;
    }

    private BookingRequest buildTelebirrRequest(Long hotelId, String email, String phone) {
        BookingRequest request = new BookingRequest();
        request.setHotelId(hotelId);
        request.setRoomType(RoomType.STANDARD);
        request.setCheckInDate(LocalDate.now().plusDays(5));
        request.setCheckOutDate(LocalDate.now().plusDays(7));
        request.setGuests(2);
        request.setGuestName("Guest User");
        request.setGuestEmail(email);
        request.setGuestPhone(phone);
        request.setMobileNumber(phone);
        request.setPaymentMethodId("telebirr");
        request.setSpecialRequests("Late arrival");
        return request;
    }

    private PaymentCallbackRequest callback(String transactionId, String status, String providerTransactionId,
            String eventId) {
        PaymentCallbackRequest callbackRequest = new PaymentCallbackRequest();
        callbackRequest.setTransactionId(transactionId);
        callbackRequest.setStatus(status);
        callbackRequest.setProviderTransactionId(providerTransactionId);
        callbackRequest.setEventId(eventId);
        return callbackRequest;
    }
}