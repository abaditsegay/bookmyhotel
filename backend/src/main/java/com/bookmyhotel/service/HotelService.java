package com.bookmyhotel.service;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Hotel Service for hotel-centric operations
 */
@Service
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    /**
     * Get hotel by ID
     */
    public Optional<Hotel> getHotelById(Long hotelId) {
        if (hotelId == null) {
            throw new IllegalArgumentException("Hotel ID cannot be null");
        }
        return hotelRepository.findByIdAndIsActiveTrue(hotelId);
    }

    /**
     * Get all active hotels
     */
    public List<Hotel> getAllActiveHotels() {
        return hotelRepository.findAll().stream()
                .filter(Hotel::getIsActive)
                .toList();
    }

    /**
     * Get hotels by tenant ID (for admin operations)
     */
    public List<Hotel> getHotelsByTenantId(String tenantId) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalArgumentException("Tenant ID cannot be null or empty");
        }
        return hotelRepository.findByTenant_IdAndIsActiveTrue(tenantId);
    }

    /**
     * Check if a hotel exists and is active
     */
    public boolean isHotelActiveAndExists(Long hotelId) {
        if (hotelId == null) {
            return false;
        }
        return hotelRepository.findByIdAndIsActiveTrue(hotelId).isPresent();
    }

    /**
     * Get the tenant ID for a hotel (backward compatibility helper)
     */
    public String getTenantIdFromHotel(Long hotelId) {
        return hotelRepository.findByIdAndIsActiveTrue(hotelId)
                .map(Hotel::getTenantId)
                .orElse(null);
    }

    /**
     * Get hotel ID by tenant ID (backward compatibility method)
     * 
     * @deprecated Use hotel-centric methods instead
     */
    @Deprecated
    public Long getHotelIdByTenantId(String tenantId) {
        if (tenantId == null || tenantId.trim().isEmpty()) {
            return null;
        }

        List<Hotel> hotels = hotelRepository.findByTenant_IdAndIsActiveTrue(tenantId);
        // Return the first active hotel for the tenant
        return hotels.isEmpty() ? null : hotels.get(0).getId();
    }
}
