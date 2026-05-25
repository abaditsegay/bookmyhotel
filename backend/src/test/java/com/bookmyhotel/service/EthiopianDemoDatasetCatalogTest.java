package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelPricingConfig;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.BookingHistoryRepository;
import com.bookmyhotel.repository.BookingNotificationRepository;
import com.bookmyhotel.repository.HotelPricingConfigRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.MaintenanceTaskRepository;
import com.bookmyhotel.repository.ProductRepository;
import com.bookmyhotel.repository.PromotionalCodeRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomChargeRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.RoomTypePricingRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
import com.bookmyhotel.repository.StaffScheduleRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class EthiopianDemoDatasetCatalogTest {

    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private HotelRepository hotelRepository;
    @Mock
    private HotelPricingConfigRepository hotelPricingConfigRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private RoomTypePricingRepository roomTypePricingRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ReservationRepository reservationRepository;
    @Mock
    private ShopOrderRepository shopOrderRepository;
    @Mock
    private RoomChargeRepository roomChargeRepository;
    @Mock
    private HousekeepingTaskRepository housekeepingTaskRepository;
    @Mock
    private MaintenanceTaskRepository maintenanceTaskRepository;
    @Mock
    private StaffScheduleRepository staffScheduleRepository;
    @Mock
    private PromotionalCodeRepository promotionalCodeRepository;
    @Mock
    private BookingHistoryRepository bookingHistoryRepository;
    @Mock
    private BookingNotificationRepository bookingNotificationRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private EthiopianDemoDatasetSeeder ethiopianDemoDatasetSeeder;

    @Test
    void hotelSeedSpecsShouldMatchRequestedDistribution() {
        Map<Integer, Long> byRoomCount = EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream()
                .collect(Collectors.groupingBy(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount, Collectors.counting()));

        assertEquals(20, EthiopianDemoDatasetCatalog.hotelSeedSpecs().size());
        assertEquals(2000, EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream()
                .mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount)
                .sum());
        assertEquals(10L, byRoomCount.getOrDefault(100, 0L));
        assertEquals(5L, byRoomCount.getOrDefault(50, 0L));
        assertEquals(5L, byRoomCount.getOrDefault(150, 0L));
    }

    @Test
    void lastNamesShouldExcludeFemaleFirstNames() {
        assertTrue(EthiopianDemoDatasetCatalog.femaleNamesExcludedFromLastNames());
    }

    @Test
    void reportShouldSummarizeRequestedDatasetShape() {
        EthiopianDemoDatasetSeeder.DatasetReport report = new EthiopianDemoDatasetSeeder.DatasetReport(
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().size(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().filter(spec -> spec.roomCount() == 50).count(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().filter(spec -> spec.roomCount() == 100).count(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().filter(spec -> spec.roomCount() == 150).count(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::reservationCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::shopOrderCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::maintenanceTaskCount).sum(),
                EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::customerCount).sum(),
                EthiopianDemoDatasetCatalog.femaleNamesExcludedFromLastNames());

        assertEquals(20, report.hotelCount());
        assertEquals(2000, report.totalRoomCount());
        assertEquals(5, report.hotelsWith50Rooms());
        assertEquals(10, report.hotelsWith100Rooms());
        assertEquals(5, report.hotelsWith150Rooms());
        assertTrue(report.femaleNamesExcludedFromLastNames());
    }

    @Test
    void resetAndSeedShouldClearPricingConfigAndSeedHotelTaxConfiguration() {
        ReflectionTestUtils.setField(ethiopianDemoDatasetSeeder, "tenantId", "ethiopian-demo");
        ReflectionTestUtils.setField(ethiopianDemoDatasetSeeder, "defaultPassword", "DemoAccess2026!");
        when(jdbcTemplate.queryForObject(anyString(), eq(Integer.class), anyString())).thenReturn(1);
        when(tenantRepository.findById(anyString())).thenReturn(java.util.Optional.empty());
        when(tenantRepository.save(any(Tenant.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel hotel = invocation.getArgument(0);
            if (hotel.getId() == null) {
                hotel.setId((long) (EthiopianDemoDatasetCatalog.hotelSeedSpecs().indexOf(
                        EthiopianDemoDatasetCatalog.hotelSeedSpecs().stream()
                                .filter(spec -> spec.name().equals(hotel.getName()))
                                .findFirst()
                                .orElseThrow()) + 1));
            }
            return hotel;
        });
        when(hotelPricingConfigRepository.save(any(HotelPricingConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomTypePricingRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(productRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(shopOrderRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomChargeRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(housekeepingTaskRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(maintenanceTaskRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(staffScheduleRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(promotionalCodeRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");

        ethiopianDemoDatasetSeeder.resetAndSeed("samuelweld2018@gmail.com");

        verify(jdbcTemplate, atLeastOnce()).update("DELETE FROM hotel_pricing_config");

        ArgumentCaptor<HotelPricingConfig> pricingConfigCaptor = ArgumentCaptor.forClass(HotelPricingConfig.class);
        verify(hotelPricingConfigRepository, atLeastOnce()).save(pricingConfigCaptor.capture());
        HotelPricingConfig seededConfig = pricingConfigCaptor.getAllValues().getFirst();
        assertEquals(new java.math.BigDecimal("0.1500"), seededConfig.getVatRate());
        assertEquals(new java.math.BigDecimal("0.0500"), seededConfig.getServiceTaxRate());
        assertEquals(new java.math.BigDecimal("0.0200"), seededConfig.getCityTaxRate());
    }
}