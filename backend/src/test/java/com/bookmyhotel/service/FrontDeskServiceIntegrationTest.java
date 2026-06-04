package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

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
        "spring.sql.init.schema-locations=classpath:schema-ops-workflow-test.sql"
})
@SuppressWarnings("removal")
class FrontDeskServiceIntegrationTest extends MySqlIntegrationTestSupport {

    @Autowired
    private FrontDeskService frontDeskService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @MockitoBean
    private HotelActivityAuditService hotelActivityAuditService;

    @MockitoBean
    private BookingService bookingService;

    @MockitoBean
    private BookingChangeNotificationService bookingChangeNotificationService;

    @MockitoBean
    private AutomatedRoomStatusService automatedRoomStatusService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateBookingStatusShouldPersistCheckedInStateAndOccupyRoom() {
        Hotel hotel = createHotel("frontdesk-status");
        Room room = createRoom(hotel, "401");
        Reservation reservation = createReservation(hotel, room, ReservationStatus.BOOKED, PaymentStatus.PENDING,
                "FD-CHECKIN-001");

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "frontdesk@example.com",
                "n/a",
                java.util.List.of(new SimpleGrantedAuthority("ROLE_FRONT_DESK"))));

        BookingResponse response = frontDeskService.updateBookingStatus(reservation.getId(), "CHECKED_IN");

        assertEquals("CHECKED_IN", response.getStatus());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room persistedRoom = roomRepository.findById(room.getId()).orElseThrow();

        assertEquals(ReservationStatus.CHECKED_IN, persistedReservation.getStatus());
        assertNotNull(persistedReservation.getActualCheckInTime());
        assertEquals(RoomStatus.OCCUPIED, persistedRoom.getStatus());
        verify(automatedRoomStatusService).checkRoomStatusConsistency(room.getId());
    }

    @Test
    void updateBookingPaymentStatusShouldPersistCompletedPaymentState() {
        Hotel hotel = createHotel("frontdesk-payment");
        Room room = createRoom(hotel, "402");
        Reservation reservation = createReservation(hotel, room, ReservationStatus.BOOKED, PaymentStatus.PENDING,
                "FD-PAY-001");

        when(bookingService.convertToBookingResponse(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            response.setPaymentStatus(updatedReservation.getPaymentStatus().name());
            response.setConfirmationNumber(updatedReservation.getConfirmationNumber());
            return response;
        });

        BookingResponse response = frontDeskService.updateBookingPaymentStatus(reservation.getId(), "COMPLETED");

        assertEquals("COMPLETED", response.getPaymentStatus());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        assertEquals(PaymentStatus.COMPLETED, persistedReservation.getPaymentStatus());
        assertEquals(ReservationStatus.BOOKED, persistedReservation.getStatus());
    }

    @Test
    void checkInWithRoomAssignmentShouldReassignRoomRecalculateTotalAndOccupyAssignedRoom() {
        Hotel hotel = createHotel("frontdesk-assignment");
        Room originalRoom = createRoom(hotel, "403");
        Room assignedRoom = createRoom(hotel, "404", RoomType.DELUXE, new BigDecimal("2500.00"));
        Reservation reservation = createReservation(hotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
                "FD-ASSIGN-001");

        when(bookingService.convertToBookingResponse(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            response.setConfirmationNumber(updatedReservation.getConfirmationNumber());
            response.setRoomNumber(updatedReservation.getRoom() != null ? updatedReservation.getRoom().getRoomNumber() : null);
            return response;
        });

        BookingResponse response = frontDeskService.checkInWithRoomAssignment(
                reservation.getId(),
                assignedRoom.getId(),
                RoomType.DELUXE.name());

        assertEquals("CHECKED_IN", response.getStatus());
        assertEquals("404", response.getRoomNumber());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room persistedAssignedRoom = roomRepository.findById(assignedRoom.getId()).orElseThrow();
        Room persistedOriginalRoom = roomRepository.findById(originalRoom.getId()).orElseThrow();

        assertEquals(assignedRoom.getId(), persistedReservation.getRoom().getId());
        assertEquals(RoomType.DELUXE, persistedReservation.getRoomType());
        assertEquals(new BigDecimal("5000.00"), persistedReservation.getTotalAmount());
        assertEquals(ReservationStatus.CHECKED_IN, persistedReservation.getStatus());
        assertNotNull(persistedReservation.getActualCheckInTime());
        assertEquals(RoomStatus.OCCUPIED, persistedAssignedRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, persistedOriginalRoom.getStatus());
    }

    @Test
    void checkInWithRoomAssignmentShouldRejectUnavailableRoomWithoutMutatingReservation() {
        Hotel hotel = createHotel("frontdesk-assignment-unavailable");
        Room originalRoom = createRoom(hotel, "405");
        Room unavailableRoom = createRoom(hotel, "406", RoomType.DELUXE, new BigDecimal("2500.00"));
        unavailableRoom.setStatus(RoomStatus.OCCUPIED);
        Room persistedUnavailableRoom = roomRepository.save(unavailableRoom);

        Reservation reservation = createReservation(hotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
                "FD-ASSIGN-002");

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> frontDeskService.checkInWithRoomAssignment(
                        reservation.getId(),
                    persistedUnavailableRoom.getId(),
                        RoomType.DELUXE.name()));

        assertEquals("Room is not available for check-in", exception.getMessage());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room reloadedUnavailableRoom = roomRepository.findById(persistedUnavailableRoom.getId()).orElseThrow();
        Room persistedOriginalRoom = roomRepository.findById(originalRoom.getId()).orElseThrow();

        assertEquals(originalRoom.getId(), persistedReservation.getRoom().getId());
        assertEquals(RoomType.STANDARD, persistedReservation.getRoomType());
        assertEquals(ReservationStatus.BOOKED, persistedReservation.getStatus());
        assertEquals(new BigDecimal("3600.00"), persistedReservation.getTotalAmount());
        assertEquals(RoomStatus.OCCUPIED, reloadedUnavailableRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, persistedOriginalRoom.getStatus());
    }

    @Test
    void checkInWithRoomAssignmentShouldRejectEarlyCheckInWithoutMutatingReservation() {
        Hotel hotel = createHotel("frontdesk-assignment-early");
        Room originalRoom = createRoom(hotel, "407");
        Room assignedRoom = createRoom(hotel, "408", RoomType.DELUXE, new BigDecimal("2500.00"));
        Reservation reservation = createReservation(hotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
                "FD-ASSIGN-003");
        reservation.setCheckInDate(LocalDate.now().plusDays(2));
        Reservation persistedEarlyReservation = reservationRepository.save(reservation);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> frontDeskService.checkInWithRoomAssignment(
                persistedEarlyReservation.getId(),
                        assignedRoom.getId(),
                        RoomType.DELUXE.name()));

        assertEquals("Early check-in is not allowed", exception.getMessage());

        Reservation persistedReservation = reservationRepository.findById(persistedEarlyReservation.getId()).orElseThrow();
        Room persistedAssignedRoom = roomRepository.findById(assignedRoom.getId()).orElseThrow();
        Room persistedOriginalRoom = roomRepository.findById(originalRoom.getId()).orElseThrow();

        assertEquals(originalRoom.getId(), persistedReservation.getRoom().getId());
        assertEquals(RoomType.STANDARD, persistedReservation.getRoomType());
        assertEquals(ReservationStatus.BOOKED, persistedReservation.getStatus());
        assertNotNull(persistedReservation.getCheckInDate());
        assertEquals(new BigDecimal("3600.00"), persistedReservation.getTotalAmount());
        assertEquals(RoomStatus.AVAILABLE, persistedAssignedRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, persistedOriginalRoom.getStatus());
    }

        @Test
        void updateBookingShouldKeepAssignedRoomAvailableForBookedReservation() {
        Hotel hotel = createHotel("frontdesk-update-booked");
        Room originalRoom = createRoom(hotel, "409");
        Room reassignedRoom = createRoom(hotel, "410", RoomType.DELUXE, new BigDecimal("2500.00"));
        Reservation reservation = createReservation(hotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
            "FD-UPDATE-001");

        when(bookingService.convertToBookingResponse(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            response.setRoomNumber(updatedReservation.getRoom() != null ? updatedReservation.getRoom().getRoomNumber() : null);
            return response;
        });

        com.bookmyhotel.dto.BookingRequest request = new com.bookmyhotel.dto.BookingRequest();
        request.setCheckInDate(reservation.getCheckInDate());
        request.setCheckOutDate(reservation.getCheckOutDate());
        request.setGuests(2);
        request.setGuestName("Front Desk Guest");
        request.setGuestEmail("frontdesk.guest@example.com");
        request.setGuestPhone("+251900000300");
        request.setRoomId(reassignedRoom.getId());

        BookingResponse response = frontDeskService.updateBooking(reservation.getId(), request);

        assertEquals("BOOKED", response.getStatus());
        assertEquals("410", response.getRoomNumber());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room persistedOriginalRoom = roomRepository.findById(originalRoom.getId()).orElseThrow();
        Room persistedReassignedRoom = roomRepository.findById(reassignedRoom.getId()).orElseThrow();

        assertEquals(RoomType.DELUXE, persistedReservation.getRoomType());
        assertEquals(new BigDecimal("5000.00"), persistedReservation.getTotalAmount());
        assertEquals(RoomStatus.AVAILABLE, persistedOriginalRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, persistedReassignedRoom.getStatus());
        }

        @Test
        void checkInGuestShouldRequireAssignedRoom() {
        Hotel hotel = createHotel("frontdesk-checkin-no-room");
        Room room = createRoom(hotel, "411");
            Reservation reservation = createReservation(hotel, room, ReservationStatus.BOOKED, PaymentStatus.PENDING,
            "FD-CHECKIN-004");
        reservation.setRoom(null);
            Reservation reservationWithoutRoom = reservationRepository.save(reservation);

        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
                () -> frontDeskService.checkInGuest(reservationWithoutRoom.getId()));

        assertEquals("An assigned room is required before check-in", exception.getMessage());
        }

        @Test
        void checkInWithRoomAssignmentShouldRejectRoomFromDifferentHotel() {
        Hotel reservationHotel = createHotel("frontdesk-cross-hotel-a");
        Hotel otherHotel = createHotel("frontdesk-cross-hotel-b");
        Room originalRoom = createRoom(reservationHotel, "412");
        Room otherHotelRoom = createRoom(otherHotel, "501", RoomType.DELUXE, new BigDecimal("2600.00"));
        Reservation reservation = createReservation(reservationHotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
            "FD-CHECKIN-005");

        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> frontDeskService.checkInWithRoomAssignment(
                reservation.getId(),
                otherHotelRoom.getId(),
                RoomType.DELUXE.name()));

        assertEquals("Selected room does not belong to the reservation hotel", exception.getMessage());
        }

        @Test
        void checkInWithRoomAssignmentShouldRejectRoomBookedByAnotherReservationForSameDates() {
        Hotel hotel = createHotel("frontdesk-overlap");
        Room originalRoom = createRoom(hotel, "413");
        Room contestedRoom = createRoom(hotel, "414", RoomType.DELUXE, new BigDecimal("2500.00"));
        Reservation reservation = createReservation(hotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
            "FD-CHECKIN-006");
        createReservation(hotel, contestedRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING, "FD-CHECKIN-007");

        IllegalStateException exception = assertThrows(
            IllegalStateException.class,
            () -> frontDeskService.checkInWithRoomAssignment(
                reservation.getId(),
                contestedRoom.getId(),
                RoomType.DELUXE.name()));

        assertEquals("Selected room is currently occupied", exception.getMessage());
        }

        @Test
        void updateBookingRoomAssignmentShouldAlignRoomTypeAndPriceToAssignedRoom() {
        Hotel hotel = createHotel("frontdesk-reassign-align");
        Room originalRoom = createRoom(hotel, "415");
        Room deluxeRoom = createRoom(hotel, "416", RoomType.DELUXE, new BigDecimal("2500.00"));
        Reservation reservation = createReservation(hotel, originalRoom, ReservationStatus.BOOKED, PaymentStatus.PENDING,
            "FD-ASSIGN-004");

        when(bookingService.convertToBookingResponse(any(Reservation.class))).thenAnswer(invocation -> {
            Reservation updatedReservation = invocation.getArgument(0);
            BookingResponse response = new BookingResponse();
            response.setReservationId(updatedReservation.getId());
            response.setStatus(updatedReservation.getStatus().name());
            response.setRoomNumber(updatedReservation.getRoom() != null ? updatedReservation.getRoom().getRoomNumber() : null);
            return response;
        });

        BookingResponse response = frontDeskService.updateBookingRoomAssignment(
            reservation.getId(),
            deluxeRoom.getId(),
            null);

        assertEquals("BOOKED", response.getStatus());
        assertEquals("416", response.getRoomNumber());

        Reservation persistedReservation = reservationRepository.findById(reservation.getId()).orElseThrow();
        Room persistedOriginalRoom = roomRepository.findById(originalRoom.getId()).orElseThrow();
        Room persistedDeluxeRoom = roomRepository.findById(deluxeRoom.getId()).orElseThrow();

        assertEquals(RoomType.DELUXE, persistedReservation.getRoomType());
        assertEquals(new BigDecimal("5000.00"), persistedReservation.getTotalAmount());
        assertEquals(RoomStatus.AVAILABLE, persistedOriginalRoom.getStatus());
        assertEquals(RoomStatus.AVAILABLE, persistedDeluxeRoom.getStatus());
        }

    private Hotel createHotel(String suffix) {
        Tenant tenant = new Tenant();
        tenant.setId("tenant-fd-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setName("Tenant " + suffix);
        tenant.setSubdomain("tenant-fd-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Front Desk Hotel " + suffix);
        hotel.setAddress("Addis Ababa");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251911000000");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(true);
        return hotelRepository.save(hotel);
    }

    private Room createRoom(Hotel hotel, String roomNumber) {
        return createRoom(hotel, roomNumber, RoomType.STANDARD, new BigDecimal("1800.00"));
    }

    private Room createRoom(Hotel hotel, String roomNumber, RoomType roomType, BigDecimal pricePerNight) {
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(roomNumber);
        room.setRoomType(roomType);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);
        room.setCapacity(2);
        room.setPricePerNight(pricePerNight);
        return roomRepository.save(room);
    }

    private Reservation createReservation(Hotel hotel, Room room, ReservationStatus status, PaymentStatus paymentStatus,
            String confirmationNumber) {
        Reservation reservation = new Reservation();
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("1800.00"));
        reservation.setCheckInDate(LocalDate.now());
        reservation.setCheckOutDate(LocalDate.now().plusDays(2));
        reservation.setTotalAmount(new BigDecimal("3600.00"));
        reservation.setStatus(status);
        reservation.setPaymentStatus(paymentStatus);
        reservation.setPaymentMethod("cash");
        reservation.setGuestInfo(new GuestInfo("Front Desk Guest", "frontdesk.guest@example.com", "+251900000300"));
        reservation.setNumberOfGuests(2);
        reservation.setConfirmationNumber(confirmationNumber);
        return reservationRepository.save(reservation);
    }
}