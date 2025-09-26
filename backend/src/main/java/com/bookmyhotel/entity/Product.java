package com.bookmyhotel.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Product entity for hotel shop
 */
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_hotel", columnList = "hotel_id"),
        @Index(name = "idx_product_category", columnList = "category"),
        @Index(name = "idx_product_active", columnList = "is_active")
})
public class Product extends HotelScopedEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ProductCategory category;

    @NotNull(message = "Price is required")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @PositiveOrZero(message = "Stock quantity must be zero or positive")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @PositiveOrZero(message = "Minimum stock level must be zero or positive")
    @Column(name = "minimum_stock_level", nullable = false)
    private Integer minimumStockLevel = 0;

    @Column(name = "sku", length = 50, unique = true)
    private String sku; // Stock Keeping Unit

    @Lob
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "weight_grams")
    private Integer weightGrams; // For shipping calculations if needed

    // Constructors
    public Product() {
    }

    public Product(String name, String description, ProductCategory category,
            BigDecimal price, Integer stockQuantity, Hotel hotel) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.setHotel(hotel);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getMinimumStockLevel() {
        return minimumStockLevel;
    }

    public void setMinimumStockLevel(Integer minimumStockLevel) {
        this.minimumStockLevel = minimumStockLevel;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public BigDecimal getWeightKg() {
        return weightGrams != null ? new BigDecimal(weightGrams).divide(new BigDecimal(1000)) : null;
    }

    public void setWeightKg(BigDecimal weightKg) {
        this.weightGrams = weightKg != null ? weightKg.multiply(new BigDecimal(1000)).intValue() : null;
    }

    public Integer getWeightGrams() {
        return weightGrams;
    }

    public void setWeightGrams(Integer weightGrams) {
        this.weightGrams = weightGrams;
    }

    /**
     * Check if product is available (active, explicitly available, and has stock)
     */
    public boolean isAvailable() {
        return isActive && isAvailable && stockQuantity > 0;
    }

    /**
     * Check if a specific quantity can be ordered (as long as stock doesn't go to 0)
     */
    public boolean canOrderQuantity(int quantity) {
        return stockQuantity - quantity >= 0;
    }

    /**
     * Get available quantity that can be ordered (all current stock)
     */
    public int getAvailableQuantityForOrder() {
        return Math.max(0, stockQuantity);
    }

    /**
     * Reduce stock quantity (allows going to 0 but not negative)
     */
    public boolean reduceStock(int quantity) {
        if (canOrderQuantity(quantity)) {
            stockQuantity -= quantity;
            return true;
        }
        return false;
    }

    /**
     * Increase stock quantity
     */
    public void increaseStock(int quantity) {
        stockQuantity += quantity;
    }
}
