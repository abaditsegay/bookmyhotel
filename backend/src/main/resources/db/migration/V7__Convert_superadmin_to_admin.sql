-- Update SUPERADMIN role to ADMIN role
UPDATE user_roles SET role = 'ADMIN' WHERE role = 'SUPERADMIN';

-- Update any users table that might have SUPERADMIN references
-- This ensures consistency across the database
