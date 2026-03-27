package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.exception.BookingException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.TenantRepository;

@Testcontainers
@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-booking-concurrency-test.sql"
})
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class BookingServiceConcurrencyIntegrationTest {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("bookmyhotel_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        if (!MYSQL.isRunning()) {
            MYSQL.start();
        }
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @MockBean
    private EmailService emailService;

    @MockBean
    private BookingTokenService bookingTokenService;

    @MockBean
    private RoomTypePricingService roomTypePricingService;

    @MockBean
    private HotelPricingConfigService hotelPricingConfigService;

    @BeforeEach
    void setup() {
        when(bookingTokenService.generateManagementUrl(anyLong(), anyString(), anyString()))
                .thenReturn("http://localhost:3000/manage/mock-token");
        when(roomTypePricingService.getBasePriceForRoomType(anyLong(), eq(RoomType.STANDARD)))
                .thenReturn(BigDecimal.valueOf(1500));
        when(hotelPricingConfigService.getActiveConfiguration(anyLong())).thenReturn(null);
        doNothing().when(emailService).sendBookingConfirmationEmail(org.mockito.ArgumentMatchers.any(), anyString(),
                org.mockito.ArgumentMatchers.anyBoolean());
    }

    @Test
    void shouldAllowOnlyOneRoomTypeBookingWhenOnlyOneRoomExists() throws Exception {
        Hotel hotel = createHotelWithSingleRoom(RoomType.STANDARD);

        BookingRequest request1 = buildBookingRequest(hotel.getId(), "guest1@example.com", "+251900000001");
        BookingRequest request2 = buildBookingRequest(hotel.getId(), "guest2@example.com", "+251900000002");

        CountDownLatch startLatch = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        Callable<Result> task1 = () -> runBookingCall(startLatch, request1);
        Callable<Result> task2 = () -> runBookingCall(startLatch, request2);

        List<Future<Result>> futures = new ArrayList<>();
        futures.add(executor.submit(task1));
        futures.add(executor.submit(task2));

        startLatch.countDown();

        List<Result> results = new ArrayList<>();
        for (Future<Result> future : futures) {
            results.add(future.get(30, TimeUnit.SECONDS));
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);

        long successCount = results.stream().filter(Result::success).count();
        long failureCount = results.stream().filter(r -> !r.success()).count();

        assertEquals(1, successCount, "Only one concurrent booking should succeed");
        assertEquals(1, failureCount, "One concurrent booking should fail due to no availability");

        Result failed = results.stream().filter(r -> !r.success()).findFirst().orElseThrow();
        assertTrue(failed.errorMessage() != null && failed.errorMessage().contains("No available rooms of type"));

        List<Reservation> reservations = reservationRepository.findByHotelId(hotel.getId());
        assertEquals(1, reservations.size(), "Only one reservation should be persisted");
        assertNotNull(reservations.get(0).getConfirmationNumber());
    }

    private Result runBookingCall(CountDownLatch startLatch, BookingRequest request) {
        try {
            startLatch.await(10, TimeUnit.SECONDS);
            BookingResponse response = bookingService.createBookingByRoomType(request, null);
            return new Result(true, response.getConfirmationNumber(), null);
        } catch (BookingException e) {
            return new Result(false, null, e.getMessage());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new Result(false, null, "Thread interrupted");
        } catch (Exception e) {
            Throwable cause = e instanceof ExecutionException ? e.getCause() : e;
            String message = cause != null ? cause.getMessage() : e.getMessage();
            return new Result(false, null, message);
        }
    }

    private Hotel createHotelWithSingleRoom(RoomType roomType) {
        Tenant tenant = new Tenant();
        tenant.setId("tenant-" + UUID.randomUUID());
        tenant.setName("Tenant One");
        tenant.setSubdomain("tenant-one-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Concurrent Test Hotel");
        hotel.setAddress("Addis Ababa");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251911000000");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(true);
        hotel = hotelRepository.save(hotel);

        Room room = new Room();
        room.setHotel(hotel);
        room.setRoomNumber("101");
        room.setRoomType(roomType);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setIsAvailable(true);
        room.setCapacity(2);
        room.setPricePerNight(BigDecimal.valueOf(1500));
        roomRepository.save(room);

        return hotel;
    }

    private BookingRequest buildBookingRequest(Long hotelId, String email, String phone) {
        BookingRequest request = new BookingRequest();
        request.setHotelId(hotelId);
        request.setRoomType(RoomType.STANDARD);
        request.setCheckInDate(LocalDate.now().plusDays(2));
        request.setCheckOutDate(LocalDate.now().plusDays(4));
        request.setGuests(1);
        request.setGuestName("Guest User");
        request.setGuestEmail(email);
        request.setGuestPhone(phone);
        return request;
    }

    private record Result(boolean success, String confirmationNumber, String errorMessage) {
    }
}
