package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class BookingStatusUpdateServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BookingChangeNotificationService bookingChangeNotificationService;

    @Mock
    private AutomatedRoomStatusService automatedRoomStatusService;

    @Mock
    private RoomCacheService roomCacheService;

    @InjectMocks
    private BookingStatusUpdateService bookingStatusUpdateService;

    @Test
    void updateBookingStatusShouldCheckInReservationAndOccupyRoom() {
        Reservation reservation = reservationWithAssignedRoom(1L);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(userRepository.findById(10L)).thenReturn(Optional.of(guestUser()));

        BookingResponse response = bookingStatusUpdateService.updateBookingStatus(1L, ReservationStatus.CHECKED_IN, "front desk");

        assertEquals("CHECKED_IN", response.getStatus());
        assertEquals(RoomStatus.OCCUPIED, reservation.getRoom().getStatus());
        assertEquals(false, reservation.getRoom().getIsAvailable());
        assertNotNull(reservation.getActualCheckInTime());
        verify(roomRepository).save(reservation.getRoom());
        verify(roomCacheService).evictRoomSpecificCaches(20L, 5L);
        verify(automatedRoomStatusService).checkRoomStatusConsistency(20L);
    }

    @Test
    void updateBookingStatusShouldCreateCancellationNotificationAndFreeRoom() {
        Reservation reservation = reservationWithAssignedRoom(2L);
        when(reservationRepository.findById(2L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(userRepository.findById(10L)).thenReturn(Optional.of(guestUser()));

        BookingResponse response = bookingStatusUpdateService.updateBookingStatus(2L, ReservationStatus.CANCELLED, "hotel admin");

        assertEquals("CANCELLED", response.getStatus());
        assertEquals(RoomStatus.AVAILABLE, reservation.getRoom().getStatus());
        assertEquals(true, reservation.getRoom().getIsAvailable());
        verify(bookingChangeNotificationService).createCancellationNotification(
                reservation,
                "Booking cancelled by hotel admin",
                BigDecimal.ZERO,
                "hotel admin");
        verify(roomCacheService).evictRoomSpecificCaches(20L, 5L);
        verify(automatedRoomStatusService).checkRoomStatusConsistency(20L);
    }

    @Test
    void updateBookingStatusShouldSwallowCancellationNotificationFailure() {
        Reservation reservation = reservationWithAssignedRoom(3L);
        when(reservationRepository.findById(3L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(userRepository.findById(10L)).thenReturn(Optional.of(guestUser()));
        doThrow(new RuntimeException("notify failed"))
                .when(bookingChangeNotificationService)
                .createCancellationNotification(reservation, "Booking cancelled by ops", BigDecimal.ZERO, "ops");

        BookingResponse response = bookingStatusUpdateService.updateBookingStatus(3L, ReservationStatus.CANCELLED, "ops");

        assertEquals("CANCELLED", response.getStatus());
        verify(reservationRepository).save(reservation);
        verify(automatedRoomStatusService).checkRoomStatusConsistency(20L);
    }

    @Test
    void updateBookingStatusShouldHandleUnassignedRoomAndGuestInfoFallback() {
        Reservation reservation = reservationWithoutAssignedRoom(4L);
        when(reservationRepository.findById(4L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(reservation)).thenReturn(reservation);

        BookingResponse response = bookingStatusUpdateService.updateBookingStatus(4L, ReservationStatus.NO_SHOW, "system");

        assertEquals("NO_SHOW", response.getStatus());
        assertEquals("To be assigned", response.getRoomNumber());
        assertEquals("Guest Info", response.getGuestName());
        assertEquals("guest@example.com", response.getGuestEmail());
        assertEquals("Unknown Hotel", response.getHotelName());
        verify(roomRepository, never()).save(org.mockito.ArgumentMatchers.any(Room.class));
        verify(automatedRoomStatusService, never()).checkRoomStatusConsistency(org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void updateBookingStatusShouldRejectCheckInWithoutAssignedRoom() {
        Reservation reservation = reservationWithoutAssignedRoom(5L);
        when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> bookingStatusUpdateService.updateBookingStatus(5L, ReservationStatus.CHECKED_IN, "front desk"));

        assertTrue(exception.getMessage().contains("assigned room is required before check-in"));
        verify(reservationRepository, never()).save(reservation);
        verify(roomRepository, never()).save(org.mockito.ArgumentMatchers.any(Room.class));
        verify(automatedRoomStatusService, never()).checkRoomStatusConsistency(org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void updateBookingStatusStringShouldRejectInvalidStatus() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> bookingStatusUpdateService.updateBookingStatus(1L, "not-a-status", "api"));

        assertEquals("Invalid reservation status: not-a-status", exception.getMessage());
    }

    @Test
    void updateBookingStatusShouldThrowWhenReservationMissing() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingStatusUpdateService.updateBookingStatus(99L, ReservationStatus.CHECKED_OUT, "system"));
    }

    private Reservation reservationWithAssignedRoom(Long reservationId) {
        Hotel hotel = new Hotel();
        hotel.setId(5L);
        hotel.setName("Grand Plaza");
        hotel.setAddress("Bole Road");

        Room room = new Room();
        room.setId(20L);
        room.setHotel(hotel);
        room.setRoomNumber("305");
        room.setRoomType(RoomType.DELUXE);
        room.setPricePerNight(new BigDecimal("175.00"));
        room.setCapacity(2);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);

        Reservation reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setRoom(room);
        reservation.setHotel(hotel);
        reservation.setRoomType(RoomType.DELUXE);
        reservation.setPricePerNight(new BigDecimal("175.00"));
        reservation.setCheckInDate(LocalDate.of(2026, 6, 20));
        reservation.setCheckOutDate(LocalDate.of(2026, 6, 22));
        reservation.setTotalAmount(new BigDecimal("350.00"));
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setNumberOfGuests(2);
        reservation.setSpecialRequests("Airport pickup");
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.of(2026, 5, 1, 10, 0));
        User guest = new User();
        guest.setId(10L);
        reservation.setGuest(guest);
        return reservation;
    }

    private Reservation reservationWithoutAssignedRoom(Long reservationId) {
        Reservation reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("100.00"));
        reservation.setCheckInDate(LocalDate.of(2026, 7, 1));
        reservation.setCheckOutDate(LocalDate.of(2026, 7, 2));
        reservation.setTotalAmount(new BigDecimal("100.00"));
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setNumberOfGuests(1);
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        reservation.setCreatedAt(LocalDateTime.of(2026, 5, 2, 8, 0));
        reservation.setGuestInfo(new GuestInfo("Guest Info", "guest@example.com", "0911000000"));
        return reservation;
    }

    private User guestUser() {
        User user = new User();
        user.setId(10L);
        user.setFirstName("Test");
        user.setLastName("Guest");
        user.setEmail("registered@example.com");
        return user;
    }
}