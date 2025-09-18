package com.bookmyhotel.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity for tracking booking modification history and audit trail
 */
@Entity
@Table(name = "booking_history")
public class BookingHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;
    
    @Column(name = "action_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private BookingActionType actionType;
    
    @Column(name = "old_values", length = 2000)
    private String oldValues; // JSON string of old values
    
    @Column(name = "new_values", length = 2000) 
    private String newValues; // JSON string of new values
    
    @Column(name = "changed_by", length = 100)
    private String changedBy; // guest email or admin username
    
    @Column(name = "change_reason", length = 1000)
    private String changeReason;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public BookingHistory() {}
    
    public BookingHistory(Reservation reservation, BookingActionType actionType, String changedBy) {
        this.reservation = reservation;
        this.actionType = actionType;
        this.changedBy = changedBy;
        this.createdAt = LocalDateTime.now();
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
    
    public BookingActionType getActionType() {
        return actionType;
    }
    
    public void setActionType(BookingActionType actionType) {
        this.actionType = actionType;
    }
    
    public String getOldValues() {
        return oldValues;
    }
    
    public void setOldValues(String oldValues) {
        this.oldValues = oldValues;
    }
    
    public String getNewValues() {
        return newValues;
    }
    
    public void setNewValues(String newValues) {
        this.newValues = newValues;
    }
    
    public String getChangedBy() {
        return changedBy;
    }
    
    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }
    
    public String getChangeReason() {
        return changeReason;
    }
    
    public void setChangeReason(String changeReason) {
        this.changeReason = changeReason;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
