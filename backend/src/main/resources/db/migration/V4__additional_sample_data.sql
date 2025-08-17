-- V4__additional_sample_data.sql
-- Additional comprehensive sample data for testing search and booking functionality

-- Insert more hotels in different cities for varied search results
INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email) VALUES
('default', 'Downtown Business Hotel', 'Modern business hotel in the financial district', '789 Wall Street', 'New York', 'USA', '+1-555-0789', 'business@downtown.com'),
('default', 'Central Park Inn', 'Boutique hotel overlooking Central Park', '100 Central Park West', 'New York', 'USA', '+1-555-0100', 'info@centralparkinn.com'),
('default', 'Beverly Hills Luxury', 'Exclusive luxury hotel in Beverly Hills', '200 Rodeo Drive', 'Los Angeles', 'USA', '+1-555-0200', 'concierge@beverlyhills.com'),
('default', 'Silicon Valley Tech Hotel', 'Tech-focused hotel with high-speed connectivity', '300 Innovation Way', 'San Francisco', 'USA', '+1-555-0300', 'tech@siliconvalley.com'),
('default', 'Art Deco Palace', 'Historic Art Deco hotel in South Beach', '400 Ocean Drive', 'Miami', 'USA', '+1-555-0400', 'palace@artdeco.com'),
('default', 'Windy City Suites', 'Contemporary suites in downtown Chicago', '500 Michigan Avenue', 'Chicago', 'USA', '+1-555-0500', 'suites@windycity.com'),
('default', 'Freedom Bell Hotel', 'Historic hotel near Independence Hall', '600 Liberty Street', 'Philadelphia', 'USA', '+1-555-0600', 'liberty@freedombell.com'),
('default', 'Space Needle Lodge', 'Modern lodge with views of the Space Needle', '700 Pine Street', 'Seattle', 'USA', '+1-555-0700', 'lodge@spaceneedle.com');

-- Get the hotel IDs for the newly inserted hotels
SET @downtown_hotel_id = (SELECT id FROM hotels WHERE name = 'Downtown Business Hotel' AND tenant_id = 'default');
SET @centralpark_hotel_id = (SELECT id FROM hotels WHERE name = 'Central Park Inn' AND tenant_id = 'default');
SET @beverlyhills_hotel_id = (SELECT id FROM hotels WHERE name = 'Beverly Hills Luxury' AND tenant_id = 'default');
SET @siliconvalley_hotel_id = (SELECT id FROM hotels WHERE name = 'Silicon Valley Tech Hotel' AND tenant_id = 'default');
SET @artdeco_hotel_id = (SELECT id FROM hotels WHERE name = 'Art Deco Palace' AND tenant_id = 'default');
SET @windycity_hotel_id = (SELECT id FROM hotels WHERE name = 'Windy City Suites' AND tenant_id = 'default');
SET @freedombell_hotel_id = (SELECT id FROM hotels WHERE name = 'Freedom Bell Hotel' AND tenant_id = 'default');
SET @spaceneedle_hotel_id = (SELECT id FROM hotels WHERE name = 'Space Needle Lodge' AND tenant_id = 'default');

-- Insert rooms for Downtown Business Hotel
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @downtown_hotel_id, 'B101', 'SINGLE', 159.99, 1, 'Executive single room with work desk', TRUE),
('default', @downtown_hotel_id, 'B102', 'DOUBLE', 219.99, 2, 'Business double with meeting area', TRUE),
('default', @downtown_hotel_id, 'B103', 'SUITE', 349.99, 4, 'Executive suite with conference table', TRUE),
('default', @downtown_hotel_id, 'B201', 'DELUXE', 279.99, 3, 'Premium business room with city view', TRUE),
('default', @downtown_hotel_id, 'B301', 'PRESIDENTIAL', 699.99, 6, 'Executive penthouse suite', TRUE);

-- Insert rooms for Central Park Inn
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @centralpark_hotel_id, 'CP01', 'DOUBLE', 289.99, 2, 'Park view double room with French doors', TRUE),
('default', @centralpark_hotel_id, 'CP02', 'SUITE', 459.99, 4, 'Park-facing suite with fireplace', TRUE),
('default', @centralpark_hotel_id, 'CP03', 'DELUXE', 389.99, 3, 'Deluxe room with park and city views', TRUE),
('default', @centralpark_hotel_id, 'CP04', 'PRESIDENTIAL', 899.99, 8, 'Presidential suite overlooking Central Park', TRUE);

-- Insert rooms for Beverly Hills Luxury
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @beverlyhills_hotel_id, 'BH01', 'DELUXE', 399.99, 3, 'Luxury deluxe room with marble bathroom', TRUE),
('default', @beverlyhills_hotel_id, 'BH02', 'SUITE', 649.99, 4, 'Beverly Hills suite with private terrace', TRUE),
('default', @beverlyhills_hotel_id, 'BH03', 'PRESIDENTIAL', 1299.99, 10, 'Presidential villa with private pool', TRUE),
('default', @beverlyhills_hotel_id, 'BH04', 'DOUBLE', 329.99, 2, 'Premium double with designer furnishings', TRUE);

