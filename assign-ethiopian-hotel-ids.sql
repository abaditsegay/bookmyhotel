-- Assign hotel IDs to Ethiopian Heritage Hotels users
-- Hotel ID 14: Sheraton Addis Ababa
-- Hotel ID 15: Lalibela Cultural Lodge

-- Update all Sheraton Addis users to hotel ID 14
UPDATE users 
SET hotel_id = 14 
WHERE tenant_id = 'ethiopian-heritage' 
  AND email LIKE '%sheraton-addis%';

-- Update all Lalibela Lodge users to hotel ID 15  
UPDATE users 
SET hotel_id = 15 
WHERE tenant_id = 'ethiopian-heritage' 
  AND email LIKE '%lalibela-lodge%';

-- System admin should remain without hotel_id (can access all hotels)
-- admin@ethiopian-heritage.et stays NULL

-- Verify assignments
SELECT 
    h.name as hotel_name,
    COUNT(u.id) as user_count,
    GROUP_CONCAT(DISTINCT 
        CASE 
            WHEN ur.role = 'HOTEL_ADMIN' THEN ur.role
            WHEN ur.role = 'FRONTDESK' THEN ur.role  
            WHEN ur.role = 'HOUSEKEEPING' THEN ur.role
            WHEN ur.role = 'MAINTENANCE' THEN ur.role
            WHEN ur.role = 'OPERATIONS_SUPERVISOR' THEN ur.role
            WHEN ur.role = 'GUEST' THEN ur.role
            WHEN ur.role = 'CONCIERGE' THEN ur.role
            ELSE ur.role
        END
    ) as roles
FROM users u
LEFT JOIN hotels h ON u.hotel_id = h.id  
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.tenant_id = 'ethiopian-heritage' AND u.hotel_id IS NOT NULL
GROUP BY h.id, h.name
ORDER BY h.name;

-- Show system admin (should have NULL hotel_id)
SELECT email, hotel_id, 'System Admin - Multi-hotel access' as note
FROM users 
WHERE tenant_id = 'ethiopian-heritage' AND hotel_id IS NULL;
