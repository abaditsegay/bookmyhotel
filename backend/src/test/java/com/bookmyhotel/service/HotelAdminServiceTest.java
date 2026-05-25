package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.dto.UserDTO;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

import jakarta.persistence.EntityManager;

@ExtendWith(MockitoExtension.class)
class HotelAdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EntityManager entityManager;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private BookingService bookingService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RoomTypePricingService roomTypePricingService;

    @Mock
    private BookingChangeNotificationService bookingChangeNotificationService;

    @Mock
    private BookingStatusUpdateService bookingStatusUpdateService;

    @Mock
    private HotelImageService hotelImageService;

    @Mock
    private AutomatedRoomStatusService automatedRoomStatusService;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private HotelAdminService hotelAdminService;

    @Test
    void getStaffMemberByIdShouldUseHotelScopedLookup() {
        Hotel hotel = hotel(11L);
        User admin = user("admin@example.com", hotel, UserRole.HOTEL_ADMIN);
        User staff = user("staff@example.com", hotel, UserRole.FRONTDESK);
        staff.setId(21L);

        when(userRepository.findByEmailWithHotel(admin.getEmail())).thenReturn(Optional.of(admin));
        when(userRepository.findByIdAndHotelId(21L, 11L)).thenReturn(Optional.of(staff));

        UserDTO response = hotelAdminService.getStaffMemberById(21L, admin.getEmail());

        assertEquals("staff@example.com", response.getEmail());
        verify(userRepository).findByIdAndHotelId(21L, 11L);
        verify(userRepository, never()).findById(21L);
    }

    @Test
    void getRoomByIdShouldUseHotelScopedLookup() {
        Hotel hotel = hotel(12L);
        User admin = user("admin@example.com", hotel, UserRole.HOTEL_ADMIN);
        Room room = room(31L, hotel, "401");

        when(userRepository.findByEmailWithHotel(admin.getEmail())).thenReturn(Optional.of(admin));
        when(roomRepository.findByIdAndHotelId(31L, 12L)).thenReturn(Optional.of(room));

        RoomDTO response = hotelAdminService.getRoomById(31L, admin.getEmail());

        assertEquals("401", response.getRoomNumber());
        verify(roomRepository).findByIdAndHotelId(31L, 12L);
        verify(roomRepository, never()).findById(31L);
    }

    @Test
    void getBookingByIdShouldUseHotelScopedLookup() {
        Hotel hotel = hotel(13L);
        Reservation reservation = reservation(41L, hotel, room(32L, hotel, "402"));

        when(reservationRepository.findByIdAndHotelId(41L, 13L)).thenReturn(Optional.of(reservation));

        BookingResponse response = hotelAdminService.getBookingById(41L, 13L);

        assertEquals(41L, response.getReservationId());
        verify(reservationRepository).findByIdAndHotelId(41L, 13L);
        verify(reservationRepository, never()).findById(41L);
    }

    private Hotel hotel(Long id) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Hotel " + id);
        hotel.setAddress("Address");
        return hotel;
    }

    private User user(String email, Hotel hotel, UserRole role) {
        User user = new User();
        user.setId(Math.abs(email.hashCode()) + 0L);
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setHotel(hotel);
        user.setRoles(Set.of(role));
        return user;
    }

    private Room room(Long id, Hotel hotel, String roomNumber) {
        Room room = new Room();
        room.setId(id);
        room.setHotel(hotel);
        room.setRoomNumber(roomNumber);
        room.setRoomType(RoomType.STANDARD);
        room.setPricePerNight(new BigDecimal("1500.00"));
        room.setCapacity(2);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);
        return room;
    }

    private Reservation reservation(Long id, Hotel hotel, Room room) {
        Reservation reservation = new Reservation();
        reservation.setId(id);
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setRoomType(room.getRoomType());
        reservation.setCheckInDate(LocalDate.now());
        reservation.setCheckOutDate(LocalDate.now().plusDays(2));
        reservation.setStatus(ReservationStatus.BOOKED);
        reservation.setTotalAmount(new BigDecimal("3000.00"));
        reservation.setPricePerNight(new BigDecimal("1500.00"));
        reservation.setGuestInfo(new GuestInfo("Hotel Admin Guest", "guest@example.com", "+251900000111"));
        reservation.setConfirmationNumber("BK-" + id);
        return reservation;
    }
}