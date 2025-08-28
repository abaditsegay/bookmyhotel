package com.bookmyhotel.dto;

import java.math.BigDecimal;

import com.bookmyhotel.entity.RoomChargeType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Room charge creation request DTO
 */
public class RoomChargeCreateRequest {

    @NotNull(message = "Reservation ID is required")
    private Long reservationId;

    private Long shopOrderId; // Optional

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Charge type is required")
    private RoomChargeType chargeType;

    private String notes;

    // Constructors
    public RoomChargeCreateRequest() {
    }

    public RoomChargeCreateRequest(Long reservationId, String description,
            BigDecimal amount, RoomChargeType chargeType) {
        this.reservationId = reservationId;
        this.description = description;
        this.amount = amount;
        this.chargeType = chargeType;
    }

    // Getters and Setters
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public String toString() {
        return "RoomChargeCreateRequest{" +
                "reservationId=" + reservationId +
                ", shopOrderId=" + shopOrderId +
                ", description='" + description + '\'' +
                ", amount=" + amount +
                ", chargeType=" + chargeType +
                ", notes='" + notes + '\'' +
                '}';
    }
}
