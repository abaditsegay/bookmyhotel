package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing detailed booking modification history
 * Tracks individual changes made to bookings for expandable notification
 * display
 */
@Entity
@Table(name = "booking_modification_history")
public class BookingModificationHistory extends HotelScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(name = "confirmation_number", nullable = false, length = 20)
    private String confirmationNumber;

    @Column(name = "modification_type", nullable = false, length = 50)
    private String modificationType; // DATE_CHANGE, ROOM_CHANGE, GUEST_CHANGE, etc.

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "additional_charges", precision = 10, scale = 2)
    private BigDecimal additionalCharges = BigDecimal.ZERO;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "change_details", columnDefinition = "TEXT")
    private String changeDetails;

    @Column(name = "modified_by", length = 50)
    private String modifiedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public BookingModificationHistory() {
    }

    public BookingModificationHistory(Reservation reservation, String modificationType,
            String oldValue, String newValue, String changeDetails, String modifiedBy) {
        this.reservation = reservation;
        this.confirmationNumber = reservation.getConfirmationNumber();
        this.modificationType = modificationType;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changeDetails = changeDetails;
        this.modifiedBy = modifiedBy;
        this.createdAt = LocalDateTime.now();

        // Set hotel scoped fields
        if (reservation.getHotel() != null) {
            setHotel(reservation.getHotel());
        }
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
        if (reservation != null) {
            this.confirmationNumber = reservation.getConfirmationNumber();
            if (reservation.getHotel() != null) {
                setHotel(reservation.getHotel());
            }
        }
    }

    public String getConfirmationNumber() {
        return confirmationNumber;
    }

    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }

    public String getModificationType() {
        return modificationType;
    }

    public void setModificationType(String modificationType) {
        this.modificationType = modificationType;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges != null ? additionalCharges : BigDecimal.ZERO;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount != null ? refundAmount : BigDecimal.ZERO;
    }

    public String getChangeDetails() {
        return changeDetails;
    }

    public void setChangeDetails(String changeDetails) {
        this.changeDetails = changeDetails;
    }

    public String getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(String modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}