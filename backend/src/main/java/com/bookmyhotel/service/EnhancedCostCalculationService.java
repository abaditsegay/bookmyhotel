package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bookmyhotel.dto.CostCalculationRequest;
import com.bookmyhotel.dto.CostCalculationResponse;
import com.bookmyhotel.dto.PricingBreakdown;
import com.bookmyhotel.entity.PricingStrategy;
import com.bookmyhotel.entity.PromotionalCode;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.SeasonalRate;
import com.bookmyhotel.repository.PricingStrategyRepository;
import com.bookmyhotel.repository.PromotionalCodeRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.SeasonalRateRepository;

/**
 * Enhanced Cost Calculation Service with dynamic pricing, seasonal adjustments, and promotional pricing
 * 
 * This service provides comprehensive cost calculation including:
 * - Base room rates
 * - Seasonal rate adjustments
 * - Dynamic pricing based on occupancy
 * - Promotional codes and discounts
 * - Weekend/holiday premiums
 * - Early bird and last-minute pricing
 */
@Service
public class EnhancedCostCalculationService {
    
    private static final Logger logger = LoggerFactory.getLogger(EnhancedCostCalculationService.class);
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private PricingStrategyRepository pricingStrategyRepository;
    
    @Autowired
    private SeasonalRateRepository seasonalRateRepository;
    
    @Autowired
    private PromotionalCodeRepository promotionalCodeRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    /**
     * Calculate comprehensive cost for a booking with all applicable pricing strategies
     */
    public CostCalculationResponse calculateEnhancedCost(CostCalculationRequest request) {
        logger.info("Calculating enhanced cost for hotel: {}, room type: {}, dates: {} to {}", 
                   request.getHotelId(), request.getRoomType(), request.getCheckInDate(), request.getCheckOutDate());
        
        CostCalculationResponse response = new CostCalculationResponse();
        PricingBreakdown breakdown = new PricingBreakdown();
        
        try {
            // Get base room rate
            BigDecimal baseRatePerNight = getBaseRoomRate(request.getHotelId(), request.getRoomType());
            breakdown.setBaseRatePerNight(baseRatePerNight);
            
            // Calculate number of nights
            long numberOfNights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
            breakdown.setNumberOfNights((int) numberOfNights);
            
            if (numberOfNights <= 0) {
                throw new IllegalArgumentException("Check-out date must be after check-in date");
            }
            
            // Calculate base total before adjustments
            BigDecimal baseTotal = baseRatePerNight.multiply(BigDecimal.valueOf(numberOfNights));
            breakdown.setBaseTotal(baseTotal);
            
            // Apply dynamic pricing strategies
            BigDecimal adjustedTotal = applyPricingStrategies(baseTotal, request, breakdown);
            
            // Apply seasonal rate adjustments
            adjustedTotal = applySeasonalRates(adjustedTotal, request, breakdown);
            
            // Apply day-of-week adjustments
            adjustedTotal = applyDayOfWeekAdjustments(adjustedTotal, request, breakdown);
            
            // Apply promotional codes if provided
            if (request.getPromotionalCode() != null && !request.getPromotionalCode().trim().isEmpty()) {
                adjustedTotal = applyPromotionalCode(adjustedTotal, request, breakdown);
            }
            
            // Calculate taxes and fees
            BigDecimal taxesAndFees = calculateTaxesAndFees(adjustedTotal, request);
            breakdown.setTaxesAndFees(taxesAndFees);
            
            // Final total
            BigDecimal finalTotal = adjustedTotal.add(taxesAndFees);
            breakdown.setFinalTotal(finalTotal);
            
            // Calculate savings if applicable
            BigDecimal totalSavings = baseTotal.subtract(adjustedTotal);
            if (totalSavings.compareTo(BigDecimal.ZERO) > 0) {
                breakdown.setTotalSavings(totalSavings);
                breakdown.setSavingsPercentage(
                    totalSavings.divide(baseTotal, 4, RoundingMode.HALF_UP)
                               .multiply(BigDecimal.valueOf(100))
                               .setScale(2, RoundingMode.HALF_UP)
                );
            }
            
            response.setSuccess(true);
            response.setPricingBreakdown(breakdown);
            response.setRecommendations(generatePricingRecommendations(request, breakdown));
            
        } catch (Exception e) {
            logger.error("Error calculating enhanced cost: {}", e.getMessage(), e);
            response.setSuccess(false);
            response.setErrorMessage("Failed to calculate cost: " + e.getMessage());
        }
        
        return response;
    }
    
