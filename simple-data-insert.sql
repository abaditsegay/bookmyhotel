-- Simple Sample Data Insertion Script for BookMyHotel
-- Matches actual database schema

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data first
DELETE FROM booking_history;
DELETE FROM reservations;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM rooms;
DELETE FROM hotels;
DELETE FROM tenants;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert tenants
INSERT INTO tenants (tenant_id, name, description, subdomain, is_active, created_at, updated_at) VALUES
('luxury-chain', 'Luxury Hotel Chain', 'Premium luxury hotels and resorts', 'luxury', true, NOW(), NOW()),
('budget-stays', 'Budget Friendly Stays', 'Affordable and comfortable accommodations', 'budget', true, NOW(), NOW()),
('boutique-collection', 'Boutique Hotel Collection', 'Unique boutique hotels with character', 'boutique', true, NOW(), NOW());

-- Insert hotels
INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email, is_active, created_at, updated_at) VALUES
('luxury-chain', 'Grand Palace Hotel', 'Luxury hotel in downtown with world-class amenities', '123 Royal Avenue', 'New York', 'USA', '+1-212-555-0101', 'info@grandpalace.com', true, NOW(), NOW()),
('luxury-chain', 'Oceanview Resort', 'Premium beachfront resort with stunning ocean views', '456 Coastal Drive', 'Miami', 'USA', '+1-305-555-0202', 'reservations@oceanview.com', true, NOW(), NOW()),
('budget-stays', 'Downtown Express Inn', 'Clean, comfortable, and affordable accommodations', '789 Main Street', 'Chicago', 'USA', '+1-312-555-0303', 'info@downtownexpress.com', true, NOW(), NOW()),
('budget-stays', 'Airport Lodge', 'Convenient airport hotel with shuttle service', '321 Airport Boulevard', 'Los Angeles', 'USA', '+1-424-555-0404', 'bookings@airportlodge.com', true, NOW(), NOW()),
('boutique-collection', 'The Artist Quarter', 'Unique boutique hotel featuring local art', '555 Arts District Lane', 'Portland', 'USA', '+1-503-555-0505', 'stay@artistquarter.com', true, NOW(), NOW()),
('boutique-collection', 'Historic Mansion Inn', 'Restored Victorian mansion with period charm', '888 Heritage Street', 'Charleston', 'USA', '+1-843-555-0606', 'info@historicmansion.com', true, NOW(), NOW());

