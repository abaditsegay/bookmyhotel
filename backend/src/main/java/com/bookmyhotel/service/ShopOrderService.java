package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.ShopOrderItemResponse;
import com.bookmyhotel.dto.ShopOrderRequest;
import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.ShopOrderItem;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.ShopOrderRepository;

/**
 * Service class for ShopOrder operations - Simplified PENDING/PAID status
 * management
 */
@Service
@Transactional
public class ShopOrderService {

    @Autowired
    private ShopOrderRepository shopOrderRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomChargeService roomChargeService;

    /**
     * Simple method to demonstrate shop order functionality
     * This will be expanded once all DTOs and repositories are properly configured
     */
    public String getOrderStatusMessage(Long orderId) {
        return "Shop order system is ready - Order #" + orderId + " with simplified " +
                "PENDING/PAID status workflow";
    }

    // Stub methods to satisfy controller dependencies
    // These will be properly implemented once DTOs and repositories are complete

    public ShopOrderResponse createOrder(Long hotelId, ShopOrderRequest request) {
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Generate unique order number
        String orderNumber = generateOrderNumber(hotelId);

        // Create shop order
        ShopOrder order = new ShopOrder();
        order.setOrderNumber(orderNumber);
        order.setHotel(hotel);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setRoomNumber(request.getRoomNumber());

        // Set reservation if provided
        if (request.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Reservation not found with ID: " + request.getReservationId()));
            order.setReservation(reservation);
        }

        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toString() : null);
        order.setNotes(request.getNotes());
        order.setIsDelivery(request.getIsDelivery());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDeliveryTime(request.getDeliveryTime());

        // Set status based on payment method
        LocalDateTime now = LocalDateTime.now();
        order.setOrderDate(now);

        if (request.getPaymentMethod() == null ||
                request.getPaymentMethod().toString().equals("CASH") ||
                request.getPaymentMethod().toString().equals("CARD")) {
            // For immediate payments (cash/card), mark as paid
            order.setStatus(OrderStatus.PAID);
            order.setIsPaid(true);
            order.setPaidAt(now);
        } else {
            // For room charges and other deferred payments, keep as pending
            order.setStatus(OrderStatus.PENDING);
            order.setIsPaid(false);
        }

        // Calculate total amount and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ShopOrderItem> orderItems = new ArrayList<>();

        for (var itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with ID: " + itemRequest.getProductId()));

            ShopOrderItem orderItem = new ShopOrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setProductName(product.getName());
            orderItem.setProductDescription(product.getDescription());
            orderItem.setProductSku(product.getSku());
            orderItem.setNotes(itemRequest.getNotes());

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderItems(orderItems);

        // Save the order
        ShopOrder savedOrder = shopOrderRepository.save(order);

        // If payment method is ROOM_CHARGE and order is linked to a reservation,
        // create a room charge automatically
        if (request.getPaymentMethod() == PaymentMethod.ROOM_CHARGE &&
                savedOrder.getReservation() != null) {
            try {
                roomChargeService.createChargeFromShopOrder(savedOrder);
            } catch (Exception e) {
                // Log the error but don't fail the order creation
                // The room charge can be created manually later if needed
                System.err.println(
                        "Failed to create room charge for shop order " + savedOrder.getId() + ": " + e.getMessage());
            }
        }

        // Convert to response
        return convertToResponse(savedOrder);
    }

    public ShopOrderResponse getOrder(Long hotelId, Long orderId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Find the order
        ShopOrder order = shopOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Verify the order belongs to the specified hotel
        if (!order.getHotel().getId().equals(hotelId)) {
            throw new ResourceNotFoundException("Order not found for hotel ID: " + hotelId);
        }

        return convertToResponse(order);
    }

