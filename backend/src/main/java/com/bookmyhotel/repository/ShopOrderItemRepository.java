package com.bookmyhotel.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.ShopOrderItem;

/**
 * Repository interface for ShopOrderItem entity operations
 */
@Repository
public interface ShopOrderItemRepository extends JpaRepository<ShopOrderItem, Long> {
    
    /**
     * Find all order items by order ID
     */
    List<ShopOrderItem> findByOrderId(Long orderId);
    
    /**
     * Find all order items by product ID
     */
    List<ShopOrderItem> findByProductId(Long productId);
    
    /**
     * Find order items by hotel ID (through order relationship)
     */
    @Query("SELECT oi FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId")
    List<ShopOrderItem> findByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Find order items by hotel ID within date range
     */
    @Query("SELECT oi FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    List<ShopOrderItem> findByHotelIdAndDateRange(@Param("hotelId") Long hotelId, 
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    /**
     * Calculate total quantity sold for a product
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.productId = :productId AND oi.order.isPaid = true")
    Integer calculateTotalQuantitySoldForProduct(@Param("productId") Long productId);
    
    /**
     * Calculate total quantity sold for a product within date range
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.productId = :productId AND oi.order.isPaid = true AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    Integer calculateQuantitySoldForProductInDateRange(@Param("productId") Long productId, 
                                                       @Param("startDate") LocalDateTime startDate, 
                                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * Calculate total revenue for a product
     */
    @Query("SELECT COALESCE(SUM(oi.unitPrice * oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.productId = :productId AND oi.order.isPaid = true")
    BigDecimal calculateTotalRevenueForProduct(@Param("productId") Long productId);
    
    /**
     * Calculate total revenue for a product within date range
     */
    @Query("SELECT COALESCE(SUM(oi.unitPrice * oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.productId = :productId AND oi.order.isPaid = true AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueForProductInDateRange(@Param("productId") Long productId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find top selling products by hotel ID
     */
    @Query("SELECT oi.productId, oi.productName, COALESCE(SUM(oi.quantity), 0) as totalSold " +
           "FROM ShopOrderItem oi " +
           "WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true " +
           "GROUP BY oi.productId, oi.productName " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProductsByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Find top selling products by hotel ID within date range
     */
    @Query("SELECT oi.productId, oi.productName, COALESCE(SUM(oi.quantity), 0) as totalSold " +
           "FROM ShopOrderItem oi " +
           "WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true " +
           "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.productId, oi.productName " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProductsByHotelIdInDateRange(@Param("hotelId") Long hotelId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find top revenue generating products by hotel ID
     */
    @Query("SELECT oi.productId, oi.productName, COALESCE(SUM(oi.unitPrice * oi.quantity), 0) as totalRevenue " +
           "FROM ShopOrderItem oi " +
           "WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true " +
           "GROUP BY oi.productId, oi.productName " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findTopRevenueProductsByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Find top revenue generating products by hotel ID within date range
     */
    @Query("SELECT oi.productId, oi.productName, COALESCE(SUM(oi.unitPrice * oi.quantity), 0) as totalRevenue " +
           "FROM ShopOrderItem oi " +
           "WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true " +
           "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.productId, oi.productName " +
           "ORDER BY totalRevenue DESC")
    List<Object[]> findTopRevenueProductsByHotelIdInDateRange(@Param("hotelId") Long hotelId, 
                                                              @Param("startDate") LocalDateTime startDate, 
                                                              @Param("endDate") LocalDateTime endDate);
    
    /**
     * Calculate total items sold by hotel ID
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true")
    Long calculateTotalItemsSoldByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Calculate total items sold by hotel ID today
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true AND DATE(oi.order.createdAt) = CURRENT_DATE")
    Long calculateTotalItemsSoldTodayByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Calculate total items sold by hotel ID within date range
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true AND oi.order.createdAt BETWEEN :startDate AND :endDate")
    Long calculateTotalItemsSoldByHotelIdInDateRange(@Param("hotelId") Long hotelId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find sales data grouped by date for charts/reports
     */
    @Query("SELECT DATE(oi.order.createdAt) as saleDate, COALESCE(SUM(oi.quantity), 0) as itemsSold, COALESCE(SUM(oi.unitPrice * oi.quantity), 0) as revenue " +
           "FROM ShopOrderItem oi " +
           "WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true " +
           "AND oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(oi.order.createdAt) " +
           "ORDER BY saleDate")
    List<Object[]> findSalesDataByHotelIdInDateRange(@Param("hotelId") Long hotelId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count distinct products sold by hotel ID
     */
    @Query("SELECT COUNT(DISTINCT oi.productId) FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId AND oi.order.isPaid = true")
    Long countDistinctProductsSoldByHotelId(@Param("hotelId") Long hotelId);
    
    /**
     * Count total order items by hotel ID
     */
    @Query("SELECT COUNT(oi) FROM ShopOrderItem oi WHERE oi.order.hotel.id = :hotelId")
    Long countOrderItemsByHotelId(@Param("hotelId") Long hotelId);
}
