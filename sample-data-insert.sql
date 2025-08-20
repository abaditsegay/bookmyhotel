-- Sample Data Insertion Script for BookMyHotel
-- This script populates the database with realistic sample data

-- First, insert tenants (adjusted for actual schema)
INSERT INTO tenants (tenant_id, name, description, subdomain, is_active, created_at, updated_at) VALUES
('luxury-chain', 'Luxury Hotel Chain', 'Premium luxury hotels and resorts', 'luxury', true, NOW(), NOW()),
('budget-stays', 'Budget Friendly Stays', 'Affordable and comfortable accommodations', 'budget', true, NOW(), NOW()),
('boutique-collection', 'Boutique Hotel Collection', 'Unique boutique hotels with character', 'boutique', true, NOW(), NOW());

-- Insert hotels for each tenant (adjusted for actual schema)
INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email, is_active, created_at, updated_at) VALUES
-- Luxury Chain Hotels
('luxury-chain', 'Grand Palace Hotel', 'A magnificent luxury hotel in the heart of downtown with world-class amenities and exceptional service.', '123 Royal Avenue', 'New York', 'USA', '+1-212-555-0101', 'info@grandpalace.com', true, NOW(), NOW()),
('luxury-chain', 'Oceanview Resort', 'Premium beachfront resort with stunning ocean views and luxury accommodations.', '456 Coastal Drive', 'Miami', 'USA', '+1-305-555-0202', 'reservations@oceanview.com', true, NOW(), NOW()),

-- Budget Stays Hotels
('budget-stays', 'Downtown Express Inn', 'Clean, comfortable, and affordable accommodations in the city center.', '789 Main Street', 'Chicago', 'USA', '+1-312-555-0303', 'info@downtownexpress.com', true, NOW(), NOW()),
('budget-stays', 'Airport Lodge', 'Convenient airport hotel with shuttle service and competitive rates.', '321 Airport Boulevard', 'Los Angeles', 'USA', '+1-424-555-0404', 'bookings@airportlodge.com', true, NOW(), NOW()),

-- Boutique Collection Hotels
('boutique-collection', 'The Artist Quarter', 'Unique boutique hotel featuring local art and personalized service.', '555 Arts District Lane', 'Portland', 'USA', '+1-503-555-0505', 'stay@artistquarter.com', true, NOW(), NOW()),
('boutique-collection', 'Historic Mansion Inn', 'Restored Victorian mansion with period charm and modern amenities.', '888 Heritage Street', 'Charleston', 'USA', '+1-843-555-0606', 'info@historicmansion.com', true, NOW(), NOW());

-- Insert rooms for each hotel
INSERT INTO rooms (id, hotel_id, room_number, room_type, capacity, base_price, amenities, description, is_available, is_active, created_at, updated_at) VALUES
-- Grand Palace Hotel (Luxury)
(1, 1, '101', 'STANDARD', 2, 299.00, 'King Bed,City View,Marble Bathroom,Mini Bar,Safe', 'Elegant standard room with city views', true, true, NOW(), NOW()),
(2, 1, '102', 'STANDARD', 2, 299.00, 'Queen Bed,City View,Marble Bathroom,Mini Bar,Safe', 'Comfortable standard room with modern amenities', true, true, NOW(), NOW()),
(3, 1, '201', 'DELUXE', 2, 399.00, 'King Bed,Park View,Marble Bathroom,Mini Bar,Safe,Sitting Area', 'Spacious deluxe room with park views', true, true, NOW(), NOW()),
(4, 1, '301', 'SUITE', 4, 699.00, 'King Bed,Sofa Bed,Central Park View,Marble Bathroom,Kitchen,Living Room', 'Luxurious suite with separate living area', true, true, NOW(), NOW()),
(5, 1, '401', 'PRESIDENTIAL', 6, 1299.00, 'Master Suite,Guest Room,Panoramic Views,Full Kitchen,Dining Room,Butler Service', 'Presidential suite with premium amenities', true, true, NOW(), NOW()),

