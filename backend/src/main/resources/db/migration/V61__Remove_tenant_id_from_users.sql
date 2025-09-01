-- V61: Remove tenant_id column from users table as part of architectural refactoring
-- Users now access tenants through hotel.tenant_id relationship

-- Drop the tenant_id column from users table
ALTER TABLE users DROP COLUMN tenant_id;

-- Also remove tenant_id from room_type_pricing table and related constraints
-- RoomTypePricing now inherits tenant access through hotel.tenant_id
ALTER TABLE room_type_pricing DROP CONSTRAINT fk_room_type_pricing_tenant_id;
ALTER TABLE room_type_pricing DROP INDEX idx_room_type_pricing_tenant;
ALTER TABLE room_type_pricing DROP COLUMN tenant_id;

-- Update any existing queries that might depend on this column
-- This migration assumes all users are properly associated with hotels
-- and tenant access is done through the hotel relationship
