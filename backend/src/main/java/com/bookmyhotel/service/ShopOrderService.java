package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.ShopOrderRequest;
import com.bookmyhotel.dto.ShopOrderItemRequest;
import com.bookmyhotel.dto.ShopOrderResponse;
import com.bookmyhotel.dto.ShopOrderItemResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;
import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.ShopOrderItem;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.exception.BadRequestException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ProductRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
import com.bookmyhotel.repository.ShopOrderItemRepository;

/**
 * Service class for ShopOrder operations
 */
@Service
@Transactional
public class ShopOrderService {
    
    @Autowired
    private ShopOrderRepository shopOrderRepository;
    
    @Autowired
    private ShopOrderItemRepository shopOrderItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private ProductService productService;
    
    /**
     * Create a new shop order
     */
    public ShopOrderResponse createOrder(Long hotelId, ShopOrderRequest request) {
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));
        
        // Validate reservation if provided
        Reservation reservation = null;
        if (request.getReservationId() != null) {
            reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + request.getReservationId()));
            
            // Verify reservation belongs to hotel
            if (!reservation.getHotel().getId().equals(hotelId)) {
                throw new BadRequestException("Reservation does not belong to the specified hotel");
            }
        }
        
        // Validate order items and check availability
        validateOrderItems(request.getItems());
        
        // Create order
        ShopOrder order = new ShopOrder();
        order.setOrderNumber(generateOrderNumber(hotel));
        order.setStatus(OrderStatus.PENDING);
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setRoomNumber(request.getRoomNumber());
        order.setReservation(reservation);
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toStringId() : null);
        order.setNotes(request.getNotes());
        order.setIsDelivery(request.getIsDelivery() != null ? request.getIsDelivery() : false);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDeliveryTime(request.getDeliveryTime());
        order.setHotel(hotel);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        // Save order first to get ID
        ShopOrder savedOrder = shopOrderRepository.save(order);
        
        // Create order items and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<ShopOrderItem> orderItems = new ArrayList<>();
        
        for (ShopOrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemRequest.getProductId()));
            
            // Verify product belongs to hotel
            if (!product.getHotel().getId().equals(hotelId)) {
                throw new BadRequestException("Product does not belong to the specified hotel");
            }
            
            // Check stock availability
            if (!productService.isProductAvailable(product.getId(), itemRequest.getQuantity())) {
                throw new BadRequestException("Product '" + product.getName() + "' is not available in requested quantity");
            }
            
            // Create order item
            ShopOrderItem orderItem = new ShopOrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductId(product.getId());
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setNotes(itemRequest.getNotes());
            
            orderItems.add(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());
            
            // Reduce stock
            productService.reduceStock(product.getId(), itemRequest.getQuantity());
        }
        
        // Save order items
        shopOrderItemRepository.saveAll(orderItems);
        
        // Update order total
        savedOrder.setTotalAmount(totalAmount);
        savedOrder.setOrderItems(orderItems);
        savedOrder = shopOrderRepository.save(savedOrder);
        
        return convertToResponse(savedOrder);
    }
    
    /**
     * Update order status
     */
    public ShopOrderResponse updateOrderStatus(Long hotelId, Long orderId, OrderStatus newStatus) {
        ShopOrder order = shopOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify order belongs to hotel
        if (!order.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Order does not belong to the specified hotel");
        }
        
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        // Set completion time if order is completed
        if (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.READY_FOR_PICKUP) {
            order.setCompletedAt(LocalDateTime.now());
        }
        
        // Handle stock restoration for cancelled orders
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            restoreStockForCancelledOrder(order);
        }
        
        ShopOrder updatedOrder = shopOrderRepository.save(order);
        return convertToResponse(updatedOrder);
    }
    
    /**
     * Mark order as paid
     */
    public ShopOrderResponse markOrderAsPaid(Long hotelId, Long orderId, String paymentReference) {
        ShopOrder order = shopOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify order belongs to hotel
        if (!order.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Order does not belong to the specified hotel");
        }
        
        order.setIsPaid(true);
        order.setPaidAt(LocalDateTime.now());
        order.setPaymentReference(paymentReference);
        order.setUpdatedAt(LocalDateTime.now());
        
        // Auto-update status to CONFIRMED if still PENDING
        if (order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
        }
        
        ShopOrder updatedOrder = shopOrderRepository.save(order);
        return convertToResponse(updatedOrder);
    }
    
    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public ShopOrderResponse getOrder(Long hotelId, Long orderId) {
        ShopOrder order = shopOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify order belongs to hotel
        if (!order.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Order does not belong to the specified hotel");
        }
        
        return convertToResponse(order);
    }
    
    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public ShopOrderResponse getOrderByNumber(Long hotelId, String orderNumber) {
        ShopOrder order = shopOrderRepository.findByHotelIdAndOrderNumber(hotelId, orderNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        
        return convertToResponse(order);
    }
    
    /**
     * Get all orders for a hotel
     */
    @Transactional(readOnly = true)
    public Page<ShopOrderResponse> getOrders(Long hotelId, Pageable pageable) {
        Page<ShopOrder> orders = shopOrderRepository.findByHotelId(hotelId, pageable);
        return orders.map(this::convertToResponse);
    }
    
    /**
     * Get orders by status
     */
    @Transactional(readOnly = true)
    public Page<ShopOrderResponse> getOrdersByStatus(Long hotelId, OrderStatus status, Pageable pageable) {
        Page<ShopOrder> orders = shopOrderRepository.findByHotelIdAndStatus(hotelId, status, pageable);
        return orders.map(this::convertToResponse);
    }
    
    /**
     * Get pending orders (orders that need attention)
     */
    @Transactional(readOnly = true)
    public List<ShopOrderResponse> getPendingOrders(Long hotelId) {
        List<OrderStatus> pendingStatuses = Arrays.asList(
            OrderStatus.PENDING, 
            OrderStatus.CONFIRMED, 
            OrderStatus.PREPARING
        );
        
        List<ShopOrder> orders = shopOrderRepository.findPendingOrdersByHotelId(hotelId, pendingStatuses);
        return orders.stream().map(this::convertToResponse).toList();
    }
    
    /**
     * Search orders
     */
    @Transactional(readOnly = true)
    public Page<ShopOrderResponse> searchOrders(Long hotelId, String searchTerm, Pageable pageable) {
        Page<ShopOrder> orders = shopOrderRepository.searchOrdersByHotelId(hotelId, searchTerm, pageable);
        return orders.map(this::convertToResponse);
    }
    
    /**
     * Get today's orders
     */
    @Transactional(readOnly = true)
    public List<ShopOrderResponse> getTodaysOrders(Long hotelId) {
        List<ShopOrder> orders = shopOrderRepository.findTodaysOrdersByHotelId(hotelId);
        return orders.stream().map(this::convertToResponse).toList();
    }
    
    /**
     * Cancel order
     */
    public ShopOrderResponse cancelOrder(Long hotelId, Long orderId, String reason) {
        ShopOrder order = shopOrderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        
        // Verify order belongs to hotel
        if (!order.getHotel().getId().equals(hotelId)) {
            throw new BadRequestException("Order does not belong to the specified hotel");
        }
        
        // Check if order can be cancelled
        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot cancel order with status: " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setNotes(order.getNotes() != null ? order.getNotes() + "\nCancellation reason: " + reason : "Cancellation reason: " + reason);
        order.setUpdatedAt(LocalDateTime.now());
        
        // Restore stock
        restoreStockForCancelledOrder(order);
        
        ShopOrder updatedOrder = shopOrderRepository.save(order);
        return convertToResponse(updatedOrder);
    }
    
    /**
     * Get order statistics
     */
    @Transactional(readOnly = true)
    public OrderStatistics getOrderStatistics(Long hotelId) {
        long totalOrders = shopOrderRepository.countByHotelId(hotelId);
        long todaysOrders = shopOrderRepository.countTodaysOrdersByHotelId(hotelId);
        long pendingOrders = shopOrderRepository.countByHotelIdAndStatus(hotelId, OrderStatus.PENDING);
        BigDecimal totalRevenue = shopOrderRepository.calculateTotalRevenueByHotelId(hotelId);
        BigDecimal todaysRevenue = shopOrderRepository.calculateTodaysRevenueByHotelId(hotelId);
        
        return new OrderStatistics(totalOrders, todaysOrders, pendingOrders, totalRevenue, todaysRevenue);
    }
    
    /**
     * Validate order items
     */
    private void validateOrderItems(List<ShopOrderItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new BadRequestException("Order must contain at least one item");
        }
        
        for (ShopOrderItemRequest item : items) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new BadRequestException("Item quantity must be positive");
            }
        }
    }
    
    /**
     * Generate unique order number
     */
    private String generateOrderNumber(Hotel hotel) {
        String prefix = hotel.getName().replaceAll("[^A-Za-z]", "").toUpperCase().substring(0, Math.min(3, hotel.getName().length()));
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String orderNumber = "ORD-" + prefix + "-" + timestamp;
        
        // Ensure uniqueness
        int counter = 1;
        String finalOrderNumber = orderNumber;
        while (shopOrderRepository.existsByHotelIdAndOrderNumber(hotel.getId(), finalOrderNumber)) {
            finalOrderNumber = orderNumber + "-" + counter;
            counter++;
        }
        
        return finalOrderNumber;
    }
    
    /**
     * Restore stock for cancelled order
     */
    private void restoreStockForCancelledOrder(ShopOrder order) {
        List<ShopOrderItem> orderItems = shopOrderItemRepository.findByOrderId(order.getId());
        for (ShopOrderItem item : orderItems) {
            try {
                productService.restoreStock(item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                // Log the error but don't fail the cancellation
                System.err.println("Failed to restore stock for product " + item.getProductId() + ": " + e.getMessage());
            }
        }
    }
    
    /**
     * Convert ShopOrder entity to ShopOrderResponse DTO
     */
    private ShopOrderResponse convertToResponse(ShopOrder order) {
        ShopOrderResponse response = new ShopOrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setStatus(order.getStatus());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setRoomNumber(order.getRoomNumber());
        response.setReservationId(order.getReservation() != null ? order.getReservation().getId() : null);
        response.setPaymentMethod(order.getPaymentMethod() != null ? PaymentMethod.fromString(order.getPaymentMethod()) : null);
        response.setTotalAmount(order.getTotalAmount());
        response.setIsPaid(order.getIsPaid());
        response.setPaidAt(order.getPaidAt());
        response.setPaymentReference(order.getPaymentReference());
        response.setNotes(order.getNotes());
        response.setIsDelivery(order.getIsDelivery());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setDeliveryTime(order.getDeliveryTime());
        response.setCompletedAt(order.getCompletedAt());
        response.setHotelId(order.getHotel().getId());
        response.setHotelName(order.getHotel().getName());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        // Convert order items
        if (order.getOrderItems() != null) {
            List<ShopOrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(this::convertItemToResponse)
                .toList();
            response.setItems(itemResponses);
        }
        
        return response;
    }
    
    /**
     * Convert ShopOrderItem entity to ShopOrderItemResponse DTO
     */
    private ShopOrderItemResponse convertItemToResponse(ShopOrderItem item) {
        ShopOrderItemResponse response = new ShopOrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProductId());
        response.setProductName(item.getProductName());
        response.setProductSku(item.getProductSku());
        response.setUnitPrice(item.getUnitPrice());
        response.setQuantity(item.getQuantity());
        response.setTotalPrice(item.getTotalPrice());
        response.setNotes(item.getNotes());
        return response;
    }
    
    /**
     * Inner class for order statistics
     */
    public static class OrderStatistics {
        private final long totalOrders;
        private final long todaysOrders;
        private final long pendingOrders;
        private final BigDecimal totalRevenue;
        private final BigDecimal todaysRevenue;
        
        public OrderStatistics(long totalOrders, long todaysOrders, long pendingOrders, 
                              BigDecimal totalRevenue, BigDecimal todaysRevenue) {
            this.totalOrders = totalOrders;
            this.todaysOrders = todaysOrders;
            this.pendingOrders = pendingOrders;
            this.totalRevenue = totalRevenue;
            this.todaysRevenue = todaysRevenue;
        }
        
        public long getTotalOrders() { return totalOrders; }
        public long getTodaysOrders() { return todaysOrders; }
        public long getPendingOrders() { return pendingOrders; }
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public BigDecimal getTodaysRevenue() { return todaysRevenue; }
    }
}
