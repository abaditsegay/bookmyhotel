package com.bookmyhotel.config;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Data initialization component that creates initial system data
 * This runs after the application starts and the database schema is created
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");

        createDevelopmentTenant();
        createSystemAdminUser();
        createSampleHotelWithRooms();
        createHotelStaffUsers();
        createEthiopianProducts();

        logger.info("Data initialization completed successfully.");
    }

    /**
     * Create the development tenant if it doesn't exist
     */
    private void createDevelopmentTenant() {
        String tenantName = "development";
        String subdomain = "dev";
        String tenantId = "development"; // Use a simple ID for development

        logger.info("Checking for development tenant with name: {}", tenantName);

        Optional<Tenant> existingTenant = tenantRepository.findByName(tenantName);

        if (existingTenant.isPresent()) {
            logger.info("Development tenant already exists: {}", tenantName);
            return;
        }

        logger.info("Creating development tenant...");

        Tenant developmentTenant = new Tenant();
        developmentTenant.setId(tenantId); // Set the ID manually
        developmentTenant.setName(tenantName);
        developmentTenant.setSubdomain(subdomain);
        developmentTenant.setDescription("Development environment tenant for testing and development");
        developmentTenant.setIsActive(true);

        try {
            Tenant savedTenant = tenantRepository.save(developmentTenant);
            logger.info("Development tenant created successfully with ID: {} and name: {}",
                    savedTenant.getId(), savedTenant.getName());
        } catch (Exception e) {
            logger.error("Failed to create development tenant: {}", e.getMessage(), e);
        }
    }

    /**
     * Create the system admin user if it doesn't exist
     */
    private void createSystemAdminUser() {
        String adminEmail = "admin@bookmyhotel.com";
        String adminPassword = "admin123";

        logger.info("Checking for system admin user with email: {}", adminEmail);

        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin.isPresent()) {
            logger.info("System admin user already exists: {}", adminEmail);
            return;
        }

        logger.info("Creating system admin user...");

        User systemAdmin = new User();
        systemAdmin.setEmail(adminEmail);
        systemAdmin.setPassword(passwordEncoder.encode(adminPassword));
        systemAdmin.setFirstName("System");
        systemAdmin.setLastName("Administrator");
        systemAdmin.setIsActive(true);
        systemAdmin.setRoles(Set.of(UserRole.SYSTEM_ADMIN));
        // Leave hotel as null for system-wide admin

        try {
            User savedAdmin = userRepository.save(systemAdmin);
            logger.info("System admin user created successfully with ID: {} and email: {}",
                    savedAdmin.getId(), savedAdmin.getEmail());
            logger.info("System admin credentials - Email: {} | Password: {}", adminEmail, adminPassword);
        } catch (Exception e) {
            logger.error("Failed to create system admin user: {}", e.getMessage(), e);
        }
    }

    /**
     * Create a sample hotel with 100 rooms if none exists
     */
    private void createSampleHotelWithRooms() {
        logger.info("Checking for existing hotels...");

        // Check if hotels already exist
        long hotelCount = hotelRepository.count();
        if (hotelCount > 0) {
            logger.info("Hotels already exist ({} found), skipping hotel creation.", hotelCount);
            return;
        }

        logger.info("No hotels found, creating sample hotel...");

        // Get any development tenant (use the first one we find)
        Optional<Tenant> tenantOpt = tenantRepository.findByName("development");

        if (tenantOpt.isEmpty()) {
            logger.error("Development tenant not found with name: development");
            return;
        }

        Tenant tenant = tenantOpt.get();
        String developmentTenantId = tenant.getId();

        // Set tenant context for hotel creation
        TenantContext.setTenantId(developmentTenantId);

        try {
            // Create the sample hotel
            Hotel sampleHotel = new Hotel();
            sampleHotel.setName("Grand Plaza Hotel");
            sampleHotel.setDescription(
                    "A luxurious 5-star hotel located in the heart of the city with modern amenities and exceptional service.");
            sampleHotel.setAddress("123 Main Street, Downtown");
            sampleHotel.setCity("Addis Ababa");
            sampleHotel.setCountry("Ethiopia");
            sampleHotel.setPhone("+251-11-123-4567");
            sampleHotel.setEmail("info@grandplazahotel.com");
            sampleHotel.setTenant(tenant);

            Hotel savedHotel = hotelRepository.save(sampleHotel);
            logger.info("Sample hotel created successfully with ID: {} and name: {}",
                    savedHotel.getId(), savedHotel.getName());

            // Create 100 rooms for the hotel
            createRoomsForHotel(savedHotel);

        } catch (Exception e) {
            logger.error("Failed to create sample hotel: {}", e.getMessage(), e);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Create 100 rooms for the given hotel
     */
    private void createRoomsForHotel(Hotel hotel) {
        logger.info("Creating 100 rooms for hotel: {}", hotel.getName());

        try {
            for (int i = 1; i <= 100; i++) {
                Room room = new Room();

                // Room numbering: Floor + Room number
                String roomNumber;
                int floor = (i - 1) / 10 + 1; // 10 rooms per floor
                int roomOnFloor = ((i - 1) % 10) + 1;
                roomNumber = String.format("%d%02d", floor, roomOnFloor);

                room.setRoomNumber(roomNumber);
                room.setHotel(hotel);
                room.setStatus(RoomStatus.AVAILABLE);

                // Assign room types and prices based on room number
                if (i <= 20) {
                    // First 20 rooms: Standard rooms
                    room.setRoomType(RoomType.STANDARD);
                    room.setPricePerNight(new BigDecimal("150.00"));
                    room.setCapacity(2);
                    room.setDescription("Comfortable standard room with modern amenities");
                } else if (i <= 50) {
                    // Next 30 rooms: Deluxe rooms
                    room.setRoomType(RoomType.DELUXE);
                    room.setPricePerNight(new BigDecimal("220.00"));
                    room.setCapacity(2);
                    room.setDescription("Spacious deluxe room with city view");
                } else if (i <= 80) {
                    // Next 30 rooms: Suite rooms
                    room.setRoomType(RoomType.SUITE);
                    room.setPricePerNight(new BigDecimal("300.00"));
                    room.setCapacity(3);
                    room.setDescription("Superior suite with premium amenities and city view");
                } else if (i <= 95) {
                    // Next 15 rooms: Family rooms
                    room.setRoomType(RoomType.FAMILY);
                    room.setPricePerNight(new BigDecimal("450.00"));
                    room.setCapacity(4);
                    room.setDescription("Family room with separate areas and premium services");
                } else {
                    // Last 5 rooms: Presidential suites
                    room.setRoomType(RoomType.PRESIDENTIAL);
                    room.setPricePerNight(new BigDecimal("800.00"));
                    room.setCapacity(6);
                    room.setDescription("Luxurious presidential suite with panoramic city view and premium amenities");
                }

                roomRepository.save(room);

                // Log progress every 25 rooms
                if (i % 25 == 0) {
                    logger.info("Created {} rooms so far...", i);
                }
            }

            logger.info("Successfully created all 100 rooms for hotel: {}", hotel.getName());

            // Log summary of room types created
            logger.info("Room distribution: 20 Standard, 30 Deluxe, 30 Suite, 15 Family, 5 Presidential");

        } catch (Exception e) {
            logger.error("Failed to create rooms for hotel: {}", e.getMessage(), e);
        }
    }

    /**
     * Create hotel admin and front desk users for each hotel
     */
    private void createHotelStaffUsers() {
        logger.info("Creating hotel staff users...");

        // Get development tenant
        Optional<Tenant> tenantOpt = tenantRepository.findByName("development");
        if (tenantOpt.isEmpty()) {
            logger.error("Development tenant not found, skipping staff user creation");
            return;
        }

        Tenant tenant = tenantOpt.get();
        String developmentTenantId = tenant.getId();
        TenantContext.setTenantId(developmentTenantId);

        try {
            // Get all hotels
            List<Hotel> hotels = hotelRepository.findAll();

            for (Hotel hotel : hotels) {
                createStaffUsersForHotel(hotel);
            }

            logger.info("Hotel staff user creation completed");

        } catch (Exception e) {
            logger.error("Failed to create hotel staff users: {}", e.getMessage(), e);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Create hotel admin and front desk users for a specific hotel
     */
    private void createStaffUsersForHotel(Hotel hotel) {
        String hotelNameClean = hotel.getName().toLowerCase().replaceAll("[^a-z0-9]", "");
        String hotelNameShort = hotelNameClean.substring(0, Math.min(10, hotelNameClean.length()));

        // Create hotel admin user
        String adminEmail = "admin." + hotelNameShort + "@bookmyhotel.com";
        String adminPassword = "admin123";

        if (!userRepository.findByEmail(adminEmail).isPresent()) {
            User hotelAdmin = new User();
            hotelAdmin.setEmail(adminEmail);
            hotelAdmin.setPassword(passwordEncoder.encode(adminPassword));
            hotelAdmin.setFirstName(hotel.getName());
            hotelAdmin.setLastName("Admin");
            hotelAdmin.setIsActive(true);
            hotelAdmin.setRoles(Set.of(UserRole.HOTEL_ADMIN));
            hotelAdmin.setHotel(hotel);

            userRepository.save(hotelAdmin);
            logger.info("Created hotel admin for {}: {} | Password: {}",
                    hotel.getName(), adminEmail, adminPassword);
        }

        // Create front desk user
        String frontdeskEmail = "frontdesk." + hotelNameShort + "@bookmyhotel.com";
        String frontdeskPassword = "front123";

        if (!userRepository.findByEmail(frontdeskEmail).isPresent()) {
            User frontdeskUser = new User();
            frontdeskUser.setEmail(frontdeskEmail);
            frontdeskUser.setPassword(passwordEncoder.encode(frontdeskPassword));
            frontdeskUser.setFirstName(hotel.getName());
            frontdeskUser.setLastName("Front Desk");
            frontdeskUser.setIsActive(true);
            frontdeskUser.setRoles(Set.of(UserRole.FRONTDESK));
            frontdeskUser.setHotel(hotel);

            userRepository.save(frontdeskUser);
            logger.info("Created front desk user for {}: {} | Password: {}",
                    hotel.getName(), frontdeskEmail, frontdeskPassword);
        }
    }

    /**
     * Create Ethiopian products for all hotels
     */
    private void createEthiopianProducts() {
        logger.info("Creating Ethiopian products for hotels...");

        try {
            // Set tenant context for product creation
            TenantContext.setTenantId("development");

            // Get all hotels
            List<Hotel> hotels = hotelRepository.findAll();

            for (Hotel hotel : hotels) {
                createEthiopianProductsForHotel(hotel);
            }

            logger.info("Ethiopian products creation completed");

        } catch (Exception e) {
            logger.error("Failed to create Ethiopian products: {}", e.getMessage(), e);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Create Ethiopian products for a specific hotel
     */
    private void createEthiopianProductsForHotel(Hotel hotel) {
        logger.info("Creating Ethiopian products for hotel: {}", hotel.getName());

        // Ethiopian Beverages
        createProductIfNotExists(hotel, "Ethiopian Coffee Beans (250g)",
                "Premium Arabica coffee beans from Sidamo region, roasted to perfection",
                ProductCategory.BEVERAGES, new BigDecimal("45.00"), 50, "ETH-COFFEE-250");

        createProductIfNotExists(hotel, "Tej (Ethiopian Honey Wine)",
                "Traditional Ethiopian honey wine, sweet and aromatic",
                ProductCategory.BEVERAGES, new BigDecimal("35.00"), 30, "ETH-TEJ-750");

        createProductIfNotExists(hotel, "Ethiopian Tea Blend",
                "Traditional spiced tea blend with cardamom, cinnamon, and cloves",
                ProductCategory.BEVERAGES, new BigDecimal("25.00"), 40, "ETH-TEA-100");

        createProductIfNotExists(hotel, "Tella (Ethiopian Barley Beer)",
                "Traditional low-alcohol beer made from barley and hops",
                ProductCategory.BEVERAGES, new BigDecimal("18.00"), 25, "ETH-TELLA-500");

        // Ethiopian Snacks
        createProductIfNotExists(hotel, "Dabo Kolo (Roasted Barley)",
                "Crunchy roasted barley snack seasoned with berbere spice",
                ProductCategory.SNACKS, new BigDecimal("12.00"), 60, "ETH-DABO-150");

        createProductIfNotExists(hotel, "Roasted Coffee Beans Snack",
                "Lightly roasted coffee beans covered in honey, perfect for snacking",
                ProductCategory.SNACKS, new BigDecimal("15.00"), 45, "ETH-COFFEE-SNACK");

        createProductIfNotExists(hotel, "Ethiopian Peanuts Mix",
                "Roasted peanuts with berbere spice and salt",
                ProductCategory.SNACKS, new BigDecimal("10.00"), 70, "ETH-PEANUTS-200");

        createProductIfNotExists(hotel, "Injera Chips",
                "Crispy injera chips seasoned with traditional spices",
                ProductCategory.SNACKS, new BigDecimal("8.00"), 50, "ETH-INJERA-CHIPS");

        // Ethiopian Cultural Items
        createProductIfNotExists(hotel, "Traditional Habesha Kemis",
                "Beautiful hand-woven traditional Ethiopian dress for women",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("120.00"), 15, "ETH-KEMIS-F");

        createProductIfNotExists(hotel, "Men's Traditional Shirt",
                "Elegant Ethiopian traditional shirt with embroidered collar",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("85.00"), 20, "ETH-SHIRT-M");

        createProductIfNotExists(hotel, "Netela (Traditional Shawl)",
                "Lightweight cotton shawl with traditional border design",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("55.00"), 35, "ETH-NETELA");

        createProductIfNotExists(hotel, "Ethiopian Cotton Scarf",
                "Hand-woven cotton scarf with traditional patterns",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("25.00"), 40, "ETH-SCARF");

        // Ethiopian Souvenirs
        createProductIfNotExists(hotel, "Ethiopian Cross Pendant",
                "Handcrafted traditional Ethiopian Orthodox cross in silver",
                ProductCategory.SOUVENIRS, new BigDecimal("75.00"), 25, "ETH-CROSS-SILVER");

        createProductIfNotExists(hotel, "Coffee Ceremony Set",
                "Complete traditional Ethiopian coffee ceremony set with clay pot and cups",
                ProductCategory.SOUVENIRS, new BigDecimal("95.00"), 10, "ETH-COFFEE-SET");

        createProductIfNotExists(hotel, "Wooden Ethiopian Map",
                "Handcrafted wooden map of Ethiopia with regional details",
                ProductCategory.SOUVENIRS, new BigDecimal("40.00"), 20, "ETH-MAP-WOOD");

        createProductIfNotExists(hotel, "Traditional Basket (Mesob)",
                "Colorful hand-woven basket used for serving injera",
                ProductCategory.SOUVENIRS, new BigDecimal("65.00"), 15, "ETH-MESOB");

        createProductIfNotExists(hotel, "Ethiopian Spice Collection",
                "Authentic Ethiopian spices including berbere, mitmita, and korarima",
                ProductCategory.SOUVENIRS, new BigDecimal("30.00"), 50, "ETH-SPICES-SET");

        createProductIfNotExists(hotel, "Lalibela Rock Church Model",
                "Miniature replica of the famous Lalibela rock churches",
                ProductCategory.SOUVENIRS, new BigDecimal("85.00"), 12, "ETH-LALIBELA-MODEL");

        createProductIfNotExists(hotel, "Ethiopian Lion Sculpture",
                "Hand-carved wooden sculpture of the Lion of Judah",
                ProductCategory.SOUVENIRS, new BigDecimal("55.00"), 18, "ETH-LION-WOOD");

        createProductIfNotExists(hotel, "Traditional Ethiopian Drums",
                "Authentic kebero drum with traditional leather design",
                ProductCategory.SOUVENIRS, new BigDecimal("140.00"), 8, "ETH-KEBERO-DRUM");

        // Ethiopian Toiletries & Wellness
        createProductIfNotExists(hotel, "Ethiopian Black Soap",
                "Natural black soap made with traditional Ethiopian ingredients",
                ProductCategory.TOILETRIES, new BigDecimal("15.00"), 60, "ETH-SOAP-BLACK");

        createProductIfNotExists(hotel, "Coffee Body Scrub",
                "Exfoliating body scrub made with Ethiopian coffee grounds",
                ProductCategory.TOILETRIES, new BigDecimal("28.00"), 35, "ETH-SCRUB-COFFEE");

        createProductIfNotExists(hotel, "Shea Butter Moisturizer",
                "Rich moisturizer made with Ethiopian shea butter and herbs",
                ProductCategory.TOILETRIES, new BigDecimal("22.00"), 45, "ETH-SHEA-CREAM");

        createProductIfNotExists(hotel, "Ethiopian Essential Oil Blend",
                "Relaxing essential oil blend with frankincense and myrrh",
                ProductCategory.TOILETRIES, new BigDecimal("35.00"), 30, "ETH-OIL-BLEND");

        logger.info("Created Ethiopian products for hotel: {}", hotel.getName());
    }

    /**
     * Create a product if it doesn't already exist
     */
    private void createProductIfNotExists(Hotel hotel, String name, String description,
            ProductCategory category, BigDecimal price, int stockQuantity, String sku) {

        // Check if product with this SKU already exists for this hotel
        Optional<Product> existingProduct = productRepository.findByHotelIdAndSku(hotel.getId(), sku);

        if (existingProduct.isPresent()) {
            logger.debug("Product {} already exists for hotel {}", sku, hotel.getName());
            return;
        }

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setSku(sku);
        product.setIsActive(true);
        product.setIsAvailable(true);
        product.setHotel(hotel);

        productRepository.save(product);
        logger.info("Created Ethiopian product: {} for hotel: {}", name, hotel.getName());
    }
}
