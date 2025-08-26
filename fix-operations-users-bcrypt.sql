-- Fix Operations Users Credentials
-- This script updates passwords for all operations staff with proper bcrypt hashes
-- Generated on: 2024

-- Show current operations users before update
SELECT 'BEFORE UPDATE - Current operations users:' as status;
SELECT u.id, u.email, u.full_name, u.role, u.is_enabled, u.created_at
FROM users u 
WHERE u.role IN ('OPERATIONS_SUPERVISOR', 'HOUSEKEEPING', 'MAINTENANCE')
ORDER BY u.role, u.email;

-- Update OPERATIONS_SUPERVISOR users with password 'operations123'
UPDATE users 
SET password = '$2b$12$wWA3hv8DsLmZrwUZzUILwOV5TZXZTVXRBOjiWtg2AULY8PGd7fgjq'
WHERE role = 'OPERATIONS_SUPERVISOR';

-- Update HOUSEKEEPING users with password 'housekeeping123'  
UPDATE users 
SET password = '$2b$12$MBeNeYFhn.uf9otyl4z2XePaO37htyPyVzzZM1kWjzL5iK2LftFym'
WHERE role = 'HOUSEKEEPING';

-- Update MAINTENANCE users with password 'maintenance123'
UPDATE users 
SET password = '$2b$12$7lxaO1lQlgNmWjmZmJlx8eNMpM73uQ0LgWh1nj3YCY1xCSKSop5P2'
WHERE role = 'MAINTENANCE';

-- Ensure all operations users are enabled
UPDATE users 
SET is_enabled = 1 
WHERE role IN ('OPERATIONS_SUPERVISOR', 'HOUSEKEEPING', 'MAINTENANCE');

-- Show updated operations users
SELECT 'AFTER UPDATE - Updated operations users:' as status;
SELECT u.id, u.email, u.full_name, u.role, u.is_enabled, u.created_at
FROM users u 
WHERE u.role IN ('OPERATIONS_SUPERVISOR', 'HOUSEKEEPING', 'MAINTENANCE')
ORDER BY u.role, u.email;

-- Show credential summary
SELECT 'CREDENTIAL SUMMARY:' as info;
SELECT 
    'OPERATIONS_SUPERVISOR' as role,
    'operations123' as password,
    COUNT(*) as user_count
FROM users WHERE role = 'OPERATIONS_SUPERVISOR'
UNION ALL
SELECT 
    'HOUSEKEEPING' as role,
    'housekeeping123' as password, 
    COUNT(*) as user_count
FROM users WHERE role = 'HOUSEKEEPING'
UNION ALL
SELECT 
    'MAINTENANCE' as role,
    'maintenance123' as password,
    COUNT(*) as user_count  
FROM users WHERE role = 'MAINTENANCE';
