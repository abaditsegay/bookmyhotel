package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.bookmyhotel.dto.RoomChargeCreateRequest;
import com.bookmyhotel.dto.RoomChargeResponse;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomCharge;
import com.bookmyhotel.entity.RoomChargeType;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomChargeRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.support.MySqlIntegrationTestSupport;

@Testcontainers
@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-ops-workflow-test.sql"
})
class RoomChargeServiceIntegrationTest extends MySqlIntegrationTestSupport {

    @Container
    static final org.testcontainers.containers.MySQLContainer<?> MYSQL = MySqlIntegrationTestSupport.MYSQL;

    @Autowired
    private RoomChargeService roomChargeService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ShopOrderRepository shopOrderRepository;

    @Autowired
    private RoomChargeRepository roomChargeRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void createRoomChargeShouldPersistChargeCreatorAndShopOrderLink() {
        Hotel hotel = createHotel("room-charge-create");
        Room room = createRoom(hotel, "501");
        Reservation reservation = createReservation(hotel, room, "RC-RES-001");
        ShopOrder shopOrder = createShopOrder(hotel, reservation);
        User staff = createUser(hotel, "charges@example.com");

        RoomChargeCreateRequest request = new RoomChargeCreateRequest();
        request.setReservationId(reservation.getId());
        request.setShopOrderId(shopOrder.getId());
        request.setDescription("Laundry bag service");
        request.setAmount(new BigDecimal("45.00"));
        request.setChargeType(RoomChargeType.LAUNDRY);
        request.setNotes("Collected at reception");

        RoomChargeResponse response = roomChargeService.createRoomCharge(request, staff.getEmail(), hotel.getId());

        assertNotNull(response.getId());
        assertEquals(hotel.getId(), response.getHotelId());
        assertEquals(reservation.getId(), response.getReservationId());
        assertEquals(shopOrder.getId(), response.getShopOrderId());
        assertEquals(new BigDecimal("45.00"), response.getAmount());
        assertEquals(RoomChargeType.LAUNDRY, response.getChargeType());
        assertFalse(response.getIsPaid());
        assertEquals(staff.getId(), response.getCreatedBy());
        assertEquals("Front Desk Guest", response.getGuestName());
        assertEquals("501", response.getRoomNumber());
        assertEquals("RC-RES-001", response.getReservationConfirmationNumber());

        RoomCharge persistedCharge = roomChargeRepository.findById(response.getId()).orElseThrow();
        assertEquals(hotel.getId(), persistedCharge.getHotel().getId());
        assertEquals(shopOrder.getId(), persistedCharge.getShopOrder().getId());
        assertEquals(staff.getId(), persistedCharge.getCreatedBy().getId());
        assertEquals("Collected at reception", persistedCharge.getNotes());
        assertNotNull(persistedCharge.getChargeDate());
    }

    @Test
    void markChargeAsPaidShouldPersistPaidStateAndKeepReservationScope() {
        Hotel hotel = createHotel("room-charge-paid");
        Room room = createRoom(hotel, "502");
        Reservation reservation = createReservation(hotel, room, "RC-RES-002");

        RoomCharge charge = new RoomCharge(hotel, reservation, "Mini bar snack", new BigDecimal("30.00"),
                RoomChargeType.MINIBAR);
        charge.setNotes("Added after guest request");
        charge = roomChargeRepository.save(charge);

        RoomChargeResponse response = roomChargeService.markChargeAsPaid(hotel.getId(), charge.getId(), "PAY-RC-1");

        assertTrue(response.getIsPaid());
        assertNotNull(response.getPaidAt());

        RoomCharge persistedCharge = roomChargeRepository.findById(charge.getId()).orElseThrow();
        assertTrue(persistedCharge.getIsPaid());
        assertNotNull(persistedCharge.getPaidAt());
        assertEquals(reservation.getId(), persistedCharge.getReservation().getId());
        assertNull(persistedCharge.getUpdatedAt());
    }

        @Test
        void getTotalUnpaidAmountShouldSumOnlyOpenChargesForReservation() {
        Hotel hotel = createHotel("room-charge-total");
        Room room = createRoom(hotel, "503");
        Reservation reservation = createReservation(hotel, room, "RC-RES-003");

        RoomCharge unpaidLaundry = new RoomCharge(hotel, reservation, "Laundry service", new BigDecimal("45.00"),
            RoomChargeType.LAUNDRY);
        RoomCharge unpaidMinibar = new RoomCharge(hotel, reservation, "Mini bar items", new BigDecimal("30.00"),
            RoomChargeType.MINIBAR);
        RoomCharge paidTransfer = new RoomCharge(hotel, reservation, "Airport transfer", new BigDecimal("80.00"),
            RoomChargeType.OTHER);
        paidTransfer.markAsPaid("PAY-RC-2");

        roomChargeRepository.save(unpaidLaundry);
        roomChargeRepository.save(unpaidMinibar);
        roomChargeRepository.save(paidTransfer);

        BigDecimal totalUnpaidAmount = roomChargeService.getTotalUnpaidAmount(hotel.getId(), reservation.getId());

        assertEquals(new BigDecimal("75.00"), totalUnpaidAmount);
    }

