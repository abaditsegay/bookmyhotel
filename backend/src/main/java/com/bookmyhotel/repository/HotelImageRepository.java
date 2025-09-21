package com.bookmyhotel.repository;

import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.enums.ImageCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for HotelImage entity operations
 * Provides multi-tenant aware queries for hotel and room type images
 */
@Repository
public interface HotelImageRepository extends JpaRepository<HotelImage, Long> {

    /**
     * Find all active images for a specific hotel within a tenant
     */
    List<HotelImage> findByTenantIdAndHotelIdAndIsActiveTrueOrderByDisplayOrderAsc(
            String tenantId, Long hotelId);

    /**
     * Find all active hotel images (not room type specific) for a hotel
     */
    List<HotelImage> findByTenantIdAndHotelIdAndRoomTypeIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc(
            String tenantId, Long hotelId);

    /**
     * Find all active room type images for a specific room type
     */
    List<HotelImage> findByTenantIdAndHotelIdAndRoomTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(
            String tenantId, Long hotelId, Long roomTypeId);

    /**
     * Find hero image for hotel
     */
    Optional<HotelImage> findByTenantIdAndHotelIdAndImageCategoryAndIsActiveTrue(
            String tenantId, Long hotelId, ImageCategory imageCategory);

    /**
     * Find hero image for room type
     */
    Optional<HotelImage> findByTenantIdAndHotelIdAndRoomTypeIdAndImageCategoryAndIsActiveTrue(
            String tenantId, Long hotelId, Long roomTypeId, ImageCategory imageCategory);

    /**
     * Find all gallery images for hotel
     */
    List<HotelImage> findByTenantIdAndHotelIdAndImageCategoryAndIsActiveTrueOrderByDisplayOrderAsc(
            String tenantId, Long hotelId, ImageCategory imageCategory);

    /**
     * Find all gallery images for room type
     */
    List<HotelImage> findByTenantIdAndHotelIdAndRoomTypeIdAndImageCategoryAndIsActiveTrueOrderByDisplayOrderAsc(
            String tenantId, Long hotelId, Long roomTypeId, ImageCategory imageCategory);

    /**
     * Count active images for a hotel
     */
    long countByTenantIdAndHotelIdAndIsActiveTrue(String tenantId, Long hotelId);

    /**
     * Count active images for a room type
     */
    long countByTenantIdAndHotelIdAndRoomTypeIdAndIsActiveTrue(
            String tenantId, Long hotelId, Long roomTypeId);

    /**
     * Find all images by file path (useful for cleanup operations)
     */
    List<HotelImage> findByFilePath(String filePath);

    /**
     * Custom query to get images grouped by category for a hotel
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.tenantId = :tenantId " +
            "AND hi.hotelId = :hotelId AND hi.roomTypeId IS NULL " +
            "AND hi.isActive = true ORDER BY hi.imageCategory, hi.displayOrder")
    List<HotelImage> findHotelImagesGroupedByCategory(
            @Param("tenantId") String tenantId,
            @Param("hotelId") Long hotelId);

    /**
     * Custom query to get images grouped by category for a room type
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.tenantId = :tenantId " +
            "AND hi.hotelId = :hotelId AND hi.roomTypeId = :roomTypeId " +
            "AND hi.isActive = true ORDER BY hi.imageCategory, hi.displayOrder")
    List<HotelImage> findRoomTypeImagesGroupedByCategory(
            @Param("tenantId") String tenantId,
            @Param("hotelId") Long hotelId,
            @Param("roomTypeId") Long roomTypeId);

    /**
     * Get the next display order for a specific image category
     */
    @Query("SELECT COALESCE(MAX(hi.displayOrder), 0) + 1 FROM HotelImage hi " +
            "WHERE hi.tenantId = :tenantId AND hi.hotelId = :hotelId " +
            "AND hi.imageCategory = :imageCategory " +
            "AND (:roomTypeId IS NULL AND hi.roomTypeId IS NULL OR hi.roomTypeId = :roomTypeId)")
    Integer getNextDisplayOrder(
            @Param("tenantId") String tenantId,
            @Param("hotelId") Long hotelId,
            @Param("roomTypeId") Long roomTypeId,
            @Param("imageCategory") ImageCategory imageCategory);

    /**
     * Check if hotel already has a hero image
     */
    boolean existsByTenantIdAndHotelIdAndRoomTypeIdIsNullAndImageCategoryAndIsActiveTrue(
            String tenantId, Long hotelId, ImageCategory imageCategory);

    /**
     * Check if room type already has a hero image
     */
    boolean existsByTenantIdAndHotelIdAndRoomTypeIdAndImageCategoryAndIsActiveTrue(
            String tenantId, Long hotelId, Long roomTypeId, ImageCategory imageCategory);

    /**
     * Delete all images for a hotel (for cleanup)
     */
    void deleteByTenantIdAndHotelId(String tenantId, Long hotelId);

    /**
     * Delete all images for a room type (for cleanup)
     */
    void deleteByTenantIdAndHotelIdAndRoomTypeId(String tenantId, Long hotelId, Long roomTypeId);
}