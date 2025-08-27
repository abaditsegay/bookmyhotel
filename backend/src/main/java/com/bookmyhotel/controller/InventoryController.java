package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.bookmyhotel.dto.ProductResponse;
import com.bookmyhotel.service.ProductService;

/**
 * REST controller for Inventory management operations
 */
@RestController
@RequestMapping("/api/hotels/{hotelId}/shop/inventory")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONT_DESK') or hasRole('SYSTEM_ADMIN')")
public class InventoryController {
    
    @Autowired
    private ProductService productService;
    
    /**
     * Get inventory stock for a hotel
     * GET /api/hotels/{hotelId}/shop/inventory/stock
     */
    @GetMapping("/stock")
    public ResponseEntity<Page<ProductResponse>> getInventoryStock(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ProductResponse> response = productService.getProducts(hotelId, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get low stock items
     * GET /api/hotels/{hotelId}/shop/inventory/low-stock
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockItems(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "10") int threshold) {
        
        List<ProductResponse> lowStockItems = productService.getLowStockProducts(hotelId, threshold);
        return ResponseEntity.ok(lowStockItems);
    }
    
    /**
     * Get out of stock items
     * GET /api/hotels/{hotelId}/shop/inventory/out-of-stock
     */
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStockItems(@PathVariable Long hotelId) {
        List<ProductResponse> outOfStockItems = productService.getOutOfStockProducts(hotelId);
        return ResponseEntity.ok(outOfStockItems);
    }
    
    /**
     * Get inventory summary
     * GET /api/hotels/{hotelId}/shop/inventory/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<InventorySummary> getInventorySummary(@PathVariable Long hotelId) {
        InventorySummary summary = productService.getInventorySummary(hotelId);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Search inventory items
     * GET /api/hotels/{hotelId}/shop/inventory/search
     */
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchInventory(
            @PathVariable Long hotelId,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ProductResponse> response = productService.searchProducts(hotelId, query, pageable);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Inventory summary DTO
     */
    public static class InventorySummary {
        private long totalProducts;
        private long lowStockProducts;
        private long outOfStockProducts;
        private long activeProducts;
        
        public InventorySummary(long totalProducts, long lowStockProducts, long outOfStockProducts, long activeProducts) {
            this.totalProducts = totalProducts;
            this.lowStockProducts = lowStockProducts;
            this.outOfStockProducts = outOfStockProducts;
            this.activeProducts = activeProducts;
        }
        
        // Getters and setters
        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
        
        public long getLowStockProducts() { return lowStockProducts; }
        public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }
        
        public long getOutOfStockProducts() { return outOfStockProducts; }
        public void setOutOfStockProducts(long outOfStockProducts) { this.outOfStockProducts = outOfStockProducts; }
        
        public long getActiveProducts() { return activeProducts; }
        public void setActiveProducts(long activeProducts) { this.activeProducts = activeProducts; }
    }
}
