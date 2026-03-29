package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class FrontDeskServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomCacheService roomCacheService;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelService hotelService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CheckoutReceiptService checkoutReceiptService;

    @Mock
    private BookingService bookingService;

    @Mock
    private BookingStatusUpdateService bookingStatusUpdateService;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private FrontDeskService frontDeskService;

    @Test
    void shouldAuditPaymentStatusUpdate() {
        Hotel hotel = new Hotel();
        hotel.setId(13L);

        Reservation reservation = new Reservation();
        reservation.setId(501L);
        reservation.setHotel(hotel);
        reservation.setPaymentStatus(PaymentStatus.PENDING);

        BookingResponse bookingResponse = new BookingResponse();
        bookingResponse.setReservationId(501L);

        when(reservationRepository.findById(501L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(bookingService.convertToBookingResponse(reservation)).thenReturn(bookingResponse);
        BookingResponse response = frontDeskService.updateBookingPaymentStatus(501L, "COMPLETED");

        assertEquals(501L, response.getReservationId());
        assertEquals(PaymentStatus.COMPLETED, reservation.getPaymentStatus());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq("RESERVATION"),
                eq(501L),
                eq("PAYMENT_STATUS_CHANGE"),
                any(),
                any(),
                any(),
                eq("Front desk updated payment status"),
                eq(true),
                eq("FINANCIAL"));
    }
}