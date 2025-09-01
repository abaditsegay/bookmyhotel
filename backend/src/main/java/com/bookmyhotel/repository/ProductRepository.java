package com.bookmyhotel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bookmyhotel.entity.Product;
import com.bookmyhotel.entity.ProductCategory;

/**
 * Repository interface for Product entity operations
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

       /**
        * Find all products by hotel ID
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId")
       List<Product> findByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Find all products by hotel ID with pagination
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId")
       Page<Product> findByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find all active products by hotel ID
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true")
       List<Product> findByHotelIdAndIsActiveTrue(@Param("hotelId") Long hotelId);

       /**
        * Find all active products by hotel ID with pagination
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true")
       Page<Product> findByHotelIdAndIsActiveTrue(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find all available products by hotel ID (active and in stock)
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity > 0")
       List<Product> findAvailableProductsByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Find all available products by hotel ID with pagination
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity > 0")
       Page<Product> findAvailableProductsByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

       /**
        * Find products by hotel ID and category
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.category = :category")
       List<Product> findByHotelIdAndCategory(@Param("hotelId") Long hotelId,
                     @Param("category") ProductCategory category);

       /**
        * Find products by hotel ID and category with pagination
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.category = :category")
       Page<Product> findByHotelIdAndCategory(@Param("hotelId") Long hotelId,
                     @Param("category") ProductCategory category, Pageable pageable);

       /**
        * Find active products by hotel ID and category
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.category = :category AND p.isActive = true")
       List<Product> findByHotelIdAndCategoryAndIsActiveTrue(@Param("hotelId") Long hotelId,
                     @Param("category") ProductCategory category);

       /**
        * Find available products by hotel ID and category
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.category = :category AND p.isActive = true AND p.stockQuantity > 0")
       List<Product> findAvailableProductsByHotelIdAndCategory(@Param("hotelId") Long hotelId,
                     @Param("category") ProductCategory category);

       /**
        * Find product by hotel ID and SKU
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.sku = :sku")
       Optional<Product> findByHotelIdAndSku(@Param("hotelId") Long hotelId, @Param("sku") String sku);

       /**
        * Find products by hotel ID and name containing (case insensitive)
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       List<Product> findByHotelIdAndNameContainingIgnoreCase(@Param("hotelId") Long hotelId,
                     @Param("name") String name);

       /**
        * Find products by hotel ID and name containing with pagination
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
       Page<Product> findByHotelIdAndNameContainingIgnoreCase(@Param("hotelId") Long hotelId,
                     @Param("name") String name, Pageable pageable);

       /**
        * Search products by hotel ID, name, description, or SKU
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(p.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
       List<Product> searchProductsByHotelId(@Param("hotelId") Long hotelId, @Param("searchTerm") String searchTerm);

       /**
        * Search products by hotel ID with pagination
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND " +
                     "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(p.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
       Page<Product> searchProductsByHotelId(@Param("hotelId") Long hotelId, @Param("searchTerm") String searchTerm,
                     Pageable pageable);

       /**
        * Count products by hotel ID
        */
       @Query("SELECT COUNT(p) FROM Product p WHERE p.hotel.id = :hotelId")
       long countByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Count active products by hotel ID
        */
       @Query("SELECT COUNT(p) FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true")
       long countByHotelIdAndIsActiveTrue(@Param("hotelId") Long hotelId);

       /**
        * Count available products by hotel ID
        */
       @Query("SELECT COUNT(p) FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity > 0")
       long countAvailableProductsByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Count products by hotel ID and category
        */
       @Query("SELECT COUNT(p) FROM Product p WHERE p.hotel.id = :hotelId AND p.category = :category")
       long countByHotelIdAndCategory(@Param("hotelId") Long hotelId, @Param("category") ProductCategory category);

       /**
        * Find products with low stock by hotel ID
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity <= :threshold")
       List<Product> findLowStockProductsByHotelId(@Param("hotelId") Long hotelId,
                     @Param("threshold") Integer threshold);

       /**
        * Find out of stock products by hotel ID
        */
       @Query("SELECT p FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity = 0")
       List<Product> findOutOfStockProductsByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Count products with low stock by hotel ID
        */
       @Query("SELECT COUNT(p) FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity <= :threshold")
       long countLowStockProductsByHotelId(@Param("hotelId") Long hotelId, @Param("threshold") Integer threshold);

       /**
        * Count out of stock products by hotel ID
        */
       @Query("SELECT COUNT(p) FROM Product p WHERE p.hotel.id = :hotelId AND p.isActive = true AND p.stockQuantity = 0")
       long countOutOfStockProductsByHotelId(@Param("hotelId") Long hotelId);

       /**
        * Check if SKU exists for hotel (excluding specific product ID for updates)
        */
       @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.hotel.id = :hotelId AND p.sku = :sku AND p.id != :productId")
       boolean existsByHotelIdAndSkuAndIdNot(@Param("hotelId") Long hotelId, @Param("sku") String sku,
                     @Param("productId") Long productId);

       /**
        * Check if SKU exists for hotel
        */
       @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.hotel.id = :hotelId AND p.sku = :sku")
       boolean existsByHotelIdAndSku(@Param("hotelId") Long hotelId, @Param("sku") String sku);
}
