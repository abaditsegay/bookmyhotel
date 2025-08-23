package com.bookmyhotel.service;

import com.bookmyhotel.entity.Ad;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.repository.AdRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.dto.AdRequest;
import com.bookmyhotel.dto.AdResponse;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing advertisements
 */
@Service
@Transactional
public class AdService {

    private static final Logger logger = LoggerFactory.getLogger(AdService.class);

    @Autowired
    private AdRepository adRepository;

    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private TenantRepository tenantRepository;

    /**
     * Get random active ads for homepage display
     */
    @Transactional(readOnly = true)
    public List<AdResponse> getRandomActiveAds(int limit) {
        logger.debug("Fetching {} random active ads", limit);
        
        List<Ad> ads = adRepository.findRandomActiveAds(LocalDate.now());
        
        return ads.stream()
                .limit(limit)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all ads for current tenant
     */
    @Transactional(readOnly = true)
    public List<AdResponse> getAllAds() {
        logger.debug("Fetching all ads");
        
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return List.of();
        }
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        
        List<Ad> ads = adRepository.findByTenantOrderByCreatedAtDesc(tenant);
        
        return ads.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get ads by hotel
     */
    @Transactional(readOnly = true)
    public List<AdResponse> getAdsByHotel(Long hotelId) {
        logger.debug("Fetching ads for hotel {}", hotelId);
        
        List<Ad> ads = adRepository.findActiveAdsByHotelId(hotelId, LocalDate.now());
        
        return ads.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get ad by ID
     */
    @Transactional(readOnly = true)
    public AdResponse getAdById(Long id) {
        logger.debug("Fetching ad with id {}", id);
        
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found"));
        
        return convertToResponse(ad);
    }

    /**
     * Create new ad
     */
    public AdResponse createAd(AdRequest request) {
        logger.debug("Creating new ad for hotel {}", request.getHotelId());
        
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        
        // Verify hotel exists
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
        
        // Verify tenant exists
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

        Ad ad = new Ad();
        ad.setTitle(request.getTitle());
        ad.setDescription(request.getDescription());
        ad.setImageUrl(request.getImageUrl());
        ad.setHotel(hotel);
        ad.setTenant(tenant);
        ad.setOriginalPrice(request.getOriginalPrice());
        ad.setDiscountPercentage(request.getDiscountPercentage());
        ad.setValidUntil(request.getValidUntil());
        ad.setPriorityLevel(request.getPriorityLevel() != null ? request.getPriorityLevel() : 1);
        ad.setIsActive(true);
        ad.setClickCount(0);

        Ad savedAd = adRepository.save(ad);
        logger.debug("Created ad with id {}", savedAd.getId());

        return convertToResponse(savedAd);
    }

    /**
     * Update ad
     */
    public AdResponse updateAd(Long id, AdRequest request) {
        logger.debug("Updating ad with id {}", id);
        
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found"));

        // Update hotel if changed
        if (request.getHotelId() != null && !request.getHotelId().equals(ad.getHotel().getId())) {
            Hotel hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
            ad.setHotel(hotel);
        }

        // Update other fields
        if (request.getTitle() != null) {
            ad.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            ad.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            ad.setImageUrl(request.getImageUrl());
        }
        if (request.getOriginalPrice() != null) {
            ad.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getDiscountPercentage() != null) {
            ad.setDiscountPercentage(request.getDiscountPercentage());
        }
        if (request.getValidUntil() != null) {
            ad.setValidUntil(request.getValidUntil());
        }
        if (request.getPriorityLevel() != null) {
            ad.setPriorityLevel(request.getPriorityLevel());
        }

        Ad savedAd = adRepository.save(ad);
        logger.debug("Updated ad with id {}", savedAd.getId());

        return convertToResponse(savedAd);
    }

    /**
     * Delete ad
     */
    public void deleteAd(Long id) {
        logger.debug("Deleting ad with id {}", id);
        
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found"));

        adRepository.delete(ad);
        logger.debug("Deleted ad with id {}", id);
    }

    /**
     * Toggle ad active status
     */
    public AdResponse toggleAdStatus(Long id) {
        logger.debug("Toggling status for ad with id {}", id);
        
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found"));

        ad.setIsActive(!ad.getIsActive());
        Ad savedAd = adRepository.save(ad);
        
        logger.debug("Toggled ad {} status to {}", id, savedAd.getIsActive());
        return convertToResponse(savedAd);
    }

    /**
     * Track ad click
     */
    public void trackClick(Long id) {
        logger.debug("Tracking click for ad {}", id);
        
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found"));

        ad.incrementClickCount();
        adRepository.save(ad);
        
        logger.debug("Incremented click count for ad {}", id);
    }

    /**
     * Get active ads for current tenant
     */
    @Transactional(readOnly = true)
    public List<AdResponse> getActiveAds() {
        logger.debug("Fetching active ads");
        
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return List.of();
        }
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
        
        List<Ad> ads = adRepository.findActiveValidAdsByTenant(tenant, LocalDate.now());
        
        return ads.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Ad entity to AdResponse DTO
     */
    private AdResponse convertToResponse(Ad ad) {
        AdResponse response = new AdResponse();
        response.setId(ad.getId());
        response.setTitle(ad.getTitle());
        response.setDescription(ad.getDescription());
        response.setImageUrl(ad.getImageUrl());
        
        if (ad.getHotel() != null) {
            response.setHotelId(ad.getHotel().getId());
            response.setHotelName(ad.getHotel().getName());
        }
        
        response.setDiscountPercentage(ad.getDiscountPercentage());
        response.setOriginalPrice(ad.getOriginalPrice());
        response.setDiscountedPrice(ad.getDiscountedPrice());
        response.setValidUntil(ad.getValidUntil());
        response.setPriorityLevel(ad.getPriorityLevel());
        response.setIsActive(ad.getIsActive());
        response.setClickCount(ad.getClickCount());
        response.setCreatedAt(ad.getCreatedAt());
        response.setUpdatedAt(ad.getUpdatedAt());
        
        return response;
    }
}