-- Insert rooms for Silicon Valley Tech Hotel
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @siliconvalley_hotel_id, 'SV01', 'SINGLE', 199.99, 1, 'Tech single room with smart home features', TRUE),
('default', @siliconvalley_hotel_id, 'SV02', 'DOUBLE', 279.99, 2, 'Innovation double with high-tech amenities', TRUE),
('default', @siliconvalley_hotel_id, 'SV03', 'SUITE', 449.99, 4, 'Tech suite with conference room', TRUE),
('default', @siliconvalley_hotel_id, 'SV04', 'PRESIDENTIAL', 799.99, 6, 'Executive tech penthouse', TRUE);

-- Insert rooms for Art Deco Palace
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @artdeco_hotel_id, 'AD01', 'DOUBLE', 259.99, 2, 'Art Deco double with ocean glimpse', TRUE),
('default', @artdeco_hotel_id, 'AD02', 'SUITE', 419.99, 4, 'Vintage suite with period furnishings', TRUE),
('default', @artdeco_hotel_id, 'AD03', 'DELUXE', 339.99, 3, 'Deluxe room with South Beach views', TRUE),
('default', @artdeco_hotel_id, 'AD04', 'PRESIDENTIAL', 849.99, 8, 'Presidential Art Deco penthouse', TRUE);

-- Insert rooms for Windy City Suites
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @windycity_hotel_id, 'WC01', 'SUITE', 319.99, 4, 'Downtown suite with kitchen', TRUE),
('default', @windycity_hotel_id, 'WC02', 'DELUXE', 259.99, 3, 'Deluxe room with river view', TRUE),
('default', @windycity_hotel_id, 'WC03', 'DOUBLE', 199.99, 2, 'Comfortable double with city view', TRUE),
('default', @windycity_hotel_id, 'WC04', 'PRESIDENTIAL', 699.99, 6, 'Presidential suite with skyline view', TRUE);

-- Insert rooms for Freedom Bell Hotel
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @freedombell_hotel_id, 'FB01', 'SINGLE', 149.99, 1, 'Historic single room with period details', TRUE),
('default', @freedombell_hotel_id, 'FB02', 'DOUBLE', 199.99, 2, 'Colonial-style double room', TRUE),
('default', @freedombell_hotel_id, 'FB03', 'SUITE', 329.99, 4, 'Independence suite with historic charm', TRUE),
('default', @freedombell_hotel_id, 'FB04', 'DELUXE', 249.99, 3, 'Deluxe room with Liberty Bell view', TRUE);

-- Insert rooms for Space Needle Lodge
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', @spaceneedle_hotel_id, 'SN01', 'DOUBLE', 229.99, 2, 'Modern double with Space Needle view', TRUE),
('default', @spaceneedle_hotel_id, 'SN02', 'SUITE', 389.99, 4, 'Sky suite with panoramic views', TRUE),
('default', @spaceneedle_hotel_id, 'SN03', 'DELUXE', 299.99, 3, 'Deluxe room with mountain and city views', TRUE),
('default', @spaceneedle_hotel_id, 'SN04', 'PRESIDENTIAL', 749.99, 6, 'Presidential lodge with 360-degree views', TRUE);

-- Insert some sample basic reservations using existing table structure
-- Get guest user ID
SET @guest_user_id = (SELECT id FROM users WHERE email = 'guest@example.com' AND tenant_id = 'default');

-- Get some room IDs for reservations
SET @grand_plaza_room1 = (SELECT id FROM rooms WHERE hotel_id = 1 AND room_number = '101' AND tenant_id = 'default');
SET @grand_plaza_room2 = (SELECT id FROM rooms WHERE hotel_id = 1 AND room_number = '202' AND tenant_id = 'default');
SET @seaside_room1 = (SELECT id FROM rooms WHERE hotel_id = 2 AND room_number = 'A101' AND tenant_id = 'default');

-- Insert basic reservations with existing table structure
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, special_requests, payment_intent_id) VALUES
('default', @grand_plaza_room1, @guest_user_id, '2025-08-10', '2025-08-12', 259.98, 'PENDING', 'Late check-in requested', 'pi_test_completed_001'),
('default', @grand_plaza_room2, @guest_user_id, '2025-08-15', '2025-08-17', 379.98, 'PENDING', 'Room with balcony preferred', 'pi_test_confirmed_002'),
('default', @seaside_room1, @guest_user_id, '2025-08-25', '2025-08-27', 499.98, 'PENDING', 'Celebrating anniversary', 'pi_test_pending_003');

-- Add more guest users for testing
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active) VALUES
('default', 'alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice', 'Johnson', '+1-555-1001', TRUE),
('default', 'charlie@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlie', 'Brown', '+1-555-1002', TRUE),
('default', 'diana@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diana', 'Smith', '+1-555-1003', TRUE);

-- Get the new user IDs
SET @alice_user_id = (SELECT id FROM users WHERE email = 'alice@example.com' AND tenant_id = 'default');
SET @charlie_user_id = (SELECT id FROM users WHERE email = 'charlie@example.com' AND tenant_id = 'default');
SET @diana_user_id = (SELECT id FROM users WHERE email = 'diana@example.com' AND tenant_id = 'default');

-- Add customer role to new users
INSERT INTO user_roles (user_id, role) VALUES
(@alice_user_id, 'CUSTOMER'),
(@charlie_user_id, 'CUSTOMER'),
(@diana_user_id, 'CUSTOMER');
