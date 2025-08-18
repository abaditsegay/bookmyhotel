-- V10: Fix admin user login and ensure frontdesk sample user is available

-- Fix the admin@grandplaza.com user to ensure it has ADMIN role properly
-- First, ensure the user exists and is properly configured
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_active = TRUE,
    tenant_id = 'default'
WHERE email = 'admin@grandplaza.com';

-- Ensure the admin user has the ADMIN role (remove any conflicting roles first)
DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'admin@grandplaza.com');

-- Add ADMIN role to admin@grandplaza.com
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'admin@grandplaza.com'), 'ADMIN');

-- Ensure frontdesk1@grandplaza.com user exists and is properly configured
-- Update if exists, otherwise this will have no effect
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_active = TRUE,
    tenant_id = 'default',
    first_name = 'Mike',
    last_name = 'Brown',
    phone = '+1-555-0005',
    hotel_id = 1
WHERE email = 'frontdesk1@grandplaza.com';

-- Ensure the frontdesk user has the FRONTDESK role (remove any conflicting roles first)
DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'frontdesk1@grandplaza.com');

-- Add FRONTDESK role to frontdesk1@grandplaza.com
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'frontdesk1@grandplaza.com'), 'FRONTDESK');

-- Ensure hoteladmin@bookmyhotel.com user is properly configured
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    is_active = TRUE,
    tenant_id = 'default',
    hotel_id = 1
WHERE email = 'hoteladmin@bookmyhotel.com';

-- Ensure the hotel admin user has the HOTEL_ADMIN role (remove any conflicting roles first)
DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'hoteladmin@bookmyhotel.com');

-- Add HOTEL_ADMIN role to hoteladmin@bookmyhotel.com
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'hoteladmin@bookmyhotel.com'), 'HOTEL_ADMIN');

-- Add a comment explaining the password
-- All users have password: 'password' (bcrypt hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
