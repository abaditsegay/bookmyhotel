-- Create superadmin user for login (if not exists)
INSERT IGNORE INTO users (tenant_id, email, password, first_name, last_name, phone, is_active, created_at, updated_at) 
VALUES (
    'superadmin',
    'superadmin@bookmyhotel.com',
    '$2a$10$rq2.nUYXJrAX7.JqiNKEJOe7BznvFZhyNzkwZlJhD5NaM9z1S1P7G', -- password: admin123
    'Super',
    'Admin',
    '+1234567890',
    true,
    NOW(),
    NOW()
);

-- Insert superadmin role for the user (if not exists)
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'SUPERADMIN' 
FROM users u 
WHERE u.email = 'superadmin@bookmyhotel.com';
