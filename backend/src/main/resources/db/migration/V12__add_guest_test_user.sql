-- V12: Add guest test user for testing booking functionality

-- Add guest test user
INSERT INTO users (email, password, first_name, last_name, phone, is_active, tenant_id, hotel_id) VALUES
('guest@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'Guest', '+1-555-0006', TRUE, 'default', NULL);

-- Add GUEST role to guest@test.com
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'guest@test.com'), 'GUEST');

-- Add a comment explaining the password
-- guest@test.com has password: 'password' (bcrypt hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