-- Insert rooms (using hotel_id from 1-6 based on insertion order)
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
-- Grand Palace Hotel (hotel_id: 1, tenant: luxury-chain)
(1, 'luxury-chain', '101', 'SINGLE', 2, 299.00, 'Elegant standard room with city views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'luxury-chain', '102', 'SINGLE', 2, 299.00, 'Comfortable room with modern amenities', 'AVAILABLE', true, NOW(), NOW()),
(1, 'luxury-chain', '201', 'DELUXE', 2, 399.00, 'Spacious deluxe room with park views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'luxury-chain', '301', 'SUITE', 4, 699.00, 'Luxurious suite with separate living area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'luxury-chain', '401', 'PRESIDENTIAL', 6, 1299.00, 'Presidential suite with premium amenities', 'AVAILABLE', true, NOW(), NOW()),

-- Oceanview Resort (hotel_id: 2, tenant: luxury-chain)
(2, 'luxury-chain', '101', 'SINGLE', 2, 249.00, 'Ocean view room with private balcony', 'AVAILABLE', true, NOW(), NOW()),
(2, 'luxury-chain', '102', 'SINGLE', 2, 249.00, 'Comfortable ocean view accommodation', 'AVAILABLE', true, NOW(), NOW()),
(2, 'luxury-chain', '201', 'DELUXE', 2, 349.00, 'Deluxe room with enhanced ocean views', 'AVAILABLE', true, NOW(), NOW()),
(2, 'luxury-chain', '301', 'SUITE', 4, 599.00, 'Oceanfront suite with full amenities', 'AVAILABLE', true, NOW(), NOW()),

-- Downtown Express Inn (hotel_id: 3, tenant: budget-stays)
(3, 'budget-stays', '101', 'SINGLE', 2, 89.00, 'Clean and comfortable standard room', 'AVAILABLE', true, NOW(), NOW()),
(3, 'budget-stays', '102', 'DOUBLE', 2, 89.00, 'Twin bed configuration for business travelers', 'AVAILABLE', true, NOW(), NOW()),
(3, 'budget-stays', '201', 'DELUXE', 2, 109.00, 'Enhanced room with city views', 'AVAILABLE', true, NOW(), NOW()),
(3, 'budget-stays', '301', 'SUITE', 4, 149.00, 'Family-friendly suite with kitchenette', 'AVAILABLE', true, NOW(), NOW()),

-- Airport Lodge (hotel_id: 4, tenant: budget-stays)
(4, 'budget-stays', '101', 'SINGLE', 2, 79.00, 'Quiet room designed for rest', 'AVAILABLE', true, NOW(), NOW()),
(4, 'budget-stays', '102', 'SINGLE', 2, 79.00, 'Comfortable accommodation near airport', 'AVAILABLE', true, NOW(), NOW()),
(4, 'budget-stays', '201', 'DELUXE', 2, 99.00, 'Upgraded room with better amenities', 'AVAILABLE', true, NOW(), NOW()),

-- The Artist Quarter (hotel_id: 5, tenant: boutique-collection)
(5, 'boutique-collection', '101', 'SINGLE', 2, 159.00, 'Artist-themed room with local art', 'AVAILABLE', true, NOW(), NOW()),
(5, 'boutique-collection', '201', 'DELUXE', 2, 199.00, 'Deluxe room overlooking art gallery', 'AVAILABLE', true, NOW(), NOW()),
(5, 'boutique-collection', '301', 'SUITE', 4, 299.00, 'Creative suite with studio space', 'AVAILABLE', true, NOW(), NOW()),

-- Historic Mansion Inn (hotel_id: 6, tenant: boutique-collection)
(6, 'boutique-collection', '101', 'SINGLE', 2, 189.00, 'Charming room with historic character', 'AVAILABLE', true, NOW(), NOW()),
(6, 'boutique-collection', '201', 'DELUXE', 2, 239.00, 'Elegant Victorian-style accommodation', 'AVAILABLE', true, NOW(), NOW()),
(6, 'boutique-collection', '301', 'SUITE', 4, 389.00, 'Luxurious historic suite with period charm', 'AVAILABLE', true, NOW(), NOW());

-- Insert users with different roles (password is 'password123')
INSERT INTO users (tenant_id, first_name, last_name, email, password, phone, hotel_id, is_active, created_at, updated_at) VALUES
-- Super Admin (no tenant - system-wide access)
(NULL, 'System', 'Administrator', 'admin@bookmyhotel.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-000-0001', NULL, true, NOW(), NOW()),

-- Luxury Chain users
('luxury-chain', 'John', 'Manager', 'admin@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-100-0001', NULL, true, NOW(), NOW()),
('luxury-chain', 'Sarah', 'Smith', 'frontdesk.grandpalace@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-0101', 1, true, NOW(), NOW()),
('luxury-chain', 'Mike', 'Johnson', 'frontdesk.oceanview@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-305-555-0202', 2, true, NOW(), NOW()),

-- Budget Stays users
('budget-stays', 'Lisa', 'Davis', 'admin@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-200-0001', NULL, true, NOW(), NOW()),
('budget-stays', 'Tom', 'Wilson', 'frontdesk.downtown@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-312-555-0303', 3, true, NOW(), NOW()),
('budget-stays', 'Emma', 'Brown', 'frontdesk.airport@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-424-555-0404', 4, true, NOW(), NOW()),

-- Boutique Collection users
('boutique-collection', 'Alex', 'Garcia', 'admin@boutique-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-300-0001', NULL, true, NOW(), NOW()),
('boutique-collection', 'Jessica', 'Miller', 'frontdesk.artist@boutique-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-503-555-0505', 5, true, NOW(), NOW()),
('boutique-collection', 'David', 'Anderson', 'frontdesk.mansion@boutique-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-843-555-0606', 6, true, NOW(), NOW()),

-- Guest users for testing
(NULL, 'Guest', 'User', 'guest@example.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0001', NULL, true, NOW(), NOW()),
(NULL, 'Jane', 'Customer', 'jane.customer@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0002', NULL, true, NOW(), NOW());

-- Insert user roles
INSERT INTO user_roles (user_id, role) VALUES
-- Super Admin
(1, 'ADMIN'),

-- Hotel Admins (one per tenant)
(2, 'HOTEL_ADMIN'),
(5, 'HOTEL_ADMIN'),
(8, 'HOTEL_ADMIN'),

-- Front Desk users (one per hotel)
(3, 'FRONTDESK'),
(4, 'FRONTDESK'),
(6, 'FRONTDESK'),
(7, 'FRONTDESK'),
(9, 'FRONTDESK'),
(10, 'FRONTDESK'),

-- Guest users
(11, 'GUEST'),
(12, 'GUEST');

-- Insert sample reservations (adjusted for actual schema)
INSERT INTO reservations (room_id, guest_id, tenant_id, check_in_date, check_out_date, total_amount, status, confirmation_number, guest_name, special_requests, created_at, updated_at) VALUES
-- Future reservations that can be modified (more than 24 hours away)
(3, 11, 'luxury-chain', '2025-08-26', '2025-08-29', 1197.00, 'CONFIRMED', 'BMH-2025-004', 'Lisa Chen', 'Honeymoon suite if available', NOW(), NOW()),
(17, 12, 'boutique-collection', '2025-08-28', '2025-08-30', 318.00, 'CONFIRMED', 'BMH-2025-005', 'Michael Brown', 'Interested in local art tours', NOW(), NOW()),
(20, 11, 'boutique-collection', '2025-09-01', '2025-09-04', 567.00, 'CONFIRMED', 'BMH-2025-006', 'Sandra Davis', 'Celebrating anniversary', NOW(), NOW()),

-- Recent confirmed reservations
(1, 12, 'luxury-chain', '2025-08-25', '2025-08-28', 897.00, 'CONFIRMED', 'BMH-2025-001', 'Robert Johnson', 'Late check-in requested', NOW(), NOW()),
(6, 11, 'luxury-chain', '2025-08-22', '2025-08-25', 747.00, 'CONFIRMED', 'BMH-2025-002', 'Maria Rodriguez', 'Crib needed for child', NOW(), NOW()),
(10, 12, 'budget-stays', '2025-08-20', '2025-08-22', 178.00, 'CHECKED_IN', 'BMH-2025-003', 'James Wilson', 'Business traveler, quiet room please', NOW(), NOW()),

-- Cancelled reservations
(4, 11, 'luxury-chain', '2025-08-30', '2025-09-02', 2097.00, 'CANCELLED', 'BMH-2025-009', 'Brian Moore', 'Business conference cancelled', NOW(), NOW()),
(21, 12, 'boutique-collection', '2025-08-27', '2025-08-29', 478.00, 'CANCELLED', 'BMH-2025-010', 'Nicole White', 'Plans changed due to weather', NOW(), NOW());

-- Insert some booking history entries for the reservations
INSERT INTO booking_history (reservation_id, action_type, performed_by, performed_at, reason, financial_impact, old_values, new_values, created_at) VALUES
-- Original bookings
(1, 'CREATED', 'lisa.chen@email.com', NOW(), 'Initial booking', 1197.00, NULL, '{"status": "CONFIRMED", "totalAmount": 1197.00}', NOW()),
(2, 'CREATED', 'michael.brown@email.com', NOW(), 'Initial booking', 318.00, NULL, '{"status": "CONFIRMED", "totalAmount": 318.00}', NOW()),
(3, 'CREATED', 'sandra.davis@email.com', NOW(), 'Initial booking', 567.00, NULL, '{"status": "CONFIRMED", "totalAmount": 567.00}', NOW()),
(6, 'CREATED', 'james.wilson@email.com', NOW(), 'Initial booking', 178.00, NULL, '{"status": "CONFIRMED", "totalAmount": 178.00}', NOW()),
(6, 'MODIFIED', 'james.wilson@email.com', NOW(), 'Check-in processed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN"}', NOW()),

-- Cancellation history
(7, 'CREATED', 'brian.moore@email.com', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Initial booking', 2097.00, NULL, '{"status": "CONFIRMED", "totalAmount": 2097.00}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 'CANCELLED', 'brian.moore@email.com', NOW(), 'Conference cancelled', -1258.20, '{"status": "CONFIRMED", "totalAmount": 2097.00}', '{"status": "CANCELLED", "refundAmount": 1258.20}', NOW()),

(8, 'CREATED', 'nicole.white@email.com', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Initial booking', 478.00, NULL, '{"status": "CONFIRMED", "totalAmount": 478.00}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'CANCELLED', 'nicole.white@email.com', NOW(), 'Weather-related cancellation', -286.80, '{"status": "CONFIRMED", "totalAmount": 478.00}', '{"status": "CANCELLED", "refundAmount": 286.80}', NOW());
