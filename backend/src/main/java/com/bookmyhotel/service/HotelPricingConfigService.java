package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelPricingConfig;
import com.bookmyhotel.entity.HotelPricingConfig.PricingStrategy;
import com.bookmyhotel.repository.HotelPricingConfigRepository;
import com.bookmyhotel.repository.HotelRepository;

/**
 * Service class for managing hotel pricing configurations
 * Handles CRUD operations and business logic for hotel-specific pricing and tax settings
 */
@Service
@Transactional
public class HotelPricingConfigService {

    private static final Logger logger = LoggerFactory.getLogger(HotelPricingConfigService.class);

    @Autowired
    private HotelPricingConfigRepository pricingConfigRepository;

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Get the active pricing configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the configuration or null if not found
     */
    @Transactional(readOnly = true)
    public HotelPricingConfig getActiveConfiguration(Long hotelId) {
        logger.debug("Getting pricing configuration for hotel ID: {}", hotelId);
        
        Optional<HotelPricingConfig> config = pricingConfigRepository.findByHotelId(hotelId);
        
        if (config.isPresent()) {
            logger.debug("Found configuration for hotel {}: version {}", hotelId, config.get().getVersion());
            return config.get();
        } else {
            logger.debug("No configuration found for hotel {}", hotelId);
            return null;
        }
    }

    /**
     * Get or create active configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the configuration (creates default if none exists)
     */
    @Transactional
    public HotelPricingConfig getOrCreateActiveConfiguration(Long hotelId) {
        HotelPricingConfig config = getActiveConfiguration(hotelId);
        if (config == null) {
            config = createDefaultConfiguration(hotelId);
        }
        return config;
    }

    /**
     * Create a default pricing configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the new configuration
     */
    @Transactional
    public HotelPricingConfig createDefaultConfiguration(Long hotelId) {
        logger.info("Creating default pricing configuration for hotel ID: {}", hotelId);
        
        Optional<Hotel> hotel = hotelRepository.findById(hotelId);
        if (!hotel.isPresent()) {
            throw new IllegalArgumentException("Hotel not found with ID: " + hotelId);
        }

        HotelPricingConfig config = new HotelPricingConfig();
        config.setHotel(hotel.get());
        config.setVersion(1); // Start with version 1
        config.setPricingStrategy(PricingStrategy.FIXED);
        config.setServiceTaxRate(new BigDecimal("0.05"));
        config.setVatRate(new BigDecimal("0.17"));
        config.setCancellationFeeRate(new BigDecimal("0.50"));
        config.setNoShowPenaltyRate(new BigDecimal("1.00"));
        config.setModificationFeeRate(new BigDecimal("0.00"));
        // Set meaningful default multipliers for Ethiopian hotels
        config.setPeakSeasonMultiplier(new BigDecimal("1.30")); // 30% increase for peak season
        config.setOffSeasonMultiplier(new BigDecimal("0.90")); // 10% discount for off season  
        config.setWeekendMultiplier(new BigDecimal("1.20")); // 20% increase for weekends
        config.setHolidayMultiplier(new BigDecimal("1.50")); // 50% increase for holidays
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());
        
