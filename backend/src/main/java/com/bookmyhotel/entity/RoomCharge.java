package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Room charge entity - represents charges posted to guest rooms
 */
@Entity
@Table(name = "room_charges", indexes = {
        @Index(name = "idx_room_charge_hotel", columnList = "hotel_id"),
        @Index(name = "idx_room_charge_reservation", columnList = "reservation_id"),
        @Index(name = "idx_room_charge_order", columnList = "shop_order_id"),
        @Index(name = "idx_room_charge_type", columnList = "charge_type"),
        @Index(name = "idx_room_charge_date", columnList = "charge_date"),
        @Index(name = "idx_room_charge_paid", columnList = "is_paid")
})
public class RoomCharge extends HotelScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Reservation is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    // Optional: Link to shop order if charge originated from shop purchase
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_order_id", nullable = true)
    private ShopOrder shopOrder;

    @NotBlank(message = "Description is required")
    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Charge type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "charge_type", nullable = false, length = 20)
    private RoomChargeType chargeType;

    @NotNull(message = "Charge date is required")
    @Column(name = "charge_date", nullable = false)
    private LocalDateTime chargeDate;

    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(name = "payment_date")
    private LocalDateTime paidAt;

    @Column(name = "notes", length = 1000)
    private String notes;

    // Reference to the user who created this charge (staff member)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = true)
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Override inherited updatedAt field to exclude it from database mapping
    // since room_charges table doesn't have updated_at column
    @Transient
    private LocalDateTime updatedAt;

    // Constructors
    public RoomCharge() {
        this.chargeDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    public RoomCharge(Hotel hotel, Reservation reservation, String description,
            BigDecimal amount, RoomChargeType chargeType) {
        this();
        this.setHotel(hotel);
        this.reservation = reservation;
        this.description = description;
        this.amount = amount;
        this.chargeType = chargeType;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reservation getReservation() {
        return reservation;
    }

    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }

    public ShopOrder getShopOrder() {
        return shopOrder;
    }

    public void setShopOrder(ShopOrder shopOrder) {
        this.shopOrder = shopOrder;
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Override inherited getUpdatedAt/setUpdatedAt to handle @Transient field
    @Override
    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    @Override
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Mark this charge as paid
     */
    public void markAsPaid(String paymentReference) {
        this.isPaid = true;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * Mark this charge as unpaid
     */
    public void markAsUnpaid() {
        this.isPaid = false;
        this.paidAt = null;
    }

    @Override
    public String toString() {
        return "RoomCharge{" +
                "id=" + id +
                ", description='" + description + '\'' +
                ", amount=" + amount +
                ", chargeType=" + chargeType +
                ", chargeDate=" + chargeDate +
                ", isPaid=" + isPaid +
                '}';
    }
}