    @Test
    void getUnpaidChargesForReservationShouldReturnOnlyUnpaidChargeDetails() {
    Hotel hotel = createHotel("room-charge-unpaid-list");
    Room room = createRoom(hotel, "504");
    Reservation reservation = createReservation(hotel, room, "RC-RES-004");

    RoomCharge unpaidLaundry = new RoomCharge(hotel, reservation, "Laundry service", new BigDecimal("45.00"),
        RoomChargeType.LAUNDRY);
    RoomCharge unpaidMinibar = new RoomCharge(hotel, reservation, "Mini bar items", new BigDecimal("30.00"),
        RoomChargeType.MINIBAR);
    RoomCharge paidOther = new RoomCharge(hotel, reservation, "Airport transfer", new BigDecimal("80.00"),
        RoomChargeType.OTHER);
    paidOther.markAsPaid("PAY-RC-3");

    roomChargeRepository.save(unpaidLaundry);
    roomChargeRepository.save(unpaidMinibar);
    roomChargeRepository.save(paidOther);

    List<RoomChargeResponse> unpaidCharges = roomChargeService.getUnpaidChargesForReservation(
        hotel.getId(),
        reservation.getId());

    assertEquals(2, unpaidCharges.size());
    assertTrue(unpaidCharges.stream().allMatch(charge -> Boolean.FALSE.equals(charge.getIsPaid())));
    assertTrue(unpaidCharges.stream().allMatch(charge -> reservation.getId().equals(charge.getReservationId())));
    assertTrue(unpaidCharges.stream().allMatch(charge -> "504".equals(charge.getRoomNumber())));
    assertTrue(unpaidCharges.stream().anyMatch(charge -> "Laundry service".equals(charge.getDescription())
        && new BigDecimal("45.00").equals(charge.getAmount())));
    assertTrue(unpaidCharges.stream().anyMatch(charge -> "Mini bar items".equals(charge.getDescription())
        && new BigDecimal("30.00").equals(charge.getAmount())));
    }

        @Test
        void getRoomChargesForHotelShouldReturnOnlyChargesForRequestedHotel() {
        Hotel targetHotel = createHotel("room-charge-hotel-page");
        Room targetRoom = createRoom(targetHotel, "505");
        Reservation targetReservation = createReservation(targetHotel, targetRoom, "RC-RES-005");

        Hotel otherHotel = createHotel("room-charge-hotel-page-other");
        Room otherRoom = createRoom(otherHotel, "506");
        Reservation otherReservation = createReservation(otherHotel, otherRoom, "RC-RES-006");

        roomChargeRepository.save(new RoomCharge(targetHotel, targetReservation, "Laundry service", new BigDecimal("45.00"),
            RoomChargeType.LAUNDRY));
        roomChargeRepository.save(new RoomCharge(targetHotel, targetReservation, "Mini bar items", new BigDecimal("30.00"),
            RoomChargeType.MINIBAR));
        roomChargeRepository.save(new RoomCharge(otherHotel, otherReservation, "Other hotel charge", new BigDecimal("80.00"),
            RoomChargeType.OTHER));

        Page<RoomChargeResponse> chargesPage = roomChargeService.getRoomChargesForHotel(
            targetHotel.getId(),
            PageRequest.of(0, 10));

        assertEquals(2, chargesPage.getTotalElements());
        assertEquals(2, chargesPage.getContent().size());
        assertTrue(chargesPage.getContent().stream().allMatch(charge -> targetHotel.getId().equals(charge.getHotelId())));
        assertTrue(chargesPage.getContent().stream().allMatch(charge -> targetReservation.getId().equals(charge.getReservationId())));
        assertTrue(chargesPage.getContent().stream().allMatch(charge -> "505".equals(charge.getRoomNumber())));
        assertTrue(chargesPage.getContent().stream().anyMatch(charge -> "Laundry service".equals(charge.getDescription())));
        assertTrue(chargesPage.getContent().stream().anyMatch(charge -> "Mini bar items".equals(charge.getDescription())));
        }

    private Hotel createHotel(String suffix) {
        Tenant tenant = new Tenant();
        tenant.setId("tenant-rc-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setName("Tenant " + suffix);
        tenant.setSubdomain("tenant-rc-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Room Charge Hotel " + suffix);
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
        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber(roomNumber);
        room.setRoomType(RoomType.STANDARD);
        room.setStatus(RoomStatus.OCCUPIED);
        room.setIsAvailable(true);
        room.setCapacity(2);
        room.setPricePerNight(new BigDecimal("1800.00"));
        return roomRepository.save(room);
    }

    private Reservation createReservation(Hotel hotel, Room room, String confirmationNumber) {
        Reservation reservation = new Reservation();
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("1800.00"));
        reservation.setCheckInDate(LocalDate.now().minusDays(1));
        reservation.setCheckOutDate(LocalDate.now().plusDays(2));
        reservation.setTotalAmount(new BigDecimal("5400.00"));
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setGuestInfo(new GuestInfo("Front Desk Guest", "roomcharge.guest@example.com", "+251900000301"));
        reservation.setNumberOfGuests(2);
        reservation.setConfirmationNumber(confirmationNumber);
        return reservationRepository.save(reservation);
    }

    private ShopOrder createShopOrder(Hotel hotel, Reservation reservation) {
        ShopOrder shopOrder = new ShopOrder();
        shopOrder.setHotel(hotel);
        shopOrder.setOrderNumber("SHOP-" + UUID.randomUUID().toString().substring(0, 8));
        shopOrder.setReservation(reservation);
        shopOrder.setCustomerName("Front Desk Guest");
        shopOrder.setCustomerEmail("roomcharge.guest@example.com");
        shopOrder.setCustomerPhone("+251900000301");
        shopOrder.setRoomNumber(reservation.getRoom().getRoomNumber());
        shopOrder.setStatus(OrderStatus.PENDING);
        shopOrder.setTotalAmount(new BigDecimal("45.00"));
        shopOrder.setPaymentMethod("ROOM_CHARGE");
        shopOrder.setIsPaid(false);
        return shopOrderRepository.save(shopOrder);
    }

    private User createUser(Hotel hotel, String email) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setFirstName("Charge");
        user.setLastName("Operator");
        user.setPhone("+251900000400");
        user.setIsActive(true);
        user.setHotel(hotel);
        return userRepository.save(user);
    }
}