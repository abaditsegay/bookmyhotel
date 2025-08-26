-- Fix Ethiopian system admin role from SYSTEM_ADMIN to ADMIN
UPDATE user_roles SET role = 'ADMIN' WHERE user_id = 117 AND role = 'SYSTEM_ADMIN';

-- Verify the fix
SELECT u.email, ur.role 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
WHERE u.email = 'admin@ethiopian-heritage.et';
