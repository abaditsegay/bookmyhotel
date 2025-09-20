package com.bookmyhotel.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.HotelPricingConfig;
import com.bookmyhotel.entity.HotelPricingConfig.PricingStrategy;

/**
 * Repository interface for HotelPricingConfig entity
 * Provides data access methods for hotel-specific pricing and tax configurations
 */
@Repository
public interface HotelPricingConfigRepository extends JpaRepository<HotelPricingConfig, Long> {

    /**
     * Find the most recent pricing configuration for a hotel by version
     * Returns the single configuration with the highest version number
     * Uses Spring Data JPA method naming convention to automatically limit to 1 result
     * 
     * @param hotelId the hotel ID
     * @return Optional containing the latest configuration if found
     */
    Optional<HotelPricingConfig> findTopByHotel_IdOrderByVersionDesc(Long hotelId);

    /**
     * Default method for backward compatibility - returns the latest version
     * 
     * @param hotelId the hotel ID
     * @return Optional containing the latest configuration if found
     */
    default Optional<HotelPricingConfig> findByHotelId(Long hotelId) {
        return findTopByHotel_IdOrderByVersionDesc(hotelId);
    }

    /**
     * Find the most recent pricing configuration for a hotel
     * Uses native Spring Data JPA method with Pageable to get only first result
     * 
     * @param hotelId the hotel ID
     * @param pageable page request (limit 1)
     * @return Page containing the latest configuration
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.hotel.id = :hotelId " +
           "ORDER BY hpc.version DESC")
    Page<HotelPricingConfig> findByHotelIdOrderByVersionDesc(@Param("hotelId") Long hotelId, Pageable pageable);

    /**
     * Convenience method with same name for backward compatibility
     */
    default Optional<HotelPricingConfig> findActiveConfigurationByHotelId(Long hotelId) {
        return findByHotelId(hotelId);
    }

    /**
     * Find all configurations for a hotel (active and inactive)
     * 
     * @param hotelId the hotel ID
     * @return List of all configurations for the hotel
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.hotel.id = :hotelId " +
           "ORDER BY hpc.createdAt DESC")
    List<HotelPricingConfig> findAllByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Find all configurations across all hotels (one per hotel)
     * 
     * @return List of all configurations
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "ORDER BY hpc.hotel.name, hpc.version DESC")
    List<HotelPricingConfig> findAllConfigurations();

    /**
     * Find all configurations (convenience method for backward compatibility)
     */
    default List<HotelPricingConfig> findAllActiveConfigurations() {
        return findAllConfigurations();
    }

    /**
     * Check if a hotel has a configuration
     * 
     * @param hotelId the hotel ID
     * @return true if hotel has configuration
     */
    @Query("SELECT COUNT(hpc) > 0 FROM HotelPricingConfig hpc " +
           "WHERE hpc.hotel.id = :hotelId " +
           "AND (hpc.effectiveFrom IS NULL OR hpc.effectiveFrom <= :now) " +
           "AND (hpc.effectiveUntil IS NULL OR hpc.effectiveUntil > :now)")
    boolean hasActiveConfiguration(@Param("hotelId") Long hotelId, @Param("now") LocalDateTime now);

    /**
     * Check if a hotel has a configuration (convenience method)
     */
    default boolean hasActiveConfiguration(Long hotelId) {
        return hasActiveConfiguration(hotelId, LocalDateTime.now());
    }

