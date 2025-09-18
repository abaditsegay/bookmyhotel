package com.bookmyhotel.controller;

import java.math.BigDecimal;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/public")
    public ResponseEntity<String> testPublic() {
        return ResponseEntity.ok("Public endpoint works!");
    }

    @GetMapping("/admin")
    public ResponseEntity<String> testAdmin() {
        return ResponseEntity.ok("Admin endpoint works!");
    }

    @PostMapping("/create-ethiopian-products")
    public ResponseEntity<String> createEthiopianProducts() {
        logger.info("Manually creating Ethiopian products...");

        // Get all hotels
        Iterable<Hotel> hotels = hotelRepository.findAll();
        int hotelCount = 0;
        int productCount = 0;

        for (Hotel hotel : hotels) {
            hotelCount++;
            logger.info("Creating Ethiopian products for hotel: {}", hotel.getName());
            productCount += createEthiopianProductsForHotel(hotel);
        }

        String message = String.format("Created Ethiopian products for %d hotels. Total products created: %d",
                hotelCount, productCount);
        logger.info(message);
        return ResponseEntity.ok(message);
    }

    private int createEthiopianProductsForHotel(Hotel hotel) {
        int createdCount = 0;

        // Ethiopian Beverages
        createdCount += createProductIfNotExists(hotel, "Ethiopian Coffee Beans (250g)",
                "Premium Arabica coffee beans from Ethiopian highlands",
                ProductCategory.BEVERAGES, new BigDecimal("45.00"), 50, "ETH-COFFEE-250G") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Tej (Ethiopian Honey Wine)",
                "Traditional fermented honey wine with gesho herbs",
                ProductCategory.BEVERAGES, new BigDecimal("35.00"), 25, "ETH-TEJ-HONEY") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Ethiopian Tea Blend",
                "Aromatic blend of Ethiopian spices and tea leaves",
                ProductCategory.BEVERAGES, new BigDecimal("25.00"), 40, "ETH-TEA-BLEND") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Tella (Ethiopian Barley Beer)",
                "Traditional low-alcohol fermented barley beverage",
                ProductCategory.BEVERAGES, new BigDecimal("18.00"), 30, "ETH-TELLA-BEER") ? 1 : 0;

        // Ethiopian Snacks
        createdCount += createProductIfNotExists(hotel, "Dabo Kolo (Roasted Barley)",
                "Crunchy roasted barley snack seasoned with berbere spice",
                ProductCategory.SNACKS, new BigDecimal("12.00"), 60, "ETH-DABO-KOLO") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Roasted Coffee Beans Snack",
                "Lightly roasted coffee beans with salt and spices",
                ProductCategory.SNACKS, new BigDecimal("15.00"), 45, "ETH-ROAST-COFFEE") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Ethiopian Peanuts Mix",
                "Roasted peanuts with berbere and Ethiopian spices",
                ProductCategory.SNACKS, new BigDecimal("10.00"), 50, "ETH-PEANUTS-MIX") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Injera Chips",
                "Crispy dried injera chips with spice seasoning",
                ProductCategory.SNACKS, new BigDecimal("8.00"), 35, "ETH-INJERA-CHIPS") ? 1 : 0;

        // Traditional Clothing
        createdCount += createProductIfNotExists(hotel, "Traditional Habesha Kemis",
                "Beautiful white cotton dress with colorful embroidered borders",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("120.00"), 15, "ETH-HABESHA-KEMIS") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Men's Traditional Shirt",
                "Classic white cotton shirt with embroidered neckline",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("85.00"), 20, "ETH-MENS-SHIRT") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Netela (Traditional Shawl)",
                "Lightweight cotton shawl with intricate border designs",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("55.00"), 25, "ETH-NETELA-SHAWL") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Ethiopian Cotton Scarf",
                "Soft handwoven cotton scarf with traditional patterns",
                ProductCategory.CULTURAL_CLOTHING, new BigDecimal("25.00"), 40, "ETH-COTTON-SCARF") ? 1 : 0;

        // Souvenirs & Crafts
        createdCount += createProductIfNotExists(hotel, "Ethiopian Cross Pendant",
                "Handcrafted silver Ethiopian Orthodox cross pendant",
                ProductCategory.SOUVENIRS, new BigDecimal("75.00"), 30, "ETH-CROSS-PENDANT") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Coffee Ceremony Set",
                "Complete traditional coffee ceremony set with jebena pot",
                ProductCategory.SOUVENIRS, new BigDecimal("95.00"), 12, "ETH-COFFEE-CEREMONY") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Wooden Ethiopian Map",
                "Hand-carved wooden map of Ethiopia with regional details",
                ProductCategory.SOUVENIRS, new BigDecimal("40.00"), 18, "ETH-WOOD-MAP") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Traditional Basket (Mesob)",
                "Woven grass basket used for serving injera",
                ProductCategory.SOUVENIRS, new BigDecimal("65.00"), 20, "ETH-MESOB-BASKET") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Ethiopian Spice Collection",
                "Selection of authentic Ethiopian spices including berbere",
                ProductCategory.SOUVENIRS, new BigDecimal("30.00"), 35, "ETH-SPICE-COLLECTION") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Lalibela Rock Church Model",
                "Miniature replica of famous Lalibela rock-hewn churches",
                ProductCategory.SOUVENIRS, new BigDecimal("85.00"), 15, "ETH-LALIBELA-MODEL") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Ethiopian Lion Sculpture",
                "Hand-carved wooden Lion of Judah sculpture",
                ProductCategory.SOUVENIRS, new BigDecimal("55.00"), 22, "ETH-LION-SCULPTURE") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Traditional Ethiopian Drums",
                "Small decorative kebero drums with painted designs",
                ProductCategory.SOUVENIRS, new BigDecimal("140.00"), 8, "ETH-TRADITIONAL-DRUMS") ? 1 : 0;

        // Ethiopian Toiletries & Wellness
        createdCount += createProductIfNotExists(hotel, "Ethiopian Black Soap",
                "Natural black soap made with Ethiopian ingredients",
                ProductCategory.TOILETRIES, new BigDecimal("15.00"), 60, "ETH-BLACK-SOAP") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Coffee Body Scrub",
                "Exfoliating scrub made with Ethiopian coffee grounds",
                ProductCategory.TOILETRIES, new BigDecimal("28.00"), 40, "ETH-COFFEE-SCRUB") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Shea Butter Moisturizer",
                "Rich moisturizer made with Ethiopian shea butter and herbs",
                ProductCategory.TOILETRIES, new BigDecimal("22.00"), 45, "ETH-SHEA-CREAM") ? 1 : 0;

        createdCount += createProductIfNotExists(hotel, "Ethiopian Essential Oil Blend",
                "Relaxing essential oil blend with frankincense and myrrh",
                ProductCategory.TOILETRIES, new BigDecimal("35.00"), 30, "ETH-OIL-BLEND") ? 1 : 0;

        logger.info("Created {} Ethiopian products for hotel: {}", createdCount, hotel.getName());
        return createdCount;
    }

    private boolean createProductIfNotExists(Hotel hotel, String name, String description,
            ProductCategory category, BigDecimal price, int stockQuantity, String sku) {

        // Check if product with this SKU already exists for this hotel
        Optional<Product> existingProduct = productRepository.findByHotelIdAndSku(hotel.getId(), sku);

        if (existingProduct.isPresent()) {
            logger.debug("Product {} already exists for hotel {}", sku, hotel.getName());
            return false;
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
        return true;
    }
}