    public ShopOrderResponse getOrderByNumber(Long hotelId, String orderNumber) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Find the order by order number
        ShopOrder order = shopOrderRepository.findByHotelIdAndOrderNumber(hotelId, orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));

        return convertToResponse(order);
    }

    public Page<ShopOrderResponse> searchOrders(Long hotelId, String searchTerm, Pageable pageable) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Search orders
        Page<ShopOrder> orders = shopOrderRepository.searchOrdersByHotelId(hotelId, searchTerm, pageable);

        // Convert to responses
        List<ShopOrderResponse> orderResponses = orders.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(orderResponses, pageable, orders.getTotalElements());
    }

    public Page<ShopOrderResponse> getOrdersByStatus(Long hotelId, OrderStatus status, Pageable pageable) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Get orders by status
        Page<ShopOrder> orders = shopOrderRepository.findByHotelIdAndStatus(hotelId, status, pageable);

        // Convert to responses
        List<ShopOrderResponse> orderResponses = orders.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(orderResponses, pageable, orders.getTotalElements());
    }

    public Page<ShopOrderResponse> getOrders(Long hotelId, Pageable pageable) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Get orders for the hotel
        Page<ShopOrder> orders = shopOrderRepository.findByHotelId(hotelId, pageable);

        // Convert to responses
        List<ShopOrderResponse> orderResponses = orders.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(orderResponses, pageable, orders.getTotalElements());
    }

    public List<ShopOrderResponse> getPendingOrders(Long hotelId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        // Define pending statuses (orders that need attention)
        List<OrderStatus> pendingStatuses = List.of(
                OrderStatus.valueOf("PENDING"),
                OrderStatus.valueOf("CONFIRMED"),
                OrderStatus.valueOf("PREPARING"));

        // Get pending orders
        List<ShopOrder> orders = shopOrderRepository.findPendingOrdersByHotelId(hotelId, pendingStatuses);

        // Convert to responses
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ShopOrderResponse> getTodaysOrders(Long hotelId) {
        return new ArrayList<>();
    }

    public ShopOrderResponse updateOrderStatus(Long hotelId, Long orderId, OrderStatus newStatus) {
        // Find the order and verify it belongs to the hotel
        ShopOrder order = shopOrderRepository.findByIdAndHotelId(orderId, hotelId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found or doesn't belong to this hotel"));

        // Update the status
        order.setStatus(newStatus);

        // Update payment fields based on new status
        LocalDateTime now = LocalDateTime.now();
        if (newStatus == OrderStatus.PAID) {
            order.setIsPaid(true);
            order.setPaidAt(now);
        } else {
            order.setIsPaid(false);
            order.setPaidAt(null);
            order.setPaymentReference(null);
        }

        // Save the updated order
        shopOrderRepository.save(order);

        // Convert to response DTO
        return convertToResponse(order);
    }

    public ShopOrderResponse markOrderAsPaid(Long hotelId, Long orderId, String paymentReference) {
        // Find the order and verify it belongs to the hotel
        ShopOrder order = shopOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Order does not belong to the specified hotel");
        }

        // Mark as paid
        order.setIsPaid(true);
        order.setPaidAt(LocalDateTime.now());
        if (paymentReference != null && !paymentReference.trim().isEmpty()) {
            order.setPaymentReference(paymentReference.trim());
        }

        // Update status to PAID (simplified status)
        order.setStatus(OrderStatus.PAID);

        order = shopOrderRepository.save(order);
        return convertToResponse(order);
    }

    /**
     * Toggle order payment status between PAID and PENDING
     */
    public ShopOrderResponse toggleOrderStatus(Long hotelId, Long orderId) {
        // Find the order and verify it belongs to the hotel
        ShopOrder order = shopOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Order does not belong to the specified hotel");
        }

        // Toggle status
        OrderStatus newStatus = order.getStatus().toggle();
        order.setStatus(newStatus);

        // Update payment fields based on new status
        if (newStatus == OrderStatus.PAID) {
            order.setIsPaid(true);
            order.setPaidAt(LocalDateTime.now());
        } else {
            order.setIsPaid(false);
            order.setPaidAt(null);
            order.setPaymentReference(null);
        }

        order = shopOrderRepository.save(order);
        return convertToResponse(order);
    }

    public ShopOrderResponse cancelOrder(Long hotelId, Long orderId, String reason) {
        // Find the order and verify it belongs to the hotel
        ShopOrder order = shopOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getHotel().getId().equals(hotelId)) {
            throw new IllegalArgumentException("Order does not belong to the specified hotel");
        }

        // Only allow cancellation if order is not already paid
        if (order.getStatus() == OrderStatus.PAID) {
            throw new IllegalStateException("Cannot cancel a paid order");
        }

        // Cancel the order (simplified: reset to pending and unpaid state)
        order.setStatus(OrderStatus.PENDING);
        order.setIsPaid(false);
        order.setPaidAt(null);
        order.setPaymentReference(null);
        if (reason != null && !reason.trim().isEmpty()) {
            order.setNotes(order.getNotes() != null ? order.getNotes() + " | Cancellation reason: " + reason.trim()
                    : "Cancellation reason: " + reason.trim());
        }

        order = shopOrderRepository.save(order);
        return convertToResponse(order);
    }

    public OrderStatistics getOrderStatistics(Long hotelId) {
        // Calculate actual statistics using repository methods (simplified status)
        long totalOrders = shopOrderRepository.countByHotelId(hotelId);
        long paidOrders = shopOrderRepository.countByHotelIdAndStatus(hotelId, OrderStatus.PAID);

        // Count pending orders (unpaid)
        long pendingOrders = shopOrderRepository.countByHotelIdAndStatus(hotelId, OrderStatus.PENDING);

        // Count unpaid orders (same as pending in simplified model)
        long unpaidOrders = pendingOrders;

        // Calculate total revenue from paid orders
        BigDecimal totalRevenue = shopOrderRepository.calculateTotalRevenueByHotelId(hotelId);

        // Calculate today's statistics
        long todayOrders = shopOrderRepository.countTodaysOrdersByHotelId(hotelId);
        BigDecimal todayRevenue = shopOrderRepository.calculateTodaysRevenueByHotelId(hotelId);

        // Calculate monthly revenue (current month)
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
                .withNano(0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);
        BigDecimal monthlyRevenue = shopOrderRepository.calculateRevenueByHotelIdAndDateRange(hotelId, startOfMonth,
                endOfMonth);

        // Calculate pending revenue (total amount of unpaid orders)
        BigDecimal pendingRevenue;
        try {
            // Get all unpaid orders and sum their amounts (simplified: only PENDING status)
            List<ShopOrder> unpaidOrdersList = shopOrderRepository.findByHotelIdAndStatus(hotelId, OrderStatus.PENDING);

            pendingRevenue = unpaidOrdersList.stream()
                    .filter(order -> !order.getIsPaid())
                    .map(ShopOrder::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            // Fallback to zero if calculation fails
            pendingRevenue = BigDecimal.ZERO;
        }

        return new OrderStatistics(totalOrders, unpaidOrders, paidOrders, totalRevenue, pendingRevenue,
                todayOrders, todayRevenue, monthlyRevenue, pendingOrders);
    }

    /**
     * Generate unique order number for hotel
     */
    private String generateOrderNumber(Long hotelId) {
        String prefix = "ORD-" + hotelId + "-";
        long currentTime = System.currentTimeMillis();
        String timestamp = String.valueOf(currentTime);
        String suffix = timestamp.substring(timestamp.length() - 6); // Last 6 digits

        String orderNumber = prefix + suffix;

        // Ensure uniqueness
        while (shopOrderRepository.existsByHotelIdAndOrderNumber(hotelId, orderNumber)) {
            currentTime = System.currentTimeMillis();
            timestamp = String.valueOf(currentTime);
            suffix = timestamp.substring(timestamp.length() - 6);
            orderNumber = prefix + suffix;
        }

        return orderNumber;
    }

    /**
     * Convert ShopOrder entity to ShopOrderResponse DTO
     */
    private ShopOrderResponse convertToResponse(ShopOrder order) {
        ShopOrderResponse response = new ShopOrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus());
        response.setCustomerName(order.getCustomerName() != null && !order.getCustomerName().trim().isEmpty()
                ? order.getCustomerName()
                : "Anonymous Customer");
        response.setCustomerEmail(order.getCustomerEmail());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setRoomNumber(order.getRoomNumber());
        response.setReservationId(order.getReservation() != null ? order.getReservation().getId() : null);
        response.setTotalAmount(order.getTotalAmount());
        response.setIsPaid(order.getIsPaid());
        response.setPaidAt(order.getPaidAt());
        response.setPaymentReference(order.getPaymentReference());

        // Convert payment method string back to enum
        if (order.getPaymentMethod() != null) {
            try {
                response.setPaymentMethod(com.bookmyhotel.entity.PaymentMethod.valueOf(order.getPaymentMethod()));
            } catch (IllegalArgumentException e) {
                // If the stored string doesn't match an enum value, default to CASH
                response.setPaymentMethod(com.bookmyhotel.entity.PaymentMethod.CASH);
            }
        }

        response.setNotes(order.getNotes());
        response.setIsDelivery(order.getIsDelivery());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setDeliveryTime(order.getDeliveryTime());
        response.setOrderDate(order.getOrderDate());
        response.setCompletedAt(order.getCompletedAt());
        response.setHotelId(order.getHotel().getId());
        response.setHotelName(order.getHotel().getName());
        response.setHotelAddress(order.getHotel().getAddress());
        // TODO: Add hotelTaxId when Hotel entity has taxId field
        response.setHotelTaxId(null); // Placeholder for now
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        // Convert order items
        List<ShopOrderItemResponse> itemResponses = new ArrayList<>();
        for (ShopOrderItem item : order.getOrderItems()) {
            ShopOrderItemResponse itemResponse = new ShopOrderItemResponse();
            itemResponse.setId(item.getId());
            itemResponse.setProductId(item.getProduct().getId());
            itemResponse.setProductName(item.getProductName());
            itemResponse.setProductSku(item.getProductSku());
            itemResponse.setUnitPrice(item.getUnitPrice());
            itemResponse.setQuantity(item.getQuantity());
            itemResponse.setTotalPrice(item.getTotalPrice());
            itemResponse.setNotes(item.getNotes());
            itemResponses.add(itemResponse);
        }
        response.setItems(itemResponses);

        return response;
    }

    /**
     * Inner class for order statistics
     */
    public static class OrderStatistics {
        private final long totalOrders;
        private final long unpaidOrders;
        private final long paidOrders;
        private final BigDecimal totalRevenue;
        private final BigDecimal pendingRevenue;

        // Additional fields for comprehensive dashboard
        private final long todayOrders;
        private final BigDecimal todayRevenue;
        private final BigDecimal monthlyRevenue;
        private final long pendingOrders;

        public OrderStatistics(long totalOrders, long unpaidOrders, long paidOrders,
                BigDecimal totalRevenue, BigDecimal pendingRevenue) {
            this.totalOrders = totalOrders;
            this.unpaidOrders = unpaidOrders;
            this.paidOrders = paidOrders;
            this.totalRevenue = totalRevenue;
            this.pendingRevenue = pendingRevenue;
            // Set defaults for additional fields
            this.todayOrders = 0;
            this.todayRevenue = BigDecimal.ZERO;
            this.monthlyRevenue = BigDecimal.ZERO;
            this.pendingOrders = 0;
        }

        public OrderStatistics(long totalOrders, long unpaidOrders, long paidOrders,
                BigDecimal totalRevenue, BigDecimal pendingRevenue, long todayOrders,
                BigDecimal todayRevenue, BigDecimal monthlyRevenue, long pendingOrders) {
            this.totalOrders = totalOrders;
            this.unpaidOrders = unpaidOrders;
            this.paidOrders = paidOrders;
            this.totalRevenue = totalRevenue;
            this.pendingRevenue = pendingRevenue;
            this.todayOrders = todayOrders;
            this.todayRevenue = todayRevenue;
            this.monthlyRevenue = monthlyRevenue;
            this.pendingOrders = pendingOrders;
        }

        // Getters
        public long getTotalOrders() {
            return totalOrders;
        }

        public long getUnpaidOrders() {
            return unpaidOrders;
        }

        public long getPaidOrders() {
            return paidOrders;
        }

        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }

        public BigDecimal getPendingRevenue() {
            return pendingRevenue;
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

        public long getPendingOrders() {
            return pendingOrders;
        }
    }
}