-- Oceanview Resort (Luxury)
(6, 2, '101', 'STANDARD', 2, 249.00, 'Queen Bed,Ocean View,Private Balcony,Mini Fridge,Safe', 'Ocean view room with private balcony', true, true, NOW(), NOW()),
(7, 2, '102', 'STANDARD', 2, 249.00, 'King Bed,Ocean View,Private Balcony,Mini Fridge,Safe', 'Comfortable ocean view accommodation', true, true, NOW(), NOW()),
(8, 2, '201', 'DELUXE', 2, 349.00, 'King Bed,Premium Ocean View,Large Balcony,Mini Bar,Jacuzzi', 'Deluxe room with enhanced ocean views', true, true, NOW(), NOW()),
(9, 2, '301', 'SUITE', 4, 599.00, 'King Bed,Sofa Bed,Panoramic Ocean View,Full Kitchen,Living Area', 'Oceanfront suite with full amenities', true, true, NOW(), NOW()),

-- Downtown Express Inn (Budget)
(10, 3, '101', 'STANDARD', 2, 89.00, 'Queen Bed,Free WiFi,Desk,Coffee Maker,Hair Dryer', 'Clean and comfortable standard room', true, true, NOW(), NOW()),
(11, 3, '102', 'STANDARD', 2, 89.00, 'Two Twin Beds,Free WiFi,Desk,Coffee Maker,Hair Dryer', 'Twin bed configuration for business travelers', true, true, NOW(), NOW()),
(12, 3, '201', 'DELUXE', 2, 109.00, 'King Bed,City View,Mini Fridge,Free WiFi,Work Desk', 'Enhanced room with city views', true, true, NOW(), NOW()),
(13, 3, '301', 'SUITE', 4, 149.00, 'King Bed,Sofa Bed,Kitchenette,Separate Sitting Area', 'Family-friendly suite with kitchenette', true, true, NOW(), NOW()),

-- Airport Lodge (Budget)
(14, 4, '101', 'STANDARD', 2, 79.00, 'Queen Bed,Free WiFi,Desk,Coffee Maker,Blackout Curtains', 'Quiet room designed for rest', true, true, NOW(), NOW()),
(15, 4, '102', 'STANDARD', 2, 79.00, 'King Bed,Free WiFi,Desk,Coffee Maker,Blackout Curtains', 'Comfortable accommodation near airport', true, true, NOW(), NOW()),
(16, 4, '201', 'DELUXE', 2, 99.00, 'King Bed,Runway View,Mini Fridge,Enhanced Soundproofing', 'Upgraded room with better amenities', true, true, NOW(), NOW()),

-- The Artist Quarter (Boutique)
(17, 5, '101', 'STANDARD', 2, 159.00, 'Queen Bed,Local Artwork,Free WiFi,Artisan Coffee,Unique Decor', 'Artist-themed room with local art', true, true, NOW(), NOW()),
(18, 5, '201', 'DELUXE', 2, 199.00, 'King Bed,Gallery View,Balcony,Local Artwork,Mini Bar', 'Deluxe room overlooking art gallery', true, true, NOW(), NOW()),
(19, 5, '301', 'SUITE', 4, 299.00, 'King Bed,Sofa Bed,Art Studio Space,Local Artwork,Kitchenette', 'Creative suite with studio space', true, true, NOW(), NOW()),

-- Historic Mansion Inn (Boutique)
(20, 6, '101', 'STANDARD', 2, 189.00, 'Antique Queen Bed,Garden View,Period Furnishings,Free WiFi', 'Charming room with historic character', true, true, NOW(), NOW()),
(21, 6, '201', 'DELUXE', 2, 239.00, 'Victorian King Bed,Garden View,Clawfoot Tub,Antique Furnishings', 'Elegant Victorian-style accommodation', true, true, NOW(), NOW()),
(22, 6, '301', 'SUITE', 4, 389.00, 'Master Suite,Historic Furnishings,Garden Terrace,Fireplace,Sitting Room', 'Luxurious historic suite with period charm', true, true, NOW(), NOW());

-- Insert users with different roles
INSERT INTO users (id, tenant_id, first_name, last_name, email, password, phone, is_active, email_verified, created_at, updated_at) VALUES
-- Super Admin (no tenant - system-wide access)
(1, NULL, 'System', 'Administrator', 'admin@bookmyhotel.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-000-0001', true, true, NOW(), NOW()),

-- Luxury Chain users
(2, 'luxury-chain', 'John', 'Manager', 'admin@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-100-0001', true, true, NOW(), NOW()),
(3, 'luxury-chain', 'Sarah', 'Smith', 'frontdesk.grandpalace@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-212-555-0101', true, true, NOW(), NOW()),
(4, 'luxury-chain', 'Mike', 'Johnson', 'frontdesk.oceanview@luxury-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-305-555-0202', true, true, NOW(), NOW()),