    /**
     * Get base room rate for the specified hotel and room type
     */
    private BigDecimal getBaseRoomRate(Long hotelId, RoomType roomType) {
        Optional<Room> roomOpt = roomRepository.findFirstByHotelIdAndRoomType(hotelId, roomType);
        if (roomOpt.isPresent()) {
            return roomOpt.get().getPricePerNight();
        }
        throw new IllegalArgumentException("No rooms found for the specified type");
    }
    
    /**
     * Apply dynamic pricing strategies
     */
    private BigDecimal applyPricingStrategies(BigDecimal baseTotal, CostCalculationRequest request, 
                                            PricingBreakdown breakdown) {
        
        List<PricingStrategy> strategies = pricingStrategyRepository
            .findActiveStrategiesForRoomTypeAndDate(request.getHotelId(), request.getRoomType(), request.getCheckInDate());
        
        BigDecimal adjustedTotal = baseTotal;
        List<String> appliedStrategies = new ArrayList<>();
        
        for (PricingStrategy strategy : strategies) {
            BigDecimal adjustment = BigDecimal.ZERO;
            boolean applicable = false;
            
            switch (strategy.getStrategyType()) {
                case DEMAND_BASED:
                    adjustment = applyDemandBasedPricing(baseTotal, strategy, request);
                    applicable = adjustment.compareTo(BigDecimal.ZERO) != 0;
                    break;
                    
                case EARLY_BIRD:
                    adjustment = applyEarlyBirdPricing(baseTotal, strategy, request);
                    applicable = adjustment.compareTo(BigDecimal.ZERO) != 0;
                    break;
                    
                case LAST_MINUTE:
                    adjustment = applyLastMinutePricing(baseTotal, strategy, request);
                    applicable = adjustment.compareTo(BigDecimal.ZERO) != 0;
                    break;
                    
                case LENGTH_OF_STAY:
                    adjustment = applyLengthOfStayPricing(baseTotal, strategy, request);
                    applicable = adjustment.compareTo(BigDecimal.ZERO) != 0;
                    break;
                    
                default:
                    adjustment = baseTotal.multiply(strategy.getBaseRateMultiplier().subtract(BigDecimal.ONE));
                    applicable = true;
                    break;
            }
            
            if (applicable) {
                adjustedTotal = adjustedTotal.add(adjustment);
                appliedStrategies.add(strategy.getName() + ": " + formatCurrency(adjustment));
            }
        }
        
        breakdown.setAppliedPricingStrategies(appliedStrategies);
        return adjustedTotal;
    }
    
    /**
     * Apply demand-based pricing based on current occupancy
     */
    private BigDecimal applyDemandBasedPricing(BigDecimal baseTotal, PricingStrategy strategy, 
                                             CostCalculationRequest request) {
        // Calculate current occupancy rate
        double occupancyRate = calculateOccupancyRate(request.getHotelId(), request.getCheckInDate(), request.getCheckOutDate());
        
        if (strategy.getMinOccupancyThreshold() != null && 
            occupancyRate < strategy.getMinOccupancyThreshold().doubleValue()) {
            return BigDecimal.ZERO;
        }
        
        if (strategy.getMaxOccupancyThreshold() != null && 
            occupancyRate > strategy.getMaxOccupancyThreshold().doubleValue()) {
            return BigDecimal.ZERO;
        }
        
        return baseTotal.multiply(strategy.getBaseRateMultiplier().subtract(BigDecimal.ONE));
    }
    
