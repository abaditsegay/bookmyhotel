package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.repository.ReservationRepository;

@ExtendWith(MockitoExtension.class)
class SystemAnalyticsServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private SystemAnalyticsService systemAnalyticsService;

    @Test
    void getOverviewShouldAggregateBookingsRevenueAndStatuses() {
        Reservation completedCurrentMonth = reservation(1L, ReservationStatus.BOOKED, PaymentStatus.COMPLETED,
                new BigDecimal("2500.00"), LocalDateTime.now().minusDays(2));
        Reservation checkedInCurrentMonth = reservation(2L, ReservationStatus.CHECKED_IN, PaymentStatus.PENDING,
                new BigDecimal("1800.00"), LocalDateTime.now().minusDays(1));
        Reservation completedPreviousMonth = reservation(3L, ReservationStatus.CHECKED_OUT, PaymentStatus.COMPLETED,
                new BigDecimal("3200.00"), LocalDateTime.now().minusMonths(1));

        when(reservationRepository.findAll())
                .thenReturn(List.of(completedCurrentMonth, checkedInCurrentMonth, completedPreviousMonth));

        SystemAnalyticsService.SystemAnalyticsOverview overview = systemAnalyticsService.getOverview();

        assertEquals(3L, overview.getTotalBookings());
        assertEquals(2L, overview.getActiveBookings());
        assertEquals(2L, overview.getCompletedPayments());
        assertEquals(2L, overview.getCurrentMonthBookings());
        assertEquals(new BigDecimal("2500.00"), overview.getCurrentMonthRevenue());
        assertEquals(new BigDecimal("5700.00"), overview.getCurrentYearRevenue());
        assertEquals(1L, overview.getReservationStatusBreakdown().get("BOOKED"));
        assertEquals(1L, overview.getReservationStatusBreakdown().get("CHECKED_IN"));
        assertEquals(1L, overview.getReservationStatusBreakdown().get("CHECKED_OUT"));
        assertEquals(2L, overview.getPaymentStatusBreakdown().get("COMPLETED"));
        assertEquals(1L, overview.getPaymentStatusBreakdown().get("PENDING"));
    }

    private Reservation reservation(Long id, ReservationStatus status, PaymentStatus paymentStatus,
            BigDecimal totalAmount, LocalDateTime createdAt) {
        Hotel hotel = new Hotel();
        hotel.setId(1L);
        hotel.setName("Analytics Hotel");

        Reservation reservation = new Reservation();
        reservation.setId(id);
        reservation.setHotel(hotel);
        reservation.setStatus(status);
        reservation.setPaymentStatus(paymentStatus);
        reservation.setTotalAmount(totalAmount);
        reservation.setCreatedAt(createdAt);
        reservation.setCheckInDate(LocalDate.now());
        reservation.setCheckOutDate(LocalDate.now().plusDays(1));
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(totalAmount);
        reservation.setGuestInfo(new GuestInfo("Analytics Guest", "analytics@example.com", "+251900000001"));
        reservation.setNumberOfGuests(1);
        reservation.setConfirmationNumber("BK-" + id);
        return reservation;
    }
}