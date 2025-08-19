-- V20: Add new tenant "Luxury Hotel Group" with two hotels and complete test data
-- This migration creates a new tenant with hotels, rooms, staff, and sample bookings

-- Set the new tenant ID
SET @new_tenant_id = 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6';

-- Insert the new tenant
INSERT INTO tenants (tenant_id, name, subdomain, description, is_active, created_at, updated_at) VALUES
(@new_tenant_id, 'Luxury Hotel Group', 'luxury', 'Premium luxury hotel chain with exceptional service', TRUE, NOW(), NOW());

-- Insert two hotels for this tenant
INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email) VALUES
(@new_tenant_id, 'Royal Palace Hotel', 'Elegant palace-style hotel with royal treatment', '100 Royal Avenue', 'Las Vegas', 'USA', '+1-555-0800', 'palace@luxury.com'),
(@new_tenant_id, 'Diamond Resort & Spa', 'Luxury resort with world-class spa facilities', '200 Diamond Beach', 'Malibu', 'USA', '+1-555-0900', 'diamond@luxury.com');

-- Get the hotel IDs for the newly inserted hotels
SET @royal_palace_id = (SELECT id FROM hotels WHERE name = 'Royal Palace Hotel' AND tenant_id = @new_tenant_id);
SET @diamond_resort_id = (SELECT id FROM hotels WHERE name = 'Diamond Resort & Spa' AND tenant_id = @new_tenant_id);

