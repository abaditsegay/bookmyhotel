-- V2: Add subdomain column to tenants table
-- Tenants table already has id as VARCHAR(50) which supports UUID format

-- Add subdomain column if it doesn't exist
ALTER TABLE tenants ADD COLUMN subdomain VARCHAR(50) UNIQUE;
