package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.support.MySqlIntegrationTestSupport;

@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-booking-concurrency-test.sql"
})
@SuppressWarnings("removal")
class BookingStatusUpdateServiceIntegrationTest extends MySqlIntegrationTestSupport {

    @Autowired
    private BookingStatusUpdateService bookingStatusUpdateService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @MockBean
    private BookingChangeNotificationService bookingChangeNotificationService;

    @MockBean
    private AutomatedRoomStatusService automatedRoomStatusService;

    @Test
    void updateBookingStatusShouldPersistCheckedOutStateAndMoveRoomToMaintenance() {
        Hotel hotel = createHotel("checkout");
        Room room = createRoom(hotel, "601", RoomStatus.OCCUPIED);
        Reservation reservation = createReservation(hotel, room, ReservationStatus.CHECKED_IN, "BKCHECKOUT001");

        BookingResponse response = bookingStatusUpdateService.updateBookingStatus(
                reservation.getId(),
                ReservationStatus.CHECKED_OUT,
                "front desk");

        assertEquals("CHECKED_OUT", response.getStatus());
        assertEquals("601", response.getRoomNumber());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room persistedRoom = roomRepository.findById(room.getId()).orElseThrow();

        assertEquals(ReservationStatus.CHECKED_OUT, persistedReservation.getStatus());
        assertNotNull(persistedReservation.getActualCheckOutTime());
        assertEquals(RoomStatus.MAINTENANCE, persistedRoom.getStatus());
        verify(automatedRoomStatusService).checkRoomStatusConsistency(room.getId());
    }

    @Test
    void updateBookingStatusShouldPersistCancellationEvenWhenNotificationFails() {
        Hotel hotel = createHotel("cancel");
        Room room = createRoom(hotel, "602", RoomStatus.AVAILABLE);
        Reservation reservation = createReservation(hotel, room, ReservationStatus.BOOKED, "BKCANCEL001");

        doThrow(new RuntimeException("notify failed")).when(bookingChangeNotificationService)
                .createCancellationNotification(any(Reservation.class), eq("Booking cancelled by ops"),
                        eq(BigDecimal.ZERO), eq("ops"));

        BookingResponse response = bookingStatusUpdateService.updateBookingStatus(
                reservation.getId(),
                ReservationStatus.CANCELLED,
                "ops");

        assertEquals("CANCELLED", response.getStatus());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room persistedRoom = roomRepository.findById(room.getId()).orElseThrow();

        assertEquals(ReservationStatus.CANCELLED, persistedReservation.getStatus());
        assertEquals(PaymentStatus.PENDING, persistedReservation.getPaymentStatus());
        assertEquals(RoomStatus.AVAILABLE, persistedRoom.getStatus());
        verify(bookingChangeNotificationService).createCancellationNotification(
                any(Reservation.class),
                eq("Booking cancelled by ops"),
                eq(BigDecimal.ZERO),
                eq("ops"));
        verify(automatedRoomStatusService).checkRoomStatusConsistency(room.getId());
    }

    private Hotel createHotel(String suffix) {
        Tenant tenant = new Tenant();
        tenant.setId("tenant-bsu-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setName("Tenant " + suffix);
        tenant.setSubdomain("tenant-bsu-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Booking Status Hotel " + suffix);
        hotel.setAddress("Addis Ababa");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251911000000");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(true);
        return hotelRepository.save(hotel);
    }

    private Room createRoom(Hotel hotel, String roomNumber, RoomStatus status) {
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(roomNumber);
        room.setRoomType(RoomType.STANDARD);
        room.setStatus(status);
        room.setIsAvailable(true);
        room.setCapacity(2);
        room.setPricePerNight(new BigDecimal("2000.00"));
        return roomRepository.save(room);
    }

    private Reservation createReservation(Hotel hotel, Room room, ReservationStatus status, String confirmationNumber) {
        Reservation reservation = new Reservation();
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("2000.00"));
        reservation.setCheckInDate(LocalDate.now().minusDays(1));
        reservation.setCheckOutDate(LocalDate.now().plusDays(1));
        reservation.setTotalAmount(new BigDecimal("4000.00"));
        reservation.setStatus(status);
        reservation.setPaymentStatus(PaymentStatus.PENDING);
        reservation.setGuestInfo(new GuestInfo("Booking Status Guest", "status.guest@example.com", "+251900000501"));
        reservation.setNumberOfGuests(2);
        reservation.setConfirmationNumber(confirmationNumber);
        return reservationRepository.save(reservation);
    }
}