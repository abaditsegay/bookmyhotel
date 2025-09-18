package com.bookmyhotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.PromotionalCode;
import com.bookmyhotel.entity.RoomType;

/**
 * Repository for managing PromotionalCode entities
 */
@Repository
public interface PromotionalCodeRepository extends JpaRepository<PromotionalCode, Long> {

       /**
        * Find promotional code by code string
        */
       Optional<PromotionalCode> findByCodeAndIsActiveTrue(String code);

       /**
        * Find promotional code by code string for a specific hotel
        */
       Optional<PromotionalCode> findByCodeAndHotelIdAndIsActiveTrue(String code, Long hotelId);

       /**
        * Find all active promotional codes for a hotel
        */
       List<PromotionalCode> findByHotelIdAndIsActiveTrueOrderByCreatedAtDesc(Long hotelId);

       /**
        * Find active promotional codes valid for a specific date
        */
       @Query("SELECT pc FROM PromotionalCode pc WHERE pc.hotelId = :hotelId " +
                     "AND pc.isActive = true " +
                     "AND pc.validFrom <= :date " +
                     "AND pc.validTo >= :date " +
                     "AND (pc.usageLimit IS NULL OR pc.usageCount < pc.usageLimit)")
       List<PromotionalCode> findActiveCodesForDate(@Param("hotelId") Long hotelId,
                     @Param("date") LocalDate date);

       /**
        * Find promotional codes for a specific room type
        */
       @Query("SELECT pc FROM PromotionalCode pc WHERE pc.hotelId = :hotelId " +
                     "AND pc.isActive = true " +
                     "AND (pc.applicableRoomType IS NULL OR pc.applicableRoomType = :roomType) " +
                     "AND pc.validFrom <= :date " +
                     "AND pc.validTo >= :date " +
                     "AND (pc.usageLimit IS NULL OR pc.usageCount < pc.usageLimit)")
       List<PromotionalCode> findActiveCodesForRoomTypeAndDate(@Param("hotelId") Long hotelId,
                     @Param("roomType") RoomType roomType,
                     @Param("date") LocalDate date);

       /**
        * Count usage of a promotional code by a specific customer email
        */
       @Query("SELECT COUNT(r) FROM Reservation r WHERE r.promotionalCode = :code " +
                     "AND r.guest.email = :customerEmail")
       Integer countUsageByCustomer(@Param("code") String code, @Param("customerEmail") String customerEmail);

       /**
        * Check if customer is first time customer (has no previous bookings)
        */
       @Query("SELECT COUNT(r) FROM Reservation r WHERE r.guest.email = :customerEmail " +
                     "AND ((r.assignedRoom IS NOT NULL AND r.assignedRoom.hotel.id = :hotelId) OR " +
                     "(r.assignedRoom IS NULL AND r.hotel.id = :hotelId))")
       Integer countPreviousBookingsByCustomer(@Param("customerEmail") String customerEmail,
                     @Param("hotelId") Long hotelId);

       /**
        * Find promotional codes that are about to expire (within specified days)
        */
       @Query("SELECT pc FROM PromotionalCode pc WHERE pc.hotelId = :hotelId " +
                     "AND pc.isActive = true " +
                     "AND pc.validTo BETWEEN :currentDate AND :expiryDate")
       List<PromotionalCode> findExpiringCodes(@Param("hotelId") Long hotelId,
                     @Param("currentDate") LocalDate currentDate,
                     @Param("expiryDate") LocalDate expiryDate);

       /**
        * Find promotional codes with low usage (usage count below threshold)
        */
       @Query("SELECT pc FROM PromotionalCode pc WHERE pc.hotelId = :hotelId " +
                     "AND pc.isActive = true " +
                     "AND pc.usageLimit IS NOT NULL " +
                     "AND pc.usageCount < :usageThreshold")
       List<PromotionalCode> findLowUsageCodes(@Param("hotelId") Long hotelId,
                     @Param("usageThreshold") Integer usageThreshold);
}
