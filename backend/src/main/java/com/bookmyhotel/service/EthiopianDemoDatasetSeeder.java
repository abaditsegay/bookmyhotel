package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.BookingActionType;
import com.bookmyhotel.entity.BookingHistory;
import com.bookmyhotel.entity.BookingNotification;
import com.bookmyhotel.entity.DiscountType;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelPricingConfig;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.MaintenanceTask;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.entity.PromotionalCode;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomCharge;
import com.bookmyhotel.entity.RoomChargeType;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.RoomTypePricing;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.ShopOrderItem;
import com.bookmyhotel.entity.StaffSchedule;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.TaskStatus;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.enums.NotificationStatus;
import com.bookmyhotel.enums.NotificationType;
import com.bookmyhotel.repository.BookingHistoryRepository;
import com.bookmyhotel.repository.BookingNotificationRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.HotelPricingConfigRepository;
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

@Service
@Transactional
public class EthiopianDemoDatasetSeeder {

    private static final Logger logger = LoggerFactory.getLogger(EthiopianDemoDatasetSeeder.class);
    private static final long RANDOM_SEED = 20260514L;
    private static final Map<RoomType, BigDecimal> BASE_PRICES = Map.of(
            RoomType.STANDARD, new BigDecimal("3200.00"),
            RoomType.DELUXE, new BigDecimal("4300.00"),
            RoomType.SUITE, new BigDecimal("6200.00"),
            RoomType.FAMILY, new BigDecimal("5600.00"),
            RoomType.ACCESSIBLE, new BigDecimal("3500.00"),
            RoomType.PRESIDENTIAL, new BigDecimal("12000.00"));
        private static final BigDecimal DEFAULT_VAT_RATE = new BigDecimal("0.1500");
        private static final BigDecimal DEFAULT_SERVICE_TAX_RATE = new BigDecimal("0.0500");
        private static final BigDecimal DEFAULT_CITY_TAX_RATE = new BigDecimal("0.0200");

