-- Migration to assign proper GUID-based tenant IDs to existing hotels with "default" tenant_id
-- This ensures all hotels have unique tenant identifiers for proper multi-tenant isolation

-- Create a temporary table to generate UUIDs for each hotel that needs updating
CREATE TEMPORARY TABLE temp_hotel_tenants AS
SELECT id, UUID() as new_tenant_id 
FROM hotels 
WHERE tenant_id = 'default';

-- Update hotels table with new GUID tenant IDs
UPDATE hotels h
JOIN temp_hotel_tenants tht ON h.id = tht.id
SET h.tenant_id = tht.new_tenant_id
WHERE h.tenant_id = 'default';

-- Insert corresponding tenant records for the updated hotels
INSERT INTO tenants (tenant_id, name, subdomain, description, is_active, created_at, updated_at)
SELECT 
    h.tenant_id,
    CONCAT('tenant-', h.name),
    LOWER(REPLACE(REPLACE(h.name, ' ', '-'), '.', '')),
    CONCAT('Tenant for ', h.name),
    1,
    NOW(),
    NOW()
FROM hotels h
JOIN temp_hotel_tenants tht ON h.id = tht.id
WHERE h.tenant_id = tht.new_tenant_id;

-- Clean up temporary table
DROP TEMPORARY TABLE temp_hotel_tenants;
