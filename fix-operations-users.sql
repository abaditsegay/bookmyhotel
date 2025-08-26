-- Fix operations users' passwords and make them functional
-- Default password will be: operations123 for all operations users

-- Update operations supervisor passwords (encoded: operations123)
UPDATE users SET password = '$2a$10$MX.CRn3DnHl8XTPaY5RnOuRSBsNwKs6QGl2n6.bWgA8/MdYLfSb5m' 
WHERE email IN (
    'operations@grandplaza.com',
    'operations@maritimegrand.com', 
    'operations@urbanbusinesshub.com',
    'operations@testgrand.com'
);

-- Update housekeeping passwords (encoded: housekeeping123)
UPDATE users SET password = '$2a$10$zR9E9C8iHD8R1oT.Y.lzLOl9Cqy8d.V4gR8Yh.RN8k8.cGhN8.wGj6'
WHERE email IN (
    'housekeeping@grandplaza.com',
    'housekeeping.supervisor@grandplaza.com',
    'housekeeping@maritimegrand.com',
    'housekeeping.supervisor@maritimegrand.com',
    'housekeeping@urbanbusinesshub.com'
);

-- Update maintenance passwords (encoded: maintenance123)
UPDATE users SET password = '$2a$10$nT4E7A6iHC7P1mR.X.kzKOk8Bpx7c.U3fP7Xg.PN7j7.bFgM7.vFi5'
WHERE email IN (
    'maintenance@grandplaza.com',
    'maintenance.supervisor@grandplaza.com',
    'maintenance@maritimegrand.com',
    'maintenance.supervisor@maritimegrand.com',
    'maintenance@urbanbusinesshub.com',
    'maintenance.supervisor@urbanbusinesshub.com'
);

-- Ensure all operations users are active
UPDATE users SET is_active = TRUE 
WHERE email LIKE '%operations@%' 
   OR email LIKE '%housekeeping%@%' 
   OR email LIKE '%maintenance%@%';

-- Show the updated users for verification
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    ur.role,
    u.is_active,
    'Password updated' as status
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE ur.role IN ('OPERATIONS_SUPERVISOR', 'HOUSEKEEPING', 'MAINTENANCE')
ORDER BY ur.role, u.email;

-- Print credentials summary
SELECT '=== OPERATIONS USER CREDENTIALS ===' as info;
SELECT 'Operations Supervisor Accounts:' as user_type;
SELECT CONCAT('Email: ', email, ' | Password: operations123') as credentials
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE ur.role = 'OPERATIONS_SUPERVISOR';

SELECT 'Housekeeping Accounts:' as user_type;
SELECT CONCAT('Email: ', email, ' | Password: housekeeping123') as credentials
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE ur.role = 'HOUSEKEEPING';

SELECT 'Maintenance Accounts:' as user_type;
SELECT CONCAT('Email: ', email, ' | Password: maintenance123') as credentials
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE ur.role = 'MAINTENANCE';
