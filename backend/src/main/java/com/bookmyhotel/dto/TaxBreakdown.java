package com.bookmyhotel.dto;

import java.math.BigDecimal;

/**
 * Tax breakdown for receipts and financial calculations
 * Provides detailed breakdown of VAT and service tax
 */
public class TaxBreakdown {

    private BigDecimal vatAmount;
    private BigDecimal serviceTaxAmount;

    public TaxBreakdown() {
        this.vatAmount = BigDecimal.ZERO;
        this.serviceTaxAmount = BigDecimal.ZERO;
    }

    public TaxBreakdown(BigDecimal vatAmount, BigDecimal serviceTaxAmount) {
        this.vatAmount = vatAmount != null ? vatAmount : BigDecimal.ZERO;
        this.serviceTaxAmount = serviceTaxAmount != null ? serviceTaxAmount : BigDecimal.ZERO;
    }

    /**
     * Get total tax amount (VAT + Service Tax)
     */
    public BigDecimal getTotalTax() {
        return vatAmount.add(serviceTaxAmount);
    }

    // Getters and setters
    public BigDecimal getVatAmount() {
        return vatAmount;
    }

    public void setVatAmount(BigDecimal vatAmount) {
        this.vatAmount = vatAmount;
    }

    public BigDecimal getServiceTaxAmount() {
        return serviceTaxAmount;
    }

    public void setServiceTaxAmount(BigDecimal serviceTaxAmount) {
        this.serviceTaxAmount = serviceTaxAmount;
    }
}
