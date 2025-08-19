-- V19: Fix tenant-hotel relationship to match frontend expectations
-- Each hotel should be its own tenant as defined in the frontend TenantContext

-- First, ensure the tenants table has the correct tenant records
-- Clear existing tenants and insert the correct ones from frontend context
DELETE FROM tenants;

INSERT INTO tenants (tenant_id, name, subdomain, description, is_active, created_at, updated_at) VALUES
('default', 'Default Tenant', 'default', 'System default tenant', TRUE, NOW(), NOW()),
('07fac8ae-7c91-11f0-8a72-6abc1ea96c43', 'Grand Plaza Hotel', 'grandplaza', 'Grand Plaza Hotel tenant', TRUE, NOW(), NOW()),
('f60a5bc4-7c91-11f0-8a72-6abc1ea96c43', 'Downtown Business Hotel', 'downtown', 'Downtown Business Hotel tenant', TRUE, NOW(), NOW()),
('f60a5c04-7c91-11f0-8a72-6abc1ea96c43', 'Seaside Resort', 'seaside', 'Seaside Resort tenant', TRUE, NOW(), NOW());

-- Update Grand Plaza Hotel to use its proper tenant ID
UPDATE hotels 
SET tenant_id = '07fac8ae-7c91-11f0-8a72-6abc1ea96c43' 
WHERE name = 'Grand Plaza Hotel';

-- Update Downtown Business Hotel to use its proper tenant ID  
UPDATE hotels 
SET tenant_id = 'f60a5bc4-7c91-11f0-8a72-6abc1ea96c43' 
WHERE name = 'Downtown Business Hotel';

-- Update Seaside Resort to use its proper tenant ID
UPDATE hotels 
SET tenant_id = 'f60a5c04-7c91-11f0-8a72-6abc1ea96c43' 
WHERE name = 'Seaside Resort';

-- Update all other hotels that currently have 'default' to use appropriate tenant IDs
-- For simplicity, assign them to Grand Plaza tenant
UPDATE hotels 
SET tenant_id = '07fac8ae-7c91-11f0-8a72-6abc1ea96c43' 
WHERE tenant_id = 'default' AND name NOT IN ('Grand Plaza Hotel', 'Downtown Business Hotel', 'Seaside Resort');

-- Update rooms to match their hotel's tenant
UPDATE rooms r
JOIN hotels h ON r.hotel_id = h.id
SET r.tenant_id = h.tenant_id
WHERE r.tenant_id != h.tenant_id;

-- Update users - assign them to appropriate tenants
-- Admin users go to Grand Plaza tenant
UPDATE users 
SET tenant_id = '07fac8ae-7c91-11f0-8a72-6abc1ea96c43' 
WHERE email LIKE '%admin%' OR email LIKE '%manager%';

-- Guest users go to Grand Plaza tenant as well (or could be distributed)
UPDATE users 
SET tenant_id = '07fac8ae-7c91-11f0-8a72-6abc1ea96c43' 
WHERE tenant_id = 'default' OR tenant_id IS NULL;

-- Update reservations to match their room's tenant
UPDATE reservations res
JOIN rooms r ON res.room_id = r.id
JOIN hotels h ON r.hotel_id = h.id
SET res.tenant_id = h.tenant_id
WHERE res.tenant_id != h.tenant_id;

-- Verify the migration
SELECT 
    'Migration V19 completed. Hotel-Tenant mapping:' AS status;

SELECT 
    h.name as hotel_name,
    h.tenant_id,
    t.name as tenant_name,
    t.subdomain,
    COUNT(r.id) as room_count
FROM hotels h
LEFT JOIN tenants t ON h.tenant_id = t.tenant_id
LEFT JOIN rooms r ON h.id = r.hotel_id
GROUP BY h.id, h.name, h.tenant_id, t.name, t.subdomain
ORDER BY h.name;
