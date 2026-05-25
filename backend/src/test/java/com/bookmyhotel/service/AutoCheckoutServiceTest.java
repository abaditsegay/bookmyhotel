package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;

@ExtendWith(MockitoExtension.class)
class AutoCheckoutServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private AutoCheckoutService autoCheckoutService;

    @Test
    void autoCheckoutExpiredReservationsShouldUpdateReservationsAndRooms() {
        Reservation first = reservation("CONF-1", "Needs towels", true);
        Reservation second = reservation("CONF-2", null, false);
        when(reservationRepository.findExpiredCheckedInReservations(any(LocalDate.class))).thenReturn(List.of(first, second));

        autoCheckoutService.autoCheckoutExpiredReservations();

        assertEquals(ReservationStatus.CHECKED_OUT, first.getStatus());
        assertNotNull(first.getActualCheckOutTime());
        assertTrue(first.getSpecialRequests().contains("Automatically checked out - checkout date passed"));
        assertEquals(RoomStatus.MAINTENANCE, first.getRoom().getStatus());

        assertEquals(ReservationStatus.CHECKED_OUT, second.getStatus());
        assertNotNull(second.getActualCheckOutTime());
        assertEquals("Automatically checked out - checkout date passed", second.getSpecialRequests());

        verify(roomRepository).save(first.getRoom());
        verify(reservationRepository).save(first);
        verify(reservationRepository).save(second);
    }

    @Test
    void autoCheckoutExpiredReservationsShouldContinueWhenSingleReservationFails() {
        Reservation failing = reservation("CONF-FAIL", null, true);
        Reservation succeeding = reservation("CONF-OK", null, false);
        when(reservationRepository.findExpiredCheckedInReservations(any(LocalDate.class))).thenReturn(List.of(failing, succeeding));
        doThrow(new RuntimeException("db error")).when(reservationRepository).save(failing);

        autoCheckoutService.autoCheckoutExpiredReservations();

        assertEquals(ReservationStatus.CHECKED_OUT, failing.getStatus());
        assertEquals(ReservationStatus.CHECKED_OUT, succeeding.getStatus());
        verify(reservationRepository).save(failing);
        verify(reservationRepository).save(succeeding);
    }

    @Test
    void autoCheckoutExpiredReservationsShouldSwallowFetchFailures() {
        when(reservationRepository.findExpiredCheckedInReservations(any(LocalDate.class)))
                .thenThrow(new RuntimeException("query failed"));

        autoCheckoutService.autoCheckoutExpiredReservations();

        verify(reservationRepository, never()).save(any(Reservation.class));
        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void manualAutoCheckoutShouldReturnSuccessfulCount() {
        Reservation first = reservation("CONF-1", null, true);
        Reservation second = reservation("CONF-2", "Late checkout requested", false);
        when(reservationRepository.findExpiredCheckedInReservations(any(LocalDate.class))).thenReturn(List.of(first, second));

        int checkedOutCount = autoCheckoutService.manualAutoCheckout();

        assertEquals(2, checkedOutCount);
        assertEquals("Manually triggered automatic checkout - checkout date passed", first.getSpecialRequests());
        assertTrue(second.getSpecialRequests().contains("Manually triggered automatic checkout - checkout date passed"));
        assertEquals(RoomStatus.MAINTENANCE, first.getRoom().getStatus());
        verify(roomRepository).save(first.getRoom());
    }

    @Test
    void manualAutoCheckoutShouldSkipFailedReservationAndCountOnlySuccesses() {
        Reservation failing = reservation("CONF-FAIL", null, true);
        Reservation succeeding = reservation("CONF-OK", null, false);
        when(reservationRepository.findExpiredCheckedInReservations(any(LocalDate.class))).thenReturn(List.of(failing, succeeding));
        doThrow(new RuntimeException("db error")).when(reservationRepository).save(failing);

        int checkedOutCount = autoCheckoutService.manualAutoCheckout();

        assertEquals(1, checkedOutCount);
        verify(reservationRepository).save(failing);
        verify(reservationRepository).save(succeeding);
    }

    private Reservation reservation(String confirmationNumber, String specialRequests, boolean withRoom) {
        Reservation reservation = new Reservation();
        reservation.setConfirmationNumber(confirmationNumber);
        reservation.setCheckInDate(LocalDate.now().minusDays(2));
        reservation.setCheckOutDate(LocalDate.now().minusDays(1));
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(BigDecimal.TEN);
        reservation.setTotalAmount(BigDecimal.TEN);
        reservation.setNumberOfGuests(1);
        reservation.setSpecialRequests(specialRequests);

        if (withRoom) {
            Room room = new Room();
            room.setRoomNumber("101");
            room.setRoomType(RoomType.STANDARD);
            room.setPricePerNight(BigDecimal.TEN);
            room.setCapacity(1);
            room.setStatus(RoomStatus.AVAILABLE);
            reservation.setRoom(room);
        }

        return reservation;
    }
}