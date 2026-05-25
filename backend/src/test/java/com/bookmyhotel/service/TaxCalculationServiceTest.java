package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.TaxBreakdown;

@ExtendWith(MockitoExtension.class)
class TaxCalculationServiceTest {

    @Mock
    private HotelPricingConfigService hotelPricingConfigService;

    @InjectMocks
    private TaxCalculationService taxCalculationService;

    @Test
    void calculateTaxesShouldReturnZerosForNullOrNonPositiveSubtotal() {
        TaxBreakdown nullSubtotal = taxCalculationService.calculateTaxes(1L, null);
        TaxBreakdown zeroSubtotal = taxCalculationService.calculateTaxes(1L, BigDecimal.ZERO);

        assertEquals(BigDecimal.ZERO, nullSubtotal.getVatAmount());
        assertEquals(BigDecimal.ZERO, nullSubtotal.getServiceTaxAmount());
        assertEquals(BigDecimal.ZERO, nullSubtotal.getCityTaxAmount());
        assertEquals(BigDecimal.ZERO, zeroSubtotal.getTotalTax());
        verifyNoInteractions(hotelPricingConfigService);
    }

    @Test
    void calculateTaxesShouldUseConfiguredRates() {
        when(hotelPricingConfigService.getVatRate(1L)).thenReturn(new BigDecimal("0.15"));
        when(hotelPricingConfigService.getServiceTaxRate(1L)).thenReturn(new BigDecimal("0.05"));
        when(hotelPricingConfigService.getCityTaxRate(1L)).thenReturn(new BigDecimal("0.02"));

        TaxBreakdown breakdown = taxCalculationService.calculateTaxes(1L, new BigDecimal("100.00"));

        assertEquals(new BigDecimal("15.00"), breakdown.getVatAmount());
        assertEquals(new BigDecimal("5.00"), breakdown.getServiceTaxAmount());
        assertEquals(new BigDecimal("2.00"), breakdown.getCityTaxAmount());
        assertEquals(new BigDecimal("22.00"), breakdown.getTotalTax());
    }

    @Test
    void calculateTaxesShouldFallBackToDefaultRatesWhenConfigLookupFails() {
        when(hotelPricingConfigService.getVatRate(1L)).thenThrow(new RuntimeException("db error"));

        TaxBreakdown breakdown = taxCalculationService.calculateTaxes(1L, new BigDecimal("200.00"));

        assertEquals(new BigDecimal("30.00"), breakdown.getVatAmount());
        assertEquals(new BigDecimal("10.00"), breakdown.getServiceTaxAmount());
        assertEquals(BigDecimal.ZERO.setScale(2), breakdown.getCityTaxAmount().setScale(2));
        assertEquals(new BigDecimal("40.00"), breakdown.getTotalTax());
    }

    @Test
    void calculateTaxesWithRatesShouldUseDefaultsForNullRatesAndRoundHalfUp() {
        TaxBreakdown breakdown = taxCalculationService.calculateTaxesWithRates(
                new BigDecimal("99.999"),
                null,
                new BigDecimal("0.055"),
                null);

        assertEquals(new BigDecimal("15.00"), breakdown.getVatAmount());
        assertEquals(new BigDecimal("5.50"), breakdown.getServiceTaxAmount());
        assertEquals(new BigDecimal("0.00"), breakdown.getCityTaxAmount());
    }

    @Test
    void calculateTotalWithTaxesShouldAddRoundedTaxAmounts() {
        when(hotelPricingConfigService.getVatRate(1L)).thenReturn(new BigDecimal("0.15"));
        when(hotelPricingConfigService.getServiceTaxRate(1L)).thenReturn(new BigDecimal("0.05"));
        when(hotelPricingConfigService.getCityTaxRate(1L)).thenReturn(new BigDecimal("0.02"));

        BigDecimal total = taxCalculationService.calculateTotalWithTaxes(1L, new BigDecimal("250.00"));

        assertEquals(new BigDecimal("305.00"), total);
    }

    @Test
    void getTotalTaxRateShouldReturnConfiguredOrDefaultCombinedRate() {
        when(hotelPricingConfigService.getVatRate(1L)).thenReturn(new BigDecimal("0.15"));
        when(hotelPricingConfigService.getServiceTaxRate(1L)).thenReturn(new BigDecimal("0.05"));
        when(hotelPricingConfigService.getCityTaxRate(1L)).thenReturn(new BigDecimal("0.02"));
        when(hotelPricingConfigService.getVatRate(2L)).thenThrow(new RuntimeException("db error"));

        assertEquals(new BigDecimal("0.22"), taxCalculationService.getTotalTaxRate(1L));
        assertEquals(new BigDecimal("0.20"), taxCalculationService.getTotalTaxRate(2L));
    }

    @Test
    void validatePriceShouldRejectNullAndNonPositiveAmounts() {
        IllegalArgumentException nullException = assertThrows(IllegalArgumentException.class,
                () -> taxCalculationService.validatePrice(null, "booking"));
        IllegalArgumentException negativeException = assertThrows(IllegalArgumentException.class,
                () -> taxCalculationService.validatePrice(new BigDecimal("-1.00"), "checkout"));

        assertEquals("Price cannot be null in booking", nullException.getMessage());
        assertEquals("Price must be positive in checkout: -1.00", negativeException.getMessage());
        assertDoesNotThrow(() -> taxCalculationService.validatePrice(new BigDecimal("10.999"), "quote"));
    }

    @Test
    void roundPriceShouldReturnZeroForNullAndHalfUpForValues() {
        assertEquals(BigDecimal.ZERO, taxCalculationService.roundPrice(null));
        assertEquals(new BigDecimal("12.35"), taxCalculationService.roundPrice(new BigDecimal("12.345")));
    }
}