package com.bookmyhotel.entity;

import jakarta.persistence.MappedSuperclass;

/**
 * Base entity for system-wide entities (not tenant-bound)
 * Used for entities like GUEST and ADMIN users that operate across all tenants
 */
@MappedSuperclass
public abstract class SystemEntity extends BaseEntity {
    
    // This class extends BaseEntity but doesn't include tenant_id
    // System-wide entities are not filtered by tenant context
}
