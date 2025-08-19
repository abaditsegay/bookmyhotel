package com.bookmyhotel.entity;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

import com.bookmyhotel.tenant.TenantContext;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

/**
 * Base entity for tenant-scoped entities
 */
@MappedSuperclass
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public abstract class TenantEntity extends BaseEntity {
    
    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;
    
    @PrePersist
    public void prePersist() {
        super.prePersist(); // Call BaseEntity's prePersist
        if (this.tenantId == null) {
            this.tenantId = TenantContext.getTenantId();
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        super.preUpdate(); // Call BaseEntity's preUpdate
    }
    
    // Getters and Setters
    public String getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
}
