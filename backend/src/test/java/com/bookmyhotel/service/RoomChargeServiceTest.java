package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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

import com.bookmyhotel.dto.RoomChargeCreateRequest;
import com.bookmyhotel.dto.RoomChargeResponse;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomCharge;
import com.bookmyhotel.entity.RoomChargeType;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.RoomChargeException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomChargeRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RoomChargeServiceTest {

    @Mock
    private RoomChargeRepository roomChargeRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private ShopOrderRepository shopOrderRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RoomChargeService roomChargeService;

    @Test
    void createRoomChargeShouldPersistChargeAndMapGuestRoomMetadata() {
        Hotel hotel = hotel(1L);
        Reservation reservation = reservation(10L, hotel);
        ShopOrder shopOrder = shopOrder(20L, hotel, reservation);
        User creator = user(30L, "staff@example.com");
        RoomChargeCreateRequest request = createRequest();
        request.setShopOrderId(20L);

        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));
        when(shopOrderRepository.findById(20L)).thenReturn(Optional.of(shopOrder));
        when(userRepository.findByEmail("staff@example.com")).thenReturn(Optional.of(creator));
        when(roomChargeRepository.save(any(RoomCharge.class))).thenAnswer(invocation -> {
            RoomCharge saved = invocation.getArgument(0);
            saved.setId(40L);
            return saved;
        });

        RoomChargeResponse response = roomChargeService.createRoomCharge(request, "staff@example.com", 1L);

        assertEquals(40L, response.getId());
        assertEquals(1L, response.getHotelId());
        assertEquals(10L, response.getReservationId());
        assertEquals(20L, response.getShopOrderId());
        assertEquals(new BigDecimal("25.00"), response.getAmount());
        assertEquals(RoomChargeType.MINIBAR, response.getChargeType());
        assertFalse(response.getIsPaid());
        assertEquals(30L, response.getCreatedBy());
        assertEquals("Guest Example", response.getGuestName());
        assertEquals("101", response.getRoomNumber());
        assertEquals("CONF-123", response.getReservationConfirmationNumber());
        verify(roomChargeRepository).save(any(RoomCharge.class));
    }

    @Test
    void createRoomChargeShouldWrapReservationHotelMismatch() {
        Hotel reservationHotel = hotel(2L);
        Reservation reservation = reservation(10L, reservationHotel);

        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));

        RoomChargeException exception = assertThrows(RoomChargeException.class,
                () -> roomChargeService.createRoomCharge(createRequest(), "staff@example.com", 1L));

        assertEquals("Failed to create room charge: Reservation not found for this hotel", exception.getMessage());
        verify(roomChargeRepository, never()).save(any(RoomCharge.class));
    }

    @Test
    void markChargeAsPaidShouldPersistPaidState() {
        Hotel hotel = hotel(1L);
        RoomCharge charge = roomCharge(50L, hotel, reservation(10L, hotel));
        when(roomChargeRepository.findById(50L)).thenReturn(Optional.of(charge));
        when(roomChargeRepository.save(charge)).thenReturn(charge);

        RoomChargeResponse response = roomChargeService.markChargeAsPaid(1L, 50L, "PAY-1");

        assertTrue(charge.getIsPaid());
        assertNotNull(charge.getPaidAt());
        assertTrue(response.getIsPaid());
        assertNotNull(response.getPaidAt());
        verify(roomChargeRepository).save(charge);
    }

    @Test
    void markChargeAsUnpaidShouldClearPaymentTimestamp() {
        Hotel hotel = hotel(1L);
        RoomCharge charge = roomCharge(51L, hotel, reservation(10L, hotel));
        charge.setIsPaid(true);
        charge.setPaidAt(LocalDateTime.now().minusHours(2));
        when(roomChargeRepository.findById(51L)).thenReturn(Optional.of(charge));
        when(roomChargeRepository.save(charge)).thenReturn(charge);

        RoomChargeResponse response = roomChargeService.markChargeAsUnpaid(1L, 51L);

        assertFalse(charge.getIsPaid());
        assertNull(charge.getPaidAt());
        assertFalse(response.getIsPaid());
        assertNull(response.getPaidAt());
    }

    @Test
    void createChargeFromShopOrderShouldRejectOrderWithoutReservation() {
        Hotel hotel = hotel(1L);
        ShopOrder shopOrder = shopOrder(70L, hotel, null);

        RoomChargeException exception = assertThrows(RoomChargeException.class,
                () -> roomChargeService.createChargeFromShopOrder(shopOrder, 1L));

        assertEquals(
                "Failed to create room charge from shop order: Cannot create room charge: Shop order is not linked to a reservation",
                exception.getMessage());
    }

    @Test
    void getTotalUnpaidAmountShouldRejectReservationOutsideHotel() {
        Hotel hotel = hotel(2L);
        Reservation reservation = reservation(10L, hotel);
        when(reservationRepository.findById(10L)).thenReturn(Optional.of(reservation));

        RoomChargeException exception = assertThrows(RoomChargeException.class,
                () -> roomChargeService.getTotalUnpaidAmount(1L, 10L));

        assertEquals("Reservation not found for this hotel", exception.getMessage());
    }

    private RoomChargeCreateRequest createRequest() {
        RoomChargeCreateRequest request = new RoomChargeCreateRequest();
        request.setReservationId(10L);
        request.setDescription("Mini bar soda");
        request.setAmount(new BigDecimal("25.00"));
        request.setChargeType(RoomChargeType.MINIBAR);
        request.setNotes("Late night purchase");
        return request;
    }

    private Hotel hotel(Long id) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Hotel " + id);
        hotel.setAddress("Address");
        return hotel;
    }

    private Reservation reservation(Long id, Hotel hotel) {
        Reservation reservation = new Reservation();
        reservation.setId(id);
        reservation.setHotel(hotel);
        reservation.setCheckInDate(LocalDate.now().minusDays(1));
        reservation.setCheckOutDate(LocalDate.now().plusDays(1));
        reservation.setTotalAmount(new BigDecimal("100.00"));
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("100.00"));
        reservation.setGuestInfo(new GuestInfo("Guest Example", "guest@example.com", "123"));
        reservation.setConfirmationNumber("CONF-123");

        Room room = new Room();
        room.setRoomNumber("101");
        room.setRoomType(RoomType.STANDARD);
        room.setPricePerNight(new BigDecimal("100.00"));
        reservation.setRoom(room);
        return reservation;
    }

    private ShopOrder shopOrder(Long id, Hotel hotel, Reservation reservation) {
        ShopOrder shopOrder = new ShopOrder();
        shopOrder.setId(id);
        shopOrder.setHotel(hotel);
        shopOrder.setReservation(reservation);
        shopOrder.setOrderNumber("SHOP-1");
        shopOrder.setTotalAmount(new BigDecimal("25.00"));
        return shopOrder;
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        return user;
    }

    private RoomCharge roomCharge(Long id, Hotel hotel, Reservation reservation) {
        RoomCharge charge = new RoomCharge(hotel, reservation, "Mini bar soda", new BigDecimal("25.00"),
                RoomChargeType.MINIBAR);
        charge.setId(id);
        return charge;
    }
}