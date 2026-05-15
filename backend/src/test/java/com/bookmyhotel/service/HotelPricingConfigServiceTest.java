package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.bookmyhotel.audit.AuditTaxonomy;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelPricingConfig;
import com.bookmyhotel.entity.HotelPricingConfig.PricingStrategy;
import com.bookmyhotel.repository.HotelPricingConfigRepository;
import com.bookmyhotel.repository.HotelRepository;

@ExtendWith(MockitoExtension.class)
class HotelPricingConfigServiceTest {

    @Mock
    private HotelPricingConfigRepository pricingConfigRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private HotelPricingConfigService hotelPricingConfigService;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken("pricing-admin@example.com", null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createDefaultConfigurationShouldSetDefaultsAndAudit() {
        Hotel hotel = hotel(1L);
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(pricingConfigRepository.save(any(HotelPricingConfig.class))).thenAnswer(invocation -> {
            HotelPricingConfig config = invocation.getArgument(0);
            config.setId(100L);
            return config;
        });

        HotelPricingConfig result = hotelPricingConfigService.createDefaultConfiguration(1L);

        assertEquals(hotel, result.getHotel());
        assertEquals(PricingStrategy.FIXED, result.getPricingStrategy());
        assertEquals(new BigDecimal("0.15"), result.getVatRate());
        assertEquals(new BigDecimal("0.05"), result.getServiceTaxRate());
        assertEquals(new BigDecimal("1.00"), result.getWeekendMultiplier());
        assertEquals("pricing-admin@example.com", result.getCreatedBy());
        assertEquals("pricing-admin@example.com", result.getUpdatedBy());
        assertNotNull(result.getCreatedAt());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq(AuditTaxonomy.EntityType.PRICING_CONFIG),
                eq(100L),
                eq(AuditTaxonomy.Action.CREATE),
            isNull(),
            anyMap(),
            anyCollection(),
                eq("Created default pricing configuration"),
                eq(true),
                eq(AuditTaxonomy.ComplianceCategory.FINANCIAL));
    }

    @Test
    void createDefaultConfigurationShouldRejectMissingHotel() {
        when(hotelRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> hotelPricingConfigService.createDefaultConfiguration(999L));

        assertEquals("Hotel not found with ID: 999", exception.getMessage());
        verify(pricingConfigRepository, never()).save(any());
    }

