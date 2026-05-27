package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.dto.RoomResponse;
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

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

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

    @Test
    void checkInGuestShouldRequireAssignedRoom() {
        Reservation reservation = buildReservation(610L, buildHotel(41L), null, ReservationStatus.BOOKED);

        when(reservationRepository.findById(610L)).thenReturn(Optional.of(reservation));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> frontDeskService.checkInGuest(610L));

        assertEquals("An assigned room is required before check-in", exception.getMessage());
    }

    @Test
    void checkInGuestShouldEvictRoomCachesAfterOccupyingRoom() {
        Hotel hotel = buildHotel(42L);
        Room room = buildRoom(712L, hotel, "714", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(620L, hotel, room, ReservationStatus.BOOKED);

        when(reservationRepository.findById(620L)).thenReturn(Optional.of(reservation));
        when(roomRepository.save(room)).thenReturn(room);
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(bookingService.convertToBookingResponse(reservation)).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            return response;
        });

        BookingResponse response = frontDeskService.checkInGuest(620L);

        assertEquals("CHECKED_IN", response.getStatus());
        assertEquals(RoomStatus.OCCUPIED, room.getStatus());
        assertEquals(false, room.getIsAvailable());
        verify(roomCacheService).evictRoomSpecificCaches(712L, 42L);
    }

    @Test
    void checkInWithRoomAssignmentShouldRejectRoomFromDifferentHotel() {
        Hotel reservationHotel = buildHotel(51L);
        Hotel otherHotel = buildHotel(52L);
        Room currentRoom = buildRoom(710L, reservationHotel, "701", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Room otherHotelRoom = buildRoom(711L, otherHotel, "801", RoomType.DELUXE, "2500.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(611L, reservationHotel, currentRoom, ReservationStatus.BOOKED);

        when(reservationRepository.findById(611L)).thenReturn(Optional.of(reservation));
        when(roomRepository.findByIdForUpdate(711L)).thenReturn(Optional.of(otherHotelRoom));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> frontDeskService.checkInWithRoomAssignment(611L, 711L, RoomType.DELUXE.name()));

        assertEquals("Selected room does not belong to the reservation hotel", exception.getMessage());
    }

    @Test
    void checkInWithRoomAssignmentShouldRejectOverlappingAssignment() {
        Hotel hotel = buildHotel(61L);
        Room currentRoom = buildRoom(720L, hotel, "702", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Room contestedRoom = buildRoom(721L, hotel, "703", RoomType.DELUXE, "2500.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(612L, hotel, currentRoom, ReservationStatus.BOOKED);

        when(reservationRepository.findById(612L)).thenReturn(Optional.of(reservation));
        when(roomRepository.findByIdForUpdate(721L)).thenReturn(Optional.of(contestedRoom));
        when(reservationRepository.existsByAssignedRoomAndDateRangeExcludingReservation(
                721L,
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                612L,
                61L)).thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> frontDeskService.checkInWithRoomAssignment(612L, 721L, RoomType.DELUXE.name()));

        assertEquals("Selected room is currently occupied", exception.getMessage());
    }

    @Test
    void updateBookingShouldKeepBookedAssignedRoomAvailableAndAlignRoomType() {
        Hotel hotel = buildHotel(71L);
        Room originalRoom = buildRoom(730L, hotel, "704", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Room newRoom = buildRoom(731L, hotel, "705", RoomType.DELUXE, "2500.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(613L, hotel, originalRoom, ReservationStatus.BOOKED);
        BookingRequest request = new BookingRequest();
        request.setCheckInDate(reservation.getCheckInDate());
        request.setCheckOutDate(reservation.getCheckOutDate());
        request.setGuests(2);
        request.setGuestName("Front Desk Guest");
        request.setGuestEmail("frontdesk@example.com");
        request.setGuestPhone("+251900000700");
        request.setRoomId(731L);

        when(reservationRepository.findById(613L)).thenReturn(Optional.of(reservation));
        when(roomRepository.findByIdForUpdate(731L)).thenReturn(Optional.of(newRoom));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(reservationRepository.existsByAssignedRoomAndDateRangeExcludingReservation(
                731L,
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                613L,
                71L)).thenReturn(false);
        when(bookingService.convertToBookingResponse(reservation)).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            response.setRoomNumber(updatedReservation.getRoom().getRoomNumber());
            return response;
        });

        BookingResponse response = frontDeskService.updateBooking(613L, request);

        assertEquals("BOOKED", response.getStatus());
        assertEquals("705", response.getRoomNumber());
        assertEquals(RoomType.DELUXE, reservation.getRoomType());
        assertEquals(new BigDecimal("5000.00"), reservation.getTotalAmount());
        assertEquals(RoomStatus.AVAILABLE, originalRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, newRoom.getStatus());
    }

    @Test
    void updateBookingRoomAssignmentShouldAlignRoomTypeWithoutExplicitType() {
        Hotel hotel = buildHotel(81L);
        Room originalRoom = buildRoom(740L, hotel, "706", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Room newRoom = buildRoom(741L, hotel, "707", RoomType.DELUXE, "2500.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(614L, hotel, originalRoom, ReservationStatus.BOOKED);

        when(reservationRepository.findById(614L)).thenReturn(Optional.of(reservation));
        when(roomRepository.findByIdForUpdate(741L)).thenReturn(Optional.of(newRoom));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.save(reservation)).thenReturn(reservation);
        when(reservationRepository.existsByAssignedRoomAndDateRangeExcludingReservation(
                741L,
                reservation.getCheckInDate(),
                reservation.getCheckOutDate(),
                614L,
                81L)).thenReturn(false);
        when(bookingService.convertToBookingResponse(reservation)).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            response.setRoomNumber(updatedReservation.getRoom().getRoomNumber());
            return response;
        });

        BookingResponse response = frontDeskService.updateBookingRoomAssignment(614L, 741L, null);

        assertEquals("BOOKED", response.getStatus());
        assertEquals("707", response.getRoomNumber());
        assertEquals(RoomType.DELUXE, reservation.getRoomType());
        assertEquals(new BigDecimal("5000.00"), reservation.getTotalAmount());
        assertEquals(RoomStatus.AVAILABLE, originalRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, newRoom.getStatus());
        assertDoesNotThrow(() -> verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq("RESERVATION"),
                eq(614L),
                eq("ROOM_ASSIGNMENT_CHANGE"),
                any(),
                any(),
                any(),
                eq("Front desk updated booking room assignment"),
                eq(true),
                eq("FINANCIAL")));
    }

    @Test
    void getAllRoomsShouldKeepBookedRoomAvailableUntilCheckIn() {
        Hotel hotel = buildHotel(91L);
        User user = buildUser("frontdesk@example.com", hotel);
        Room room = buildRoom(750L, hotel, "708", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(615L, hotel, room, ReservationStatus.BOOKED);
        room.setReservations(List.of(reservation));

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_FRONT_DESK"))));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(roomRepository.findByHotelIdWithReservationsOrderByRoomNumber(hotel.getId())).thenReturn(List.of(room));

        Page<RoomResponse> response = frontDeskService.getAllRooms(PageRequest.of(0, 10), null, null, null);

        assertEquals(1, response.getTotalElements());
        assertEquals(RoomStatus.AVAILABLE, response.getContent().get(0).getStatus());
        assertNull(response.getContent().get(0).getCurrentGuest());
    }

    @Test
    void getAllRoomsShouldShowOccupiedForCheckedInReservationWithGuestName() {
        Hotel hotel = buildHotel(92L);
        User user = buildUser("frontdesk@example.com", hotel);
        Room room = buildRoom(751L, hotel, "709", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(616L, hotel, room, ReservationStatus.CHECKED_IN);
        room.setReservations(List.of(reservation));

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_FRONT_DESK"))));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(roomRepository.findByHotelIdWithReservationsOrderByRoomNumber(hotel.getId())).thenReturn(List.of(room));
        when(roomRepository.isRoomCurrentlyBooked(room.getId(), hotel.getId())).thenReturn(true);

        Page<RoomResponse> response = frontDeskService.getAllRooms(PageRequest.of(0, 10), null, null, null);

        assertEquals(1, response.getTotalElements());
        assertEquals(RoomStatus.OCCUPIED, response.getContent().get(0).getStatus());
        assertEquals("Front Desk Guest", response.getContent().get(0).getCurrentGuest());
    }

    @Test
    void getAllRoomsShouldNotDependOnSingleHotelPerTenantForOccupancyComputation() {
        Hotel hotel = buildHotel(94L);
        User user = buildUser("frontdesk@example.com", hotel);
        Room room = buildRoom(753L, hotel, "711", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        Reservation reservation = buildReservation(618L, hotel, room, ReservationStatus.CHECKED_IN);
        room.setReservations(List.of(reservation));

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_FRONT_DESK"))));

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(roomRepository.findByHotelIdWithReservationsOrderByRoomNumber(hotel.getId())).thenReturn(List.of(room));
        when(roomRepository.isRoomCurrentlyBooked(room.getId(), hotel.getId())).thenReturn(true);

        Page<RoomResponse> response = frontDeskService.getAllRooms(PageRequest.of(0, 10), null, null, null);

        assertEquals(1, response.getTotalElements());
        assertEquals(RoomStatus.OCCUPIED, response.getContent().get(0).getStatus());
        assertEquals(hotel.getId(), response.getContent().get(0).getHotelId());
    }

    @Test
    void updateRoomStatusShouldRejectOccupiedWithoutCheckedInReservation() {
        Hotel hotel = buildHotel(93L);
        Room room = buildRoom(752L, hotel, "710", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);
        room.setReservations(List.of(
                buildReservation(617L, hotel, room, ReservationStatus.BOOKED)));

        when(roomRepository.findById(752L)).thenReturn(Optional.of(room));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> frontDeskService.updateRoomStatus(752L, RoomStatus.OCCUPIED.name(), null));

        assertEquals("Cannot set room to OCCUPIED - no checked-in guest is assigned", exception.getMessage());
    }

    @Test
    void getBookingByIdShouldUseAuthenticatedUsersHotelScope() {
        Hotel hotel = buildHotel(95L);
        User user = buildUser("frontdesk@example.com", hotel);
        Reservation reservation = buildReservation(619L, hotel, buildRoom(754L, hotel, "712", RoomType.STANDARD,
                "1800.00", RoomStatus.AVAILABLE), ReservationStatus.BOOKED);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_FRONT_DESK"))));

        when(userRepository.findByEmailWithHotel(user.getEmail())).thenReturn(Optional.of(user));
        when(reservationRepository.findByIdAndHotelId(619L, 95L)).thenReturn(Optional.of(reservation));
        when(bookingService.convertToBookingResponse(reservation)).thenAnswer(invocation -> {
            Reservation scopedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(scopedReservation.getId());
            return response;
        });

        BookingResponse response = frontDeskService.getBookingById(619L);

        assertEquals(619L, response.getReservationId());
        verify(reservationRepository).findByIdAndHotelId(619L, 95L);
        verify(reservationRepository, never()).findById(619L);
    }

    @Test
    void getRoomByIdShouldUseAuthenticatedUsersHotelScope() {
        Hotel hotel = buildHotel(96L);
        User user = buildUser("frontdesk@example.com", hotel);
        Room room = buildRoom(755L, hotel, "713", RoomType.STANDARD, "1800.00", RoomStatus.AVAILABLE);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_FRONT_DESK"))));

        when(userRepository.findByEmailWithHotel(user.getEmail())).thenReturn(Optional.of(user));
        when(roomRepository.findByIdAndHotelId(755L, 96L)).thenReturn(Optional.of(room));
        when(roomRepository.isRoomCurrentlyBooked(755L, 96L)).thenReturn(false);

        RoomResponse response = frontDeskService.getRoomById(755L);

        assertEquals(755L, response.getId());
        verify(roomRepository).findByIdAndHotelId(755L, 96L);
        verify(roomRepository, never()).findById(755L);
    }

    private Hotel buildHotel(Long hotelId) {
        Hotel hotel = new Hotel();
        hotel.setId(hotelId);
        hotel.setName("Hotel " + hotelId);
        return hotel;
    }

    private User buildUser(String email, Hotel hotel) {
        User user = new User();
        user.setEmail(email);
        user.setHotel(hotel);
        return user;
    }

    private Room buildRoom(Long roomId, Hotel hotel, String roomNumber, RoomType roomType, String pricePerNight,
            RoomStatus status) {
        Room room = new Room();
        room.setId(roomId);
        room.setHotel(hotel);
        room.setRoomNumber(roomNumber);
        room.setRoomType(roomType);
        room.setPricePerNight(new BigDecimal(pricePerNight));
        room.setStatus(status);
        room.setIsAvailable(true);
        room.setCapacity(2);
        return room;
    }

    private Reservation buildReservation(Long reservationId, Hotel hotel, Room room, ReservationStatus status) {
        Reservation reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setRoomType(room != null ? room.getRoomType() : RoomType.STANDARD);
        reservation.setCheckInDate(LocalDate.now());
        reservation.setCheckOutDate(LocalDate.now().plusDays(2));
        reservation.setStatus(status);
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        reservation.setPaymentMethod("cash");
        reservation.setPricePerNight(room != null ? room.getPricePerNight() : new BigDecimal("1800.00"));
        reservation.setTotalAmount(new BigDecimal("3600.00"));
        reservation.setConfirmationNumber("FD-" + reservationId);
        reservation.setGuestInfo(new GuestInfo("Front Desk Guest", "frontdesk@example.com", "+251900000700"));
        reservation.setNumberOfGuests(2);
        return reservation;
    }
}