-- Insert comprehensive room inventory for Royal Palace Hotel
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
-- Floor 1 - Royal Palace Hotel
(@new_tenant_id, @royal_palace_id, 'RP101', 'DELUXE', 299.99, 2, 'Royal deluxe room with marble bathroom', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP102', 'DELUXE', 299.99, 2, 'Royal deluxe room with city view', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP103', 'SUITE', 499.99, 4, 'Royal suite with sitting area', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP104', 'SUITE', 499.99, 4, 'Royal suite with balcony', TRUE),
-- Floor 2 - Royal Palace Hotel
(@new_tenant_id, @royal_palace_id, 'RP201', 'DELUXE', 329.99, 2, 'Premium deluxe with garden view', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP202', 'DELUXE', 329.99, 2, 'Premium deluxe with fountain view', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP203', 'SUITE', 549.99, 4, 'Premium suite with terrace', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP204', 'PRESIDENTIAL', 999.99, 8, 'Royal presidential suite', TRUE),
-- Floor 3 - Royal Palace Hotel
(@new_tenant_id, @royal_palace_id, 'RP301', 'SINGLE', 199.99, 1, 'Royal single room with elegance', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP302', 'SINGLE', 199.99, 1, 'Royal single with work area', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP303', 'DOUBLE', 259.99, 2, 'Royal double with comfort', TRUE),
(@new_tenant_id, @royal_palace_id, 'RP304', 'DOUBLE', 259.99, 2, 'Royal double with amenities', TRUE);

-- Insert comprehensive room inventory for Diamond Resort & Spa
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
-- Beach Villas - Diamond Resort
(@new_tenant_id, @diamond_resort_id, 'DV101', 'SUITE', 599.99, 4, 'Beachfront villa suite with private deck', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DV102', 'SUITE', 599.99, 4, 'Ocean view villa suite with spa access', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DV103', 'PRESIDENTIAL', 1299.99, 10, 'Presidential beach villa with pool', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DV104', 'PRESIDENTIAL', 1299.99, 10, 'Executive beach villa with butler', TRUE),
-- Garden Rooms - Diamond Resort
(@new_tenant_id, @diamond_resort_id, 'DG201', 'DELUXE', 399.99, 3, 'Garden deluxe with spa view', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DG202', 'DELUXE', 399.99, 3, 'Garden deluxe with pool access', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DG203', 'DOUBLE', 329.99, 2, 'Garden double with terrace', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DG204', 'DOUBLE', 329.99, 2, 'Garden double with patio', TRUE),
-- Spa Suites - Diamond Resort
(@new_tenant_id, @diamond_resort_id, 'DS301', 'SUITE', 749.99, 4, 'Spa suite with wellness amenities', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DS302', 'SUITE', 749.99, 4, 'Spa suite with treatment room', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DS303', 'DELUXE', 449.99, 3, 'Spa deluxe with relaxation area', TRUE),
(@new_tenant_id, @diamond_resort_id, 'DS304', 'DELUXE', 449.99, 3, 'Spa deluxe with meditation space', TRUE);

-- Insert staff users for the new tenant
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active) VALUES
-- Hotel Admin for Royal Palace Hotel
(@new_tenant_id, 'admin@royalpalace.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Victoria', 'Sterling', '+1-555-8001', TRUE),
-- Front Desk for Royal Palace Hotel
(@new_tenant_id, 'frontdesk@royalpalace.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James', 'Butler', '+1-555-8002', TRUE),
-- Hotel Admin for Diamond Resort
(@new_tenant_id, 'admin@diamondresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophia', 'Diamond', '+1-555-9001', TRUE),
-- Front Desk for Diamond Resort
(@new_tenant_id, 'frontdesk@diamondresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Concierge', '+1-555-9002', TRUE),
-- Sample guest users for testing
(@new_tenant_id, 'guest1@luxury.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Elizabeth', 'Windsor', '+1-555-1101', TRUE),
(@new_tenant_id, 'guest2@luxury.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'William', 'Rothschild', '+1-555-1102', TRUE),
(@new_tenant_id, 'guest3@luxury.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Catherine', 'Vanderbilt', '+1-555-1103', TRUE);

-- Get user IDs for role assignments
SET @victoria_admin_id = (SELECT id FROM users WHERE email = 'admin@royalpalace.com' AND tenant_id = @new_tenant_id);
SET @james_frontdesk_id = (SELECT id FROM users WHERE email = 'frontdesk@royalpalace.com' AND tenant_id = @new_tenant_id);
SET @sophia_admin_id = (SELECT id FROM users WHERE email = 'admin@diamondresort.com' AND tenant_id = @new_tenant_id);
SET @michael_frontdesk_id = (SELECT id FROM users WHERE email = 'frontdesk@diamondresort.com' AND tenant_id = @new_tenant_id);
SET @elizabeth_guest_id = (SELECT id FROM users WHERE email = 'guest1@luxury.com' AND tenant_id = @new_tenant_id);
SET @william_guest_id = (SELECT id FROM users WHERE email = 'guest2@luxury.com' AND tenant_id = @new_tenant_id);
SET @catherine_guest_id = (SELECT id FROM users WHERE email = 'guest3@luxury.com' AND tenant_id = @new_tenant_id);

-- Insert user roles
INSERT INTO user_roles (user_id, role) VALUES
-- Royal Palace Hotel staff
(@victoria_admin_id, 'HOTEL_ADMIN'),
(@victoria_admin_id, 'HOTEL_MANAGER'),
(@james_frontdesk_id, 'FRONTDESK'),
-- Diamond Resort staff
(@sophia_admin_id, 'HOTEL_ADMIN'),
(@sophia_admin_id, 'HOTEL_MANAGER'),
(@michael_frontdesk_id, 'FRONTDESK'),
-- Guest users
(@elizabeth_guest_id, 'CUSTOMER'),
(@william_guest_id, 'CUSTOMER'),
(@catherine_guest_id, 'CUSTOMER');

-- Insert hotel-user associations for staff
INSERT INTO hotel_user_associations (hotel_id, user_id, role, created_at) VALUES
-- Royal Palace Hotel associations
(@royal_palace_id, @victoria_admin_id, 'HOTEL_ADMIN', NOW()),
(@royal_palace_id, @james_frontdesk_id, 'FRONTDESK', NOW()),
-- Diamond Resort associations
(@diamond_resort_id, @sophia_admin_id, 'HOTEL_ADMIN', NOW()),
(@diamond_resort_id, @michael_frontdesk_id, 'FRONTDESK', NOW());

-- Get some room IDs for sample reservations
SET @royal_suite_1 = (SELECT id FROM rooms WHERE hotel_id = @royal_palace_id AND room_number = 'RP103' AND tenant_id = @new_tenant_id);
SET @royal_suite_2 = (SELECT id FROM rooms WHERE hotel_id = @royal_palace_id AND room_number = 'RP203' AND tenant_id = @new_tenant_id);
SET @royal_presidential = (SELECT id FROM rooms WHERE hotel_id = @royal_palace_id AND room_number = 'RP204' AND tenant_id = @new_tenant_id);
SET @diamond_villa_1 = (SELECT id FROM rooms WHERE hotel_id = @diamond_resort_id AND room_number = 'DV101' AND tenant_id = @new_tenant_id);
SET @diamond_villa_2 = (SELECT id FROM rooms WHERE hotel_id = @diamond_resort_id AND room_number = 'DV102' AND tenant_id = @new_tenant_id);
SET @diamond_presidential = (SELECT id FROM rooms WHERE hotel_id = @diamond_resort_id AND room_number = 'DV103' AND tenant_id = @new_tenant_id);

-- Insert sample reservations with various statuses
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests, payment_intent_id, created_at) VALUES
-- Current and upcoming reservations for Royal Palace Hotel
(@new_tenant_id, @royal_suite_1, @elizabeth_guest_id, '2025-08-20', '2025-08-23', 1499.97, 'CONFIRMED', 'Royal treatment requested, champagne on arrival', 'pi_luxury_001', NOW()),
(@new_tenant_id, @royal_suite_2, @william_guest_id, '2025-08-25', '2025-08-28', 1649.97, 'CONFIRMED', 'Business center access, late checkout', 'pi_luxury_002', NOW()),
(@new_tenant_id, @royal_presidential, @catherine_guest_id, '2025-09-01', '2025-09-05', 3999.96, 'PENDING', 'Anniversary celebration, rose petals', 'pi_luxury_003', NOW()),

-- Current and upcoming reservations for Diamond Resort
(@new_tenant_id, @diamond_villa_1, @elizabeth_guest_id, '2025-08-28', '2025-08-31', 1799.97, 'CONFIRMED', 'Spa package included, dietary restrictions: vegetarian', 'pi_luxury_004', NOW()),
(@new_tenant_id, @diamond_villa_2, @william_guest_id, '2025-09-05', '2025-09-08', 1799.97, 'CONFIRMED', 'Beachfront dining reservation, yoga sessions', 'pi_luxury_005', NOW()),
(@new_tenant_id, @diamond_presidential, @catherine_guest_id, '2025-09-15', '2025-09-20', 6499.95, 'PENDING', 'Wellness retreat package, personal butler service', 'pi_luxury_006', NOW()),

-- Past reservations for history/testing
(@new_tenant_id, @royal_suite_1, @william_guest_id, '2025-08-01', '2025-08-04', 1499.97, 'COMPLETED', 'Excellent stay, returned guest', 'pi_luxury_007', '2025-08-01 14:00:00'),
(@new_tenant_id, @diamond_villa_1, @catherine_guest_id, '2025-07-20', '2025-07-25', 2999.95, 'COMPLETED', 'Spa treatments exceeded expectations', 'pi_luxury_008', '2025-07-20 16:00:00');

-- Insert some walk-in bookings (checkins for today)
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests, payment_intent_id, created_at) VALUES
(@new_tenant_id, (SELECT id FROM rooms WHERE hotel_id = @royal_palace_id AND room_number = 'RP101' AND tenant_id = @new_tenant_id), @elizabeth_guest_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 599.98, 'CONFIRMED', 'Walk-in booking, city tour information requested', 'pi_luxury_walkin_001', NOW()),
(@new_tenant_id, (SELECT id FROM rooms WHERE hotel_id = @diamond_resort_id AND room_number = 'DG201' AND tenant_id = @new_tenant_id), @william_guest_id, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), 399.99, 'CONFIRMED', 'Walk-in booking, spa appointment needed', 'pi_luxury_walkin_002', NOW());

-- Verification query to show the migration results
SELECT 
    'V20 Migration completed successfully!' AS status,
    (SELECT COUNT(*) FROM hotels WHERE tenant_id = @new_tenant_id) AS hotels_created,
    (SELECT COUNT(*) FROM rooms WHERE tenant_id = @new_tenant_id) AS rooms_created,
    (SELECT COUNT(*) FROM users WHERE tenant_id = @new_tenant_id) AS users_created,
    (SELECT COUNT(*) FROM reservations WHERE tenant_id = @new_tenant_id) AS reservations_created;

-- Show hotel summary
SELECT 
    h.name as hotel_name,
    h.city,
    COUNT(r.id) as total_rooms,
    COUNT(CASE WHEN res.status = 'CONFIRMED' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN res.status = 'PENDING' THEN 1 END) as pending_bookings
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
LEFT JOIN reservations res ON r.id = res.room_id
WHERE h.tenant_id = @new_tenant_id
GROUP BY h.id, h.name, h.city
ORDER BY h.name;