    private final TenantRepository tenantRepository;
    private final HotelRepository hotelRepository;
        private final HotelPricingConfigRepository hotelPricingConfigRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomTypePricingRepository roomTypePricingRepository;
    private final ProductRepository productRepository;
    private final ReservationRepository reservationRepository;
    private final ShopOrderRepository shopOrderRepository;
    private final RoomChargeRepository roomChargeRepository;
    private final HousekeepingTaskRepository housekeepingTaskRepository;
    private final MaintenanceTaskRepository maintenanceTaskRepository;
    private final StaffScheduleRepository staffScheduleRepository;
    private final PromotionalCodeRepository promotionalCodeRepository;
    private final BookingHistoryRepository bookingHistoryRepository;
    private final BookingNotificationRepository bookingNotificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.bootstrap.ethiopian-demo.tenant-id:ethiopian-demo}")
    private String tenantId;

    @Value("${app.bootstrap.ethiopian-demo.default-password:DemoAccess2026!}")
    private String defaultPassword;

        public record DatasetReport(
            int hotelCount,
            int totalRoomCount,
            long hotelsWith50Rooms,
            long hotelsWith100Rooms,
            long hotelsWith150Rooms,
            int totalReservationCount,
            int totalShopOrderCount,
            int totalMaintenanceTaskCount,
            int totalCustomerCount,
            boolean femaleNamesExcludedFromLastNames) {
        }

    public EthiopianDemoDatasetSeeder(TenantRepository tenantRepository,
            HotelRepository hotelRepository,
            HotelPricingConfigRepository hotelPricingConfigRepository,
            UserRepository userRepository,
            RoomRepository roomRepository,
            RoomTypePricingRepository roomTypePricingRepository,
            ProductRepository productRepository,
            ReservationRepository reservationRepository,
            ShopOrderRepository shopOrderRepository,
            RoomChargeRepository roomChargeRepository,
            HousekeepingTaskRepository housekeepingTaskRepository,
            MaintenanceTaskRepository maintenanceTaskRepository,
            StaffScheduleRepository staffScheduleRepository,
            PromotionalCodeRepository promotionalCodeRepository,
            BookingHistoryRepository bookingHistoryRepository,
            BookingNotificationRepository bookingNotificationRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {
        this.tenantRepository = tenantRepository;
        this.hotelRepository = hotelRepository;
        this.hotelPricingConfigRepository = hotelPricingConfigRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.roomTypePricingRepository = roomTypePricingRepository;
        this.productRepository = productRepository;
        this.reservationRepository = reservationRepository;
        this.shopOrderRepository = shopOrderRepository;
        this.roomChargeRepository = roomChargeRepository;
        this.housekeepingTaskRepository = housekeepingTaskRepository;
        this.maintenanceTaskRepository = maintenanceTaskRepository;
        this.staffScheduleRepository = staffScheduleRepository;
        this.promotionalCodeRepository = promotionalCodeRepository;
        this.bookingHistoryRepository = bookingHistoryRepository;
        this.bookingNotificationRepository = bookingNotificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void resetAndSeed(String preservedSuperAdminEmail) {
        logger.info("Resetting hotel business data and seeding Ethiopian demo dataset");
        logPlannedReport();

        Random random = new Random(RANDOM_SEED);
        resetBusinessData(preservedSuperAdminEmail);

        Tenant tenant = ensureTenant();
        int totalHotels = 0;
        int totalRooms = 0;

        for (int index = 0; index < EthiopianDemoDatasetCatalog.hotelSeedSpecs().size(); index++) {
            EthiopianDemoDatasetCatalog.HotelSeedSpec spec = EthiopianDemoDatasetCatalog.hotelSeedSpecs().get(index);
            SeedContext context = seedHotel(tenant, spec, index, random);
            totalHotels++;
            totalRooms += context.rooms().size();
        }

        logger.info("Seeded Ethiopian demo dataset with {} hotels and {} rooms", totalHotels, totalRooms);
    }

    public DatasetReport buildReport() {
        List<EthiopianDemoDatasetCatalog.HotelSeedSpec> specs = EthiopianDemoDatasetCatalog.hotelSeedSpecs();
        return new DatasetReport(
                specs.size(),
                specs.stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::roomCount).sum(),
                specs.stream().filter(spec -> spec.roomCount() == 50).count(),
                specs.stream().filter(spec -> spec.roomCount() == 100).count(),
                specs.stream().filter(spec -> spec.roomCount() == 150).count(),
                specs.stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::reservationCount).sum(),
                specs.stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::shopOrderCount).sum(),
                specs.stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::maintenanceTaskCount).sum(),
                specs.stream().mapToInt(EthiopianDemoDatasetCatalog.HotelSeedSpec::customerCount).sum(),
                EthiopianDemoDatasetCatalog.femaleNamesExcludedFromLastNames());
    }

    public void logPlannedReport() {
        DatasetReport report = buildReport();
        logger.info(
                "Ethiopian demo dataset report: hotels={}, rooms={}, distribution[50={},100={},150={}], reservations={}, shopOrders={}, maintenanceTasks={}, customers={}, femaleNamesExcludedFromLastNames={}",
                report.hotelCount(),
                report.totalRoomCount(),
                report.hotelsWith50Rooms(),
                report.hotelsWith100Rooms(),
                report.hotelsWith150Rooms(),
                report.totalReservationCount(),
                report.totalShopOrderCount(),
                report.totalMaintenanceTaskCount(),
                report.totalCustomerCount(),
                report.femaleNamesExcludedFromLastNames());
    }

    private Tenant ensureTenant() {
        Optional<Tenant> existingTenant = tenantRepository.findById(tenantId);
        if (existingTenant.isPresent()) {
            return existingTenant.get();
        }

        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Ethiopian Hospitality Collection");
        tenant.setSubdomain("ethiopian-demo");
        tenant.setDescription("Curated Ethiopian hospitality demo dataset");
        tenant.setIsActive(true);
        return tenantRepository.save(tenant);
    }

    private void resetBusinessData(String preservedSuperAdminEmail) {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
        try {
            deleteIfTableExists("booking_modification_history");
            deleteIfTableExists("booking_notifications");
            deleteIfTableExists("booking_history");
            deleteIfTableExists("room_charges");
            deleteIfTableExists("shop_order_items");
            deleteIfTableExists("shop_orders");
            deleteIfTableExists("seasonal_rates");
            deleteIfTableExists("pricing_strategies");
            deleteIfTableExists("hotel_pricing_config");
            deleteIfTableExists("housekeeping_tasks");
            deleteIfTableExists("housekeeping_staff");
            deleteIfTableExists("maintenance_tasks");
            deleteIfTableExists("maintenance_requests");
            deleteIfTableExists("staff_schedules");
            deleteIfTableExists("promotional_codes");
            deleteIfTableExists("todos");
            deleteIfTableExists("uat_defects");
            deleteIfTableExists("uat_checklists");
            deleteIfTableExists("products");
            deleteIfTableExists("room_type_pricing");
            deleteIfTableExists("reservations");
            deleteIfTableExists("rooms");
            deleteIfTableExists("hotel_images");
            deleteIfTableExists("ads");

            if (tableExists("user_roles") && tableExists("users")) {
                jdbcTemplate.update(
                        "DELETE ur FROM user_roles ur " +
                                "JOIN users u ON ur.user_id = u.id " +
                                "LEFT JOIN user_roles keep_role ON keep_role.user_id = u.id AND keep_role.role IN ('SUPER_ADMIN', 'ADMIN') " +
                                "WHERE keep_role.user_id IS NULL AND u.email <> ?",
                        preservedSuperAdminEmail);

                jdbcTemplate.update(
                        "DELETE u FROM users u " +
                                "LEFT JOIN user_roles keep_role ON keep_role.user_id = u.id AND keep_role.role IN ('SUPER_ADMIN', 'ADMIN') " +
                                "WHERE keep_role.user_id IS NULL AND u.email <> ?",
                        preservedSuperAdminEmail);
            }

            if (tableExists("hotels")) {
                jdbcTemplate.update("DELETE FROM hotels");
            }
            if (tableExists("tenants")) {
                jdbcTemplate.update("DELETE FROM tenants WHERE id <> 'system'");
            }
        } finally {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
        }
    }

    private void deleteIfTableExists(String tableName) {
        if (tableExists(tableName)) {
            jdbcTemplate.update("DELETE FROM " + tableName);
        }
    }

    private boolean tableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
                Integer.class,
                tableName);
        return count != null && count > 0;
    }

    private SeedContext seedHotel(Tenant tenant, EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int seedIndex, Random random) {
        Hotel hotel = createHotel(tenant, spec, seedIndex);
        HotelPricingConfig pricingConfig = createHotelPricingConfig(hotel, seedIndex);
        List<RoomTypePricing> pricing = createRoomTypePricing(hotel);
        List<Room> rooms = createRooms(hotel, spec.roomCount(), random);
        StaffBundle staff = createStaff(hotel, spec, seedIndex, random);
        List<User> customers = createCustomers(spec, seedIndex, random);
        List<Product> products = createProducts(hotel, spec, seedIndex);
        List<Reservation> reservations = createReservations(hotel, rooms, customers, pricingConfig, spec, seedIndex, random);

        createShopOrders(hotel, reservations, products, customers, spec, seedIndex, random);
        createRoomCharges(hotel, reservations, spec, staff.hotelAdmin(), random);
        createHousekeepingTasks(hotel, rooms, staff.housekeepingUsers(), spec, random);
        createMaintenanceTasks(hotel, rooms, staff.operationalAdmin(), staff.frontdeskUsers(), spec, random);
        createStaffSchedules(hotel, staff, random);
        createPromotionalCodes(hotel, seedIndex);
        createBookingHistory(reservations, staff.hotelAdmin(), random);
        createBookingNotifications(reservations, random);

        return new SeedContext(hotel, pricingConfig, rooms, pricing, staff, customers, reservations, products);
    }

    private Hotel createHotel(Tenant tenant, EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int index) {
        Hotel hotel = new Hotel();
        hotel.setTenant(tenant);
        hotel.setName(spec.name());
        hotel.setDescription("Full-service Ethiopian hotel with curated hospitality operations, room inventory, shop catalog, and staff workflows.");
        hotel.setAddress(spec.address());
        hotel.setCity(spec.city());
        hotel.setCountry("Ethiopia");
        hotel.setPhone(String.format(Locale.ROOT, "+251-11-%03d-%04d", 200 + index, 1000 + index * 13));
        hotel.setEmail(spec.code() + "@ethiostay.demo");
        hotel.setContactPerson(spec.contactPerson());
        hotel.setMobilePaymentPhone(String.format(Locale.ROOT, "+251-9%08d", 10000000 + index * 17));
        hotel.setMobilePaymentPhone2(String.format(Locale.ROOT, "+251-9%08d", 20000000 + index * 19));
        hotel.setLicenseNumber("LIC-ETH-" + String.format(Locale.ROOT, "%03d", index + 1));
        hotel.setTaxId("TIN-" + String.format(Locale.ROOT, "%09d", 500000000 + index));
        hotel.setWebsiteUrl("https://" + spec.code() + ".ethiostay.demo");
        hotel.setFacilityAmenities("Wi-Fi, restaurant, airport transfer, laundry, meeting rooms, curated Ethiopian coffee bar");
        hotel.setNumberOfRooms(spec.roomCount());
        hotel.setCheckInTime("14:00");
        hotel.setCheckOutTime("12:00");
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(true);
        return hotelRepository.save(hotel);
    }

    private HotelPricingConfig createHotelPricingConfig(Hotel hotel, int index) {
        HotelPricingConfig config = new HotelPricingConfig();
        config.setHotel(hotel);
        config.setPricingStrategy(HotelPricingConfig.PricingStrategy.SEASONAL);
        config.setVatRate(DEFAULT_VAT_RATE);
        config.setServiceTaxRate(DEFAULT_SERVICE_TAX_RATE);
        config.setCityTaxRate(DEFAULT_CITY_TAX_RATE);
        config.setDynamicPricingEnabled(Boolean.TRUE);
        config.setPeakSeasonMultiplier(new BigDecimal("1.18"));
        config.setOffSeasonMultiplier(new BigDecimal("0.92"));
        config.setWeekendMultiplier(new BigDecimal("1.08"));
        config.setHolidayMultiplier(new BigDecimal("1.12"));
        config.setCancellationFeeRate(new BigDecimal("0.3500"));
        config.setRefundPolicy7PlusDays(new BigDecimal("1.0000"));
        config.setRefundPolicy3To7Days(new BigDecimal("0.6500"));
        config.setRefundPolicy1To2Days(new BigDecimal("0.3000"));
        config.setRefundPolicySameDay(BigDecimal.ZERO);
        config.setModificationFeeRate(new BigDecimal("0.0500"));
        config.setNoShowPenaltyRate(new BigDecimal("1.0000"));
        config.setCurrencyCode("ETB");
        config.setTaxInclusivePricing(Boolean.FALSE);
        config.setMinimumStayNights(1);
        config.setMaximumAdvanceBookingDays(365);
        config.setMinimumAdvanceBookingHours(2);
        config.setLoyaltyDiscountRate(new BigDecimal("0.0500"));
        config.setEarlyBookingDiscountRate(new BigDecimal("0.0800"));
        config.setEarlyBookingDaysThreshold(21);
        config.setVersion(1);
        config.setCreatedBy("seed-system");
        config.setUpdatedBy("seed-system");
        config.setNotes("Seeded Ethiopian demo pricing and tax configuration for hotel booking operations.");
        return hotelPricingConfigRepository.save(config);
    }

    private List<RoomTypePricing> createRoomTypePricing(Hotel hotel) {
        List<RoomTypePricing> pricingList = new ArrayList<>();
        for (Map.Entry<RoomType, BigDecimal> entry : BASE_PRICES.entrySet()) {
            RoomTypePricing pricing = new RoomTypePricing(hotel, entry.getKey(), entry.getValue());
            pricing.setWeekendPrice(entry.getValue().multiply(new BigDecimal("1.08")).setScale(2, RoundingMode.HALF_UP));
            pricing.setHolidayPrice(entry.getValue().multiply(new BigDecimal("1.12")).setScale(2, RoundingMode.HALF_UP));
            pricing.setPeakSeasonPrice(entry.getValue().multiply(new BigDecimal("1.18")).setScale(2, RoundingMode.HALF_UP));
            pricing.setCurrency("ETB");
            pricing.setDescription(entry.getKey().name() + " pricing for " + hotel.getName());
            pricingList.add(pricing);
        }
        return roomTypePricingRepository.saveAll(pricingList);
    }

    private List<Room> createRooms(Hotel hotel, int roomCount, Random random) {
        List<Room> rooms = new ArrayList<>();
        for (int index = 1; index <= roomCount; index++) {
            Room room = new Room();
            room.setHotel(hotel);
            room.setRoomNumber(String.format(Locale.ROOT, "%d%02d", ((index - 1) / 10) + 1, ((index - 1) % 10) + 1));
            room.setRoomType(roomTypeForIndex(index, roomCount));
            room.setPricePerNight(BASE_PRICES.get(room.getRoomType()));
            room.setCapacity(capacityForRoomType(room.getRoomType()));
            room.setDescription(room.getRoomType().name() + " room at " + hotel.getName());
            room.setStatus(roomStatusForIndex(index, random));
            room.setIsAvailable(room.getStatus() == RoomStatus.AVAILABLE || room.getStatus() == RoomStatus.CLEANING);
            rooms.add(room);
        }
        return roomRepository.saveAll(rooms);
    }

    private StaffBundle createStaff(Hotel hotel, EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int seedIndex, Random random) {
        User hotelAdmin = createStaffUser(hotel, UserRole.HOTEL_ADMIN, seedIndex, 0, false, random);
        User operationalAdmin = createStaffUser(hotel, UserRole.OPERATIONAL_ADMIN, seedIndex, 1, false, random);

        List<User> frontdeskUsers = new ArrayList<>();
        List<User> housekeepingUsers = new ArrayList<>();
        List<User> maintenanceUsers = new ArrayList<>();
        List<User> testerUsers = new ArrayList<>();

        int frontdeskCount = spec.roomCount() >= 150 ? 8 : spec.roomCount() >= 100 ? 5 : 3;
        int housekeepingCount = spec.roomCount() >= 150 ? 14 : spec.roomCount() >= 100 ? 10 : 6;
        int maintenanceCount = spec.roomCount() >= 150 ? 6 : spec.roomCount() >= 100 ? 4 : 2;
        int testerCount = spec.roomCount() >= 150 ? 2 : 1;

        for (int i = 0; i < frontdeskCount; i++) {
            frontdeskUsers.add(createStaffUser(hotel, UserRole.FRONTDESK, seedIndex, 10 + i, true, random));
        }
        for (int i = 0; i < housekeepingCount; i++) {
            housekeepingUsers.add(createStaffUser(hotel, UserRole.HOUSEKEEPING, seedIndex, 30 + i, i % 2 == 1, random));
        }
        for (int i = 0; i < maintenanceCount; i++) {
            maintenanceUsers.add(createStaffUser(hotel, UserRole.MAINTENANCE, seedIndex, 60 + i, i % 2 == 0, random));
        }
        for (int i = 0; i < testerCount; i++) {
            testerUsers.add(createStaffUser(hotel, UserRole.TESTER, seedIndex, 80 + i, true, random));
        }

        return new StaffBundle(hotelAdmin, operationalAdmin, frontdeskUsers, housekeepingUsers, maintenanceUsers,
                testerUsers);
    }

    private User createStaffUser(Hotel hotel, UserRole role, int hotelIndex, int offset, boolean female, Random random) {
        User user = new User();
        user.setHotel(hotel);
        user.setRoles(Set.of(role));
        user.setIsActive(true);
        user.setFirstName(randomFirstName(female, random, offset));
        user.setLastName(randomLastName(random, offset));
        user.setPhone(String.format(Locale.ROOT, "+251-9%08d", 30000000 + hotelIndex * 100 + offset));
        user.setEmail(String.format(Locale.ROOT, "%s.%02d.%s@ethiostay.demo",
                role.name().toLowerCase(Locale.ROOT), hotelIndex + 1, slug(hotel.getName())));
        if (offset > 1) {
            user.setEmail(String.format(Locale.ROOT, "%s.%02d.%02d@ethiostay.demo",
                    role.name().toLowerCase(Locale.ROOT), hotelIndex + 1, offset));
        }
        user.setPassword(passwordEncoder.encode(defaultPassword));
        return userRepository.save(user);
    }

    private List<User> createCustomers(EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int hotelIndex, Random random) {
        List<User> customers = new ArrayList<>();
        for (int i = 0; i < spec.customerCount(); i++) {
            boolean female = i % 2 == 1;
            User user = new User();
            user.setRoles(Set.of(UserRole.CUSTOMER));
            user.setIsActive(true);
            user.setFirstName(randomFirstName(female, random, hotelIndex + i));
            user.setLastName(randomLastName(random, hotelIndex + i));
            user.setPhone(String.format(Locale.ROOT, "+251-9%08d", 50000000 + hotelIndex * 100 + i));
            user.setEmail(String.format(Locale.ROOT, "guest.%02d.%02d@ethiostay.demo", hotelIndex + 1, i + 1));
            user.setPassword(passwordEncoder.encode(defaultPassword));
            customers.add(user);
        }
        return userRepository.saveAll(customers);
    }

    private List<Product> createProducts(Hotel hotel, EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int hotelIndex) {
        List<Product> products = new ArrayList<>();
        products.add(product(hotel, "Sidama Filter Coffee", "Fresh roasted Sidama beans", ProductCategory.BEVERAGES,
                new BigDecimal("180.00"), 80, hotelIndex, 1));
        products.add(product(hotel, "Buna Macchiato", "Hotel coffee bar signature drink", ProductCategory.BEVERAGES,
                new BigDecimal("120.00"), 90, hotelIndex, 2));
        products.add(product(hotel, "Berbere Cashews", "Roasted cashews with berbere", ProductCategory.SNACKS,
                new BigDecimal("95.00"), 70, hotelIndex, 3));
        products.add(product(hotel, "Dabo Kolo", "Traditional crispy barley snack", ProductCategory.SNACKS,
                new BigDecimal("60.00"), 120, hotelIndex, 4));
        products.add(product(hotel, "Netela Shawl", "Handwoven Ethiopian shawl", ProductCategory.CULTURAL_CLOTHING,
                new BigDecimal("1250.00"), 18, hotelIndex, 5));
        products.add(product(hotel, "Habesha Dress", "Traditional festive attire", ProductCategory.CULTURAL_CLOTHING,
                new BigDecimal("3400.00"), 8, hotelIndex, 6));
        products.add(product(hotel, "Mesob Basket", "Decorated serving basket", ProductCategory.SOUVENIRS,
                new BigDecimal("980.00"), 20, hotelIndex, 7));
        products.add(product(hotel, "Lalibela Cross", "Handcrafted silver-tone cross", ProductCategory.SOUVENIRS,
                new BigDecimal("1500.00"), 12, hotelIndex, 8));
        products.add(product(hotel, "Black Soap", "Natural Ethiopian black soap", ProductCategory.TOILETRIES,
                new BigDecimal("140.00"), 60, hotelIndex, 9));
        products.add(product(hotel, "Shea Lotion", "Moisturizing body lotion", ProductCategory.TOILETRIES,
                new BigDecimal("220.00"), 45, hotelIndex, 10));
        products.add(product(hotel, "Airport Transfer Voucher", "One-way airport transfer", ProductCategory.OTHER,
                new BigDecimal("650.00"), 30, hotelIndex, 11));
        products.add(product(hotel, "Coffee Ceremony Set", "Portable coffee ceremony gift box", ProductCategory.SOUVENIRS,
                new BigDecimal("2100.00"), 10, hotelIndex, 12));
        return productRepository.saveAll(products);
    }

    private Product product(Hotel hotel, String name, String description, ProductCategory category, BigDecimal price,
            int stock, int hotelIndex, int skuIndex) {
        Product product = new Product();
        product.setHotel(hotel);
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setPrice(price);
        product.setStockQuantity(stock);
        product.setMinimumStockLevel(Math.max(5, stock / 6));
        product.setSku(String.format(Locale.ROOT, "%s-%02d-%02d", slug(hotel.getName()).toUpperCase(Locale.ROOT), hotelIndex + 1,
                skuIndex));
        product.setIsActive(true);
        product.setIsAvailable(true);
        return product;
    }

        private List<Reservation> createReservations(Hotel hotel, List<Room> rooms, List<User> customers,
            HotelPricingConfig pricingConfig, EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int hotelIndex, Random random) {
        List<Reservation> reservations = new ArrayList<>();
        LocalDate baseDate = LocalDate.now().minusDays(40);

        for (int i = 0; i < spec.reservationCount(); i++) {
            User guest = customers.get(i % customers.size());
            Room room = rooms.get((i * 3) % rooms.size());
            LocalDate checkIn = baseDate.plusDays(i * 2L);
            int nights = 1 + (i % 4);
            Reservation reservation = new Reservation();
            reservation.setHotel(hotel);
            reservation.setGuest(guest);
            reservation.setGuestInfo(new GuestInfo(guest.getFirstName() + " " + guest.getLastName(), guest.getEmail(), guest.getPhone()));
            reservation.setCheckInDate(checkIn);
            reservation.setCheckOutDate(checkIn.plusDays(nights));
            reservation.setRoomType(room.getRoomType());
            reservation.setPricePerNight(room.getPricePerNight());
            reservation.setTotalAmount(calculateBookingTotal(room.getPricePerNight(), nights, pricingConfig));
            reservation.setNumberOfGuests(Math.min(room.getCapacity(), 1 + (i % room.getCapacity())));
            reservation.setConfirmationNumber(String.format(Locale.ROOT, "ETH%02d%04d", hotelIndex + 1, i + 1));
            reservation.setSpecialRequests(i % 5 == 0 ? "Airport pickup and early coffee ceremony setup" : null);
            reservation.setPaymentReference(String.format(Locale.ROOT, "PAY-%02d-%04d", hotelIndex + 1, i + 1));
            reservation.setAssignedRoom(i % 6 == 0 || i % 6 == 1 || i % 6 == 2 ? room : null);

            ReservationStatus status = switch (i % 6) {
                case 0 -> ReservationStatus.CHECKED_OUT;
                case 1 -> ReservationStatus.CHECKED_IN;
                case 2 -> ReservationStatus.BOOKED;
                case 3 -> ReservationStatus.PENDING;
                case 4 -> ReservationStatus.CANCELLED;
                default -> ReservationStatus.NO_SHOW;
            };
            reservation.setStatus(status);
            reservation.setPaymentStatus(paymentStatusForReservation(status));
            if (status == ReservationStatus.CANCELLED) {
                reservation.setCancellationReason("Guest itinerary changed due to domestic flight reschedule");
                reservation.setCancelledAt(LocalDateTime.now().minusDays(2));
            }
            if (status == ReservationStatus.CHECKED_IN || status == ReservationStatus.CHECKED_OUT) {
                reservation.setActualCheckInTime(checkIn.atTime(14, 0));
            }
            if (status == ReservationStatus.CHECKED_OUT) {
                reservation.setActualCheckOutTime(checkIn.plusDays(nights).atTime(11, 30));
            }

            reservations.add(reservation);
        }

        return reservationRepository.saveAll(reservations);
    }

    private BigDecimal calculateBookingTotal(BigDecimal pricePerNight, int nights, HotelPricingConfig pricingConfig) {
        BigDecimal subtotal = pricePerNight.multiply(BigDecimal.valueOf(nights));
        BigDecimal totalTaxRate = pricingConfig.getVatRate()
                .add(pricingConfig.getServiceTaxRate())
                .add(pricingConfig.getCityTaxRate());
        return subtotal.multiply(BigDecimal.ONE.add(totalTaxRate)).setScale(2, RoundingMode.HALF_UP);
    }

    private void createShopOrders(Hotel hotel, List<Reservation> reservations, List<Product> products, List<User> customers,
            EthiopianDemoDatasetCatalog.HotelSeedSpec spec, int hotelIndex, Random random) {
        List<ShopOrder> orders = new ArrayList<>();

        for (int i = 0; i < spec.shopOrderCount(); i++) {
            Reservation reservation = reservations.get(i % reservations.size());
            User guest = customers.get(i % customers.size());
            Product firstProduct = products.get(i % products.size());
            Product secondProduct = products.get((i + 3) % products.size());
            int qtyOne = 1 + (i % 2);
            int qtyTwo = 1;

            ShopOrder order = new ShopOrder();
            order.setHotel(hotel);
            order.setOrderNumber(String.format(Locale.ROOT, "SO-%02d-%04d", hotelIndex + 1, i + 1));
            order.setReservation(reservation.getStatus() == ReservationStatus.CANCELLED ? null : reservation);
            order.setGuest(guest);
            order.setCustomerName(guest.getFirstName() + " " + guest.getLastName());
            order.setCustomerEmail(guest.getEmail());
            order.setCustomerPhone(guest.getPhone());
            order.setRoomNumber(reservation.getAssignedRoom() != null ? reservation.getAssignedRoom().getRoomNumber() : null);
            order.setStatus(i % 3 == 0 ? OrderStatus.PAID : OrderStatus.PENDING);
            order.setIsPaid(order.getStatus() == OrderStatus.PAID);
            order.setPaymentMethod(order.getIsPaid() ? "CASH" : "ROOM_CHARGE");
            order.setPaymentReference(String.format(Locale.ROOT, "SHOP-%02d-%04d", hotelIndex + 1, i + 1));
            order.setNotes(i % 4 == 0 ? "Deliver with extra napkins" : "Pickup at hotel shop");
            order.setIsDelivery(i % 2 == 0);
            order.setDeliveryType(order.getIsDelivery() ? "ROOM_DELIVERY" : "PICKUP");
            order.setDeliveryAddress(order.getIsDelivery() ? hotel.getName() + " - Room " + order.getRoomNumber() : null);
            order.setOrderDate(LocalDateTime.now().minusDays(12 - (i % 12)).plusHours(i % 8));
            if (order.getIsPaid()) {
                order.setPaidAt(order.getOrderDate().plusMinutes(5));
            }

            ShopOrderItem itemOne = new ShopOrderItem(order, firstProduct, qtyOne, firstProduct.getPrice());
            itemOne.setProductName(firstProduct.getName());
            itemOne.setProductDescription(firstProduct.getDescription());
            itemOne.setProductSku(firstProduct.getSku());

            ShopOrderItem itemTwo = new ShopOrderItem(order, secondProduct, qtyTwo, secondProduct.getPrice());
            itemTwo.setProductName(secondProduct.getName());
            itemTwo.setProductDescription(secondProduct.getDescription());
            itemTwo.setProductSku(secondProduct.getSku());

            order.setOrderItems(List.of(itemOne, itemTwo));
            BigDecimal subtotal = itemOne.getTotalPrice().add(itemTwo.getTotalPrice());
            order.setTaxAmount(subtotal.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP));
            order.setVatAmount(order.getTaxAmount());
            order.setServiceTaxAmount(BigDecimal.ZERO);
            order.setTotalAmount(subtotal.add(order.getTaxAmount()));
            orders.add(order);
        }

        shopOrderRepository.saveAll(orders);
    }

    private void createRoomCharges(Hotel hotel, List<Reservation> reservations,
            EthiopianDemoDatasetCatalog.HotelSeedSpec spec, User createdBy, Random random) {
        List<RoomCharge> charges = new ArrayList<>();
        int count = Math.max(6, spec.reservationCount() / 3);
        for (int i = 0; i < count; i++) {
            Reservation reservation = reservations.get(i % reservations.size());
            if (reservation.getStatus() == ReservationStatus.CANCELLED || reservation.getStatus() == ReservationStatus.NO_SHOW) {
                continue;
            }
            RoomCharge charge = new RoomCharge();
            charge.setHotel(hotel);
            charge.setReservation(reservation);
            charge.setDescription(i % 2 == 0 ? "Late checkout convenience fee" : "In-room dining charge");
            charge.setAmount(i % 2 == 0 ? new BigDecimal("450.00") : new BigDecimal("780.00"));
            charge.setChargeType(i % 2 == 0 ? RoomChargeType.LATE_CHECKOUT : RoomChargeType.ROOM_SERVICE);
            charge.setChargeDate(LocalDateTime.now().minusDays(i % 10).minusHours(2));
            charge.setIsPaid(i % 3 != 0);
            charge.setPaidAt(charge.getIsPaid() ? charge.getChargeDate().plusHours(3) : null);
            charge.setCreatedBy(createdBy);
            charge.setNotes("Seeded demo room charge for operational reporting");
            charge.setCreatedAt(charge.getChargeDate());
            charges.add(charge);
        }
        roomChargeRepository.saveAll(charges);
    }

    private void createHousekeepingTasks(Hotel hotel, List<Room> rooms, List<User> housekeepingUsers,
            EthiopianDemoDatasetCatalog.HotelSeedSpec spec, Random random) {
        List<HousekeepingTask> tasks = new ArrayList<>();
        int taskCount = Math.max(10, spec.roomCount() / 5);
        for (int i = 0; i < taskCount; i++) {
            Room room = rooms.get(i % rooms.size());
            User assignedUser = housekeepingUsers.get(i % housekeepingUsers.size());
            HousekeepingTaskType taskType = i % 3 == 0 ? HousekeepingTaskType.CHECKOUT_CLEANING
                    : i % 3 == 1 ? HousekeepingTaskType.ROOM_CLEANING
                            : HousekeepingTaskType.RESTOCKING;

            HousekeepingTask task = new HousekeepingTask();
            task.setHotel(hotel);
            task.setRoomNumber(room.getRoomNumber());
            task.setTitle(taskType.name().replace('_', ' ') + " for room " + room.getRoomNumber());
            task.setAssignedUser(assignedUser);
            task.setTaskType(taskType);
            task.setStatus(i % 4 == 0 ? HousekeepingTaskStatus.COMPLETED : i % 4 == 1 ? HousekeepingTaskStatus.IN_PROGRESS
                    : i % 4 == 2 ? HousekeepingTaskStatus.ASSIGNED : HousekeepingTaskStatus.PENDING);
            task.setPriority(i % 5 == 0 ? TaskPriority.HIGH : TaskPriority.NORMAL);
            task.setDescription("Seeded housekeeping workflow for " + hotel.getName());
            task.setSpecialInstructions(i % 4 == 0 ? "Check minibar and replace coffee amenities" : null);
            task.setCreatedAt(LocalDateTime.now().minusHours(2 + i));
            task.setEstimatedDurationMinutes(taskType.getEstimatedDurationMinutes());
            tasks.add(task);
        }
        housekeepingTaskRepository.saveAll(tasks);
    }

    private void createMaintenanceTasks(Hotel hotel, List<Room> rooms, User createdBy, List<User> frontdeskUsers,
            EthiopianDemoDatasetCatalog.HotelSeedSpec spec, Random random) {
        List<MaintenanceTask> tasks = new ArrayList<>();
        for (int i = 0; i < spec.maintenanceTaskCount(); i++) {
            Room room = rooms.get((i * 7) % rooms.size());
            LocalDateTime scheduledStart = LocalDateTime.now().minusDays(i + 1);
            MaintenanceTask task = new MaintenanceTask();
            task.setHotel(hotel);
            task.setRoom(room);
            task.setTaskType(i % 2 == 0 ? "PLUMBING" : "ELECTRICAL");
            task.setTitle((i % 2 == 0 ? "Bathroom pressure check" : "Lighting inspection") + " - Room " + room.getRoomNumber());
            task.setDescription("Seeded maintenance activity for realistic operations coverage");
            task.setStatus(i % 3 == 0 ? TaskStatus.OPEN : i % 3 == 1 ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED);
            task.setPriority(i % 2 == 0 ? TaskPriority.NORMAL : TaskPriority.HIGH);
            task.setCreatedBy(createdBy);
            task.setReportedBy(frontdeskUsers.get(i % frontdeskUsers.size()));
            task.setLocation("Room " + room.getRoomNumber());
            task.setEquipmentType(i % 2 == 0 ? "Bathroom fixture" : "Lighting");
            task.setEstimatedDurationMinutes(i % 2 == 0 ? 45 : 30);
            task.setEstimatedCost(i % 2 == 0 ? 650.0 : 300.0);
            task.setScheduledStartTime(scheduledStart);
            task.setCreatedAt(scheduledStart.minusHours(2));
            task.setUpdatedAt(scheduledStart.minusHours(1));
            tasks.add(task);
        }
        maintenanceTaskRepository.saveAll(tasks);
    }

    private void createStaffSchedules(Hotel hotel, StaffBundle staff, Random random) {
        List<User> scheduledUsers = new ArrayList<>();
        scheduledUsers.addAll(staff.frontdeskUsers());
        scheduledUsers.addAll(staff.housekeepingUsers());
        scheduledUsers.addAll(staff.maintenanceUsers());

        List<StaffSchedule> schedules = new ArrayList<>();
        for (int i = 0; i < Math.min(12, scheduledUsers.size()); i++) {
            User staffUser = scheduledUsers.get(i);
            StaffSchedule schedule = new StaffSchedule();
            schedule.setHotel(hotel);
            schedule.setStaff(staffUser);
            schedule.setScheduleDate(LocalDate.now().plusDays(i % 4));
            schedule.setStartTime(i % 2 == 0 ? LocalTime.of(7, 0) : LocalTime.of(15, 0));
            schedule.setEndTime(i % 2 == 0 ? LocalTime.of(15, 0) : LocalTime.of(23, 0));
            schedule.setShiftType(i % 2 == 0 ? StaffSchedule.ShiftType.MORNING : StaffSchedule.ShiftType.EVENING);
            schedule.setDepartment(departmentForRole(staffUser.getRoles().iterator().next()));
            schedule.setStatus(StaffSchedule.ScheduleStatus.CONFIRMED);
            schedule.setCreatedBy(staff.hotelAdmin());
            schedule.setNotes("Seeded weekly schedule block");
            schedules.add(schedule);
        }
        staffScheduleRepository.saveAll(schedules);
    }

    private void createPromotionalCodes(Hotel hotel, int hotelIndex) {
        List<PromotionalCode> codes = new ArrayList<>();

        PromotionalCode earlyBird = new PromotionalCode();
        earlyBird.setHotelId(hotel.getId());
        earlyBird.setCode(String.format(Locale.ROOT, "EARLY%02d", hotelIndex + 1));
        earlyBird.setName("Early Booking Saver");
        earlyBird.setDescription("Discount for guests booking at least 7 days ahead.");
        earlyBird.setDiscountType(DiscountType.PERCENTAGE);
        earlyBird.setDiscountValue(new BigDecimal("12.00"));
        earlyBird.setMinBookingAmount(new BigDecimal("5000.00"));
        earlyBird.setValidFrom(LocalDate.now().minusDays(1));
        earlyBird.setValidTo(LocalDate.now().plusMonths(3));
        earlyBird.setUsageLimit(200);
        earlyBird.setPerCustomerLimit(1);
        earlyBird.setIsActive(true);
        earlyBird.setCreatedBy("seed-system");
        codes.add(earlyBird);

        PromotionalCode familyStay = new PromotionalCode();
        familyStay.setHotelId(hotel.getId());
        familyStay.setCode(String.format(Locale.ROOT, "FAMILY%02d", hotelIndex + 1));
        familyStay.setName("Family Weekend Offer");
        familyStay.setDescription("Fixed savings for family room bookings.");
        familyStay.setDiscountType(DiscountType.FIXED_AMOUNT);
        familyStay.setDiscountValue(new BigDecimal("900.00"));
        familyStay.setValidFrom(LocalDate.now().minusDays(1));
        familyStay.setValidTo(LocalDate.now().plusMonths(2));
        familyStay.setUsageLimit(120);
        familyStay.setApplicableRoomType(RoomType.FAMILY);
        familyStay.setMinNights(2);
        familyStay.setIsActive(true);
        familyStay.setCreatedBy("seed-system");
        codes.add(familyStay);

        promotionalCodeRepository.saveAll(codes);
    }

    private void createBookingHistory(List<Reservation> reservations, User changedBy, Random random) {
        List<BookingHistory> historyEntries = new ArrayList<>();
        for (int i = 0; i < reservations.size(); i++) {
            Reservation reservation = reservations.get(i);
            BookingHistory createdEntry = new BookingHistory(reservation, BookingActionType.CREATED, changedBy.getEmail());
            createdEntry.setChangeReason("Seeded reservation creation");
            historyEntries.add(createdEntry);

            if (reservation.getStatus() == ReservationStatus.CANCELLED) {
                BookingHistory cancelledEntry = new BookingHistory(reservation, BookingActionType.CANCELLED, changedBy.getEmail());
                cancelledEntry.setChangeReason(reservation.getCancellationReason());
                historyEntries.add(cancelledEntry);
            } else if (reservation.getStatus() == ReservationStatus.CHECKED_IN || reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
                BookingHistory statusEntry = new BookingHistory(reservation,
                        reservation.getStatus() == ReservationStatus.CHECKED_OUT ? BookingActionType.CHECKED_OUT : BookingActionType.CHECKED_IN,
                        changedBy.getEmail());
                statusEntry.setChangeReason("Operational stay progression");
                historyEntries.add(statusEntry);
            }
        }
        bookingHistoryRepository.saveAll(historyEntries);
    }

    private void createBookingNotifications(List<Reservation> reservations, Random random) {
        List<BookingNotification> notifications = new ArrayList<>();
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.CANCELLED) {
                BookingNotification notification = new BookingNotification(reservation, NotificationType.CANCELLED);
                notification.setStatus(NotificationStatus.UNREAD);
                notification.setCancellationReason(reservation.getCancellationReason());
                notification.setRefundAmount(reservation.getTotalAmount().multiply(new BigDecimal("0.80")).setScale(2, RoundingMode.HALF_UP));
                notifications.add(notification);
            } else if (reservation.getStatus() == ReservationStatus.BOOKED && reservation.getAssignedRoom() != null && random.nextBoolean()) {
                BookingNotification notification = new BookingNotification(reservation, NotificationType.MODIFIED);
                notification.setStatus(NotificationStatus.UNREAD);
                notification.setChangeDetails("Room assignment confirmed and arrival preferences updated.");
                notification.setAdditionalCharges(new BigDecimal("250.00"));
                notifications.add(notification);
            }
        }
        bookingNotificationRepository.saveAll(notifications);
    }

    private String randomFirstName(boolean female, Random random, int offset) {
        List<String> pool = female ? EthiopianDemoDatasetCatalog.femaleFirstNames() : EthiopianDemoDatasetCatalog.maleFirstNames();
        return pool.get(Math.floorMod(offset + random.nextInt(pool.size()), pool.size()));
    }

    private String randomLastName(Random random, int offset) {
        List<String> pool = EthiopianDemoDatasetCatalog.lastNames();
        return pool.get(Math.floorMod(offset + random.nextInt(pool.size()), pool.size()));
    }

    private RoomType roomTypeForIndex(int index, int totalRooms) {
        double ratio = (double) index / totalRooms;
        if (ratio <= 0.40) {
            return RoomType.STANDARD;
        }
        if (ratio <= 0.68) {
            return RoomType.DELUXE;
        }
        if (ratio <= 0.82) {
            return RoomType.SUITE;
        }
        if (ratio <= 0.92) {
            return RoomType.FAMILY;
        }
        if (ratio <= 0.97) {
            return RoomType.ACCESSIBLE;
        }
        return RoomType.PRESIDENTIAL;
    }

    private int capacityForRoomType(RoomType roomType) {
        return switch (roomType) {
            case STANDARD, DELUXE, ACCESSIBLE -> 2;
            case SUITE -> 3;
            case FAMILY -> 4;
            case PRESIDENTIAL -> 6;
        };
    }

    private RoomStatus roomStatusForIndex(int index, Random random) {
        if (index % 17 == 0) {
            return RoomStatus.MAINTENANCE;
        }
        if (index % 11 == 0) {
            return RoomStatus.CLEANING;
        }
        if (index % 7 == 0) {
            return RoomStatus.OCCUPIED;
        }
        return RoomStatus.AVAILABLE;
    }

    private PaymentStatus paymentStatusForReservation(ReservationStatus status) {
        return switch (status) {
            case CHECKED_IN, CHECKED_OUT, BOOKED -> PaymentStatus.COMPLETED;
            case CANCELLED -> PaymentStatus.REFUNDED;
            case NO_SHOW -> PaymentStatus.FORFEITED;
            case PENDING -> PaymentStatus.PENDING;
        };
    }

    private StaffSchedule.Department departmentForRole(UserRole role) {
        return switch (role) {
            case FRONTDESK -> StaffSchedule.Department.FRONTDESK;
            case HOUSEKEEPING -> StaffSchedule.Department.HOUSEKEEPING;
            case MAINTENANCE -> StaffSchedule.Department.MAINTENANCE;
            default -> StaffSchedule.Department.MANAGEMENT;
        };
    }

    private String slug(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private record StaffBundle(
            User hotelAdmin,
            User operationalAdmin,
            List<User> frontdeskUsers,
            List<User> housekeepingUsers,
            List<User> maintenanceUsers,
            List<User> testerUsers) {
    }

    private record SeedContext(
            Hotel hotel,
            HotelPricingConfig pricingConfig,
            List<Room> rooms,
            List<RoomTypePricing> pricing,
            StaffBundle staff,
            List<User> customers,
            List<Reservation> reservations,
            List<Product> products) {
    }
}