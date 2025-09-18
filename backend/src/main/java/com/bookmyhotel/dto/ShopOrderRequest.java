package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * Shop order request DTO for creating orders
 */
public class ShopOrderRequest {

    private String customerName;

    private String customerEmail;
    private String customerPhone;
    private String roomNumber;
    private Long reservationId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<ShopOrderItemRequest> items;

    private String notes;
    private Boolean isDelivery = false;
    private String deliveryAddress;
    private LocalDateTime deliveryTime;

    // Constructors
    public ShopOrderRequest() {
    }

    public ShopOrderRequest(String customerName, PaymentMethod paymentMethod, List<ShopOrderItemRequest> items) {
        this.customerName = customerName;
        this.paymentMethod = paymentMethod;
        this.items = items;
    }

    // Getters and Setters
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

    public List<ShopOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ShopOrderItemRequest> items) {
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
}
