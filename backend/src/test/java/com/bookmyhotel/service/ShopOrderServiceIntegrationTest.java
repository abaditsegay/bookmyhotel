package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.bookmyhotel.dto.ShopOrderItemRequest;
import com.bookmyhotel.dto.ShopOrderRequest;
import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.dto.TaxBreakdown;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.support.MySqlIntegrationTestSupport;

@Testcontainers
@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-ops-workflow-test.sql"
})
class ShopOrderServiceIntegrationTest extends MySqlIntegrationTestSupport {

    @Container
    static final org.testcontainers.containers.MySQLContainer<?> MYSQL = MySqlIntegrationTestSupport.MYSQL;

    @Autowired
    private ShopOrderService shopOrderService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ShopOrderRepository shopOrderRepository;

    @MockitoBean
    private RoomChargeService roomChargeService;

    @MockitoBean
    private TaxCalculationService taxCalculationService;

    @MockitoBean
    private HotelActivityAuditService hotelActivityAuditService;

    @BeforeEach
    void setup() {
        when(taxCalculationService.calculateTaxes(any(), any()))
                .thenReturn(new TaxBreakdown(new BigDecimal("3.00"), new BigDecimal("1.00"), BigDecimal.ZERO));
    }

    @Test
    void createOrderShouldPersistRoomChargeWorkflowAndDecrementStock() {
        Hotel hotel = createHotel("shop-flow");
        Room room = createRoom(hotel, "201");
        Reservation reservation = createCheckedInReservation(hotel, room);
        Product product = createProduct(hotel, "WATER-01", new BigDecimal("10.00"), 10);

        ShopOrderRequest request = new ShopOrderRequest();
        request.setCustomerName("Guest User");
        request.setCustomerEmail("guest@example.com");
        request.setCustomerPhone("+251900000100");
        request.setRoomNumber("201");
        request.setPaymentMethod(PaymentMethod.ROOM_CHARGE);
        request.setItems(List.of(new ShopOrderItemRequest(product.getId(), 2)));
        request.setIsDelivery(false);
        request.setNotes("Charge to room");

        ShopOrderResponse response = shopOrderService.createOrder(hotel.getId(), request);

        assertNotNull(response.getId());
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertFalse(response.getIsPaid());
        assertEquals(new BigDecimal("24.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("4.00"), response.getTaxAmount());
        assertEquals(reservation.getId(), response.getReservationId());
        assertEquals(PaymentMethod.ROOM_CHARGE, response.getPaymentMethod());
        assertEquals(1, response.getItems().size());

        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(8, updatedProduct.getStockQuantity());

        ShopOrder persistedOrder = shopOrderRepository.findById(response.getId()).orElseThrow();
        assertEquals(hotel.getId(), persistedOrder.getHotel().getId());
        assertEquals(reservation.getId(), persistedOrder.getReservation().getId());
        assertEquals("201", persistedOrder.getRoomNumber());
        assertEquals(new BigDecimal("24.00"), persistedOrder.getTotalAmount());

        verify(roomChargeService).createChargeFromShopOrder(any(ShopOrder.class), eq(hotel.getId()));
    }

    private Hotel createHotel(String suffix) {
        Tenant tenant = new Tenant();
        tenant.setId("tenant-shop-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setName("Tenant " + suffix);
        tenant.setSubdomain("tenant-shop-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Shop Hotel " + suffix);
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
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);
        room.setCapacity(2);
        room.setPricePerNight(new BigDecimal("1500.00"));
        return roomRepository.save(room);
    }

    private Reservation createCheckedInReservation(Hotel hotel, Room room) {
        Reservation reservation = new Reservation();
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setRoomType(RoomType.STANDARD);
        reservation.setPricePerNight(new BigDecimal("1500.00"));
        reservation.setCheckInDate(LocalDate.now().minusDays(1));
        reservation.setCheckOutDate(LocalDate.now().plusDays(2));
        reservation.setTotalAmount(new BigDecimal("3000.00"));
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setGuestInfo(new GuestInfo("Guest User", "guest@example.com", "+251900000100"));
        reservation.setNumberOfGuests(2);
        reservation.setConfirmationNumber("BKSHOP0001");
        return reservationRepository.save(reservation);
    }

    private Product createProduct(Hotel hotel, String sku, BigDecimal price, int stockQuantity) {
        Product product = new Product();
        product.setHotel(hotel);
        product.setName("Water Bottle");
        product.setDescription("Still mineral water");
        product.setCategory(ProductCategory.BEVERAGES);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setMinimumStockLevel(2);
        product.setSku(sku);
        product.setIsActive(true);
        product.setIsAvailable(true);
        return productRepository.save(product);
    }
}