    /**
     * Find latest hotel pricing configurations by strategy
     * 
     * @param pricingStrategy the pricing strategy
     * @param now current timestamp
     * @return list of configurations
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.pricingStrategy = :pricingStrategy " +
           "AND (hpc.effectiveFrom IS NULL OR hpc.effectiveFrom <= :now) " +
           "AND (hpc.effectiveUntil IS NULL OR hpc.effectiveUntil > :now) " +
           "ORDER BY hpc.version DESC")
    List<HotelPricingConfig> findByPricingStrategy(@Param("pricingStrategy") HotelPricingConfig.PricingStrategy pricingStrategy, 
                                                   @Param("now") LocalDateTime now);

    /**
     * Find configurations that will expire soon
     * 
     * @param withinDays number of days to look ahead
     * @return List of configurations expiring within the specified days
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.effectiveUntil IS NOT NULL " +
           "AND hpc.effectiveUntil BETWEEN :now AND :expiryDate " +
           "ORDER BY hpc.effectiveUntil ASC")
    List<HotelPricingConfig> findConfigurationsExpiringWithin(
        @Param("now") LocalDateTime now,
        @Param("expiryDate") LocalDateTime expiryDate
    );

    /**
     * Find configurations expiring within specified days (convenience method)
     */
    default List<HotelPricingConfig> findConfigurationsExpiringWithin(int withinDays) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryDate = now.plusDays(withinDays);
        return findConfigurationsExpiringWithin(now, expiryDate);
    }

    /**
     * Find configurations by currency code
     * 
     * @param currencyCode the currency code (e.g., "ETB", "USD")
     * @return List of configurations using the specified currency
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.currencyCode = :currencyCode " +
           "ORDER BY hpc.hotel.name, hpc.version DESC")
    List<HotelPricingConfig> findByCurrencyCode(@Param("currencyCode") String currencyCode);

    /**
     * Find hotels with dynamic pricing enabled
     * 
     * @return List of configurations with dynamic pricing enabled
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.dynamicPricingEnabled = true " +
           "ORDER BY hpc.hotel.name, hpc.version DESC")
    List<HotelPricingConfig> findWithDynamicPricingEnabled();

    /**
     * Count configurations per hotel
     * 
     * @return List of arrays containing hotel_id and count
     */
    @Query("SELECT hpc.hotel.id, COUNT(hpc) FROM HotelPricingConfig hpc " +
           "GROUP BY hpc.hotel.id " +
           "ORDER BY COUNT(hpc) DESC")
    List<Object[]> countActiveConfigurationsByHotel();

    /**
     * Find configuration by hotel ID and version
     * 
     * @param hotelId the hotel ID
     * @param version the configuration version
     * @return Optional containing the configuration if found
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.hotel.id = :hotelId " +
           "AND hpc.version = :version " +
           "ORDER BY hpc.createdAt DESC")
    Optional<HotelPricingConfig> findByHotelIdAndVersion(
        @Param("hotelId") Long hotelId, 
        @Param("version") Integer version
    );

    /**
     * Find the latest configuration for a hotel (active or inactive)
     * 
     * @param hotelId the hotel ID
     * @return Optional containing the latest configuration
     */
    @Query("SELECT hpc FROM HotelPricingConfig hpc " +
           "WHERE hpc.hotel.id = :hotelId " +
           "ORDER BY hpc.version DESC, hpc.createdAt DESC")
    Optional<HotelPricingConfig> findLatestConfigurationByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Custom query to expire all current configurations for a hotel
     * This is used when creating a new configuration
     * 
     * @param hotelId the hotel ID
     * @param updatedBy the user making the change
     * @return number of configurations expired
     */
    @Modifying
    @Query("UPDATE HotelPricingConfig hpc " +
           "SET hpc.effectiveUntil = :now, " +
           "    hpc.updatedBy = :updatedBy, " +
           "    hpc.updatedAt = :now " +
           "WHERE hpc.hotel.id = :hotelId " +
           "AND (hpc.effectiveUntil IS NULL OR hpc.effectiveUntil > :now)")
    int deactivateAllConfigurationsForHotel(
        @Param("hotelId") Long hotelId,
        @Param("updatedBy") String updatedBy,
        @Param("now") LocalDateTime now
    );

    /**
     * Find configurations created by a specific user
     * 
     * @param createdBy the username
     * @return List of configurations created by the user
     */
    List<HotelPricingConfig> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    /**
     * Find configurations last updated by a specific user
     * 
     * @param updatedBy the username
     * @return List of configurations updated by the user
     */
    List<HotelPricingConfig> findByUpdatedByOrderByUpdatedAtDesc(String updatedBy);
}