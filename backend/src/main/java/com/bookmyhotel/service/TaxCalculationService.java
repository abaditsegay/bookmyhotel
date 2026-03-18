package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.TaxBreakdown;

/**
 * Centralized service for all tax calculations
 * This ensures consistent tax computation across booking, checkout, and shop
 * services
 * 
 * Tax calculation rules:
 * - VAT (Value Added Tax): Typically 15% in Ethiopia, configurable per hotel
 * - Service Tax: Typically 5%, configurable per hotel
 * - City Tax: Configurable per hotel (default 0%)
 * - All amounts rounded to 2 decimal places using HALF_UP rounding
 * - Taxes are ALWAYS calculated on the subtotal (base amount)
 * 
 * Usage:
 * - Booking creation: Do NOT add taxes to totalAmount (subtotal only)
 * - Checkout receipt: Use this service to calculate taxes for display
 * - Shop orders: Use this service for consistent tax calculation
 * - Financial reports: Use this service to ensure accurate tax totals
 */
@Service
@Transactional(readOnly = true, timeout = 10)
public class TaxCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(TaxCalculationService.class);

    // Pricing constants
    public static final int PRICE_SCALE = 2;
    public static final RoundingMode PRICE_ROUNDING = RoundingMode.HALF_UP;

    // Default tax rates (fallback if hotel config not available)
    public static final BigDecimal DEFAULT_VAT_RATE = new BigDecimal("0.15");
    public static final BigDecimal DEFAULT_SERVICE_TAX_RATE = new BigDecimal("0.05");
    public static final BigDecimal DEFAULT_CITY_TAX_RATE = BigDecimal.ZERO;

    @Autowired
    private HotelPricingConfigService hotelPricingConfigService;

    /**
     * Calculate taxes for a given subtotal amount
     * 
     * @param hotelId  The hotel ID to fetch tax configuration
     * @param subtotal The base amount (before taxes)
     * @return TaxBreakdown with VAT, service tax, and total
     */
    public TaxBreakdown calculateTaxes(Long hotelId, BigDecimal subtotal) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Invalid subtotal for tax calculation: {}", subtotal);
            return new TaxBreakdown(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        try {
            // Get tax rates from hotel configuration
            BigDecimal vatRate = hotelPricingConfigService.getVatRate(hotelId);
            BigDecimal serviceTaxRate = hotelPricingConfigService.getServiceTaxRate(hotelId);
            BigDecimal cityTaxRate = hotelPricingConfigService.getCityTaxRate(hotelId);

            return calculateTaxesWithRates(subtotal, vatRate, serviceTaxRate, cityTaxRate);

        } catch (Exception e) {
            logger.error("Error fetching tax rates for hotel {}, using defaults: {}", hotelId, e.getMessage());
            return calculateTaxesWithRates(subtotal, DEFAULT_VAT_RATE, DEFAULT_SERVICE_TAX_RATE, DEFAULT_CITY_TAX_RATE);
        }
    }

    /**
     * Calculate taxes with explicit rates (useful for testing or custom
     * calculations)
     * 
     * @param subtotal       The base amount (before taxes)
     * @param vatRate        VAT rate as decimal (e.g., 0.15 for 15%)
     * @param serviceTaxRate Service tax rate as decimal (e.g., 0.05 for 5%)
     * @return TaxBreakdown with VAT, service tax, and total
     */
    public TaxBreakdown calculateTaxesWithRates(BigDecimal subtotal, BigDecimal vatRate, BigDecimal serviceTaxRate) {
        return calculateTaxesWithRates(subtotal, vatRate, serviceTaxRate, DEFAULT_CITY_TAX_RATE);
    }

    /**
     * Calculate taxes with explicit rates (useful for testing or custom
     * calculations)
     * 
     * @param subtotal       The base amount (before taxes)
     * @param vatRate        VAT rate as decimal (e.g., 0.15 for 15%)
     * @param serviceTaxRate Service tax rate as decimal (e.g., 0.05 for 5%)
     * @param cityTaxRate    City tax rate as decimal (e.g., 0.02 for 2%)
     * @return TaxBreakdown with VAT, service tax, city tax, and total
     */
    public TaxBreakdown calculateTaxesWithRates(BigDecimal subtotal, BigDecimal vatRate, BigDecimal serviceTaxRate,
            BigDecimal cityTaxRate) {
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return new TaxBreakdown(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        // Ensure rates are non-null
        if (vatRate == null) {
            vatRate = DEFAULT_VAT_RATE;
        }
        if (serviceTaxRate == null) {
            serviceTaxRate = DEFAULT_SERVICE_TAX_RATE;
        }
        if (cityTaxRate == null) {
            cityTaxRate = DEFAULT_CITY_TAX_RATE;
        }

        // Calculate individual tax amounts
        BigDecimal vatAmount = subtotal.multiply(vatRate)
                .setScale(PRICE_SCALE, PRICE_ROUNDING);

        BigDecimal serviceTaxAmount = subtotal.multiply(serviceTaxRate)
                .setScale(PRICE_SCALE, PRICE_ROUNDING);
        BigDecimal cityTaxAmount = subtotal.multiply(cityTaxRate)
                .setScale(PRICE_SCALE, PRICE_ROUNDING);

        return new TaxBreakdown(vatAmount, serviceTaxAmount, cityTaxAmount);
    }

    /**
     * Calculate total amount including taxes
     * 
     * @param hotelId  The hotel ID to fetch tax configuration
     * @param subtotal The base amount (before taxes)
     * @return Total amount (subtotal + VAT + service tax)
     */
    public BigDecimal calculateTotalWithTaxes(Long hotelId, BigDecimal subtotal) {
        TaxBreakdown taxes = calculateTaxes(hotelId, subtotal);
        return subtotal.add(taxes.getTotalTax())
                .setScale(PRICE_SCALE, PRICE_ROUNDING);
    }

    /**
     * Calculate total tax rate for a hotel (VAT + Service Tax)
     * 
     * @param hotelId The hotel ID
     * @return Combined tax rate as decimal
     */
    public BigDecimal getTotalTaxRate(Long hotelId) {
        try {
            BigDecimal vatRate = hotelPricingConfigService.getVatRate(hotelId);
            BigDecimal serviceTaxRate = hotelPricingConfigService.getServiceTaxRate(hotelId);
            BigDecimal cityTaxRate = hotelPricingConfigService.getCityTaxRate(hotelId);
            return vatRate.add(serviceTaxRate).add(cityTaxRate);
        } catch (Exception e) {
            logger.error("Error fetching tax rates for hotel {}: {}", hotelId, e.getMessage());
            return DEFAULT_VAT_RATE.add(DEFAULT_SERVICE_TAX_RATE).add(DEFAULT_CITY_TAX_RATE);
        }
    }

    /**
     * Validate that a price is positive and properly scaled
     * 
     * @param amount  The amount to validate
     * @param context Description of where this price is used (for logging)
     * @throws IllegalArgumentException if price is invalid
     */
    public void validatePrice(BigDecimal amount, String context) {
        if (amount == null) {
            throw new IllegalArgumentException("Price cannot be null in " + context);
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be positive in " + context + ": " + amount);
        }
        if (amount.scale() > PRICE_SCALE) {
            logger.warn("Price in {} has excessive decimal places: {}. Should be scaled to {}.",
                    context, amount, PRICE_SCALE);
        }
    }

    /**
     * Round amount to standard price scale
     * 
     * @param amount The amount to round
     * @return Rounded amount
     */
    public BigDecimal roundPrice(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        return amount.setScale(PRICE_SCALE, PRICE_ROUNDING);
    }
}
