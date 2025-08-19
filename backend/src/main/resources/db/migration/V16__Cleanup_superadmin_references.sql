-- V16__Cleanup_superadmin_references.sql
-- Remove any remaining SUPERADMIN role references since SUPERADMIN is no longer a valid role
-- This migration is primarily for documentation as the superadmin user and roles have been manually removed

-- Remove any remaining SUPERADMIN roles (cleanup)
DELETE FROM user_roles WHERE role = 'SUPERADMIN';

-- Add a comment to document valid roles
-- Valid roles are now: ADMIN, HOTEL_ADMIN, FRONTDESK
-- SUPERADMIN has been deprecated and removed from the system
