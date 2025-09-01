package com.bookmyhotel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.bookmyhotel.entity.ReservationStatus;

/**
 * Consolidated receipt response DTO for checkout
 */
public class ConsolidatedReceiptResponse {

    // Guest Information
    private String guestName;
    private String guestEmail;
    private String guestPhone;

    // Reservation Details
    private Long reservationId;
    private String confirmationNumber;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private LocalDateTime actualCheckInTime;
    private LocalDateTime actualCheckOutTime;
    private ReservationStatus status;
    private Integer numberOfNights;
    private Integer numberOfGuests;

    // Hotel Information
    private String hotelName;
    private String hotelAddress;
    private String hotelPhone;
    private String hotelEmail;

    // Room Information
    private String roomNumber;
    private String roomType;

    // Main Charges
    private BigDecimal roomChargePerNight;
    private BigDecimal totalRoomCharges;

    // Additional Charges
    private List<ReceiptChargeItem> additionalCharges;
    private BigDecimal totalAdditionalCharges;

    // Taxes and Fees
    private List<ReceiptChargeItem> taxesAndFees;
    private BigDecimal totalTaxesAndFees;

    // Payments
    private List<ReceiptPaymentItem> payments;
    private BigDecimal totalPayments;

    // Summary
    private BigDecimal subtotal;
    private BigDecimal grandTotal;
    private BigDecimal balanceDue;

    // Receipt Metadata
    private LocalDateTime generatedAt;
    private String receiptNumber;
    private String generatedBy;

    // Nested Classes for Charge and Payment Items
    public static class ReceiptChargeItem {
        private Long chargeId;
        private String description;
        private BigDecimal amount;
        private Integer quantity;
        private String chargeType;
        private LocalDateTime chargeDate;
        private String notes;

        // Constructors
        public ReceiptChargeItem() {
        }

        public ReceiptChargeItem(String description, BigDecimal amount, String chargeType) {
            this.description = description;
            this.amount = amount;
            this.chargeType = chargeType;
            this.quantity = 1; // Default quantity for backward compatibility
        }

        // Getters and Setters
        public Long getChargeId() {
            return chargeId;
        }

        public void setChargeId(Long chargeId) {
            this.chargeId = chargeId;
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

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getChargeType() {
            return chargeType;
        }

        public void setChargeType(String chargeType) {
            this.chargeType = chargeType;
        }

        public LocalDateTime getChargeDate() {
            return chargeDate;
        }

        public void setChargeDate(LocalDateTime chargeDate) {
            this.chargeDate = chargeDate;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class ReceiptPaymentItem {
        private String paymentMethod;
        private BigDecimal amount;
        private LocalDateTime paymentDate;
        private String paymentReference;
        private String description;

        // Constructors
        public ReceiptPaymentItem() {
        }

        public ReceiptPaymentItem(String paymentMethod, BigDecimal amount, String description) {
            this.paymentMethod = paymentMethod;
            this.amount = amount;
            this.description = description;
        }

        // Getters and Setters
        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public LocalDateTime getPaymentDate() {
            return paymentDate;
        }

        public void setPaymentDate(LocalDateTime paymentDate) {
            this.paymentDate = paymentDate;
        }

        public String getPaymentReference() {
            return paymentReference;
        }

        public void setPaymentReference(String paymentReference) {
            this.paymentReference = paymentReference;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    // Main Class Getters and Setters
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

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
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

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public Integer getNumberOfNights() {
        return numberOfNights;
    }

    public void setNumberOfNights(Integer numberOfNights) {
        this.numberOfNights = numberOfNights;
    }

    public Integer getNumberOfGuests() {
        return numberOfGuests;
    }

    public void setNumberOfGuests(Integer numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public String getHotelAddress() {
        return hotelAddress;
    }

    public void setHotelAddress(String hotelAddress) {
        this.hotelAddress = hotelAddress;
    }

    public String getHotelPhone() {
        return hotelPhone;
    }

    public void setHotelPhone(String hotelPhone) {
        this.hotelPhone = hotelPhone;
    }

    public String getHotelEmail() {
        return hotelEmail;
    }

    public void setHotelEmail(String hotelEmail) {
        this.hotelEmail = hotelEmail;
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

    public BigDecimal getRoomChargePerNight() {
        return roomChargePerNight;
    }

    public void setRoomChargePerNight(BigDecimal roomChargePerNight) {
        this.roomChargePerNight = roomChargePerNight;
    }

    public BigDecimal getTotalRoomCharges() {
        return totalRoomCharges;
    }

    public void setTotalRoomCharges(BigDecimal totalRoomCharges) {
        this.totalRoomCharges = totalRoomCharges;
    }

    public List<ReceiptChargeItem> getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(List<ReceiptChargeItem> additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getTotalAdditionalCharges() {
        return totalAdditionalCharges;
    }

    public void setTotalAdditionalCharges(BigDecimal totalAdditionalCharges) {
        this.totalAdditionalCharges = totalAdditionalCharges;
    }

    public List<ReceiptChargeItem> getTaxesAndFees() {
        return taxesAndFees;
    }

    public void setTaxesAndFees(List<ReceiptChargeItem> taxesAndFees) {
        this.taxesAndFees = taxesAndFees;
    }

    public BigDecimal getTotalTaxesAndFees() {
        return totalTaxesAndFees;
    }

    public void setTotalTaxesAndFees(BigDecimal totalTaxesAndFees) {
        this.totalTaxesAndFees = totalTaxesAndFees;
    }

    public List<ReceiptPaymentItem> getPayments() {
        return payments;
    }

    public void setPayments(List<ReceiptPaymentItem> payments) {
        this.payments = payments;
    }

    public BigDecimal getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(BigDecimal totalPayments) {
        this.totalPayments = totalPayments;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public void setBalanceDue(BigDecimal balanceDue) {
        this.balanceDue = balanceDue;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public void setReceiptNumber(String receiptNumber) {
        this.receiptNumber = receiptNumber;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }
}
