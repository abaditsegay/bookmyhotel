-- Migration to update legacy tenant_id values to meaningful tenant identifiers
-- This migration replaces 'default', 'guest', and 'test-tenant' with actual tenant UUIDs

-- Create mapping for legacy tenant IDs to actual tenant UUIDs
-- Using existing tenant records with meaningful names

-- Map 'default' to 'Default Hotel Chain' tenant
SET @default_tenant_id = '07fac8ae-7c91-11f0-8a72-6abc1ea96c43';

-- Map 'guest' to 'Hilton Hotels' tenant  
SET @guest_tenant_id = '07facb21-7c91-11f0-8a72-6abc1ea96c43';

-- Map 'test-tenant' to 'Marriott Hotels' tenant
SET @test_tenant_id = '07facd3a-7c91-11f0-8a72-6abc1ea96c43';

-- Update reservations table
UPDATE reservations 
SET tenant_id = @default_tenant_id 
WHERE tenant_id = 'default';

UPDATE reservations 
SET tenant_id = @guest_tenant_id 
WHERE tenant_id = 'guest';

-- Update rooms table
UPDATE rooms 
SET tenant_id = @default_tenant_id 
WHERE tenant_id = 'default';

-- Update users table
UPDATE users 
SET tenant_id = @default_tenant_id 
WHERE tenant_id = 'default';

UPDATE users 
SET tenant_id = @guest_tenant_id 
WHERE tenant_id = 'guest';

UPDATE users 
SET tenant_id = @test_tenant_id 
WHERE tenant_id = 'test-tenant';

-- Update hotel_registrations table (if any legacy values exist)
UPDATE hotel_registrations 
SET tenant_id = @default_tenant_id 
WHERE tenant_id = 'default';

UPDATE hotel_registrations 
SET tenant_id = @guest_tenant_id 
WHERE tenant_id = 'guest';

UPDATE hotel_registrations 
SET tenant_id = @test_tenant_id 
WHERE tenant_id = 'test-tenant';

-- Update hotels table (if any legacy values exist)
UPDATE hotels 
SET tenant_id = @default_tenant_id 
WHERE tenant_id = 'default';

UPDATE hotels 
SET tenant_id = @guest_tenant_id 
WHERE tenant_id = 'guest';

UPDATE hotels 
SET tenant_id = @test_tenant_id 
WHERE tenant_id = 'test-tenant';

-- Verify the migration by checking updated counts
-- This will be visible in the migration logs
SELECT 
    'Migration completed. Updated records:' AS status,
    (SELECT COUNT(*) FROM reservations WHERE tenant_id = @default_tenant_id) AS default_reservations,
    (SELECT COUNT(*) FROM reservations WHERE tenant_id = @guest_tenant_id) AS guest_reservations,
    (SELECT COUNT(*) FROM rooms WHERE tenant_id = @default_tenant_id) AS default_rooms,
    (SELECT COUNT(*) FROM users WHERE tenant_id IN (@default_tenant_id, @guest_tenant_id, @test_tenant_id)) AS total_users;
