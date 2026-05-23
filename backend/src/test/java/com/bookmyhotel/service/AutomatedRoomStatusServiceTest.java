package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.RoomRepository;

@ExtendWith(MockitoExtension.class)
class AutomatedRoomStatusServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private AutomatedRoomStatusService automatedRoomStatusService;

    @Test
    void checkRoomStatusConsistencyShouldMarkRoomOccupiedForCheckedInGuest() {
        Room room = room("101", RoomStatus.AVAILABLE, true,
                reservation(ReservationStatus.CHECKED_IN, LocalDate.now().minusDays(1), LocalDate.now().plusDays(1)));
        when(roomRepository.findById(10L)).thenReturn(Optional.of(room));

        automatedRoomStatusService.checkRoomStatusConsistency(10L);

        assertEquals(RoomStatus.OCCUPIED, room.getStatus());
        verify(roomRepository).findById(10L);
        verify(roomRepository).save(room);
    }

    @Test
    void checkRoomStatusConsistencyShouldMarkRoomAvailableWhenNoActiveGuestExists() {
        Room room = room("102", RoomStatus.OCCUPIED, true,
                reservation(ReservationStatus.CANCELLED, LocalDate.now().minusDays(3), LocalDate.now().minusDays(1)));
        when(roomRepository.findById(11L)).thenReturn(Optional.of(room));

        automatedRoomStatusService.checkRoomStatusConsistency(11L);

        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
        verify(roomRepository).save(room);
    }

    @Test
    void checkRoomStatusConsistencyShouldMarkAvailableWhenOnlyBookedReservationStartsToday() {
        Room room = room("103", RoomStatus.OCCUPIED, true,
                reservation(ReservationStatus.BOOKED, LocalDate.now(), LocalDate.now().plusDays(2)));
        when(roomRepository.findById(12L)).thenReturn(Optional.of(room));

        automatedRoomStatusService.checkRoomStatusConsistency(12L);

        assertEquals(RoomStatus.AVAILABLE, room.getStatus());
        verify(roomRepository).findById(12L);
        verify(roomRepository).save(room);
    }

    @Test
    void checkRoomStatusConsistencyShouldIgnoreMissingRoom() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        automatedRoomStatusService.checkRoomStatusConsistency(99L);

        verify(roomRepository).findById(99L);
        verify(roomRepository, never()).save(org.mockito.ArgumentMatchers.any(Room.class));
    }

    @Test
    void autoHandleCheckoutMaintenanceShouldOnlyUpdateOccupiedRooms() {
        Room occupied = room("201", RoomStatus.OCCUPIED, true);
        Room alreadyMaintenance = room("202", RoomStatus.MAINTENANCE, true);
        when(roomRepository.findRoomsNeedingMaintenanceAfterCheckout(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                        .thenReturn(List.of(occupied, alreadyMaintenance));

        automatedRoomStatusService.autoHandleCheckoutMaintenance();

        assertEquals(RoomStatus.MAINTENANCE, occupied.getStatus());
        assertEquals(RoomStatus.MAINTENANCE, alreadyMaintenance.getStatus());
        verify(roomRepository).save(occupied);
        verify(roomRepository, never()).save(alreadyMaintenance);
    }

    @Test
    void autoFixRoomStatusConsistencyShouldProcessAllHotelsAndFixEligibleRooms() {
        Hotel hotelOne = hotel(1L, "One");
        Hotel hotelTwo = hotel(2L, "Two");
        Room roomNeedingFix = room("301", RoomStatus.AVAILABLE, true,
                reservation(ReservationStatus.CHECKED_IN, LocalDate.now().minusDays(1), LocalDate.now().plusDays(2)));
        Room consistentRoom = room("302", RoomStatus.AVAILABLE, true);

        when(hotelRepository.findAll()).thenReturn(List.of(hotelOne, hotelTwo));
        when(roomRepository.findByHotelId(1L)).thenReturn(List.of(roomNeedingFix));
        when(roomRepository.findByHotelId(2L)).thenReturn(List.of(consistentRoom));

        automatedRoomStatusService.autoFixRoomStatusConsistency();

        assertEquals(RoomStatus.OCCUPIED, roomNeedingFix.getStatus());
        assertEquals(RoomStatus.AVAILABLE, consistentRoom.getStatus());
        verify(hotelRepository).findAll();
        verify(roomRepository).findByHotelId(1L);
        verify(roomRepository).findByHotelId(2L);
        verify(roomRepository).save(roomNeedingFix);
        verify(roomRepository, never()).save(consistentRoom);
    }

    @Test
    void triggerImmediateConsistencyCheckShouldDelegateToFullConsistencyRun() {
        when(hotelRepository.findAll()).thenReturn(List.of());

        automatedRoomStatusService.triggerImmediateConsistencyCheck();

        verify(hotelRepository).findAll();
        verifyNoMoreInteractions(roomRepository);
    }

    private Room room(String roomNumber, RoomStatus status, boolean isAvailable, Reservation... reservations) {
        Room room = new Room();
        room.setRoomNumber(roomNumber);
        room.setRoomType(RoomType.STANDARD);
        room.setPricePerNight(new BigDecimal("100.00"));
        room.setStatus(status);
        room.setIsAvailable(isAvailable);
        room.setReservations(List.of(reservations));
        return room;
    }

    private Reservation reservation(ReservationStatus status, LocalDate checkInDate, LocalDate checkOutDate) {
        Reservation reservation = new Reservation();
        reservation.setStatus(status);
        reservation.setCheckInDate(checkInDate);
        reservation.setCheckOutDate(checkOutDate);
        reservation.setTotalAmount(new BigDecimal("100.00"));
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("100.00"));
        return reservation;
    }

    private Hotel hotel(Long id, String name) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName(name);
        hotel.setAddress("Address");
        return hotel;
    }
}