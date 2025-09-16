package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.bookmyhotel.enums.NotificationStatus;
import com.bookmyhotel.enums.NotificationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing booking notifications for hotel admin and front desk
 * staff
 * Tracks booking cancellations and modifications for operational awareness
 */
@Entity
@Table(name = "booking_notifications")
public class BookingNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NotificationStatus status = NotificationStatus.UNREAD;

    @Column(name = "guest_name")
    private String guestName;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "confirmation_number")
    private String confirmationNumber;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "room_type")
    private String roomType;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Column(name = "change_details", columnDefinition = "TEXT")
    private String changeDetails;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "additional_charges", precision = 10, scale = 2)
    private BigDecimal additionalCharges;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "hotel_id")
    private Long hotelId;

    // Constructors
    public BookingNotification() {
        this.createdAt = LocalDateTime.now();
        this.status = NotificationStatus.UNREAD;
    }

    public BookingNotification(Reservation reservation, NotificationType type) {
        this();
        this.reservation = reservation;
        this.type = type;
        this.tenantId = reservation.getTenantId();

        // Set hotel ID - prefer from room if available, otherwise from reservation
        if (reservation.getRoom() != null && reservation.getRoom().getHotel() != null) {
            this.hotelId = reservation.getRoom().getHotel().getId();
        } else if (reservation.getHotel() != null) {
            this.hotelId = reservation.getHotel().getId();
        }

        this.confirmationNumber = reservation.getConfirmationNumber();
        this.checkInDate = reservation.getCheckInDate();
        this.checkOutDate = reservation.getCheckOutDate();

        // Set guest information
        if (reservation.getGuest() != null) {
            this.guestName = reservation.getGuest().getFirstName() + " " + reservation.getGuest().getLastName();
            this.guestEmail = reservation.getGuest().getEmail();
        } else if (reservation.getGuestInfo() != null) {
            this.guestName = reservation.getGuestInfo().getName();
            this.guestEmail = reservation.getGuestInfo().getEmail();
        } else {
            // Fallback for missing guest info
            this.guestName = "Guest";
            this.guestEmail = "N/A";
        }

        // Set room information - handle unassigned rooms
        if (reservation.getRoom() != null) {
            this.roomNumber = reservation.getRoom().getRoomNumber();
            this.roomType = reservation.getRoom().getRoomType().name();
        } else {
            // For unassigned rooms, use reservation room type and placeholder room number
            this.roomNumber = "To be assigned";
            this.roomType = reservation.getRoomType() != null ? reservation.getRoomType().name() : "Unknown";
        }

        // Set total amount (required field)
        this.totalAmount = reservation.getTotalAmount();
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

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public void setStatus(NotificationStatus status) {
        this.status = status;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public String getConfirmationNumber() {
        return confirmationNumber;
    }

    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public String getChangeDetails() {
        return changeDetails;
    }

    public void setChangeDetails(String changeDetails) {
        this.changeDetails = changeDetails;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
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
}