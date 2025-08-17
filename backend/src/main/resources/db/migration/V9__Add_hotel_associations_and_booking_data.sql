-- V9: Add hotel associations and booking sample data

-- Update existing users to associate them with hotels
UPDATE users SET hotel_id = 1 WHERE email = 'admin@grandplaza.com';
UPDATE users SET hotel_id = 1 WHERE email = 'manager@grandplaza.com';

-- Add hotel admin user for testing
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active, hotel_id) VALUES
('default', 'hoteladmin@bookmyhotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Wilson', '+1-555-0004', TRUE, 1);

-- Add roles for the hotel admin user (assuming the new user gets ID 4)
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'hoteladmin@bookmyhotel.com'), 'HOTEL_ADMIN');

-- Add more staff for Grand Plaza Hotel
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active, hotel_id) VALUES
('default', 'frontdesk1@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Brown', '+1-555-0005', TRUE, 1),
('default', 'housekeeping1@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lisa', 'Green', '+1-555-0006', TRUE, 1),
('default', 'frontdesk2@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'Smith', '+1-555-0007', TRUE, 1);

-- Add roles for the new staff
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'frontdesk1@grandplaza.com'), 'FRONTDESK'),
((SELECT id FROM users WHERE email = 'housekeeping1@grandplaza.com'), 'HOUSEKEEPING'),
((SELECT id FROM users WHERE email = 'frontdesk2@grandplaza.com'), 'FRONTDESK');

-- Add staff for Seaside Resort
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active, hotel_id) VALUES
('default', 'manager@seasideresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'Johnson', '+1-555-0008', TRUE, 2),
('default', 'frontdesk@seasideresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emma', 'Davis', '+1-555-0009', TRUE, 2);

-- Add roles for Seaside Resort staff
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'manager@seasideresort.com'), 'HOTEL_MANAGER'),
((SELECT id FROM users WHERE email = 'frontdesk@seasideresort.com'), 'FRONTDESK');

-- Add sample guest users (not associated with any hotel)
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active) VALUES
('default', 'john.doe@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', '+1-555-1001', TRUE),
('default', 'jane.smith@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', '+1-555-1002', TRUE),
('default', 'mike.johnson@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Johnson', '+1-555-1003', TRUE),
('default', 'sarah.wilson@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Wilson', '+1-555-1004', TRUE),
('default', 'alex.brown@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alex', 'Brown', '+1-555-1005', TRUE);

-- Add CUSTOMER role for all guest users
INSERT INTO user_roles (user_id, role) VALUES
((SELECT id FROM users WHERE email = 'john.doe@example.com'), 'CUSTOMER'),
((SELECT id FROM users WHERE email = 'jane.smith@example.com'), 'CUSTOMER'),
((SELECT id FROM users WHERE email = 'mike.johnson@example.com'), 'CUSTOMER'),
((SELECT id FROM users WHERE email = 'sarah.wilson@example.com'), 'CUSTOMER'),
((SELECT id FROM users WHERE email = 'alex.brown@example.com'), 'CUSTOMER');

-- Add sample reservations for Grand Plaza Hotel
-- Reservations for room 101 (Single)
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests) VALUES
('default', 1, (SELECT id FROM users WHERE email = 'john.doe@example.com'), '2024-12-20', '2024-12-23', 389.97, 'CONFIRMED', 'Late check-in requested'),
('default', 2, (SELECT id FROM users WHERE email = 'jane.smith@example.com'), '2024-12-25', '2024-12-28', 539.97, 'CHECKED_IN', 'Ground floor room preferred'),
('default', 3, (SELECT id FROM users WHERE email = 'mike.johnson@example.com'), '2024-12-22', '2024-12-26', 1199.96, 'PENDING', 'Need extra towels and pillows');

-- More reservations across different rooms
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests) VALUES
('default', 4, (SELECT id FROM users WHERE email = 'sarah.wilson@example.com'), '2024-12-15', '2024-12-18', 419.97, 'CHECKED_OUT', null),
('default', 5, (SELECT id FROM users WHERE email = 'alex.brown@example.com'), '2024-12-28', '2024-12-31', 569.97, 'CONFIRMED', 'Anniversary celebration'),
('default', 1, (SELECT id FROM users WHERE email = 'john.doe@example.com'), '2024-11-15', '2024-11-17', 259.98, 'CHECKED_OUT', null),
('default', 2, (SELECT id FROM users WHERE email = 'jane.smith@example.com'), '2024-11-20', '2024-11-22', 359.98, 'CHECKED_OUT', null),
('default', 6, (SELECT id FROM users WHERE email = 'mike.johnson@example.com'), '2025-01-05', '2025-01-08', 1799.97, 'CONFIRMED', 'VIP guest - special amenities');

-- Add some reservations for Seaside Resort
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests) VALUES
('default', 7, (SELECT id FROM users WHERE email = 'sarah.wilson@example.com'), '2024-12-30', '2025-01-02', 749.97, 'CONFIRMED', 'Oceanview balcony requested'),
('default', 8, (SELECT id FROM users WHERE email = 'alex.brown@example.com'), '2025-01-10', '2025-01-14', 1599.96, 'CONFIRMED', 'Honeymoon package'),
('default', 9, (SELECT id FROM users WHERE email = 'john.doe@example.com'), '2024-12-18', '2024-12-21', 989.97, 'CHECKED_IN', 'Beach access important');

-- Add some cancelled reservations for variety
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests) VALUES
('default', 1, (SELECT id FROM users WHERE email = 'jane.smith@example.com'), '2024-12-10', '2024-12-12', 259.98, 'CANCELLED', null),
('default', 7, (SELECT id FROM users WHERE email = 'mike.johnson@example.com'), '2024-12-05', '2024-12-08', 749.97, 'NO_SHOW', null);
