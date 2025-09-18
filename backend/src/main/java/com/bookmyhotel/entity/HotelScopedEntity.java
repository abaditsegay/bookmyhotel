package com.bookmyhotel.entity;

import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.NotNull;

/**
 * Base entity for hotel-scoped entities
 * 
 * Replaces the direct tenant relationship with a hotel relationship.
 * All entities that previously extended TenantEntity should now extend this
 * class.
 * Access to tenant is now through: entity -> hotel -> tenant
 * 
 * This provides:
 * - Proper data isolation through hotel relationship
 * - Simplified multi-tenancy (tenant -> hotel -> entity)
 * - Better business logic alignment (entities belong to hotels, not directly to
 * tenants)
 */
@MappedSuperclass
public abstract class HotelScopedEntity extends BaseEntity {

    @NotNull(message = "Hotel is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @PrePersist
    public void prePersist() {
        super.prePersist(); // Call BaseEntity's prePersist
        // Additional hotel-scoped entity logic can be added here if needed
    }

    @PreUpdate
    public void preUpdate() {
        super.preUpdate(); // Call BaseEntity's preUpdate
    }

    // Getters and Setters
    public Hotel getHotel() {
        return hotel;
    }

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }

    /**
     * Convenience method to get hotel ID
     */
    public Long getHotelId() {
        return hotel != null ? hotel.getId() : null;
    }

    /**
     * Convenience method to get tenant ID through hotel relationship
     */
    public String getTenantId() {
        return hotel != null ? hotel.getTenantId() : null;
    }
}