    @Test
    void updateConfigurationShouldCreateWhenNoExistingConfiguration() {
        Hotel hotel = hotel(5L);
        HotelPricingConfig updates = new HotelPricingConfig();
        updates.setVatRate(new BigDecimal("0.18"));
        updates.setServiceTaxRate(new BigDecimal("0.07"));
        updates.setCityTaxRate(new BigDecimal("0.03"));
        updates.setCurrencyCode("USD");

        when(pricingConfigRepository.findByHotelId(5L)).thenReturn(Optional.empty());
        when(hotelRepository.findById(5L)).thenReturn(Optional.of(hotel));
        when(pricingConfigRepository.save(any(HotelPricingConfig.class))).thenAnswer(invocation -> {
            HotelPricingConfig config = invocation.getArgument(0);
            config.setId(100L);
            return config;
        });

        HotelPricingConfig result = hotelPricingConfigService.updateConfiguration(5L, updates);

        assertEquals(hotel, result.getHotel());
        assertEquals(5L, result.getHotelId());
        assertEquals(1, result.getVersion());
        assertEquals("pricing-admin@example.com", result.getCreatedBy());
        assertEquals("pricing-admin@example.com", result.getUpdatedBy());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq(AuditTaxonomy.EntityType.PRICING_CONFIG),
                eq(100L),
                eq(AuditTaxonomy.Action.CREATE),
            isNull(),
            anyMap(),
            anyCollection(),
                eq("Created pricing configuration"),
                eq(true),
                eq(AuditTaxonomy.ComplianceCategory.FINANCIAL));
    }

    @Test
    void updateConfigurationShouldUpdateManagedEntityAndIncrementVersion() {
        Hotel hotel = hotel(8L);
        HotelPricingConfig existing = new HotelPricingConfig();
        existing.setId(55L);
        existing.setHotel(hotel);
        existing.setVersion(3);
        existing.setVatRate(new BigDecimal("0.15"));
        existing.setServiceTaxRate(new BigDecimal("0.05"));
        existing.setCityTaxRate(new BigDecimal("0.02"));
        existing.setCurrencyCode("ETB");

        HotelPricingConfig updates = new HotelPricingConfig();
        updates.setPricingStrategy(PricingStrategy.DYNAMIC);
        updates.setVatRate(new BigDecimal("0.20"));
        updates.setServiceTaxRate(new BigDecimal("0.06"));
        updates.setCityTaxRate(new BigDecimal("0.04"));
        updates.setWeekendMultiplier(new BigDecimal("1.25"));
        updates.setHolidayMultiplier(new BigDecimal("1.50"));
        updates.setDynamicPricingEnabled(true);
        updates.setCurrencyCode("USD");
        updates.setNotes("Updated config");

        when(pricingConfigRepository.findByHotelId(8L)).thenReturn(Optional.of(existing));
        when(pricingConfigRepository.save(any(HotelPricingConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelPricingConfig result = hotelPricingConfigService.updateConfiguration(8L, updates);

        assertEquals(existing, result);
        assertEquals(4, result.getVersion());
        assertEquals(PricingStrategy.DYNAMIC, result.getPricingStrategy());
        assertEquals(new BigDecimal("0.20"), result.getVatRate());
        assertEquals(new BigDecimal("0.04"), result.getCityTaxRate());
        assertEquals(new BigDecimal("1.25"), result.getWeekendMultiplier());
        assertTrue(result.getDynamicPricingEnabled());
        assertEquals("USD", result.getCurrencyCode());
        assertEquals("pricing-admin@example.com", result.getUpdatedBy());
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq(AuditTaxonomy.EntityType.PRICING_CONFIG),
                eq(55L),
                eq(AuditTaxonomy.Action.UPDATE),
            anyMap(),
            anyMap(),
            anyCollection(),
                eq("Updated pricing configuration"),
                eq(true),
                eq(AuditTaxonomy.ComplianceCategory.FINANCIAL));
    }

    @Test
    void getTotalTaxRateShouldSumAllConfiguredTaxes() {
        HotelPricingConfig config = new HotelPricingConfig();
        config.setVatRate(new BigDecimal("0.1555"));
        config.setServiceTaxRate(new BigDecimal("0.0544"));
        config.setCityTaxRate(new BigDecimal("0.0200"));
        when(pricingConfigRepository.findByHotelId(4L)).thenReturn(Optional.of(config));

        BigDecimal totalTaxRate = hotelPricingConfigService.getTotalTaxRate(4L);

        assertEquals(new BigDecimal("0.2299"), totalTaxRate);
    }

    @Test
    void getVatRateShouldUseDefaultsWithoutPersistingWhenConfigurationMissing() {
        when(pricingConfigRepository.findByHotelId(12L)).thenReturn(Optional.empty());

        BigDecimal vatRate = hotelPricingConfigService.getVatRate(12L);

        assertEquals(new BigDecimal("0.15"), vatRate);
        verify(pricingConfigRepository, never()).save(any(HotelPricingConfig.class));
        verifyNoInteractions(hotelRepository, hotelActivityAuditService);
    }

    @Test
    void getTotalTaxRateShouldUseDefaultReadOnlyConfigurationWhenMissing() {
        when(pricingConfigRepository.findByHotelId(13L)).thenReturn(Optional.empty());

        BigDecimal totalTaxRate = hotelPricingConfigService.getTotalTaxRate(13L);

        assertEquals(new BigDecimal("0.2000"), totalTaxRate);
        verify(pricingConfigRepository, never()).save(any(HotelPricingConfig.class));
        verifyNoInteractions(hotelRepository, hotelActivityAuditService);
    }

    @Test
    void validateConfigurationShouldRejectNullAndOutOfRangeRates() {
        assertFalse(hotelPricingConfigService.validateConfiguration(null));

        HotelPricingConfig invalidVat = new HotelPricingConfig();
        invalidVat.setVatRate(new BigDecimal("1.10"));
        assertFalse(hotelPricingConfigService.validateConfiguration(invalidVat));

        HotelPricingConfig invalidService = new HotelPricingConfig();
        invalidService.setServiceTaxRate(new BigDecimal("-0.01"));
        assertFalse(hotelPricingConfigService.validateConfiguration(invalidService));

        HotelPricingConfig invalidCity = new HotelPricingConfig();
        invalidCity.setCityTaxRate(new BigDecimal("1.01"));
        assertFalse(hotelPricingConfigService.validateConfiguration(invalidCity));

        HotelPricingConfig valid = new HotelPricingConfig();
        valid.setVatRate(new BigDecimal("0.15"));
        valid.setServiceTaxRate(new BigDecimal("0.05"));
        valid.setCityTaxRate(new BigDecimal("0.02"));
        assertTrue(hotelPricingConfigService.validateConfiguration(valid));
    }

    @Test
    void deleteConfigurationShouldDeleteAndAuditWhenPresent() {
        Hotel hotel = hotel(9L);
        HotelPricingConfig config = new HotelPricingConfig();
        config.setId(200L);
        config.setHotel(hotel);
        config.setVersion(2);
        config.setVatRate(new BigDecimal("0.15"));
        when(pricingConfigRepository.findById(200L)).thenReturn(Optional.of(config));

        boolean deleted = hotelPricingConfigService.deleteConfiguration(200L);

        assertTrue(deleted);
        verify(pricingConfigRepository).delete(config);
        verify(hotelActivityAuditService).logActivity(
                eq(hotel),
                eq(AuditTaxonomy.EntityType.PRICING_CONFIG),
                eq(200L),
                eq(AuditTaxonomy.Action.DELETE),
            anyMap(),
            isNull(),
            anyCollection(),
                eq("Deleted pricing configuration"),
                eq(true),
                eq(AuditTaxonomy.ComplianceCategory.FINANCIAL));
    }

    @Test
    void deleteConfigurationShouldReturnFalseWhenMissing() {
        when(pricingConfigRepository.findById(404L)).thenReturn(Optional.empty());

        boolean deleted = hotelPricingConfigService.deleteConfiguration(404L);

        assertFalse(deleted);
        verify(pricingConfigRepository, never()).delete(any());
        verifyNoInteractions(hotelActivityAuditService);
    }

    @Test
    void updateConfigurationByIdShouldResolveHotelFromExistingConfig() {
        Hotel hotel = hotel(15L);
        HotelPricingConfig existing = new HotelPricingConfig();
        existing.setId(300L);
        existing.setHotel(hotel);
        existing.setVersion(1);
        when(pricingConfigRepository.findById(300L)).thenReturn(Optional.of(existing));
        when(pricingConfigRepository.findByHotelId(15L)).thenReturn(Optional.of(existing));
        when(pricingConfigRepository.save(any(HotelPricingConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelPricingConfig updates = new HotelPricingConfig();
        updates.setVatRate(new BigDecimal("0.19"));
        updates.setServiceTaxRate(new BigDecimal("0.06"));

        HotelPricingConfig result = hotelPricingConfigService.updateConfigurationById(300L, updates);

        assertEquals(hotel, updates.getHotel());
        assertEquals(15L, updates.getHotelId());
        assertEquals(new BigDecimal("0.19"), result.getVatRate());
    }

    private Hotel hotel(Long id) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Hotel " + id);
        hotel.setAddress("Address " + id);
        return hotel;
    }
}