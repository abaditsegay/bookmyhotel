package com.bookmyhotel.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.OrderStatus;
import com.bookmyhotel.entity.PaymentMethod;
import com.bookmyhotel.entity.ShopOrder;

/**
 * Repository interface for ShopOrder entity operations
 */
@Repository
public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

       /**
        * Find all orders by hotel ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId")
       List<ShopOrder> findByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Find order by ID and hotel ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.id = :id AND o.hotel.id = :hotelId")
       Optional<ShopOrder> findByIdAndHotelId(@Param("id") Long id, @Param("hotelId") Long hotelId);

       /**
        * Find all orders by hotel ID with pagination
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId")
       Page<ShopOrder> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find orders by hotel ID and status
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status = :status")
       List<ShopOrder> findByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") OrderStatus status);

       /**
        * Find orders by hotel ID and status with pagination
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status = :status")
       Page<ShopOrder> findByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") OrderStatus status,
                     Pageable pageable);

       /**
        * Find orders by hotel ID and multiple statuses
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status IN :statuses")
       List<ShopOrder> findByHotelIdAndStatusIn(@Param("hotelId") Long hotelId,
                     @Param("statuses") List<OrderStatus> statuses);

       /**
        * Find orders by hotel ID and multiple statuses with pagination
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status IN :statuses")
       Page<ShopOrder> findByHotelIdAndStatusIn(@Param("hotelId") Long hotelId,
                     @Param("statuses") List<OrderStatus> statuses, Pageable pageable);

       /**
        * Find order by hotel ID and order number
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.orderNumber = :orderNumber")
       Optional<ShopOrder> findByHotelIdAndOrderNumber(@Param("hotelId") Long hotelId,
                     @Param("orderNumber") String orderNumber);

       /**
        * Find orders by hotel ID and customer name (case insensitive)
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND LOWER(o.customerName) LIKE LOWER(CONCAT('%', :customerName, '%'))")
       List<ShopOrder> findByHotelIdAndCustomerNameContainingIgnoreCase(@Param("hotelId") Long hotelId,
                     @Param("customerName") String customerName);

       /**
        * Find orders by hotel ID and customer email
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.customerEmail = :customerEmail")
       List<ShopOrder> findByHotelIdAndCustomerEmail(@Param("hotelId") Long hotelId,
                     @Param("customerEmail") String customerEmail);

       /**
        * Find orders by hotel ID and room number
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.roomNumber = :roomNumber")
       List<ShopOrder> findByHotelIdAndRoomNumber(@Param("hotelId") Long hotelId,
                     @Param("roomNumber") String roomNumber);

       /**
        * Find orders by hotel ID and reservation ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.reservation.id = :reservationId")
       List<ShopOrder> findByHotelIdAndReservationId(@Param("hotelId") Long hotelId,
                     @Param("reservationId") Long reservationId);

       /**
        * Find orders by hotel ID and payment method
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.paymentMethod = :paymentMethod")
       List<ShopOrder> findByHotelIdAndPaymentMethod(@Param("hotelId") Long hotelId,
                     @Param("paymentMethod") PaymentMethod paymentMethod);

       /**
        * Find orders by hotel ID and payment status
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isPaid = :isPaid")
       List<ShopOrder> findByHotelIdAndIsPaid(@Param("hotelId") Long hotelId, @Param("isPaid") Boolean isPaid);

       /**
        * Find unpaid orders by hotel ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isPaid = false")
       List<ShopOrder> findByHotelIdAndIsPaidFalse(@Param("hotelId") Long hotelId);

       /**
        * Find paid orders by hotel ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isPaid = true")
       List<ShopOrder> findByHotelIdAndIsPaidTrue(@Param("hotelId") Long hotelId);

       /**
        * Find orders by hotel ID and delivery type
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isDelivery = :isDelivery")
       List<ShopOrder> findByHotelIdAndIsDelivery(@Param("hotelId") Long hotelId,
                     @Param("isDelivery") Boolean isDelivery);

       /**
        * Find orders by hotel ID created within date range
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.createdAt BETWEEN :startDate AND :endDate")
       List<ShopOrder> findByHotelIdAndCreatedAtBetween(@Param("hotelId") Long hotelId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       /**
        * Find orders by hotel ID created within date range with pagination
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.createdAt BETWEEN :startDate AND :endDate")
       Page<ShopOrder> findByHotelIdAndCreatedAtBetween(@Param("hotelId") Long hotelId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate,
                     Pageable pageable);

       /**
        * Find today's orders by hotel ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND DATE(o.createdAt) = CURRENT_DATE")
       List<ShopOrder> findTodaysOrdersByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Search orders by hotel ID (customer name, email, phone, room number, order
        * number)
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND " +
                     "(LOWER(o.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.roomNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
       List<ShopOrder> searchOrdersByHotelId(@Param("hotelId") Long hotelId, @Param("searchTerm") String searchTerm);

       /**
        * Search orders by hotel ID with pagination
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND " +
                     "(LOWER(o.customerName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.customerPhone) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.roomNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
       Page<ShopOrder> searchOrdersByHotelId(@Param("hotelId") Long hotelId, @Param("searchTerm") String searchTerm,
                     Pageable pageable);

       /**
        * Count orders by hotel ID
        */
       @Query("SELECT COUNT(o) FROM ShopOrder o WHERE o.hotel.id = :hotelId")
       long countByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Count orders by hotel ID and status
        */
       @Query("SELECT COUNT(o) FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status = :status")
       long countByHotelIdAndStatus(@Param("hotelId") Long hotelId, @Param("status") OrderStatus status);

       /**
        * Count today's orders by hotel ID
        */
       @Query("SELECT COUNT(o) FROM ShopOrder o WHERE o.hotel.id = :hotelId AND DATE(o.createdAt) = CURRENT_DATE")
       long countTodaysOrdersByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Calculate total revenue by hotel ID
        */
       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isPaid = true")
       BigDecimal calculateTotalRevenueByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Calculate today's revenue by hotel ID
        */
       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isPaid = true AND DATE(o.createdAt) = CURRENT_DATE")
       BigDecimal calculateTodaysRevenueByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Calculate revenue by hotel ID within date range
        */
       @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isPaid = true AND o.createdAt BETWEEN :startDate AND :endDate")
       BigDecimal calculateRevenueByHotelIdAndDateRange(@Param("hotelId") Long hotelId,
                     @Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       /**
        * Find pending orders by hotel ID (orders that need attention)
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status IN (:pendingStatuses)")
       List<ShopOrder> findPendingOrdersByHotelId(@Param("hotelId") Long hotelId,
                     @Param("pendingStatuses") List<OrderStatus> pendingStatuses);

       /**
        * Find orders ready for delivery by hotel ID
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.status = :status AND o.isDelivery = true")
       List<ShopOrder> findByHotelIdAndStatusAndIsDeliveryTrue(@Param("hotelId") Long hotelId,
                     @Param("status") OrderStatus status);

       /**
        * Find orders scheduled for delivery within time range
        */
       @Query("SELECT o FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.isDelivery = true AND o.deliveryTime BETWEEN :startTime AND :endTime")
       List<ShopOrder> findOrdersScheduledForDelivery(@Param("hotelId") Long hotelId,
                     @Param("startTime") LocalDateTime startTime,
                     @Param("endTime") LocalDateTime endTime);

       /**
        * Check if order number exists for hotel
        */
       @Query("SELECT COUNT(o) > 0 FROM ShopOrder o WHERE o.hotel.id = :hotelId AND o.orderNumber = :orderNumber")
       boolean existsByHotelIdAndOrderNumber(@Param("hotelId") Long hotelId, @Param("orderNumber") String orderNumber);

       /**
        * Find shop order by ID with order items eagerly loaded
        */
       @Query("SELECT o FROM ShopOrder o LEFT JOIN FETCH o.orderItems WHERE o.id = :id")
       Optional<ShopOrder> findByIdWithOrderItems(@Param("id") Long id);
}
