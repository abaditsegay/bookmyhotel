package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
import com.bookmyhotel.entity.PaymentStatus;
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

    @Test
    void getHotelStatisticsShouldUseDatabaseScopedCounts() {
        Hotel hotel = hotel(14L);
        User admin = user("admin@example.com", hotel, UserRole.HOTEL_ADMIN);

        Room availableRoom = room(51L, hotel, "501");
        Room bookedRoom = room(52L, hotel, "502");
        User activeStaff = user("frontdesk@example.com", hotel, UserRole.FRONTDESK);
        activeStaff.setIsActive(true);
        User inactiveStaff = user("housekeeping@example.com", hotel, UserRole.HOUSEKEEPING);
        inactiveStaff.setIsActive(false);

        Reservation bookedReservation = reservation(61L, hotel, bookedRoom);
        bookedReservation.setStatus(ReservationStatus.BOOKED);
        bookedReservation.setCheckOutDate(LocalDate.now().plusDays(1));

        when(userRepository.findByEmailWithHotel(admin.getEmail())).thenReturn(Optional.of(admin));
        when(roomRepository.findByHotelId(hotel.getId())).thenReturn(List.of(availableRoom, bookedRoom));
        when(reservationRepository.findByHotelId(hotel.getId())).thenReturn(List.of(bookedReservation));
        when(userRepository.findByHotelAndRolesContaining(hotel, List.of(
                UserRole.FRONTDESK,
                UserRole.HOUSEKEEPING,
                UserRole.HOTEL_ADMIN,
                UserRole.ADMIN,
                UserRole.OPERATIONAL_ADMIN,
                UserRole.MAINTENANCE,
                UserRole.TESTER))).thenReturn(List.of(activeStaff, inactiveStaff));

        Map<String, Object> result = hotelAdminService.getHotelStatistics(admin.getEmail());

        assertEquals(2, result.get("totalRooms"));
        assertEquals(2L, result.get("availableRooms"));
        assertEquals(0L, result.get("bookedRooms"));
        assertEquals(1L, result.get("bookedBookings"));
        assertEquals(2, result.get("totalStaff"));
        assertEquals(1, result.get("activeStaff"));
    }

    @Test
    void getHotelStatisticsShouldCountOnlyCheckedInRoomsAsOccupied() {
        Hotel hotel = hotel(16L);
        User admin = user("admin@example.com", hotel, UserRole.HOTEL_ADMIN);

        Room bookedRoom = room(61L, hotel, "601");
        Room checkedInRoom = room(62L, hotel, "602");
        Room emptyRoom = room(63L, hotel, "603");

        Reservation bookedReservation = reservation(81L, hotel, bookedRoom);
        bookedReservation.setStatus(ReservationStatus.BOOKED);
        bookedReservation.setCheckOutDate(LocalDate.now().plusDays(1));

        Reservation checkedInReservation = reservation(82L, hotel, checkedInRoom);
        checkedInReservation.setStatus(ReservationStatus.CHECKED_IN);
        checkedInReservation.setCheckOutDate(LocalDate.now().plusDays(1));

        when(userRepository.findByEmailWithHotel(admin.getEmail())).thenReturn(Optional.of(admin));
        when(roomRepository.findByHotelId(hotel.getId())).thenReturn(List.of(bookedRoom, checkedInRoom, emptyRoom));
        when(reservationRepository.findByHotelId(hotel.getId())).thenReturn(List.of(bookedReservation, checkedInReservation));
        when(userRepository.findByHotelAndRolesContaining(hotel, List.of(
                UserRole.FRONTDESK,
                UserRole.HOUSEKEEPING,
                UserRole.HOTEL_ADMIN,
                UserRole.ADMIN,
                UserRole.OPERATIONAL_ADMIN,
                UserRole.MAINTENANCE,
                UserRole.TESTER))).thenReturn(List.of());

        Map<String, Object> result = hotelAdminService.getHotelStatistics(admin.getEmail());

        assertEquals(1L, result.get("bookedRooms"));
        assertEquals(2L, result.get("availableRooms"));
        assertEquals(2L, result.get("bookedBookings"));
    }

    @Test
    void getHotelBookingStatsShouldCountCompletedRevenueAndReportableMonthlyBookings() {
        Hotel hotel = hotel(15L);
        Room hotelRoom = room(53L, hotel, "503");

        Reservation paidThisMonth = reservation(71L, hotel, hotelRoom);
        paidThisMonth.setCreatedAt(LocalDateTime.now().minusDays(2));
        paidThisMonth.setPaymentStatus(PaymentStatus.COMPLETED);
        paidThisMonth.setTotalAmount(new BigDecimal("4200.00"));
        paidThisMonth.setStatus(ReservationStatus.BOOKED);

        Reservation cancelledThisMonth = reservation(72L, hotel, hotelRoom);
        cancelledThisMonth.setCreatedAt(LocalDateTime.now().minusDays(1));
        cancelledThisMonth.setPaymentStatus(PaymentStatus.PENDING);
        cancelledThisMonth.setStatus(ReservationStatus.CANCELLED);

        Reservation oldCompletedBooking = reservation(73L, hotel, hotelRoom);
        oldCompletedBooking.setCreatedAt(LocalDateTime.now().minusYears(1));
        oldCompletedBooking.setPaymentStatus(PaymentStatus.COMPLETED);
        oldCompletedBooking.setTotalAmount(new BigDecimal("9999.00"));
        oldCompletedBooking.setStatus(ReservationStatus.CHECKED_OUT);

        when(reservationRepository.findByHotelId(hotel.getId()))
                .thenReturn(List.of(paidThisMonth, cancelledThisMonth, oldCompletedBooking));

        Map<String, Object> result = hotelAdminService.getHotelBookingStats(hotel.getId());

        assertEquals(new BigDecimal("4200.00"), result.get("currentYearRevenue"));
        assertEquals(1L, result.get("thisMonthBookings"));
        assertEquals(3, result.get("totalBookings"));
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
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        reservation.setTotalAmount(new BigDecimal("3000.00"));
        reservation.setPricePerNight(new BigDecimal("1500.00"));
        reservation.setGuestInfo(new GuestInfo("Hotel Admin Guest", "guest@example.com", "+251900000111"));
        reservation.setConfirmationNumber("BK-" + id);
        reservation.setCreatedAt(LocalDateTime.now());
        return reservation;
    }
}