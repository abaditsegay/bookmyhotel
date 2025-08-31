package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.ProductRequest;
import com.bookmyhotel.dto.ProductResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.exception.BadRequestException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;

/**
 * Service class for Product operations
 */
@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Create a new product
     */
    public ProductResponse createProduct(Long hotelId, ProductRequest request) {
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Validate SKU uniqueness if provided
        if (request.getSku() != null && !request.getSku().trim().isEmpty()) {
            if (productRepository.existsByHotelIdAndSku(hotelId, request.getSku())) {
                throw new BadRequestException(
                        "Product with SKU '" + request.getSku() + "' already exists for this hotel");
            }
        }

        // Create product entity
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setSku(request.getSku());
        product.setImageUrl(request.getImageUrl());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        product.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        product.setWeightKg(request.getWeightKg());
        product.setHotel(hotel);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // Generate SKU if not provided
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            product.setSku(generateSku(hotel, product));
        }

        Product savedProduct = productRepository.save(product);
        return convertToResponse(savedProduct);
    }

    /**
     * Update an existing product
     */
    public ProductResponse updateProduct(Long hotelId, Long productId, ProductRequest request) {
        // Find product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        // Verify product belongs to hotel
        if (!product.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Product does not belong to the specified hotel");
        }

        // Validate SKU uniqueness if changed
        if (request.getSku() != null && !request.getSku().equals(product.getSku())) {
            if (productRepository.existsByHotelIdAndSkuAndIdNot(hotelId, request.getSku(), productId)) {
                throw new BadRequestException(
                        "Product with SKU '" + request.getSku() + "' already exists for this hotel");
            }
        }

        // Update product fields
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setSku(request.getSku());
        product.setImageUrl(request.getImageUrl());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : product.getIsActive());
        product.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : product.getIsAvailable());
        product.setWeightKg(request.getWeightKg());
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }

    /**
     * Get product by ID
     */
    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long hotelId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        // Verify product belongs to hotel
        if (!product.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Product does not belong to the specified hotel");
        }

        return convertToResponse(product);
    }

    /**
     * Get all products for a hotel
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(Long hotelId, Pageable pageable) {
        Page<Product> products = productRepository.findByHotelId(hotelId, pageable);
        return products.map(this::convertToResponse);
    }

    /**
     * Get active products for a hotel
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getActiveProducts(Long hotelId, Pageable pageable) {
        Page<Product> products = productRepository.findByHotelIdAndIsActiveTrue(hotelId, pageable);
        return products.map(this::convertToResponse);
    }

    /**
     * Get available products for a hotel (active and in stock)
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAvailableProducts(Long hotelId, Pageable pageable) {
        Page<Product> products = productRepository.findAvailableProductsByHotelId(hotelId, pageable);
        return products.map(this::convertToResponse);
    }

    /**
     * Get products by category
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long hotelId, ProductCategory category, Pageable pageable) {
        Page<Product> products = productRepository.findByHotelIdAndCategory(hotelId, category, pageable);
        return products.map(this::convertToResponse);
    }

    /**
     * Search products
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(Long hotelId, String searchTerm, Pageable pageable) {
        Page<Product> products = productRepository.searchProductsByHotelId(hotelId, searchTerm, pageable);
        return products.map(this::convertToResponse);
    }

    /**
     * Update stock quantity
     */
    public ProductResponse updateStock(Long hotelId, Long productId, Integer newQuantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        // Verify product belongs to hotel
        if (!product.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Product does not belong to the specified hotel");
        }

        if (newQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }

        product.setStockQuantity(newQuantity);
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }

    /**
     * Reduce stock quantity (for order processing)
     */
    public void reduceStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        if (product.getStockQuantity() < quantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName() +
                    ". Available: " + product.getStockQuantity() + ", Requested: " + quantity);
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    /**
     * Restore stock quantity (for order cancellation)
     */
    public void restoreStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    /**
     * Toggle product active status
     */
    public ProductResponse toggleActiveStatus(Long hotelId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        // Verify product belongs to hotel
        if (!product.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Product does not belong to the specified hotel");
        }

        product.setIsActive(!product.getIsActive());
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }

    /**
     * Toggle product availability status
     */
    public ProductResponse toggleAvailableStatus(Long hotelId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        // Verify product belongs to hotel
        if (!product.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Product does not belong to the specified hotel");
        }

        product.setIsAvailable(!product.getIsAvailable());
        product.setUpdatedAt(LocalDateTime.now());

        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }

    /**
     * Delete product
     */
    public void deleteProduct(Long hotelId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));

        // Verify product belongs to hotel
        if (!product.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Product does not belong to the specified hotel");
        }

        productRepository.delete(product);
    }

    /**
     * Get low stock products
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Long hotelId, Integer threshold) {
        List<Product> products = productRepository.findLowStockProductsByHotelId(hotelId, threshold);
        return products.stream().map(this::convertToResponse).toList();
    }

    /**
     * Get out of stock products
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getOutOfStockProducts(Long hotelId) {
        List<Product> products = productRepository.findOutOfStockProductsByHotelId(hotelId);
        return products.stream().map(this::convertToResponse).toList();
    }

    /**
     * Check product availability for order
     */
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer requiredQuantity) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return false;
        }

        Product product = productOpt.get();
        return product.getIsActive() && product.getStockQuantity() >= requiredQuantity;
    }

    /**
     * Get product statistics
     */
    @Transactional(readOnly = true)
    public ProductStatistics getProductStatistics(Long hotelId) {
        long totalProducts = productRepository.countByHotelId(hotelId);
        long activeProducts = productRepository.countByHotelIdAndIsActiveTrue(hotelId);
        long availableProducts = productRepository.countAvailableProductsByHotelId(hotelId);

        return new ProductStatistics(totalProducts, activeProducts, availableProducts);
    }

    /**
     * Get inventory summary
     */
    @Transactional(readOnly = true)
    public com.bookmyhotel.controller.InventoryController.InventorySummary getInventorySummary(Long hotelId) {
        long totalProducts = productRepository.countByHotelId(hotelId);
        long activeProducts = productRepository.countByHotelIdAndIsActiveTrue(hotelId);
        long lowStockProducts = productRepository.countLowStockProductsByHotelId(hotelId, 10); // threshold of 10
        long outOfStockProducts = productRepository.countOutOfStockProductsByHotelId(hotelId);

        return new com.bookmyhotel.controller.InventoryController.InventorySummary(
                totalProducts, lowStockProducts, outOfStockProducts, activeProducts);
    }

    /**
     * Generate SKU for product
     */
    private String generateSku(Hotel hotel, Product product) {
        String prefix = hotel.getName().replaceAll("[^A-Za-z]", "").toUpperCase().substring(0,
                Math.min(3, hotel.getName().length()));
        String categoryPrefix = product.getCategory().name().substring(0,
                Math.min(3, product.getCategory().name().length()));
        long timestamp = System.currentTimeMillis() % 10000; // Last 4 digits
        return prefix + "-" + categoryPrefix + "-" + timestamp;
    }

    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setCategory(product.getCategory());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setSku(product.getSku());
        response.setImageUrl(product.getImageUrl());
        response.setIsActive(product.getIsActive());
        response.setIsAvailable(product.isAvailable());
        response.setWeightKg(product.getWeightKg());
        response.setHotelId(product.getHotel().getId());
        response.setHotelName(product.getHotel().getName());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    /**
     * Inner class for product statistics
     */
    public static class ProductStatistics {
        private final long totalProducts;
        private final long activeProducts;
        private final long availableProducts;

        public ProductStatistics(long totalProducts, long activeProducts, long availableProducts) {
            this.totalProducts = totalProducts;
            this.activeProducts = activeProducts;
            this.availableProducts = availableProducts;
        }

        public long getTotalProducts() {
            return totalProducts;
        }

        public long getActiveProducts() {
            return activeProducts;
        }

        public long getAvailableProducts() {
            return availableProducts;
        }
    }
}