    /**
     * Apply early bird pricing for advance bookings
     */
    private BigDecimal applyEarlyBirdPricing(BigDecimal baseTotal, PricingStrategy strategy, 
                                           CostCalculationRequest request) {
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), request.getCheckInDate());
        
        if (strategy.getAdvanceBookingDays() != null && daysInAdvance >= strategy.getAdvanceBookingDays()) {
            return baseTotal.multiply(strategy.getBaseRateMultiplier().subtract(BigDecimal.ONE));
        }
        
        return BigDecimal.ZERO;
    }
    
    /**
     * Apply last-minute pricing for same-day or next-day bookings
     */
    private BigDecimal applyLastMinutePricing(BigDecimal baseTotal, PricingStrategy strategy, 
                                            CostCalculationRequest request) {
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), request.getCheckInDate());
        
        if (daysInAdvance <= 1) { // Same day or next day
            return baseTotal.multiply(strategy.getBaseRateMultiplier().subtract(BigDecimal.ONE));
        }
        
        return BigDecimal.ZERO;
    }
    
    /**
     * Apply length of stay pricing for extended stays
     */
    private BigDecimal applyLengthOfStayPricing(BigDecimal baseTotal, PricingStrategy strategy, 
                                              CostCalculationRequest request) {
        long numberOfNights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        
        // Apply discount for stays of 7 nights or more
        if (numberOfNights >= 7) {
            return baseTotal.multiply(strategy.getBaseRateMultiplier().subtract(BigDecimal.ONE));
        }
        
        return BigDecimal.ZERO;
    }
    
    /**
     * Apply seasonal rate adjustments
     */
    private BigDecimal applySeasonalRates(BigDecimal adjustedTotal, CostCalculationRequest request, 
                                        PricingBreakdown breakdown) {
        
        List<SeasonalRate> seasonalRates = seasonalRateRepository
            .findActiveRatesForRoomTypeAndDate(request.getHotelId(), request.getRoomType(), request.getCheckInDate());
        
        BigDecimal finalTotal = adjustedTotal;
        List<String> appliedSeasonalRates = new ArrayList<>();
        
        for (SeasonalRate rate : seasonalRates) {
            BigDecimal originalTotal = finalTotal;
            finalTotal = rate.calculateAdjustedRate(finalTotal);
            
            if (finalTotal.compareTo(originalTotal) != 0) {
                BigDecimal adjustment = finalTotal.subtract(originalTotal);
                appliedSeasonalRates.add(rate.getSeasonName() + ": " + formatCurrency(adjustment));
            }
        }
        
        breakdown.setAppliedSeasonalRates(appliedSeasonalRates);
        return finalTotal;
    }
    
    /**
     * Apply day-of-week adjustments (weekend premiums, etc.)
     */
    private BigDecimal applyDayOfWeekAdjustments(BigDecimal adjustedTotal, CostCalculationRequest request, 
                                               PricingBreakdown breakdown) {
        
        BigDecimal finalTotal = adjustedTotal;
        List<String> dayAdjustments = new ArrayList<>();
        
        LocalDate currentDate = request.getCheckInDate();
        LocalDate endDate = request.getCheckOutDate();
        
        while (currentDate.isBefore(endDate)) {
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            
            if (dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY) {
                // Weekend premium of 20%
                BigDecimal dailyRate = adjustedTotal.divide(BigDecimal.valueOf(ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate())), 2, RoundingMode.HALF_UP);
                BigDecimal weekendPremium = dailyRate.multiply(BigDecimal.valueOf(0.20));
                finalTotal = finalTotal.add(weekendPremium);
                
                dayAdjustments.add(currentDate + " (Weekend): " + formatCurrency(weekendPremium));
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        breakdown.setDayOfWeekAdjustments(dayAdjustments);
        return finalTotal;
    }
    
    /**
     * Apply promotional code discount
     */
    private BigDecimal applyPromotionalCode(BigDecimal adjustedTotal, CostCalculationRequest request, 
                                          PricingBreakdown breakdown) {
        
        Optional<PromotionalCode> promoOpt = promotionalCodeRepository
            .findByCodeAndHotelIdAndIsActiveTrue(request.getPromotionalCode(), request.getHotelId());
        
        if (promoOpt.isEmpty()) {
            breakdown.setPromotionalCodeError("Invalid or expired promotional code");
            return adjustedTotal;
        }
        
        PromotionalCode promo = promoOpt.get();
        
        // Validate promotional code
        if (!promo.isValidForDate(request.getCheckInDate())) {
            breakdown.setPromotionalCodeError("Promotional code is not valid for the selected dates");
            return adjustedTotal;
        }
        
        if (!promo.isValidForAmount(adjustedTotal)) {
            breakdown.setPromotionalCodeError("Booking amount does not meet minimum requirement");
            return adjustedTotal;
        }
        
        // Check customer usage limits if customer email is provided
        if (request.getCustomerEmail() != null && promo.getPerCustomerLimit() != null) {
            Integer customerUsage = promotionalCodeRepository.countUsageByCustomer(promo.getCode(), request.getCustomerEmail());
            if (customerUsage >= promo.getPerCustomerLimit()) {
                breakdown.setPromotionalCodeError("Promotional code usage limit exceeded for this customer");
                return adjustedTotal;
            }
        }
        
        // Check first-time customer requirement
        if (promo.getFirstTimeCustomerOnly() && request.getCustomerEmail() != null) {
            Integer previousBookings = promotionalCodeRepository.countPreviousBookingsByCustomer(request.getCustomerEmail(), request.getHotelId());
            if (previousBookings > 0) {
                breakdown.setPromotionalCodeError("Promotional code is only valid for first-time customers");
                return adjustedTotal;
            }
        }
        
        // Calculate discount
        BigDecimal discountAmount = promo.calculateDiscountAmount(adjustedTotal);
        BigDecimal finalTotal = adjustedTotal.subtract(discountAmount);
        
        breakdown.setPromotionalCodeApplied(promo.getCode());
        breakdown.setPromotionalCodeDiscount(discountAmount);
        breakdown.setPromotionalCodeDescription(promo.getDescription());
        
        return finalTotal;
    }
    
    /**
     * Calculate taxes and fees
     */
    private BigDecimal calculateTaxesAndFees(BigDecimal subtotal, CostCalculationRequest request) {
        // Simple tax calculation - in real implementation, this would be more complex
        // based on location, tax rates, etc.
        BigDecimal taxRate = BigDecimal.valueOf(0.15); // 15% tax
        return subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Calculate current occupancy rate for the hotel
     */
    private double calculateOccupancyRate(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        // This is a simplified calculation
        // In a real implementation, you would consider all room types and their availability
        long totalRooms = roomRepository.countByHotelId(hotelId);
        long occupiedRooms = reservationRepository.countActiveReservationsInDateRange(hotelId, checkIn, checkOut);
        
        if (totalRooms == 0) return 0.0;
        return (double) occupiedRooms / totalRooms;
    }
    
    /**
     * Generate pricing recommendations
     */
    private List<String> generatePricingRecommendations(CostCalculationRequest request, PricingBreakdown breakdown) {
        List<String> recommendations = new ArrayList<>();
        
        // Recommend alternative dates for better rates
        LocalDate alternativeDate = request.getCheckInDate().plusDays(1);
        if (alternativeDate.getDayOfWeek() != DayOfWeek.FRIDAY && alternativeDate.getDayOfWeek() != DayOfWeek.SATURDAY) {
            recommendations.add("Consider checking in on " + alternativeDate + " to avoid weekend premiums");
        }
        
        // Recommend longer stays for better rates
        long nights = breakdown.getNumberOfNights();
        if (nights < 7) {
            recommendations.add("Stay 7+ nights to qualify for extended stay discounts");
        }
        
        // Recommend advance booking
        long daysInAdvance = ChronoUnit.DAYS.between(LocalDate.now(), request.getCheckInDate());
        if (daysInAdvance < 14) {
            recommendations.add("Book 14+ days in advance for early bird discounts");
        }
        
        return recommendations;
    }
    
    /**
     * Format currency for display
     */
    private String formatCurrency(BigDecimal amount) {
        return String.format("$%.2f", amount);
    }
    
    /**
     * Calculate cost preview for modification scenarios
     */
    public CostCalculationResponse calculateModificationCost(CostCalculationRequest originalRequest, 
                                                           CostCalculationRequest newRequest) {
        CostCalculationResponse originalCost = calculateEnhancedCost(originalRequest);
        CostCalculationResponse newCost = calculateEnhancedCost(newRequest);
        
        if (originalCost.isSuccess() && newCost.isSuccess()) {
            BigDecimal costDifference = newCost.getPricingBreakdown().getFinalTotal()
                                      .subtract(originalCost.getPricingBreakdown().getFinalTotal());
            
            newCost.getPricingBreakdown().setCostDifference(costDifference);
            newCost.getPricingBreakdown().setOriginalTotal(originalCost.getPricingBreakdown().getFinalTotal());
        }
        
        return newCost;
    }
}
