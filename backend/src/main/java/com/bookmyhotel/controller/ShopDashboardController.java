package com.bookmyhotel.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.controller.InventoryController.InventorySummary;
import com.bookmyhotel.dto.ProductResponse;
import com.bookmyhotel.service.ProductService;
import com.bookmyhotel.service.ShopOrderService;
import com.bookmyhotel.service.ShopOrderService.OrderStatistics;

/**
 * REST controller for Shop Dashboard operations
 */
@RestController
@RequestMapping("/api/hotels/{hotelId}/shop/dashboard")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SUPER_ADMIN')")
public class ShopDashboardController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ShopOrderService shopOrderService;

    /**
     * Get consolidated dashboard statistics
     * GET /api/hotels/{hotelId}/shop/dashboard/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ShopDashboardStats> getDashboardStats(@PathVariable Long hotelId) {
        try {
            InventorySummary inventorySummary = productService.getInventorySummary(hotelId);
            OrderStatistics orderStats = shopOrderService.getOrderStatistics(hotelId);

            ShopDashboardStats dashboardStats = new ShopDashboardStats(
                    inventorySummary.getTotalProducts(),
                    inventorySummary.getActiveProducts(),
                    inventorySummary.getLowStockProducts(),
                    inventorySummary.getOutOfStockProducts(),
                    orderStats.getTotalOrders(),
                    orderStats.getUnpaidOrders(),
                    orderStats.getPaidOrders(),
                    orderStats.getTotalRevenue() != null ? orderStats.getTotalRevenue() : BigDecimal.ZERO,
                    orderStats.getTodayOrders(),
                    orderStats.getTodayRevenue() != null ? orderStats.getTodayRevenue() : BigDecimal.ZERO,
                    orderStats.getMonthlyRevenue() != null ? orderStats.getMonthlyRevenue() : BigDecimal.ZERO);

            return ResponseEntity.ok(dashboardStats);
        } catch (Exception e) {
            ShopDashboardStats emptyStats = new ShopDashboardStats(0, 0, 0, 0, 0, 0, 0, BigDecimal.ZERO, 0,
                    BigDecimal.ZERO, BigDecimal.ZERO);
            return ResponseEntity.ok(emptyStats);
        }
    }

    /**
     * Get low stock products with pagination
     * GET /api/hotels/{hotelId}/shop/dashboard/low-stock
     */
    @GetMapping("/low-stock")
    public ResponseEntity<Page<ProductResponse>> getLowStockProducts(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            List<ProductResponse> lowStockProducts = productService.getLowStockProducts(hotelId);

            // Convert list to page for consistent API response
            int start = Math.min((int) pageable.getOffset(), lowStockProducts.size());
            int end = Math.min((start + pageable.getPageSize()), lowStockProducts.size());
            List<ProductResponse> pageContent = lowStockProducts.subList(start, end);

            Page<ProductResponse> productPage = new org.springframework.data.domain.PageImpl<>(
                    pageContent, pageable, lowStockProducts.size());

            return ResponseEntity.ok(productPage);
        } catch (Exception e) {
            return ResponseEntity.ok(Page.empty());
        }
    }

    /**
     * Dashboard statistics DTO
     */
    public static class ShopDashboardStats {
        private long totalProducts;
        private long activeProducts;
        private long lowStockProducts;
        private long outOfStockProducts;
        private long totalOrders;
        private long pendingOrders;
        private long completedOrders;
        private BigDecimal totalRevenue;
        private long todayOrders;
        private BigDecimal todayRevenue;
        private BigDecimal monthlyRevenue;

        public ShopDashboardStats(long totalProducts, long activeProducts, long lowStockProducts,
                long outOfStockProducts, long totalOrders, long pendingOrders,
                long completedOrders, BigDecimal totalRevenue, long todayOrders,
                BigDecimal todayRevenue, BigDecimal monthlyRevenue) {
            this.totalProducts = totalProducts;
            this.activeProducts = activeProducts;
            this.lowStockProducts = lowStockProducts;
            this.outOfStockProducts = outOfStockProducts;
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.completedOrders = completedOrders;
            this.totalRevenue = totalRevenue;
            this.todayOrders = todayOrders;
            this.todayRevenue = todayRevenue;
            this.monthlyRevenue = monthlyRevenue;
        }

        public long getTotalProducts() {
            return totalProducts;
        }

        public long getActiveProducts() {
            return activeProducts;
        }

        public long getLowStockProducts() {
            return lowStockProducts;
        }

        public long getOutOfStockProducts() {
            return outOfStockProducts;
        }

        public long getTotalOrders() {
            return totalOrders;
        }

        public long getPendingOrders() {
            return pendingOrders;
        }

        public long getCompletedOrders() {
            return completedOrders;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public long getTodayOrders() {
            return todayOrders;
        }

        public BigDecimal getTodayRevenue() {
            return todayRevenue;
        }

        public BigDecimal getMonthlyRevenue() {
            return monthlyRevenue;
        }
    }
}
