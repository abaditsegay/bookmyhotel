package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bookmyhotel.dto.ProductRequest;
import com.bookmyhotel.dto.ProductResponse;
import com.bookmyhotel.entity.ProductCategory;
import com.bookmyhotel.service.ProductService;

import jakarta.validation.Valid;

/**
 * REST controller for Product management operations
 */
@RestController
@RequestMapping("/api/hotels/{hotelId}/shop/products")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * Create a new product
     * POST /api/hotels/{hotelId}/shop/products
     */
    @PostMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(
            @PathVariable Long hotelId,
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.createProduct(hotelId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Update an existing product
     * PUT /api/hotels/{hotelId}/shop/products/{productId}
     */
    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long hotelId,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response = productService.updateProduct(hotelId, productId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get product by ID
     * GET /api/hotels/{hotelId}/shop/products/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponse> getProduct(
            @PathVariable Long hotelId,
            @PathVariable Long productId) {

        ProductResponse response = productService.getProduct(hotelId, productId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all products for a hotel
     * GET /api/hotels/{hotelId}/shop/products
     */
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) String search) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductResponse> response;

        if (search != null && !search.trim().isEmpty()) {
            response = productService.searchProducts(hotelId, search.trim(), pageable);
        } else if (category != null) {
            response = productService.getProductsByCategory(hotelId, category, pageable);
        } else if (availableOnly != null && availableOnly) {
            response = productService.getAvailableProducts(hotelId, pageable);
        } else if (activeOnly != null && activeOnly) {
            response = productService.getActiveProducts(hotelId, pageable);
        } else {
            response = productService.getProducts(hotelId, pageable);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get available products (active and in stock)
     * GET /api/hotels/{hotelId}/shop/products/available
     */
    @GetMapping("/available")
    public ResponseEntity<Page<ProductResponse>> getAvailableProducts(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) ProductCategory category) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProductResponse> response;
        if (category != null) {
            // For category filtering of available products, we'll need to modify the
            // service
            response = productService.getAvailableProducts(hotelId, pageable);
        } else {
            response = productService.getAvailableProducts(hotelId, pageable);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Update product stock quantity
     * PATCH /api/hotels/{hotelId}/shop/products/{productId}/stock
     */
    @PatchMapping("/{productId}/stock")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long hotelId,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        ProductResponse response = productService.updateStock(hotelId, productId, quantity);
        return ResponseEntity.ok(response);
    }

    /**
     * Toggle product active status
     * PATCH /api/hotels/{hotelId}/shop/products/{productId}/toggle-active
     */
    @PatchMapping("/{productId}/toggle-active")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ProductResponse> toggleActiveStatus(
            @PathVariable Long hotelId,
            @PathVariable Long productId) {

        ProductResponse response = productService.toggleActiveStatus(hotelId, productId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete product
     * DELETE /api/hotels/{hotelId}/shop/products/{productId}
     */
    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long hotelId,
            @PathVariable Long productId) {

        productService.deleteProduct(hotelId, productId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get low stock products
     * GET /api/hotels/{hotelId}/shop/products/low-stock
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "5") Integer threshold) {

        List<ProductResponse> response = productService.getLowStockProducts(hotelId, threshold);
        return ResponseEntity.ok(response);
    }

    /**
     * Get out of stock products
     * GET /api/hotels/{hotelId}/shop/products/out-of-stock
     */
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts(@PathVariable Long hotelId) {
        List<ProductResponse> response = productService.getOutOfStockProducts(hotelId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get product statistics
     * GET /api/hotels/{hotelId}/shop/products/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ProductService.ProductStatistics> getProductStatistics(@PathVariable Long hotelId) {
        ProductService.ProductStatistics stats = productService.getProductStatistics(hotelId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get product categories
     * GET /api/hotels/{hotelId}/shop/products/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ProductCategory[]> getProductCategories() {
        return ResponseEntity.ok(ProductCategory.values());
    }
}