-- Budget Stays users
(5, 'budget-stays', 'Lisa', 'Davis', 'admin@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-200-0001', true, true, NOW(), NOW()),
(6, 'budget-stays', 'Tom', 'Wilson', 'frontdesk.downtown@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-312-555-0303', true, true, NOW(), NOW()),
(7, 'budget-stays', 'Emma', 'Brown', 'frontdesk.airport@budget-stays.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-424-555-0404', true, true, NOW(), NOW()),

-- Boutique Collection users
(8, 'boutique-collection', 'Alex', 'Garcia', 'admin@boutique-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-300-0001', true, true, NOW(), NOW()),
(9, 'boutique-collection', 'Jessica', 'Miller', 'frontdesk.artist@boutique-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-503-555-0505', true, true, NOW(), NOW()),
(10, 'boutique-collection', 'David', 'Anderson', 'frontdesk.mansion@boutique-hotels.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-843-555-0606', true, true, NOW(), NOW()),

-- Guest users for testing
(11, NULL, 'Guest', 'User', 'guest@example.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0001', true, true, NOW(), NOW()),
(12, NULL, 'Jane', 'Customer', 'jane.customer@email.com', '$2a$10$1IGHQHFz8R.xZTqzjUrQqeQ4zk/p7xfQgGjkFuZHmDJYy9g3UGxzi', '+1-555-999-0002', true, true, NOW(), NOW());

-- Insert user roles
INSERT INTO user_roles (user_id, role) VALUES
-- Super Admin
(1, 'SUPER_ADMIN'),

-- Hotel Admins (one per tenant)
(2, 'HOTEL_ADMIN'),
(5, 'HOTEL_ADMIN'),
(8, 'HOTEL_ADMIN'),

-- Front Desk users (one per hotel)
(3, 'FRONT_DESK'),
(4, 'FRONT_DESK'),
(6, 'FRONT_DESK'),
(7, 'FRONT_DESK'),
(9, 'FRONT_DESK'),
(10, 'FRONT_DESK'),

-- Guest users
(11, 'GUEST'),
(12, 'GUEST');

-- Insert sample reservations with different statuses
INSERT INTO reservations (id, room_id, guest_first_name, guest_last_name, guest_email, guest_phone, check_in_date, check_out_date, adults, children, special_requests, total_amount, status, confirmation_number, booking_token, created_at, updated_at) VALUES
-- Recent confirmed reservations
(1, 1, 'Robert', 'Johnson', 'robert.johnson@email.com', '+1-555-777-0001', '2025-08-25', '2025-08-28', 2, 0, 'Late check-in requested', 897.00, 'CONFIRMED', 'BMH-2025-001', 'tok_1234567890abcdef', NOW(), NOW()),
(2, 6, 'Maria', 'Rodriguez', 'maria.rodriguez@email.com', '+1-555-777-0002', '2025-08-22', '2025-08-25', 2, 1, 'Crib needed for child', 747.00, 'CONFIRMED', 'BMH-2025-002', 'tok_2345678901bcdefg', NOW(), NOW()),
(3, 10, 'James', 'Wilson', 'james.wilson@email.com', '+1-555-777-0003', '2025-08-20', '2025-08-22', 1, 0, 'Business traveler, quiet room please', 178.00, 'CHECKED_IN', 'BMH-2025-003', 'tok_3456789012cdefgh', NOW(), NOW()),

-- Future reservations that can be modified (more than 24 hours away)
(4, 3, 'Lisa', 'Chen', 'lisa.chen@email.com', '+1-555-777-0004', '2025-08-26', '2025-08-29', 2, 0, 'Honeymoon suite if available', 1197.00, 'CONFIRMED', 'BMH-2025-004', 'tok_4567890123defghi', NOW(), NOW()),
(5, 17, 'Michael', 'Brown', 'michael.brown@email.com', '+1-555-777-0005', '2025-08-28', '2025-08-30', 2, 0, 'Interested in local art tours', 318.00, 'CONFIRMED', 'BMH-2025-005', 'tok_5678901234efghij', NOW(), NOW()),
(6, 20, 'Sandra', 'Davis', 'sandra.davis@email.com', '+1-555-777-0006', '2025-09-01', '2025-09-04', 2, 0, 'Celebrating anniversary', 567.00, 'CONFIRMED', 'BMH-2025-006', 'tok_6789012345fghijk', NOW(), NOW()),

