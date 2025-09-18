package com.bookmyhotel.controller;

import com.bookmyhotel.dto.CostCalculationRequest;
import com.bookmyhotel.dto.CostCalculationResponse;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.service.EnhancedCostCalculationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * REST Controller for Enhanced Cost Calculation
 * Provides endpoints for dynamic pricing, cost calculation, and pricing recommendations
 */
@RestController
@RequestMapping("/api/pricing")
@CrossOrigin(origins = "*")
public class EnhancedPricingController {
    
    private static final Logger logger = LoggerFactory.getLogger(EnhancedPricingController.class);
    
    @Autowired
    private EnhancedCostCalculationService costCalculationService;
    
    /**
     * Calculate enhanced cost for a booking with all applicable pricing strategies
     */
    @PostMapping("/calculate")
    public ResponseEntity<CostCalculationResponse> calculateCost(
            @Valid @RequestBody CostCalculationRequest request,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {
        logger.info("Calculating enhanced cost for hotel: {}, room type: {}", request.getHotelId(), request.getRoomType());
        
        try {
            CostCalculationResponse response = costCalculationService.calculateEnhancedCost(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error calculating cost: {}", e.getMessage(), e);
            CostCalculationResponse errorResponse = new CostCalculationResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Calculate cost for booking modification
     */
    @PostMapping("/calculate-modification")
    public ResponseEntity<CostCalculationResponse> calculateModificationCost(
            @Valid @RequestBody CostCalculationRequest originalRequest,
            @Valid @RequestBody CostCalculationRequest newRequest,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {
        
        logger.info("Calculating modification cost from hotel: {} to hotel: {}", 
                   originalRequest.getHotelId(), newRequest.getHotelId());
        
        try {
            CostCalculationResponse response = costCalculationService.calculateModificationCost(originalRequest, newRequest);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error calculating modification cost: {}", e.getMessage(), e);
            CostCalculationResponse errorResponse = new CostCalculationResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get cost calculation for specific parameters (simplified endpoint)
     */
    @GetMapping("/calculate")
    public ResponseEntity<CostCalculationResponse> calculateCostSimple(
            @RequestParam Long hotelId,
            @RequestParam RoomType roomType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false) String promoCode,
            @RequestParam(defaultValue = "1") Integer guestCount,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {
        
        logger.info("Simple cost calculation for hotel: {}, room type: {}, dates: {} to {}", 
                   hotelId, roomType, checkInDate, checkOutDate);
        
        try {
            CostCalculationRequest request = new CostCalculationRequest();
            request.setHotelId(hotelId);
            request.setRoomType(roomType);
            request.setCheckInDate(checkInDate);
            request.setCheckOutDate(checkOutDate);
            request.setPromotionalCode(promoCode);
            request.setNumberOfGuests(guestCount);
            
            CostCalculationResponse response = costCalculationService.calculateEnhancedCost(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error in simple cost calculation: {}", e.getMessage(), e);
            CostCalculationResponse errorResponse = new CostCalculationResponse(false, e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Validate promotional code
     */
    @GetMapping("/validate-promo")
    public ResponseEntity<Map<String, Object>> validatePromotionalCode(
            @RequestParam String promoCode,
            @RequestParam Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam RoomType roomType,
            @RequestParam(defaultValue = "1") Integer guestCount,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantId) {
        
        logger.info("Validating promotional code: {} for hotel: {}", promoCode, hotelId);
        
        try {
            // Create a request for validation
            CostCalculationRequest request = new CostCalculationRequest();
            request.setHotelId(hotelId);
            request.setCheckInDate(checkInDate);
            request.setCheckOutDate(checkOutDate);
            request.setRoomType(roomType);
            request.setNumberOfGuests(guestCount);
            request.setPromotionalCode(promoCode);
            
            CostCalculationResponse response = costCalculationService.calculateEnhancedCost(request);
            
            Map<String, Object> result = new HashMap<>();
            if (response.isSuccess() && response.getPricingBreakdown().getPromotionalCodeApplied() != null) {
                result.put("valid", true);
                result.put("description", response.getPricingBreakdown().getPromotionalCodeDescription());
                result.put("discount", response.getPricingBreakdown().getPromotionalCodeDiscount());
            } else {
                result.put("valid", false);
                result.put("error", response.getErrorMessage() != null ? 
                          response.getErrorMessage() : "Invalid promotional code");
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("Error validating promotional code: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("valid", false);
            result.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
}
