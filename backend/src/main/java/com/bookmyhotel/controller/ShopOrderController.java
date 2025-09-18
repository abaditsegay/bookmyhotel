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

import com.bookmyhotel.dto.ShopOrderRequest;
import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.service.ShopOrderService;

import jakarta.validation.Valid;

/**
 * REST controller for Shop Order management operations
 */
@RestController
@RequestMapping("/api/hotels/{hotelId}/shop/orders")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
public class ShopOrderController {

    @Autowired
    private ShopOrderService shopOrderService;

    /**
     * Create a new shop order
     * POST /api/hotels/{hotelId}/shop/orders
     */
    @PostMapping
    public ResponseEntity<ShopOrderResponse> createOrder(
            @PathVariable Long hotelId,
            @Valid @RequestBody ShopOrderRequest request) {

        ShopOrderResponse response = shopOrderService.createOrder(hotelId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get order by ID
     * GET /api/hotels/{hotelId}/shop/orders/{orderId}
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<ShopOrderResponse> getOrder(
            @PathVariable Long hotelId,
            @PathVariable Long orderId) {

        ShopOrderResponse response = shopOrderService.getOrder(hotelId, orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get order by order number
     * GET /api/hotels/{hotelId}/shop/orders/by-number/{orderNumber}
     */
    @GetMapping("/by-number/{orderNumber}")
    public ResponseEntity<ShopOrderResponse> getOrderByNumber(
            @PathVariable Long hotelId,
            @PathVariable String orderNumber) {

        ShopOrderResponse response = shopOrderService.getOrderByNumber(hotelId, orderNumber);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all orders for a hotel
     * GET /api/hotels/{hotelId}/shop/orders
     */
    @GetMapping
    public ResponseEntity<Page<ShopOrderResponse>> getOrders(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ShopOrderResponse> response;

        if (search != null && !search.trim().isEmpty()) {
            response = shopOrderService.searchOrders(hotelId, search.trim(), pageable);
        } else if (status != null) {
            response = shopOrderService.getOrdersByStatus(hotelId, status, pageable);
        } else {
            response = shopOrderService.getOrders(hotelId, pageable);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Get pending orders (orders that need attention)
     * GET /api/hotels/{hotelId}/shop/orders/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<ShopOrderResponse>> getPendingOrders(@PathVariable Long hotelId) {
        List<ShopOrderResponse> response = shopOrderService.getPendingOrders(hotelId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get today's orders
     * GET /api/hotels/{hotelId}/shop/orders/today
     */
    @GetMapping("/today")
    public ResponseEntity<List<ShopOrderResponse>> getTodaysOrders(@PathVariable Long hotelId) {
        List<ShopOrderResponse> response = shopOrderService.getTodaysOrders(hotelId);
        return ResponseEntity.ok(response);
    }

    /**
     * Update order status
     * PATCH /api/hotels/{hotelId}/shop/orders/{orderId}/status
     */
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ShopOrderResponse> updateOrderStatus(
            @PathVariable Long hotelId,
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {

        ShopOrderResponse response = shopOrderService.updateOrderStatus(hotelId, orderId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark order as paid
     * PATCH /api/hotels/{hotelId}/shop/orders/{orderId}/mark-paid
     */
    @PatchMapping("/{orderId}/mark-paid")
    public ResponseEntity<ShopOrderResponse> markOrderAsPaid(
            @PathVariable Long hotelId,
            @PathVariable Long orderId,
            @RequestParam(required = false) String paymentReference) {

        ShopOrderResponse response = shopOrderService.markOrderAsPaid(hotelId, orderId, paymentReference);
        return ResponseEntity.ok(response);
    }

    /**
     * Toggle order payment status between PAID and PENDING
     * PATCH /api/hotels/{hotelId}/shop/orders/{orderId}/toggle-status
     */
    @PatchMapping("/{orderId}/toggle-status")
    public ResponseEntity<ShopOrderResponse> toggleOrderStatus(
            @PathVariable Long hotelId,
            @PathVariable Long orderId) {

        ShopOrderResponse response = shopOrderService.toggleOrderStatus(hotelId, orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancel order
     * PATCH /api/hotels/{hotelId}/shop/orders/{orderId}/cancel
     */
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<ShopOrderResponse> cancelOrder(
            @PathVariable Long hotelId,
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason) {

        String cancellationReason = reason != null ? reason : "Cancelled by staff";
        ShopOrderResponse response = shopOrderService.cancelOrder(hotelId, orderId, cancellationReason);
        return ResponseEntity.ok(response);
    }

    /**
     * Get order statistics
     * GET /api/hotels/{hotelId}/shop/orders/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ShopOrderService.OrderStatistics> getOrderStatistics(@PathVariable Long hotelId) {
        ShopOrderService.OrderStatistics stats = shopOrderService.getOrderStatistics(hotelId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get order statuses
     * GET /api/hotels/{hotelId}/shop/orders/statuses
     */
    @GetMapping("/statuses")
    public ResponseEntity<OrderStatus[]> getOrderStatuses() {
        return ResponseEntity.ok(OrderStatus.values());
    }
}
