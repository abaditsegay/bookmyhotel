package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.CostCalculationRequest;
import com.bookmyhotel.dto.CostCalculationResponse;
import com.bookmyhotel.dto.PricingBreakdown;
import com.bookmyhotel.entity.DiscountType;
import com.bookmyhotel.entity.PricingStrategy;
import com.bookmyhotel.entity.PricingStrategyType;
import com.bookmyhotel.entity.PromotionalCode;
import com.bookmyhotel.entity.RateAdjustmentType;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.SeasonalRate;
import com.bookmyhotel.repository.PricingStrategyRepository;
import com.bookmyhotel.repository.PromotionalCodeRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.SeasonalRateRepository;

@ExtendWith(MockitoExtension.class)
class EnhancedCostCalculationServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private PricingStrategyRepository pricingStrategyRepository;

    @Mock
    private SeasonalRateRepository seasonalRateRepository;

    @Mock
    private PromotionalCodeRepository promotionalCodeRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private HotelPricingConfigService hotelPricingConfigService;

    @InjectMocks
    private EnhancedCostCalculationService enhancedCostCalculationService;

    @Test
    void calculateEnhancedCostShouldApplyStrategySeasonalPromoAndTax() {
        CostCalculationRequest request = request(LocalDate.now().plusDays(20), LocalDate.now().plusDays(23));
        request.setPromotionalCode("SAVE20");
        request.setCustomerEmail("guest@example.com");

        when(roomRepository.findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD))
                .thenReturn(Optional.of(room(new BigDecimal("100.00"))));
        when(pricingStrategyRepository.findActiveStrategiesForRoomTypeAndDate(1L, RoomType.STANDARD,
                request.getCheckInDate()))
                        .thenReturn(List.of(earlyBirdStrategy(new BigDecimal("0.90"), 14)));
        when(seasonalRateRepository.findActiveRatesForRoomTypeAndDate(1L, RoomType.STANDARD, request.getCheckInDate()))
                .thenReturn(List.of(seasonalMultiplier("Peak Season", new BigDecimal("1.10"))));
        when(promotionalCodeRepository.findByCodeAndHotelIdAndIsActiveTrue("SAVE20", 1L))
                .thenReturn(Optional.of(fixedPromo("SAVE20", new BigDecimal("20.00"))));
        when(hotelPricingConfigService.getTotalTaxRate(1L)).thenReturn(new BigDecimal("0.15"));

        CostCalculationResponse response = enhancedCostCalculationService.calculateEnhancedCost(request);

        assertTrue(response.isSuccess());
        PricingBreakdown breakdown = response.getPricingBreakdown();
        assertNotNull(breakdown);
        assertEquals(new BigDecimal("100.00"), breakdown.getBaseRatePerNight());
        assertEquals(3, breakdown.getNumberOfNights());
        assertEquals(new BigDecimal("300.00"), breakdown.getBaseTotal());
        assertEquals(List.of("Early Bird: ETB -30.00"), breakdown.getAppliedPricingStrategies());
        assertEquals(List.of("Peak Season: ETB 27.00"), breakdown.getAppliedSeasonalRates());
        assertEquals("SAVE20", breakdown.getPromotionalCodeApplied());
        assertEquals(new BigDecimal("20.00"), breakdown.getPromotionalCodeDiscount());
        assertEquals(0, new BigDecimal("41.55").compareTo(breakdown.getTaxesAndFees()));
        assertEquals(0, new BigDecimal("318.55").compareTo(breakdown.getFinalTotal()));
        assertEquals(0, new BigDecimal("23.00").compareTo(breakdown.getTotalSavings()));
        assertEquals(new BigDecimal("7.67"), breakdown.getSavingsPercentage());
        assertTrue(response.getRecommendations().size() >= 1);
    }

    @Test
    void calculateEnhancedCostShouldReturnErrorForInvalidDateRange() {
        CostCalculationRequest request = request(LocalDate.now().plusDays(5), LocalDate.now().plusDays(5));
        when(roomRepository.findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD))
                .thenReturn(Optional.of(room(new BigDecimal("120.00"))));

        CostCalculationResponse response = enhancedCostCalculationService.calculateEnhancedCost(request);

        assertFalse(response.isSuccess());
        assertTrue(response.getErrorMessage().contains("Check-out date must be after check-in date"));
        verifyNoInteractions(pricingStrategyRepository, seasonalRateRepository, promotionalCodeRepository,
                reservationRepository, hotelPricingConfigService);
    }

    @Test
    void calculateEnhancedCostShouldReturnErrorWhenNoMatchingRoomExists() {
        CostCalculationRequest request = request(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        when(roomRepository.findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD)).thenReturn(Optional.empty());

        CostCalculationResponse response = enhancedCostCalculationService.calculateEnhancedCost(request);

        assertFalse(response.isSuccess());
        assertTrue(response.getErrorMessage().contains("No rooms found for the specified type"));
    }

    @Test
    void calculateEnhancedCostShouldKeepSubtotalWhenPromotionalCodeIsInvalid() {
        CostCalculationRequest request = request(LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));
        request.setPromotionalCode("BADCODE");

        when(roomRepository.findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD))
                .thenReturn(Optional.of(room(new BigDecimal("150.00"))));
        when(pricingStrategyRepository.findActiveStrategiesForRoomTypeAndDate(1L, RoomType.STANDARD,
                request.getCheckInDate()))
                        .thenReturn(List.of());
        when(seasonalRateRepository.findActiveRatesForRoomTypeAndDate(1L, RoomType.STANDARD, request.getCheckInDate()))
                .thenReturn(List.of());
        when(promotionalCodeRepository.findByCodeAndHotelIdAndIsActiveTrue("BADCODE", 1L)).thenReturn(Optional.empty());
        when(hotelPricingConfigService.getTotalTaxRate(1L)).thenReturn(new BigDecimal("0.10"));

        CostCalculationResponse response = enhancedCostCalculationService.calculateEnhancedCost(request);

        assertTrue(response.isSuccess());
        PricingBreakdown breakdown = response.getPricingBreakdown();
        assertEquals("Invalid or expired promotional code", breakdown.getPromotionalCodeError());
        assertNull(breakdown.getPromotionalCodeApplied());
        assertEquals(new BigDecimal("30.00"), breakdown.getTaxesAndFees());
        assertEquals(new BigDecimal("330.00"), breakdown.getFinalTotal());
    }

    @Test
    void calculateEnhancedCostShouldFallbackToZeroTaxesWhenTaxLookupFails() {
        CostCalculationRequest request = request(LocalDate.now().plusDays(2), LocalDate.now().plusDays(4));

        when(roomRepository.findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD))
                .thenReturn(Optional.of(room(new BigDecimal("80.00"))));
        when(pricingStrategyRepository.findActiveStrategiesForRoomTypeAndDate(1L, RoomType.STANDARD,
                request.getCheckInDate()))
                        .thenReturn(List.of());
        when(seasonalRateRepository.findActiveRatesForRoomTypeAndDate(1L, RoomType.STANDARD, request.getCheckInDate()))
                .thenReturn(List.of());
        when(hotelPricingConfigService.getTotalTaxRate(1L)).thenThrow(new RuntimeException("db unavailable"));

        CostCalculationResponse response = enhancedCostCalculationService.calculateEnhancedCost(request);

        assertTrue(response.isSuccess());
        assertEquals(BigDecimal.ZERO.setScale(2), response.getPricingBreakdown().getTaxesAndFees().setScale(2));
        assertEquals(new BigDecimal("160.00"), response.getPricingBreakdown().getFinalTotal());
    }

    @Test
    void calculateModificationCostShouldIncludeOriginalTotalAndDifference() {
        CostCalculationRequest originalRequest = request(LocalDate.now().plusDays(10), LocalDate.now().plusDays(12));
        CostCalculationRequest newRequest = request(LocalDate.now().plusDays(10), LocalDate.now().plusDays(13));

        when(roomRepository.findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD))
                .thenReturn(Optional.of(room(new BigDecimal("100.00"))));
        when(pricingStrategyRepository.findActiveStrategiesForRoomTypeAndDate(1L, RoomType.STANDARD,
                originalRequest.getCheckInDate()))
                        .thenReturn(List.of());
        when(pricingStrategyRepository.findActiveStrategiesForRoomTypeAndDate(1L, RoomType.STANDARD,
                newRequest.getCheckInDate()))
                        .thenReturn(List.of());
        when(seasonalRateRepository.findActiveRatesForRoomTypeAndDate(1L, RoomType.STANDARD,
                originalRequest.getCheckInDate())).thenReturn(List.of());
        when(seasonalRateRepository.findActiveRatesForRoomTypeAndDate(1L, RoomType.STANDARD,
                newRequest.getCheckInDate())).thenReturn(List.of());
        when(hotelPricingConfigService.getTotalTaxRate(1L)).thenReturn(BigDecimal.ZERO);

        CostCalculationResponse response = enhancedCostCalculationService
                .calculateModificationCost(originalRequest, newRequest);

        assertTrue(response.isSuccess());
        assertEquals(new BigDecimal("200.00"), response.getPricingBreakdown().getOriginalTotal());
        assertEquals(new BigDecimal("100.00"), response.getPricingBreakdown().getCostDifference());
        verify(roomRepository, org.mockito.Mockito.times(2)).findFirstByHotelIdAndRoomType(1L, RoomType.STANDARD);
    }

    private CostCalculationRequest request(LocalDate checkIn, LocalDate checkOut) {
        return new CostCalculationRequest(1L, RoomType.STANDARD, checkIn, checkOut);
    }

    private Room room(BigDecimal pricePerNight) {
        Room room = new Room();
        room.setRoomType(RoomType.STANDARD);
        room.setPricePerNight(pricePerNight);
        return room;
    }

    private PricingStrategy earlyBirdStrategy(BigDecimal multiplier, int advanceDays) {
        PricingStrategy strategy = new PricingStrategy();
        strategy.setName("Early Bird");
        strategy.setStrategyType(PricingStrategyType.EARLY_BIRD);
        strategy.setBaseRateMultiplier(multiplier);
        strategy.setAdvanceBookingDays(advanceDays);
        return strategy;
    }

    private SeasonalRate seasonalMultiplier(String name, BigDecimal multiplier) {
        SeasonalRate rate = new SeasonalRate();
        rate.setSeasonName(name);
        rate.setAdjustmentType(RateAdjustmentType.MULTIPLIER);
        rate.setRateMultiplier(multiplier);
        return rate;
    }

    private PromotionalCode fixedPromo(String code, BigDecimal amount) {
        PromotionalCode promo = new PromotionalCode();
        promo.setCode(code);
        promo.setDescription("Fixed discount");
        promo.setDiscountType(DiscountType.FIXED_AMOUNT);
        promo.setDiscountValue(amount);
        promo.setValidFrom(LocalDate.now().minusDays(1));
        promo.setValidTo(LocalDate.now().plusDays(30));
        promo.setIsActive(true);
        promo.setFirstTimeCustomerOnly(false);
        return promo;
    }
}