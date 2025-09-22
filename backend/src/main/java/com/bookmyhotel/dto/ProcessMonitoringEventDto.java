package com.bookmyhotel.dto;

import com.bookmyhotel.enums.EventType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO for process monitoring events (check-ins, check-outs, staff activities)
 */
public class ProcessMonitoringEventDto {
    private Long id;
    private Long hotelId;
    private String tenantId;
    private EventType eventType;
    private Long reservationId;
    private String confirmationNumber;
    private String guestName;
    private String guestEmail;
    private String roomNumber;
    private String roomType;
    private Long staffUserId;
    private String staffName;
    private String staffEmail;
    private String staffRole;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime eventTime;

    private String eventDetails;
    private String ipAddress;
    private String userAgent;
    private String deviceInfo;
    private boolean isException;
    private String exceptionReason;

    // Constructors
    public ProcessMonitoringEventDto() {
    }

    public ProcessMonitoringEventDto(EventType eventType, Long reservationId, String guestName,
            String staffName, LocalDateTime eventTime) {
        this.eventType = eventType;
        this.reservationId = reservationId;
        this.guestName = guestName;
        this.staffName = staffName;
        this.eventTime = eventTime;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
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

    // Additional getter/setter methods for compatibility
    public String getDetails() {
        return eventDetails;
    }

    public void setDetails(String details) {
        this.eventDetails = details;
    }

    public Long getStaffId() {
        return staffUserId;
    }

    public void setStaffId(Long staffId) {
        this.staffUserId = staffId;
    }

    public LocalDateTime getTimestamp() {
        return eventTime;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.eventTime = timestamp;
    }

    public String getExceptionType() {
        return exceptionReason;
    }

    public void setExceptionType(String exceptionType) {
        this.exceptionReason = exceptionType;
    }

    public String getExceptionMessage() {
        return exceptionReason;
    }

    public void setExceptionMessage(String exceptionMessage) {
        this.exceptionReason = exceptionMessage;
    }

    // These fields don't exist in entity but may be used by legacy code
    private Long guestId;
    private String sessionId;
    private String description;

    public Long getGuestId() {
        return guestId;
    }

    public void setGuestId(Long guestId) {
        this.guestId = guestId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}