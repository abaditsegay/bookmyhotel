package com.bookmyhotel.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
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
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Reservation entity
 */
@Entity
@Table(name = "reservations",
       indexes = {
           @Index(name = "idx_reservation_tenant", columnList = "tenant_id"),
           @Index(name = "idx_reservation_room", columnList = "room_id"),
           @Index(name = "idx_reservation_guest", columnList = "guest_id"),
           @Index(name = "idx_reservation_dates", columnList = "check_in_date, check_out_date"),
           @Index(name = "idx_reservation_status", columnList = "status")
       })
public class Reservation extends TenantEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Check-in date is required")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;
    
    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;
    
    @Column(name = "special_requests", length = 500)
    private String specialRequests;
    
    @Column(name = "payment_intent_id", length = 100)
    private String paymentIntentId;
    
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;
    
    @Column(name = "confirmation_number", length = 20, unique = true)
    private String confirmationNumber;

    @Column(name = "actual_check_in_time")
    private LocalDateTime actualCheckInTime;

    @Column(name = "actual_check_out_time")
    private LocalDateTime actualCheckOutTime;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "promotional_code", length = 50)
    private String promotionalCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    // Optional: Only set for registered users, null for anonymous guests
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = true)
    private User guest;

    // Guest information for all bookings (both registered and anonymous)
    @Valid
    @Embedded
    private GuestInfo guestInfo;
    
    // Constructors
    public Reservation() {}
    
    public Reservation(LocalDate checkInDate, LocalDate checkOutDate, BigDecimal totalAmount) {
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalAmount = totalAmount;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public ReservationStatus getStatus() {
        return status;
    }
    
    public void setStatus(ReservationStatus status) {
        this.status = status;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public String getPaymentIntentId() {
        return paymentIntentId;
    }
    
    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public Room getRoom() {
        return room;
    }
    
    public void setRoom(Room room) {
        this.room = room;
    }
    
    public User getGuest() {
        return guest;
    }
    
    public void setGuest(User guest) {
        this.guest = guest;
    }
    
    public String getConfirmationNumber() {
        return confirmationNumber;
    }
    
    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }
    
    public LocalDateTime getActualCheckInTime() {
        return actualCheckInTime;
    }
    
    public void setActualCheckInTime(LocalDateTime actualCheckInTime) {
        this.actualCheckInTime = actualCheckInTime;
    }
    
    public LocalDateTime getActualCheckOutTime() {
        return actualCheckOutTime;
    }
    
    public void setActualCheckOutTime(LocalDateTime actualCheckOutTime) {
        this.actualCheckOutTime = actualCheckOutTime;
    }
    
    public String getCancellationReason() {
        return cancellationReason;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }
    
    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
    
    public String getPromotionalCode() {
        return promotionalCode;
    }
    
    public void setPromotionalCode(String promotionalCode) {
        this.promotionalCode = promotionalCode;
    }
    
    public GuestInfo getGuestInfo() {
        return guestInfo;
    }
    
    public void setGuestInfo(GuestInfo guestInfo) {
        this.guestInfo = guestInfo;
    }
}
