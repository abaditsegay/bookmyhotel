package com.bookmyhotel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for daily financial reconciliation data
 */
public class DailyFinancialReconciliationDto {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reconciliationDate;

    private Long hotelId;
    private String hotelName;

    // Payment Summary
    private BigDecimal totalRevenue;
    private BigDecimal totalCashPayments;
    private BigDecimal totalCardPayments;
    private BigDecimal totalOnlinePayments;
    private BigDecimal totalMobilePayments;
    private BigDecimal totalRefunds;
    private BigDecimal netRevenue;

    // Outstanding Balances
    private BigDecimal totalOutstandingBalance;
    private int reservationsWithOutstandingBalance;

    // Tax Information
    private BigDecimal totalTaxCollected;
    private BigDecimal expectedTax;
    private BigDecimal taxDiscrepancy;

    // Transaction Counts
    private int totalTransactions;
    private int successfulTransactions;
    private int failedTransactions;
    private int refundTransactions;

    // Discrepancies
    private List<PaymentDiscrepancyDto> discrepancies;
    private boolean hasDiscrepancies;

    // Reconciliation Status
    private String reconciliationStatus;
    private String reconciledBy;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime reconciledAt;

    private String notes;

    // Constructors
    public DailyFinancialReconciliationDto() {
    }

    public DailyFinancialReconciliationDto(LocalDate reconciliationDate, Long hotelId) {
        this.reconciliationDate = reconciliationDate;
        this.hotelId = hotelId;
    }

    // Getters and Setters
    public LocalDate getReconciliationDate() {
        return reconciliationDate;
    }

    public void setReconciliationDate(LocalDate reconciliationDate) {
        this.reconciliationDate = reconciliationDate;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getTotalCashPayments() {
        return totalCashPayments;
    }

    public void setTotalCashPayments(BigDecimal totalCashPayments) {
        this.totalCashPayments = totalCashPayments;
    }

    public BigDecimal getTotalCardPayments() {
        return totalCardPayments;
    }

    public void setTotalCardPayments(BigDecimal totalCardPayments) {
        this.totalCardPayments = totalCardPayments;
    }

    public BigDecimal getTotalOnlinePayments() {
        return totalOnlinePayments;
    }

    public void setTotalOnlinePayments(BigDecimal totalOnlinePayments) {
        this.totalOnlinePayments = totalOnlinePayments;
    }

    public BigDecimal getTotalMobilePayments() {
        return totalMobilePayments;
    }

    public void setTotalMobilePayments(BigDecimal totalMobilePayments) {
        this.totalMobilePayments = totalMobilePayments;
    }

    public BigDecimal getTotalRefunds() {
        return totalRefunds;
    }

    public void setTotalRefunds(BigDecimal totalRefunds) {
        this.totalRefunds = totalRefunds;
    }

    public BigDecimal getNetRevenue() {
        return netRevenue;
    }

    public void setNetRevenue(BigDecimal netRevenue) {
        this.netRevenue = netRevenue;
    }

    public BigDecimal getTotalOutstandingBalance() {
        return totalOutstandingBalance;
    }

    public void setTotalOutstandingBalance(BigDecimal totalOutstandingBalance) {
        this.totalOutstandingBalance = totalOutstandingBalance;
    }

    public int getReservationsWithOutstandingBalance() {
        return reservationsWithOutstandingBalance;
    }

    public void setReservationsWithOutstandingBalance(int reservationsWithOutstandingBalance) {
        this.reservationsWithOutstandingBalance = reservationsWithOutstandingBalance;
    }

    public BigDecimal getTotalTaxCollected() {
        return totalTaxCollected;
    }

    public void setTotalTaxCollected(BigDecimal totalTaxCollected) {
        this.totalTaxCollected = totalTaxCollected;
    }

    public BigDecimal getExpectedTax() {
        return expectedTax;
    }

    public void setExpectedTax(BigDecimal expectedTax) {
        this.expectedTax = expectedTax;
    }

    public BigDecimal getTaxDiscrepancy() {
        return taxDiscrepancy;
    }

    public void setTaxDiscrepancy(BigDecimal taxDiscrepancy) {
        this.taxDiscrepancy = taxDiscrepancy;
    }

    public int getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(int totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public int getSuccessfulTransactions() {
        return successfulTransactions;
    }

    public void setSuccessfulTransactions(int successfulTransactions) {
        this.successfulTransactions = successfulTransactions;
    }

    public int getFailedTransactions() {
        return failedTransactions;
    }

    public void setFailedTransactions(int failedTransactions) {
        this.failedTransactions = failedTransactions;
    }

    public int getRefundTransactions() {
        return refundTransactions;
    }

    public void setRefundTransactions(int refundTransactions) {
        this.refundTransactions = refundTransactions;
    }

    public List<PaymentDiscrepancyDto> getDiscrepancies() {
        return discrepancies;
    }

    public void setDiscrepancies(List<PaymentDiscrepancyDto> discrepancies) {
        this.discrepancies = discrepancies;
    }

    public boolean isHasDiscrepancies() {
        return hasDiscrepancies;
    }

    public void setHasDiscrepancies(boolean hasDiscrepancies) {
        this.hasDiscrepancies = hasDiscrepancies;
    }

    public String getReconciliationStatus() {
        return reconciliationStatus;
    }

    public void setReconciliationStatus(String reconciliationStatus) {
        this.reconciliationStatus = reconciliationStatus;
    }

    public String getReconciledBy() {
        return reconciledBy;
    }

    public void setReconciledBy(String reconciledBy) {
        this.reconciledBy = reconciledBy;
    }

    public LocalDateTime getReconciledAt() {
        return reconciledAt;
    }

    public void setReconciledAt(LocalDateTime reconciledAt) {
        this.reconciledAt = reconciledAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}