        // Set the creator
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            config.setCreatedBy(auth.getName());
            config.setUpdatedBy(auth.getName());
        }

        return pricingConfigRepository.save(config);
    }

    /**
     * Update pricing configuration for a hotel (versioned approach)
     * 
     * @param hotelId the hotel ID
     * @param config the updated configuration
     * @return the saved configuration
     */
    @Transactional
    public HotelPricingConfig updateConfiguration(Long hotelId, HotelPricingConfig updatedConfig) {
        logger.info("Updating pricing configuration for hotel ID: {}", hotelId);
        
        // Get the existing configuration
        HotelPricingConfig existingConfig = getActiveConfiguration(hotelId);
        
        if (existingConfig == null) {
            // No existing configuration, create new one
            updatedConfig.setVersion(1);
            updatedConfig.setCreatedAt(LocalDateTime.now());
            
            // Set the creator
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                updatedConfig.setCreatedBy(auth.getName());
            }
        } else {
            // Update existing configuration (increment version)
            updatedConfig.setId(existingConfig.getId());
            updatedConfig.setVersion(existingConfig.getVersion() + 1);
            updatedConfig.setCreatedAt(existingConfig.getCreatedAt());
            updatedConfig.setCreatedBy(existingConfig.getCreatedBy());
        }
        
        updatedConfig.setUpdatedAt(LocalDateTime.now());
        
        // Set the updater
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            updatedConfig.setUpdatedBy(auth.getName());
        }

        HotelPricingConfig saved = pricingConfigRepository.save(updatedConfig);
        logger.info("Updated pricing configuration for hotel {}: new version {}", hotelId, saved.getVersion());
        
        return saved;
    }

    /**
     * Get all pricing configurations for a hotel (for history)
     * 
     * @param hotelId the hotel ID
     * @return list of configurations ordered by version
     */
    @Transactional(readOnly = true)
    public List<HotelPricingConfig> getConfigurationHistory(Long hotelId) {
        // For now, just return the single configuration as a list
        // This would be updated when we have versioning properly implemented
        HotelPricingConfig config = getActiveConfiguration(hotelId);
        return config != null ? List.of(config) : List.of();
    }

    /**
     * Get the total tax rate for a hotel (VAT + Service Tax)
     * 
     * @param hotelId the hotel ID
     * @return the total tax rate as a decimal (e.g., 0.22 for 22%)
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalTaxRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        
        BigDecimal vatRate = config.getVatRate();
        BigDecimal serviceRate = config.getServiceTaxRate();
        
        BigDecimal totalRate = vatRate.add(serviceRate);
        logger.debug("Total tax rate for hotel {}: {}% (VAT: {}%, Service: {}%)", 
                    hotelId, totalRate.multiply(new BigDecimal("100")), 
                    config.getVatRate().multiply(new BigDecimal("100")), 
                    config.getServiceTaxRate().multiply(new BigDecimal("100")));
        
        return totalRate;
    }

    /**
     * Get the VAT rate for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the VAT rate as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getVatRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getVatRate();
    }

    /**
     * Get the service tax rate for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the service tax rate as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getServiceTaxRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getServiceTaxRate();
    }

    /**
     * Delete pricing configuration for a hotel
     * 
     * @param hotelId the hotel ID
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deleteConfiguration(Long hotelId) {
        logger.info("Deleting pricing configuration for hotel ID: {}", hotelId);
        
        Optional<HotelPricingConfig> config = pricingConfigRepository.findByHotelId(hotelId);
        if (config.isPresent()) {
            pricingConfigRepository.delete(config.get());
            logger.info("Deleted pricing configuration for hotel {}", hotelId);
            return true;
        } else {
            logger.warn("No pricing configuration found to delete for hotel {}", hotelId);
            return false;
        }
    }

    /**
     * Check if a hotel has a pricing configuration
     * 
     * @param hotelId the hotel ID
     * @return true if configuration exists
     */
    @Transactional(readOnly = true)
    public boolean hasConfiguration(Long hotelId) {
        return pricingConfigRepository.findByHotelId(hotelId).isPresent();
    }

    /**
     * Get all pricing configurations for all hotels
     * 
     * @return list of all configurations
     */
    @Transactional(readOnly = true)
    public List<HotelPricingConfig> getAllConfigurations() {
        return pricingConfigRepository.findAll();
    }

    /**
     * Get cancellation fee percentage for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the cancellation fee percentage as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getCancellationFeeRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getCancellationFeeRate();
    }

    /**
     * Get no-show fee percentage for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the no-show fee percentage as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getNoShowFeeRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getNoShowPenaltyRate();
    }

    /**
     * Get early checkout fee percentage for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the early checkout fee percentage as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getEarlyCheckoutFeeRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return BigDecimal.ZERO; // Not implemented in current entity
    }

    /**
     * Get room modification fee percentage for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the room modification fee percentage as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getRoomModificationFeeRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getModificationFeeRate();
    }

    /**
     * Get tax exempt booking fee percentage for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the tax exempt booking fee percentage as a decimal
     */
    @Transactional(readOnly = true)
    public BigDecimal getTaxExemptBookingFeeRate(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return BigDecimal.ZERO; // Not implemented in current entity
    }

    /**
     * Get weekend multiplier for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the weekend multiplier
     */
    @Transactional(readOnly = true)
    public BigDecimal getWeekendMultiplier(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getWeekendMultiplier();
    }

    /**
     * Get holiday multiplier for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the holiday multiplier
     */
    @Transactional(readOnly = true)
    public BigDecimal getHolidayMultiplier(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getHolidayMultiplier();
    }

    /**
     * Get peak season multiplier for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the peak season multiplier
     */
    @Transactional(readOnly = true)
    public BigDecimal getPeakSeasonMultiplier(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getPeakSeasonMultiplier();
    }

    /**
     * Get off season multiplier for a hotel
     * 
     * @param hotelId the hotel ID
     * @return the off season multiplier
     */
    @Transactional(readOnly = true)
    public BigDecimal getOffSeasonMultiplier(Long hotelId) {
        HotelPricingConfig config = getOrCreateActiveConfiguration(hotelId);
        return config.getOffSeasonMultiplier();
    }

    /**
     * Validate pricing configuration
     * 
     * @param config the configuration to validate
     * @return true if valid
     */
    public boolean validateConfiguration(HotelPricingConfig config) {
        if (config == null || config.getHotel() == null) {
            return false;
        }
        
        // Validate tax rates are within reasonable bounds
        if (config.getVatRate() != null && 
            (config.getVatRate().compareTo(BigDecimal.ZERO) < 0 || 
             config.getVatRate().compareTo(BigDecimal.ONE) > 0)) {
            return false;
        }
        
        if (config.getServiceTaxRate() != null && 
            (config.getServiceTaxRate().compareTo(BigDecimal.ZERO) < 0 || 
             config.getServiceTaxRate().compareTo(BigDecimal.ONE) > 0)) {
            return false;
        }
        
        return true;
    }

    /**
     * Create new configuration (alias for updateConfiguration for backwards compatibility)
     * 
     * @param hotelId the hotel ID
     * @param config the configuration
     * @return the saved configuration
     */
    @Transactional
    public HotelPricingConfig createConfiguration(Long hotelId, HotelPricingConfig config) {
        return updateConfiguration(hotelId, config);
    }

    /**
     * Get configurations expiring within days (placeholder implementation)
     * 
     * @param days number of days
     * @return list of configurations
     */
    @Transactional(readOnly = true)
    public List<HotelPricingConfig> getConfigurationsExpiringWithin(int days) {
        // For now, return empty list since we don't have expiration logic
        return List.of();
    }

    /**
     * Get all active configurations (placeholder implementation)
     * 
     * @return list of active configurations
     */
    @Transactional(readOnly = true)
    public List<HotelPricingConfig> getAllActiveConfigurations() {
        return getAllConfigurations();
    }

    /**
     * Deactivate existing configurations (no-op for versioning approach)
     * 
     * @param hotelId the hotel ID
     */
    @Transactional
    public void deactivateExistingConfigurations(Long hotelId) {
        // No-op since we're using versioning instead of multiple active records
        logger.debug("Deactivation request for hotel {} - using versioning approach", hotelId);
    }
}