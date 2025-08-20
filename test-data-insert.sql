-- Minimal Test Data for Booking Modification Testing
-- Add a guest user and some test reservations

-- Add a guest user for testing
INSERT INTO users (tenant_id, first_name, last_name, email, password, phone, hotel_id, is_active, created_at, updated_at) VALUES
(NULL, 'Test', 'Guest', 'test@example.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0001', NULL, true, NOW(), NOW());

-- Get the user ID for the guest user
SET @guest_user_id = LAST_INSERT_ID();

-- Add guest role for the test user
INSERT INTO user_roles (user_id, role) VALUES (@guest_user_id, 'GUEST');

-- Add some rooms to existing hotels for testing
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
(7, 'luxury-chain', '101', 'SINGLE', 2, 299.00, 'Elegant standard room with city views', 'AVAILABLE', true, NOW(), NOW()),
(7, 'luxury-chain', '201', 'DELUXE', 2, 399.00, 'Spacious deluxe room with park views', 'AVAILABLE', true, NOW(), NOW()),
(8, 'luxury-chain', '101', 'SINGLE', 2, 249.00, 'Ocean view room with private balcony', 'AVAILABLE', true, NOW(), NOW()),
(9, 'budget-stays', '101', 'SINGLE', 2, 89.00, 'Clean and comfortable standard room', 'AVAILABLE', true, NOW(), NOW()),
(11, 'boutique-collection', '101', 'SINGLE', 2, 159.00, 'Artist-themed room with local art', 'AVAILABLE', true, NOW(), NOW());

-- Get room IDs for reservations
SET @room1_id = (SELECT id FROM rooms WHERE hotel_id = 7 AND room_number = '101' LIMIT 1);
SET @room2_id = (SELECT id FROM rooms WHERE hotel_id = 7 AND room_number = '201' LIMIT 1);
SET @room3_id = (SELECT id FROM rooms WHERE hotel_id = 8 AND room_number = '101' LIMIT 1);

-- Add test reservations that can be modified (more than 24 hours in future)
INSERT INTO reservations (room_id, guest_id, tenant_id, check_in_date, check_out_date, total_amount, status, confirmation_number, guest_name, special_requests, created_at, updated_at) VALUES
(@room1_id, @guest_user_id, 'luxury-chain', '2025-08-26', '2025-08-29', 897.00, 'CONFIRMED', 'BMH-TEST-001', 'Test Guest', 'Test reservation for modification', NOW(), NOW()),
(@room2_id, @guest_user_id, 'luxury-chain', '2025-09-01', '2025-09-03', 798.00, 'CONFIRMED', 'BMH-TEST-002', 'Test Guest', 'Another test reservation', NOW(), NOW()),
(@room3_id, @guest_user_id, 'luxury-chain', '2025-08-28', '2025-08-30', 498.00, 'CONFIRMED', 'BMH-TEST-003', 'Test Guest', 'Ocean view test booking', NOW(), NOW());

-- Add booking history for the reservations
SET @res1_id = (SELECT id FROM reservations WHERE confirmation_number = 'BMH-TEST-001' LIMIT 1);
SET @res2_id = (SELECT id FROM reservations WHERE confirmation_number = 'BMH-TEST-002' LIMIT 1);
SET @res3_id = (SELECT id FROM reservations WHERE confirmation_number = 'BMH-TEST-003' LIMIT 1);

INSERT INTO booking_history (reservation_id, action_type, performed_by, performed_at, reason, financial_impact, old_values, new_values) VALUES
(@res1_id, 'CREATED', 'test@example.com', NOW(), 'Initial test booking', 897.00, NULL, '{"status": "CONFIRMED", "totalAmount": 897.00}'),
(@res2_id, 'CREATED', 'test@example.com', NOW(), 'Initial test booking', 798.00, NULL, '{"status": "CONFIRMED", "totalAmount": 798.00}'),
(@res3_id, 'CREATED', 'test@example.com', NOW(), 'Initial test booking', 498.00, NULL, '{"status": "CONFIRMED", "totalAmount": 498.00}');

-- Add admin users for testing
INSERT INTO users (tenant_id, first_name, last_name, email, password, phone, hotel_id, is_active, created_at, updated_at) VALUES
-- System admin
(NULL, 'Admin', 'User', 'admin@bookmyhotel.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-000-0001', NULL, true, NOW(), NOW()),
-- Luxury chain admin
('luxury-chain', 'John', 'Manager', 'admin@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-100-0001', NULL, true, NOW(), NOW()),
-- Budget stays admin
('budget-stays', 'Lisa', 'Davis', 'admin@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-200-0001', NULL, true, NOW(), NOW()),
-- Front desk user for Grand Palace
('luxury-chain', 'Sarah', 'Smith', 'frontdesk@grandpalace.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-0101', 7, true, NOW(), NOW());

-- Get admin user IDs and assign roles
SET @admin_id = (SELECT id FROM users WHERE email = 'admin@bookmyhotel.com' LIMIT 1);
SET @luxury_admin_id = (SELECT id FROM users WHERE email = 'admin@luxury-hotels.com' LIMIT 1);
SET @budget_admin_id = (SELECT id FROM users WHERE email = 'admin@budget-stays.com' LIMIT 1);
SET @frontdesk_id = (SELECT id FROM users WHERE email = 'frontdesk@grandpalace.com' LIMIT 1);

INSERT INTO user_roles (user_id, role) VALUES 
(@admin_id, 'ADMIN'),
(@luxury_admin_id, 'HOTEL_ADMIN'),
(@budget_admin_id, 'HOTEL_ADMIN'),
(@frontdesk_id, 'FRONTDESK');