-- Past completed reservations
(7, 14, 'Kevin', 'Martinez', 'kevin.martinez@email.com', '+1-555-777-0007', '2025-08-15', '2025-08-17', 1, 0, 'Early flight departure', 158.00, 'COMPLETED', 'BMH-2025-007', 'tok_7890123456ghijkl', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(8, 8, 'Amanda', 'Taylor', 'amanda.taylor@email.com', '+1-555-777-0008', '2025-08-10', '2025-08-14', 2, 2, 'Family vacation with kids', 1396.00, 'COMPLETED', 'BMH-2025-008', 'tok_8901234567hijklm', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Cancelled reservations
(9, 4, 'Brian', 'Moore', 'brian.moore@email.com', '+1-555-777-0009', '2025-08-30', '2025-09-02', 4, 0, 'Business conference cancelled', 2097.00, 'CANCELLED', 'BMH-2025-009', 'tok_9012345678ijklmn', NOW(), NOW()),
(10, 21, 'Nicole', 'White', 'nicole.white@email.com', '+1-555-777-0010', '2025-08-27', '2025-08-29', 2, 0, 'Plans changed due to weather', 478.00, 'CANCELLED', 'BMH-2025-010', 'tok_0123456789jklmno', NOW(), NOW());

-- Insert some booking history entries for the reservations to demonstrate the audit trail
INSERT INTO booking_history (id, reservation_id, action_type, performed_by, performed_at, reason, financial_impact, old_values, new_values, created_at) VALUES
-- Original bookings
(1, 1, 'CREATED', 'robert.johnson@email.com', NOW(), 'Initial booking', 897.00, NULL, '{"status": "CONFIRMED", "totalAmount": 897.00}', NOW()),
(2, 2, 'CREATED', 'maria.rodriguez@email.com', NOW(), 'Initial booking', 747.00, NULL, '{"status": "CONFIRMED", "totalAmount": 747.00}', NOW()),
(3, 3, 'CREATED', 'james.wilson@email.com', NOW(), 'Initial booking', 178.00, NULL, '{"status": "CONFIRMED", "totalAmount": 178.00}', NOW()),
(4, 3, 'MODIFIED', 'james.wilson@email.com', NOW(), 'Check-in processed', 0.00, '{"status": "CONFIRMED"}', '{"status": "CHECKED_IN"}', NOW()),

-- Cancellation history
(5, 9, 'CREATED', 'brian.moore@email.com', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Initial booking', 2097.00, NULL, '{"status": "CONFIRMED", "totalAmount": 2097.00}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 9, 'CANCELLED', 'brian.moore@email.com', NOW(), 'Conference cancelled', -1258.20, '{"status": "CONFIRMED", "totalAmount": 2097.00}', '{"status": "CANCELLED", "refundAmount": 1258.20}', NOW()),

(7, 10, 'CREATED', 'nicole.white@email.com', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Initial booking', 478.00, NULL, '{"status": "CONFIRMED", "totalAmount": 478.00}', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 10, 'CANCELLED', 'nicole.white@email.com', NOW(), 'Weather-related cancellation', -286.80, '{"status": "CONFIRMED", "totalAmount": 478.00}', '{"status": "CANCELLED", "refundAmount": 286.80}', NOW());

-- Insert promotional codes for testing
INSERT INTO promotional_codes (id, tenant_id, code, description, discount_type, discount_value, min_stay_nights, max_uses, current_uses, valid_from, valid_until, is_active, created_at, updated_at) VALUES
(1, 'luxury-chain', 'LUXURY20', 'Luxury chain 20% off', 'PERCENTAGE', 20.00, 2, 100, 5, '2025-08-01', '2025-12-31', true, NOW(), NOW()),
(2, 'budget-stays', 'BUDGET50', 'Budget stays $50 off', 'FIXED', 50.00, 3, 50, 2, '2025-08-01', '2025-11-30', true, NOW(), NOW()),
(3, 'boutique-collection', 'BOUTIQUE15', 'Boutique collection 15% off', 'PERCENTAGE', 15.00, 1, 75, 8, '2025-08-01', '2025-10-31', true, NOW(), NOW()),
(4, NULL, 'WELCOME10', 'Welcome offer 10% off', 'PERCENTAGE', 10.00, 1, 1000, 45, '2025-08-01', '2025-12-31', true, NOW(), NOW());

-- Insert seasonal rates for peak/off-peak pricing
INSERT INTO seasonal_rates (id, hotel_id, room_type, rate_name, start_date, end_date, rate_multiplier, is_active, created_at, updated_at) VALUES
-- Summer peak season for beach resort
(1, 2, 'STANDARD', 'Summer Peak', '2025-06-01', '2025-08-31', 1.50, true, NOW(), NOW()),
(2, 2, 'DELUXE', 'Summer Peak', '2025-06-01', '2025-08-31', 1.40, true, NOW(), NOW()),
(3, 2, 'SUITE', 'Summer Peak', '2025-06-01', '2025-08-31', 1.30, true, NOW(), NOW()),

-- Holiday season for city hotels
(4, 1, 'STANDARD', 'Holiday Season', '2025-12-20', '2026-01-05', 1.75, true, NOW(), NOW()),
(5, 1, 'DELUXE', 'Holiday Season', '2025-12-20', '2026-01-05', 1.60, true, NOW(), NOW()),
(6, 1, 'SUITE', 'Holiday Season', '2025-12-20', '2026-01-05', 1.45, true, NOW(), NOW()),
(7, 1, 'PRESIDENTIAL', 'Holiday Season', '2025-12-20', '2026-01-05', 1.25, true, NOW(), NOW()),

-- Spring discount for boutique hotels
(8, 5, 'STANDARD', 'Spring Special', '2025-03-01', '2025-05-31', 0.90, true, NOW(), NOW()),
(9, 5, 'DELUXE', 'Spring Special', '2025-03-01', '2025-05-31', 0.85, true, NOW(), NOW()),
(10, 6, 'STANDARD', 'Spring Special', '2025-03-01', '2025-05-31', 0.90, true, NOW(), NOW()),
(11, 6, 'DELUXE', 'Spring Special', '2025-03-01', '2025-05-31', 0.85, true, NOW(), NOW());

-- Insert pricing strategies
INSERT INTO pricing_strategies (id, hotel_id, strategy_name, base_rate_multiplier, demand_factor, advance_booking_discount, last_minute_multiplier, weekend_multiplier, is_active, created_at, updated_at) VALUES
(1, 1, 'Luxury Dynamic Pricing', 1.0, 0.15, 0.10, 1.25, 1.20, true, NOW(), NOW()),
(2, 2, 'Resort Seasonal Pricing', 1.0, 0.20, 0.15, 1.15, 1.30, true, NOW(), NOW()),
(3, 3, 'Budget Value Pricing', 1.0, 0.05, 0.05, 1.10, 1.15, true, NOW(), NOW()),
(4, 4, 'Airport Convenience Pricing', 1.0, 0.10, 0.08, 1.20, 1.10, true, NOW(), NOW()),
(5, 5, 'Boutique Artisan Pricing', 1.0, 0.12, 0.12, 1.18, 1.25, true, NOW(), NOW()),
(6, 6, 'Historic Premium Pricing', 1.0, 0.18, 0.20, 1.30, 1.35, true, NOW(), NOW());

-- Add some hotel registrations for audit purposes
INSERT INTO hotel_registrations (id, tenant_id, hotel_name, description, address, city, state, country, contact_email, contact_phone, registration_status, submitted_at, reviewed_at, reviewed_by, rejection_reason, created_at, updated_at) VALUES
(1, 'luxury-chain', 'Grand Palace Hotel', 'Luxury hotel registration', '123 Royal Avenue', 'New York', 'NY', 'USA', 'info@grandpalace.com', '+1-212-555-0101', 'APPROVED', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY), 1, NULL, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 29 DAY)),
(2, 'budget-stays', 'Budget Express Downtown', 'New budget hotel pending approval', '999 Budget Street', 'Seattle', 'WA', 'USA', 'info@budgetexpress.com', '+1-206-555-0999', 'PENDING', DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 'boutique-collection', 'Failed Boutique Attempt', 'Hotel registration that was rejected', '777 Rejected Lane', 'Austin', 'TX', 'USA', 'info@failed.com', '+1-512-555-0777', 'REJECTED', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), 8, 'Insufficient documentation provided', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY));
