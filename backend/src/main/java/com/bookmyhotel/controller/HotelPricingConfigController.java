package com.bookmyhotel.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.entity.HotelPricingConfig;
import com.bookmyhotel.service.HotelPricingConfigService;

import jakarta.validation.Valid;

/**
 * REST controller for managing hotel pricing configurations
 * Provides endpoints for hotel administrators to configure their pricing and tax settings
 */
@RestController
@RequestMapping("/api/hotel-admin/pricing-config")
@CrossOrigin(origins = { 
    "http://localhost:3000", 
    "http://192.168.1.230:3000", 
    "https://shegeroom.com", 
    "https://www.shegeroom.com" 
})
public class HotelPricingConfigController {

    private static final Logger logger = LoggerFactory.getLogger(HotelPricingConfigController.class);

    @Autowired
    private HotelPricingConfigService pricingConfigService;

    /**
     * Get the active pricing configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the active configuration or 404 if none found
     */
    @GetMapping("/hotel/{hotelId}/active")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelPricingConfig> getActiveConfiguration(@PathVariable Long hotelId) {
        try {
            logger.info("Fetching active pricing configuration for hotel: {}", hotelId);
            
            HotelPricingConfig config = pricingConfigService.getActiveConfiguration(hotelId);
            
            if (config != null) {
                return ResponseEntity.ok(config);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error fetching active configuration for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get or create the active pricing configuration for a hotel
     * This ensures every hotel has a configuration to work with
     * 
     * @param hotelId the hotel ID
     * @return the active configuration (created if necessary)
     */
    @GetMapping("/hotel/{hotelId}/active-or-create")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelPricingConfig> getOrCreateActiveConfiguration(@PathVariable Long hotelId) {
        try {
            logger.info("Fetching or creating active pricing configuration for hotel: {}", hotelId);
            
            HotelPricingConfig config = pricingConfigService.getOrCreateActiveConfiguration(hotelId);
            return ResponseEntity.ok(config);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Hotel not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching/creating configuration for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all pricing configurations for a hotel (active and inactive)
     * 
     * @param hotelId the hotel ID
     * @return list of all configurations for the hotel
     */
    @GetMapping("/hotel/{hotelId}/all")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<HotelPricingConfig>> getAllConfigurations(@PathVariable Long hotelId) {
        try {
            logger.info("Fetching all pricing configurations for hotel: {}", hotelId);
            
            List<HotelPricingConfig> configurations = pricingConfigService.getConfigurationHistory(hotelId);
            return ResponseEntity.ok(configurations);
            
        } catch (Exception e) {
            logger.error("Error fetching configurations for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new pricing configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @param config the configuration to create
     * @return the created configuration
     */
    @PostMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelPricingConfig> createConfiguration(
            @PathVariable Long hotelId, 
            @Valid @RequestBody HotelPricingConfig config) {
        try {
            logger.info("Creating new pricing configuration for hotel: {}", hotelId);
            
            // Validate the configuration
            pricingConfigService.validateConfiguration(config);
            
            HotelPricingConfig createdConfig = pricingConfigService.createConfiguration(hotelId, config);
            
            logger.info("Successfully created pricing configuration with ID: {} for hotel: {}", 
                       createdConfig.getId(), hotelId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdConfig);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid configuration data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating configuration for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing pricing configuration
     * 
     * @param configId the configuration ID
     * @param updates the updates to apply
     * @return the updated configuration
     */
    @PutMapping("/{configId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelPricingConfig> updateConfiguration(
            @PathVariable Long configId, 
            @Valid @RequestBody HotelPricingConfig updates) {
        try {
            logger.info("Updating pricing configuration: {}", configId);
            
            // Validate the updates
            pricingConfigService.validateConfiguration(updates);
            
            HotelPricingConfig updatedConfig = pricingConfigService.updateConfiguration(configId, updates);
            
            logger.info("Successfully updated pricing configuration: {}", configId);
            
            return ResponseEntity.ok(updatedConfig);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid configuration update: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating configuration {}: {}", configId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deactivate (soft delete) a pricing configuration
     * 
     * @param configId the configuration ID
     * @return success response
     */
    @DeleteMapping("/{configId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Long configId) {
        try {
            logger.info("Deactivating pricing configuration: {}", configId);
            
            pricingConfigService.deleteConfiguration(configId);
            
            logger.info("Successfully deactivated pricing configuration: {}", configId);
            
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            logger.warn("Configuration not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deactivating configuration {}: {}", configId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a default pricing configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the created default configuration
     */
    @PostMapping("/hotel/{hotelId}/create-default")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelPricingConfig> createDefaultConfiguration(@PathVariable Long hotelId) {
        try {
            logger.info("Creating default pricing configuration for hotel: {}", hotelId);
            
            HotelPricingConfig defaultConfig = pricingConfigService.createDefaultConfiguration(hotelId);
            
            logger.info("Successfully created default configuration with ID: {} for hotel: {}", 
                       defaultConfig.getId(), hotelId);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(defaultConfig);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Hotel not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error creating default configuration for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get configurations that will expire soon
     * 
     * @param withinDays number of days to look ahead (default: 30)
     * @return list of configurations expiring within the specified period
     */
    @GetMapping("/expiring-soon")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<HotelPricingConfig>> getConfigurationsExpiringSoon(
            @RequestParam(defaultValue = "30") int withinDays) {
        try {
            logger.info("Fetching configurations expiring within {} days", withinDays);
            
            List<HotelPricingConfig> expiringConfigs = pricingConfigService.getConfigurationsExpiringWithin(withinDays);
            
            return ResponseEntity.ok(expiringConfigs);
            
        } catch (Exception e) {
            logger.error("Error fetching expiring configurations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all active configurations across all hotels (system admin only)
     * 
     * @return list of all active configurations
     */
    @GetMapping("/all-active")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<HotelPricingConfig>> getAllActiveConfigurations() {
        try {
            logger.info("Fetching all active pricing configurations");
            
            List<HotelPricingConfig> activeConfigs = pricingConfigService.getAllActiveConfigurations();
            
            return ResponseEntity.ok(activeConfigs);
            
        } catch (Exception e) {
            logger.error("Error fetching all active configurations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deactivate all existing configurations for a hotel and create a new active one
     * This is useful for replacing the current configuration with a new one
     * 
     * @param hotelId the hotel ID
     * @param newConfig the new configuration to activate
     * @return the newly activated configuration
     */
    @PostMapping("/hotel/{hotelId}/replace-active")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<HotelPricingConfig> replaceActiveConfiguration(
            @PathVariable Long hotelId,
            @Valid @RequestBody HotelPricingConfig newConfig) {
        try {
            logger.info("Replacing active configuration for hotel: {}", hotelId);
            
            // Validate the new configuration
            pricingConfigService.validateConfiguration(newConfig);
            
            // Deactivate existing configurations
            pricingConfigService.deactivateExistingConfigurations(hotelId);
            
            // Create the new configuration (version will be handled by service)
            HotelPricingConfig createdConfig = pricingConfigService.createConfiguration(hotelId, newConfig);
            
            logger.info("Successfully replaced active configuration for hotel: {}", hotelId);
            
            return ResponseEntity.ok(createdConfig);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid configuration data: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error replacing active configuration for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get pricing multipliers for a hotel (for room type pricing dialog)
     * Returns the multipliers needed for the frontend pricing dialog
     * 
     * @param hotelId the hotel ID
     * @return pricing multipliers object
     */
    @GetMapping("/hotel/{hotelId}/multipliers")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<PricingMultipliers> getPricingMultipliers(@PathVariable Long hotelId) {
        try {
            logger.info("Fetching pricing multipliers for hotel: {}", hotelId);
            
            HotelPricingConfig config = pricingConfigService.getOrCreateActiveConfiguration(hotelId);
            
            PricingMultipliers multipliers = new PricingMultipliers();
            multipliers.setWeekendMultiplier(config.getWeekendMultiplier());
            multipliers.setHolidayMultiplier(config.getHolidayMultiplier());
            multipliers.setPeakSeasonMultiplier(config.getPeakSeasonMultiplier());
            multipliers.setCurrencyCode(config.getCurrencyCode() != null ? 
                config.getCurrencyCode() : "ETB");
            
            return ResponseEntity.ok(multipliers);
            
        } catch (Exception e) {
            logger.error("Error fetching multipliers for hotel {}: {}", hotelId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Inner class for pricing multipliers response
     */
    public static class PricingMultipliers {
        private java.math.BigDecimal weekendMultiplier;
        private java.math.BigDecimal holidayMultiplier;
        private java.math.BigDecimal peakSeasonMultiplier;
        private String currencyCode;

        public java.math.BigDecimal getWeekendMultiplier() { return weekendMultiplier; }
        public void setWeekendMultiplier(java.math.BigDecimal weekendMultiplier) { this.weekendMultiplier = weekendMultiplier; }
        
        public java.math.BigDecimal getHolidayMultiplier() { return holidayMultiplier; }
        public void setHolidayMultiplier(java.math.BigDecimal holidayMultiplier) { this.holidayMultiplier = holidayMultiplier; }
        
        public java.math.BigDecimal getPeakSeasonMultiplier() { return peakSeasonMultiplier; }
        public void setPeakSeasonMultiplier(java.math.BigDecimal peakSeasonMultiplier) { this.peakSeasonMultiplier = peakSeasonMultiplier; }
        
        public String getCurrencyCode() { return currencyCode; }
        public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    }
}