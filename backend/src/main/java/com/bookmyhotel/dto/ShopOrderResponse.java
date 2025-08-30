package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;

/**
 * Shop order response DTO for API responses
 */
public class ShopOrderResponse {

    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String roomNumber;
    private Long reservationId;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private Boolean isPaid;
    private LocalDateTime paidAt;
    private String paymentReference;
    private List<ShopOrderItemResponse> items;
    private String notes;
    private Boolean isDelivery;
    private String deliveryAddress;
    private LocalDateTime deliveryTime;
    private LocalDateTime orderDate;
    private LocalDateTime completedAt;
    private Long hotelId;
    private String hotelName;
    private String hotelAddress;
    private String hotelTaxId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ShopOrderResponse() {
    }

    public ShopOrderResponse(Long id, String orderNumber, OrderStatus status, String customerName,
            PaymentMethod paymentMethod, BigDecimal totalAmount, Boolean isPaid) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.status = status;
        this.customerName = customerName;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
        this.isPaid = isPaid;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public List<ShopOrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<ShopOrderItemResponse> items) {
        this.items = items;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getIsDelivery() {
        return isDelivery;
    }

    public void setIsDelivery(Boolean isDelivery) {
        this.isDelivery = isDelivery;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public LocalDateTime getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(LocalDateTime deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public String getHotelAddress() {
        return hotelAddress;
    }

    public void setHotelAddress(String hotelAddress) {
        this.hotelAddress = hotelAddress;
    }

    public String getHotelTaxId() {
        return hotelTaxId;
    }

    public void setHotelTaxId(String hotelTaxId) {
        this.hotelTaxId = hotelTaxId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Convenience methods for anonymous sales

    /**
     * Checks if this order is from an anonymous customer
     * 
     * @return true if customer name is null or empty
     */
    public boolean isAnonymousOrder() {
        return customerName == null || customerName.trim().isEmpty();
    }

    /**
     * Returns a display-friendly customer name
     * 
     * @return customer name or "Anonymous Customer" if null/empty
     */
    public String getDisplayCustomerName() {
        if (isAnonymousOrder()) {
            return "Anonymous Customer";
        }
        return customerName;
    }

    /**
     * Returns order type description for display purposes
     * 
     * @return "Room Charge", "Anonymous Sale", or "Customer Order"
     */
    public String getOrderTypeDescription() {
        if (roomNumber != null && !roomNumber.trim().isEmpty()) {
            return "Room Charge - Room " + roomNumber;
        } else if (isAnonymousOrder()) {
            return "Anonymous Sale";
        } else {
            return "Customer Order";
        }
    }
}
