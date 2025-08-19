-- Rollback script for V18 migration
-- This script reverts tenant_id values back to legacy identifiers
-- Use this script ONLY if you need to rollback the V18 migration

-- CAUTION: This script should only be used in development environments
-- Production rollbacks should be carefully planned and tested

-- Define the tenant IDs used in the migration
SET @default_tenant_id = '07fac8ae-7c91-11f0-8a72-6abc1ea96c43';
SET @guest_tenant_id = '07facb21-7c91-11f0-8a72-6abc1ea96c43';
SET @test_tenant_id = '07facd3a-7c91-11f0-8a72-6abc1ea96c43';

-- Rollback reservations table
UPDATE reservations 
SET tenant_id = 'default' 
WHERE tenant_id = @default_tenant_id;

UPDATE reservations 
SET tenant_id = 'guest' 
WHERE tenant_id = @guest_tenant_id;

-- Rollback rooms table
UPDATE rooms 
SET tenant_id = 'default' 
WHERE tenant_id = @default_tenant_id;

-- Rollback users table
UPDATE users 
SET tenant_id = 'default' 
WHERE tenant_id = @default_tenant_id;

UPDATE users 
SET tenant_id = 'guest' 
WHERE tenant_id = @guest_tenant_id;

UPDATE users 
SET tenant_id = 'test-tenant' 
WHERE tenant_id = @test_tenant_id;

-- Rollback hotel_registrations table
UPDATE hotel_registrations 
SET tenant_id = 'default' 
WHERE tenant_id = @default_tenant_id;

UPDATE hotel_registrations 
SET tenant_id = 'guest' 
WHERE tenant_id = @guest_tenant_id;

UPDATE hotel_registrations 
SET tenant_id = 'test-tenant' 
WHERE tenant_id = @test_tenant_id;

-- Rollback hotels table
UPDATE hotels 
SET tenant_id = 'default' 
WHERE tenant_id = @default_tenant_id;

UPDATE hotels 
SET tenant_id = 'guest' 
WHERE tenant_id = @guest_tenant_id;

UPDATE hotels 
SET tenant_id = 'test-tenant' 
WHERE tenant_id = @test_tenant_id;

-- Verify rollback
SELECT 
    'Rollback completed. Legacy tenant_id counts:' AS status,
    (SELECT COUNT(*) FROM reservations WHERE tenant_id = 'default') AS default_reservations,
    (SELECT COUNT(*) FROM reservations WHERE tenant_id = 'guest') AS guest_reservations,
    (SELECT COUNT(*) FROM rooms WHERE tenant_id = 'default') AS default_rooms,
    (SELECT COUNT(*) FROM users WHERE tenant_id IN ('default', 'guest', 'test-tenant')) AS legacy_users;
