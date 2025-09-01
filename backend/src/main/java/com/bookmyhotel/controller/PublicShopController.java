package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.ShopOrderRequest;
import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.service.ShopOrderService;

import jakarta.validation.Valid;

/**
 * Public REST controller for customer shop order operations
 * No authentication required - for customer purchases
 */
@RestController
@RequestMapping("/api/public/hotels/{hotelId}/shop")
public class PublicShopController {

    @Autowired
    private ShopOrderService shopOrderService;

    /**
     * Create a new shop order (public endpoint for customers)
     * POST /api/public/hotels/{hotelId}/shop/orders
     */
    @PostMapping("/orders")
    public ResponseEntity<ShopOrderResponse> createOrder(
            @PathVariable Long hotelId,
            @Valid @RequestBody ShopOrderRequest request) {

        ShopOrderResponse response = shopOrderService.createOrder(hotelId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get order by order number (public endpoint for customers)
     * GET /api/public/hotels/{hotelId}/shop/orders/{orderNumber}
     */
    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<ShopOrderResponse> getOrderByNumber(
            @PathVariable Long hotelId,
            @PathVariable String orderNumber) {

        ShopOrderResponse response = shopOrderService.getOrderByNumber(hotelId, orderNumber);
        return ResponseEntity.ok(response);
    }
}
