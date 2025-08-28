package com.bookmyhotel.entity;

import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import com.bookmyhotel.tenant.TenantContext;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

/**
 * Base entity for tenant-scoped entities with UUID primary key
 * 
 * Combines UUID benefits with multi-tenant isolation:
 * - UUID primary keys for global uniqueness and security
 * - Automatic tenant filtering for data isolation
 * - Proper inheritance structure for entity management
 */
@MappedSuperclass
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public abstract class TenantUUIDEntity extends BaseUUIDEntity {

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @PrePersist
    public void prePersist() {
        super.prePersist(); // Call BaseUUIDEntity's prePersist
        // Only set tenant ID from context if not explicitly set
        // This prevents overriding explicitly assigned tenant IDs during entity
        // creation
        if (this.tenantId == null || this.tenantId.trim().isEmpty()) {
            String contextTenantId = TenantContext.getTenantId();
            if (contextTenantId != null && !contextTenantId.trim().isEmpty()) {
                this.tenantId = contextTenantId;
            }
        }
    }

    @PreUpdate
    public void preUpdate() {
        super.preUpdate(); // Call BaseUUIDEntity's preUpdate
    }

    // Getters and Setters
    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
