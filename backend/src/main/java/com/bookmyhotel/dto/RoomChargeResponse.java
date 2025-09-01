package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bookmyhotel.entity.RoomChargeType;

/**
 * Room charge response DTO
 */
public class RoomChargeResponse {

    private Long id;
    private String tenantId;
    private Long hotelId;
    private Long reservationId;
    private Long shopOrderId;
    private String description;
    private BigDecimal amount;
    private RoomChargeType chargeType;
    private LocalDateTime chargeDate;
    private Boolean isPaid;
    private LocalDateTime paidAt;
    private String notes;
    private Long createdBy;
    private LocalDateTime createdAt;

    // Guest information for convenience
    private String guestName;
    private String roomNumber;
    private String reservationConfirmationNumber;

    // Constructors
    public RoomChargeResponse() {
    }

    public RoomChargeResponse(Long id, String tenantId, Long hotelId, Long reservationId,
            String description, BigDecimal amount, RoomChargeType chargeType,
            LocalDateTime chargeDate, Boolean isPaid) {
        this.id = id;
        this.tenantId = tenantId;
        this.hotelId = hotelId;
        this.reservationId = reservationId;
        this.description = description;
        this.amount = amount;
        this.chargeType = chargeType;
        this.chargeDate = chargeDate;
        this.isPaid = isPaid;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public Long getShopOrderId() {
        return shopOrderId;
    }

    public void setShopOrderId(Long shopOrderId) {
        this.shopOrderId = shopOrderId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public RoomChargeType getChargeType() {
        return chargeType;
    }

    public void setChargeType(RoomChargeType chargeType) {
        this.chargeType = chargeType;
    }

    public LocalDateTime getChargeDate() {
        return chargeDate;
    }

    public void setChargeDate(LocalDateTime chargeDate) {
        this.chargeDate = chargeDate;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getReservationConfirmationNumber() {
        return reservationConfirmationNumber;
    }

    public void setReservationConfirmationNumber(String reservationConfirmationNumber) {
        this.reservationConfirmationNumber = reservationConfirmationNumber;
    }

    @Override
    public String toString() {
        return "RoomChargeResponse{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", amount=" + amount +
                ", chargeType=" + chargeType +
                ", isPaid=" + isPaid +
                ", guestName='" + guestName + '\'' +
                ", roomNumber='" + roomNumber + '\'' +
                '}';
    }
}
