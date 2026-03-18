package com.bookmyhotel.dto;

import java.math.BigDecimal;

/**
 * Tax breakdown for receipts and financial calculations
 * Provides detailed breakdown of VAT and service tax
 */
public class TaxBreakdown {

    private BigDecimal vatAmount;
    private BigDecimal serviceTaxAmount;
    private BigDecimal cityTaxAmount;

    public TaxBreakdown() {
        this.vatAmount = BigDecimal.ZERO;
        this.serviceTaxAmount = BigDecimal.ZERO;
        this.cityTaxAmount = BigDecimal.ZERO;
    }

    public TaxBreakdown(BigDecimal vatAmount, BigDecimal serviceTaxAmount) {
        this.vatAmount = vatAmount != null ? vatAmount : BigDecimal.ZERO;
        this.serviceTaxAmount = serviceTaxAmount != null ? serviceTaxAmount : BigDecimal.ZERO;
        this.cityTaxAmount = BigDecimal.ZERO;
    }

    public TaxBreakdown(BigDecimal vatAmount, BigDecimal serviceTaxAmount, BigDecimal cityTaxAmount) {
        this.vatAmount = vatAmount != null ? vatAmount : BigDecimal.ZERO;
        this.serviceTaxAmount = serviceTaxAmount != null ? serviceTaxAmount : BigDecimal.ZERO;
        this.cityTaxAmount = cityTaxAmount != null ? cityTaxAmount : BigDecimal.ZERO;
    }

    /**
     * Get total tax amount (VAT + Service Tax)
     */
    public BigDecimal getTotalTax() {
        return vatAmount.add(serviceTaxAmount).add(cityTaxAmount);
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

    public BigDecimal getCityTaxAmount() {
        return cityTaxAmount;
    }

    public void setCityTaxAmount(BigDecimal cityTaxAmount) {
        this.cityTaxAmount = cityTaxAmount;
    }
}
