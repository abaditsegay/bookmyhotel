package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.dto.BookingModificationResponse;
import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.payment.PaymentInitiationResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.BookingException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.payment.EthiopianMobilePaymentService;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomCacheService roomCacheService;

    @Mock
    private SystemSettingsService systemSettingsService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingNotificationService notificationService;

    @Mock
    private BookingChangeNotificationService bookingChangeNotificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private HotelPricingConfigService hotelPricingConfigService;

    @Mock
    private PdfService pdfService;

    @Mock
    private BookingTokenService bookingTokenService;

    @Mock
    private EthiopianMobilePaymentService ethiopianPaymentService;

    @Mock
    private RoomTypePricingService roomTypePricingService;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "frontendUrl", "http://frontend.test");
    }

    @Test
    void createBookingByRoomTypeShouldCreateAnonymousBookingAndManagementUrl() {
        BookingRequest request = anonymousRequest();
        Hotel hotel = hotel(1L, "Grand Plaza");
        stubAnonymousBookingHappyPath(request, hotel, 42L, new BigDecimal("100.00"));
        when(bookingTokenService.generateManagementUrl(42L, "guest@example.com", "http://frontend.test"))
                .thenReturn("http://frontend.test/manage/token-42");

        BookingResponse response = bookingService.createBookingByRoomType(request, null);

        assertEquals(42L, response.getReservationId());
        assertEquals("BOOKED", response.getStatus());
        assertEquals("BK00000042", response.getConfirmationNumber());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals(new BigDecimal("200.00"), response.getTotalAmount());
        assertEquals("STANDARD", response.getRoomType());
        assertEquals("To be assigned", response.getRoomNumber());
        assertEquals("http://frontend.test/manage/token-42", response.getManagementUrl());
        verify(bookingTokenService).generateManagementUrl(42L, "guest@example.com", "http://frontend.test");
        verify(emailService).sendBookingConfirmationEmail(any(BookingResponse.class), eq("guest@example.com"), eq(true));
    }

    @Test
    void createBookingByRoomTypeShouldUseAuthenticatedUserAndMockPaymentTransaction() {
        BookingRequest request = baseRequest();
        request.setPaymentMethodId("mock_payment_processed");
        request.setTransactionId("txn-123");

        Hotel hotel = hotel(1L, "Grand Plaza");
        User user = user("user@example.com", "Test", "User", "+251911000000");

        when(hotelRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.hasAvailableRoomsOfType(1L, RoomType.STANDARD, request.getCheckInDate(), request.getCheckOutDate()))
                .thenReturn(true);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(roomTypePricingService.getBasePriceForRoomType(1L, RoomType.STANDARD)).thenReturn(new BigDecimal("150.00"));
        when(hotelPricingConfigService.getActiveConfiguration(1L)).thenReturn(null);
        stubReservationSave(43L);

        BookingResponse response = bookingService.createBookingByRoomType(request, "user@example.com");

        assertEquals(43L, response.getReservationId());
        assertEquals("BOOKED", response.getStatus());
        assertEquals("COMPLETED", response.getPaymentStatus());
        assertEquals("txn-123", response.getPaymentIntentId());
        assertEquals("Test User", response.getGuestName());
        assertEquals("user@example.com", response.getGuestEmail());
        assertNull(response.getManagementUrl());
        verify(bookingTokenService, never()).generateManagementUrl(any(), any(), any());
        verify(emailService).sendBookingConfirmationEmail(any(BookingResponse.class), eq("user@example.com"), eq(true));
    }

    @Test
    void createBookingByRoomTypeShouldMarkBookingFailedWhenTelebirrInitiationFails() {
        BookingRequest request = anonymousRequest();
        request.setPaymentMethodId("telebirr");
        request.setMobileNumber("0911000000");

        Hotel hotel = hotel(1L, "Grand Plaza");
        stubAnonymousBookingHappyPath(request, hotel, 44L, new BigDecimal("120.00"));
        when(systemSettingsService.isRealPaymentGatewayEnabled()).thenReturn(true);
        when(ethiopianPaymentService.initiateTelebirrPayment(any()))
                .thenReturn(PaymentInitiationResponse.builder().success(false).errorMessage("gateway unavailable").build());
        when(bookingTokenService.generateManagementUrl(44L, "guest@example.com", "http://frontend.test"))
                .thenReturn("http://frontend.test/manage/token-44");

        BookingResponse response = bookingService.createBookingByRoomType(request, null);

        assertEquals(44L, response.getReservationId());
        assertEquals("PENDING", response.getStatus());
        assertEquals("FAILED", response.getPaymentStatus());
        assertNull(response.getPaymentIntentId());
        assertEquals("http://frontend.test/manage/token-44", response.getManagementUrl());
        verify(emailService).sendBookingConfirmationEmail(any(BookingResponse.class), eq("guest@example.com"), eq(true));
    }

    @Test
    void createBookingByRoomTypeShouldRejectAnonymousOverlapBeforeHotelLookup() {
        BookingRequest request = anonymousRequest();
        Reservation existing = new Reservation();
        existing.setConfirmationNumber("BK00000001");
        existing.setCheckInDate(request.getCheckInDate());
        existing.setCheckOutDate(request.getCheckOutDate());
        when(reservationRepository.findOverlappingActiveReservations(
                "guest@example.com",
                request.getCheckInDate(),
                request.getCheckOutDate())).thenReturn(List.of(existing));

        BookingException exception = assertThrows(BookingException.class,
                () -> bookingService.createBookingByRoomType(request, null));

        assertEquals(true, exception.getMessage().contains("You already have a booked reservation"));
        verify(hotelRepository, never()).findByIdForUpdate(any());
    }

    @Test
    void createBookingByRoomTypeShouldKeepWalkInWithSpecificRoomCheckedIn() {
        BookingRequest request = anonymousRequest();
        request.setRoomId(10L);
        request.setPaymentMethodId("pay_at_frontdesk");

        Hotel hotel = hotel(1L, "Grand Plaza");
        Room room = room(10L, hotel, RoomType.STANDARD, "101");

        stubAnonymousBookingHappyPath(request, hotel, 45L, new BigDecimal("100.00"));
        when(roomRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(room));
        when(roomRepository.isRoomAvailable(10L, request.getCheckInDate(), request.getCheckOutDate())).thenReturn(true);
        when(roomRepository.save(room)).thenReturn(room);
        when(bookingTokenService.generateManagementUrl(45L, "guest@example.com", "http://frontend.test"))
                .thenReturn("http://frontend.test/manage/token-45");

        BookingResponse response = bookingService.createBookingByRoomType(request, null);

        assertEquals(45L, response.getReservationId());
        assertEquals("CHECKED_IN", response.getStatus());
        assertEquals("PENDING", response.getPaymentStatus());
        assertEquals("101", response.getRoomNumber());
        assertEquals(RoomStatus.OCCUPIED, room.getStatus());
        assertEquals(false, room.getIsAvailable());
    }

    @Test
    void createBookingByRoomTypeShouldRejectSameDayStay() {
        BookingRequest request = anonymousRequest();
        request.setCheckOutDate(request.getCheckInDate());

        BookingException exception = assertThrows(BookingException.class,
                () -> bookingService.createBookingByRoomType(request, null));

        assertEquals("Check-out date must be after check-in date", exception.getMessage());
        verify(hotelRepository, never()).findByIdForUpdate(any());
    }

        @Test
        void cancelCustomerBookingShouldMarkCompletedPaymentAsRefundPendingWhenRefundIsDue() {
        Reservation reservation = cancellableReservation(99L,
            LocalDate.now(ZoneId.of("Africa/Addis_Ababa")).plusDays(10),
            PaymentStatus.COMPLETED);

        when(reservationRepository.findById(99L)).thenReturn(Optional.of(reservation));
        when(hotelPricingConfigService.getActiveConfiguration(1L)).thenReturn(null);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingModificationResponse response = bookingService.cancelCustomerBooking(99L, "Change of plans",
            "guest@example.com");

        assertEquals(true, response.isSuccess());
        assertEquals(PaymentStatus.REFUND_PENDING.name(), response.getUpdatedBooking().getPaymentStatus());
        }

        @Test
        void cancelCustomerBookingShouldMarkCompletedPaymentAsForfeitedWhenNoRefundIsDue() {
        Reservation reservation = cancellableReservation(100L,
            LocalDate.now(ZoneId.of("Africa/Addis_Ababa")),
            PaymentStatus.COMPLETED);

        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(hotelPricingConfigService.getActiveConfiguration(1L)).thenReturn(null);
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingModificationResponse response = bookingService.cancelCustomerBooking(100L, "Same day cancellation",
            "guest@example.com");

        assertEquals(true, response.isSuccess());
        assertEquals(PaymentStatus.FORFEITED.name(), response.getUpdatedBooking().getPaymentStatus());
        }

    private void stubAnonymousBookingHappyPath(BookingRequest request, Hotel hotel, Long reservationId, BigDecimal basePrice) {
        when(reservationRepository.findOverlappingActiveReservations(
                request.getGuestEmail(),
                request.getCheckInDate(),
                request.getCheckOutDate())).thenReturn(List.of());
        when(hotelRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(hotel));
        when(roomRepository.hasAvailableRoomsOfType(1L, RoomType.STANDARD, request.getCheckInDate(), request.getCheckOutDate()))
                .thenReturn(true);
        when(roomTypePricingService.getBasePriceForRoomType(1L, RoomType.STANDARD)).thenReturn(basePrice);
        when(hotelPricingConfigService.getActiveConfiguration(1L)).thenReturn(null);
        stubReservationSave(reservationId);
    }

    private void stubReservationSave(Long reservationId) {
        AtomicLong saveCount = new AtomicLong();
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation reservation = invocation.getArgument(0);
            if (reservation.getId() == null) {
                reservation.setId(reservationId);
            }
            if (reservation.getCreatedAt() == null) {
                reservation.setCreatedAt(LocalDateTime.of(2026, 5, 11, 12, 0));
            }
            reservation.setUpdatedAt(LocalDateTime.of(2026, 5, 11, 12, 0).plusSeconds(saveCount.incrementAndGet()));
            return reservation;
        });
    }

    private BookingRequest anonymousRequest() {
        BookingRequest request = baseRequest();
        request.setGuestName("Guest Name");
        request.setGuestEmail("guest@example.com");
        request.setGuestPhone("0911223344");
        return request;
    }

    private BookingRequest baseRequest() {
        BookingRequest request = new BookingRequest();
        request.setHotelId(1L);
        request.setRoomType(RoomType.STANDARD);
        request.setCheckInDate(LocalDate.of(2026, 6, 15));
        request.setCheckOutDate(LocalDate.of(2026, 6, 17));
        request.setGuests(2);
        request.setSpecialRequests("Late arrival");
        return request;
    }

    private Hotel hotel(Long id, String name) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName(name);
        hotel.setAddress("Bole Road");
        return hotel;
    }

    private Room room(Long id, Hotel hotel, RoomType roomType, String roomNumber) {
        Room room = new Room();
        room.setId(id);
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setRoomNumber(roomNumber);
        room.setPricePerNight(new BigDecimal("100.00"));
        room.setCapacity(2);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);
        return room;
    }

    private User user(String email, String firstName, String lastName, String phone) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        return user;
    }

    private Reservation cancellableReservation(Long id, LocalDate checkInDate, PaymentStatus paymentStatus) {
        Reservation reservation = new Reservation();
        reservation.setId(id);
        reservation.setHotel(hotel(1L, "Grand Plaza"));
        reservation.setGuest(user("guest@example.com", "Guest", "User", "+251911000001"));
        reservation.setCheckInDate(checkInDate);
        reservation.setCheckOutDate(checkInDate.plusDays(2));
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("100.00"));
        reservation.setTotalAmount(new BigDecimal("200.00"));
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setPaymentStatus(paymentStatus);
        reservation.setConfirmationNumber("BK00000099");
        return reservation;
    }
}