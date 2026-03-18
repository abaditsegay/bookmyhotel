package com.bookmyhotel.entity;

import com.bookmyhotel.enums.EventType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity for tracking process monitoring events (check-ins, check-outs, staff
 * activities)
 */
@Entity
@Table(name = "process_monitoring_events", indexes = {
        @Index(name = "idx_pme_hotel_event_time", columnList = "hotel_id, event_time DESC"),
        @Index(name = "idx_pme_event_type", columnList = "event_type"),
        @Index(name = "idx_pme_reservation", columnList = "reservation_id"),
        @Index(name = "idx_pme_staff_user", columnList = "staff_user_id"),
        @Index(name = "idx_pme_exception", columnList = "is_exception"),
        @Index(name = "idx_pme_tenant", columnList = "tenant_id")
})
public class ProcessMonitoringEvent extends HotelScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "confirmation_number", length = 50)
    private String confirmationNumber;

    @Column(name = "guest_name", length = 200)
    private String guestName;

    @Column(name = "guest_email", length = 200)
    private String guestEmail;

    @Column(name = "room_number", length = 20)
    private String roomNumber;

    @Column(name = "room_type", length = 50)
    private String roomType;

    @Column(name = "staff_user_id")
    private Long staffUserId;

    @Column(name = "staff_name", length = 200)
    private String staffName;

    @Column(name = "staff_email", length = 200)
    private String staffEmail;

    @Column(name = "staff_role", length = 50)
    private String staffRole;

    @CreationTimestamp
    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;

    @Column(name = "event_details", columnDefinition = "TEXT")
    private String eventDetails;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "is_exception", nullable = false)
    private boolean isException = false;

    @Column(name = "exception_reason", columnDefinition = "TEXT")
    private String exceptionReason;

    // Constructors
    public ProcessMonitoringEvent() {
    }

    public ProcessMonitoringEvent(EventType eventType, Long reservationId, String guestName,
            String staffName, String staffEmail) {
        this.eventType = eventType;
        this.reservationId = reservationId;
        this.guestName = guestName;
        this.staffName = staffName;
        this.staffEmail = staffEmail;
        this.isException = eventType.isException();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
        this.isException = eventType != null && eventType.isException();
    }

    public Long getReservationId() {
        return reservationId;
    }

    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }

    public String getConfirmationNumber() {
        return confirmationNumber;
    }

    public void setConfirmationNumber(String confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
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

    public Long getStaffUserId() {
        return staffUserId;
    }

    public void setStaffUserId(Long staffUserId) {
        this.staffUserId = staffUserId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getStaffEmail() {
        return staffEmail;
    }

    public void setStaffEmail(String staffEmail) {
        this.staffEmail = staffEmail;
    }

    public String getStaffRole() {
        return staffRole;
    }

    public void setStaffRole(String staffRole) {
        this.staffRole = staffRole;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }

    public String getEventDetails() {
        return eventDetails;
    }

    public void setEventDetails(String eventDetails) {
        this.eventDetails = eventDetails;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public boolean isException() {
        return isException;
    }

    public void setException(boolean exception) {
        isException = exception;
    }

    public String getExceptionReason() {
        return exceptionReason;
    }

    public void setExceptionReason(String exceptionReason) {
        this.exceptionReason = exceptionReason;
    }
}