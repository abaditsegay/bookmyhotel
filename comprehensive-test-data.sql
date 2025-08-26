-- Comprehensive Realistic Test Data for BookMyHotel
-- Phase 1: Extended Tenants, Hotels with Many Rooms, and Users
-- Current Date Context: August 26, 2025

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data first (in proper order to avoid foreign key issues)
DELETE FROM maintenance_tasks;
DELETE FROM housekeeping_tasks;
DELETE FROM housekeeping_staff;
DELETE FROM booking_history;
DELETE FROM reservations;
DELETE FROM seasonal_rates;
DELETE FROM pricing_strategies;
DELETE FROM promotional_codes;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM rooms;
DELETE FROM hotels;
DELETE FROM tenants;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- PHASE 1: TENANTS WITH REALISTIC PROFILES
-- =============================================

INSERT INTO tenants (tenant_id, name, description, subdomain, is_active, created_at, updated_at) VALUES
-- Premium luxury chains
('grandlux-hotels', 'GrandLux Hotels International', 'Ultra-luxury hotel chain with properties in major global cities', 'grandlux', true, NOW(), NOW()),
('royal-resorts', 'Royal Palace Resorts', 'Exclusive luxury resorts and spa destinations', 'royal', true, NOW(), NOW()),
('platinum-hospitality', 'Platinum Hospitality Group', 'Premium business and leisure hotels', 'platinum', true, NOW(), NOW()),

-- Mid-range business hotels
('business-select', 'Business Select Hotels', 'Professional business hotels with modern amenities', 'bizselect', true, NOW(), NOW()),
('urban-stays', 'Urban Stays Collection', 'Contemporary hotels in city centers', 'urban', true, NOW(), NOW()),
('metro-hotels', 'Metro Hotel Network', 'Reliable mid-range accommodations', 'metro', true, NOW(), NOW()),

-- Budget and economy chains
('smart-stay', 'Smart Stay Budget Hotels', 'Clean, comfortable, and affordable accommodations', 'smartstay', true, NOW(), NOW()),
('value-inn', 'Value Inn Express', 'Budget-friendly hotels with essential amenities', 'valueinn', true, NOW(), NOW()),
('economy-lodge', 'Economy Lodge Chain', 'Basic comfortable lodging for travelers', 'economy', true, NOW(), NOW()),

-- Boutique and specialty
('artisan-collection', 'Artisan Boutique Collection', 'Unique boutique hotels with local character', 'artisan', true, NOW(), NOW()),
('heritage-inns', 'Heritage Historic Inns', 'Historic properties with modern comforts', 'heritage', true, NOW(), NOW()),
('eco-retreats', 'Eco-Friendly Retreats', 'Sustainable and environmentally conscious hotels', 'eco', true, NOW(), NOW());

-- =============================================
-- PHASE 2: HOTELS WITH MANY ROOMS PER PROPERTY
-- =============================================

INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email, is_active, created_at, updated_at) VALUES
-- GrandLux Hotels (Premium Luxury)
('grandlux-hotels', 'GrandLux Manhattan Tower', 'Iconic 50-story luxury hotel in Times Square with world-class amenities', '1000 Broadway', 'New York', 'USA', '+1-212-555-1000', 'reservations@grandlux-manhattan.com', true, NOW(), NOW()),
('grandlux-hotels', 'GrandLux Beverly Hills', 'Elegant luxury hotel on Rodeo Drive with celebrity clientele', '9876 Rodeo Drive', 'Beverly Hills', 'USA', '+1-310-555-1001', 'concierge@grandlux-bh.com', true, NOW(), NOW()),
('grandlux-hotels', 'GrandLux Chicago Magnificent Mile', 'Sophisticated downtown luxury hotel with Lake Michigan views', '500 North Michigan Avenue', 'Chicago', 'USA', '+1-312-555-1002', 'info@grandlux-chicago.com', true, NOW(), NOW()),

-- Royal Palace Resorts (Luxury Resorts)
('royal-resorts', 'Royal Palace Miami Beach', 'Beachfront luxury resort with private beach and spa', '1500 Ocean Drive', 'Miami Beach', 'USA', '+1-305-555-2000', 'royalmiami@royal-resorts.com', true, NOW(), NOW()),
('royal-resorts', 'Royal Mountain Lodge Aspen', 'Exclusive ski resort with mountain views and luxury amenities', '100 Aspen Mountain Road', 'Aspen', 'USA', '+1-970-555-2001', 'aspen@royal-resorts.com', true, NOW(), NOW()),
('royal-resorts', 'Royal Palace Napa Valley', 'Wine country resort with vineyard views and wine tastings', '2000 Silverado Trail', 'Napa', 'USA', '+1-707-555-2002', 'napa@royal-resorts.com', true, NOW(), NOW()),

-- Platinum Hospitality (Premium Business)
('platinum-hospitality', 'Platinum Executive Center NYC', 'Modern business hotel near Wall Street', '250 Water Street', 'New York', 'USA', '+1-212-555-3000', 'business@platinum-nyc.com', true, NOW(), NOW()),
('platinum-hospitality', 'Platinum Airport Hotel LAX', 'Premium airport hotel with conference facilities', '9000 Airport Boulevard', 'Los Angeles', 'USA', '+1-424-555-3001', 'lax@platinum-hotels.com', true, NOW(), NOW()),
('platinum-hospitality', 'Platinum Convention Center Vegas', 'Large convention hotel with extensive meeting spaces', '3500 Las Vegas Boulevard', 'Las Vegas', 'USA', '+1-702-555-3002', 'vegas@platinum-hotels.com', true, NOW(), NOW()),

-- Business Select Hotels (Mid-range Business)
('business-select', 'Business Select Downtown Seattle', 'Professional hotel in business district', '1200 4th Avenue', 'Seattle', 'USA', '+1-206-555-4000', 'seattle@businessselect.com', true, NOW(), NOW()),
('business-select', 'Business Select Austin Tech District', 'Modern hotel in tech corridor', '500 South Lamar Boulevard', 'Austin', 'USA', '+1-512-555-4001', 'austin@businessselect.com', true, NOW(), NOW()),
('business-select', 'Business Select Denver Airport', 'Convenient airport business hotel', '8500 Peña Boulevard', 'Denver', 'USA', '+1-303-555-4002', 'denver@businessselect.com', true, NOW(), NOW()),

-- Urban Stays Collection (Contemporary City Hotels)
('urban-stays', 'Urban Loft San Francisco', 'Hip urban hotel in SOMA district', '750 Market Street', 'San Francisco', 'USA', '+1-415-555-5000', 'soma@urbanstays.com', true, NOW(), NOW()),
('urban-stays', 'Urban District Philadelphia', 'Modern hotel in Old City', '400 Arch Street', 'Philadelphia', 'USA', '+1-215-555-5001', 'philly@urbanstays.com', true, NOW(), NOW()),
('urban-stays', 'Urban Plaza Boston', 'Contemporary hotel near Fenway Park', '800 Boylston Street', 'Boston', 'USA', '+1-617-555-5002', 'boston@urbanstays.com', true, NOW(), NOW()),

-- Metro Hotel Network (Reliable Mid-range)
('metro-hotels', 'Metro Inn Nashville Music Row', 'Comfortable hotel in music district', '1600 Music Valley Drive', 'Nashville', 'USA', '+1-615-555-6000', 'nashville@metrohotels.com', true, NOW(), NOW()),
('metro-hotels', 'Metro Plaza Orlando Universal', 'Family-friendly hotel near theme parks', '5900 Universal Boulevard', 'Orlando', 'USA', '+1-407-555-6001', 'orlando@metrohotels.com', true, NOW(), NOW()),
('metro-hotels', 'Metro Center Phoenix', 'Desert city hotel with pool and fitness center', '2400 East Camelback Road', 'Phoenix', 'USA', '+1-602-555-6002', 'phoenix@metrohotels.com', true, NOW(), NOW()),

-- Smart Stay Budget Hotels (Clean Budget)
('smart-stay', 'Smart Stay Times Square', 'Budget hotel in prime location', '200 West 41st Street', 'New York', 'USA', '+1-212-555-7000', 'timessquare@smartstay.com', true, NOW(), NOW()),
('smart-stay', 'Smart Stay Hollywood', 'Affordable hotel near attractions', '1750 North Highland Avenue', 'Los Angeles', 'USA', '+1-323-555-7001', 'hollywood@smartstay.com', true, NOW(), NOW()),
('smart-stay', 'Smart Stay River Walk', 'Budget hotel near famous river walk', '700 East Market Street', 'San Antonio', 'USA', '+1-210-555-7002', 'riverwalk@smartstay.com', true, NOW(), NOW()),

-- Value Inn Express (Basic Budget)
('value-inn', 'Value Inn Portland Downtown', 'Basic comfortable lodging in city center', '1000 Southwest Broadway', 'Portland', 'USA', '+1-503-555-8000', 'portland@valueinn.com', true, NOW(), NOW()),
('value-inn', 'Value Inn Kansas City Airport', 'Airport budget hotel with shuttle service', '11728 Northwest Plaza Circle', 'Kansas City', 'USA', '+1-816-555-8001', 'kc@valueinn.com', true, NOW(), NOW()),
('value-inn', 'Value Inn Memphis Beale Street', 'Budget hotel near music attractions', '340 West Illinois Avenue', 'Memphis', 'USA', '+1-901-555-8002', 'memphis@valueinn.com', true, NOW(), NOW()),

-- Economy Lodge Chain (Essential Budget)
('economy-lodge', 'Economy Lodge Interstate Dallas', 'Basic highway hotel for travelers', '1500 North Interstate 35E', 'Dallas', 'USA', '+1-214-555-9000', 'dallas@economylodge.com', true, NOW(), NOW()),
('economy-lodge', 'Economy Lodge Tampa Bay', 'Simple lodging near airport', '4732 West Cypress Street', 'Tampa', 'USA', '+1-813-555-9001', 'tampa@economylodge.com', true, NOW(), NOW()),

-- Artisan Boutique Collection (Unique Boutique)
('artisan-collection', 'The Artist Loft Charleston', 'Historic boutique hotel in arts district', '100 Meeting Street', 'Charleston', 'USA', '+1-843-555-1100', 'charleston@artisancollection.com', true, NOW(), NOW()),
('artisan-collection', 'Artisan House Savannah', 'Restored Victorian mansion boutique hotel', '500 Bull Street', 'Savannah', 'USA', '+1-912-555-1101', 'savannah@artisancollection.com', true, NOW(), NOW()),
('artisan-collection', 'Creative Quarter Santa Fe', 'Adobe-style boutique hotel with local art', '400 Old Santa Fe Trail', 'Santa Fe', 'USA', '+1-505-555-1102', 'santafe@artisancollection.com', true, NOW(), NOW()),

-- Heritage Historic Inns (Historic Properties)
('heritage-inns', 'Heritage Manor Newport', 'Gilded Age mansion turned luxury inn', '200 Bellevue Avenue', 'Newport', 'USA', '+1-401-555-1200', 'newport@heritageinns.com', true, NOW(), NOW()),
('heritage-inns', 'Old Town Inn San Diego', 'Historic property in Old Town district', '2400 San Diego Avenue', 'San Diego', 'USA', '+1-619-555-1201', 'sandiego@heritageinns.com', true, NOW(), NOW()),

-- Eco-Friendly Retreats (Sustainable Hotels)
('eco-retreats', 'Green Valley Retreat Asheville', 'Sustainable mountain retreat with eco-amenities', '1000 Blue Ridge Parkway', 'Asheville', 'USA', '+1-828-555-1300', 'asheville@ecoretreats.com', true, NOW(), NOW()),
('eco-retreats', 'Solar Springs Sedona', 'Solar-powered desert retreat with spa', '300 Red Rock Crossing Road', 'Sedona', 'USA', '+1-928-555-1301', 'sedona@ecoretreats.com', true, NOW(), NOW());

-- =============================================
-- PHASE 3: ROOMS - MANY ROOMS PER HOTEL
-- =============================================

-- Helper function to insert rooms for a hotel
-- GrandLux Manhattan Tower (Hotel ID 1) - 50 floors, 800 rooms
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
-- Floors 3-15: Standard Luxury Rooms (260 rooms)
(1, 'grandlux-hotels', '301', 'SINGLE', 2, 450.00, 'Luxury room with city view and marble bathroom', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '302', 'SINGLE', 2, 450.00, 'Elegant room with premium amenities', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '303', 'SINGLE', 2, 450.00, 'Sophisticated accommodation with modern design', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '304', 'SINGLE', 2, 450.00, 'Luxury room with work desk and sitting area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '305', 'DOUBLE', 2, 450.00, 'Twin luxury room perfect for business travelers', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '306', 'SINGLE', 2, 450.00, 'Premium room with Central Park glimpses', 'MAINTENANCE', false, NOW(), NOW()),
(1, 'grandlux-hotels', '307', 'SINGLE', 2, 450.00, 'Luxury accommodation with premium linens', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '308', 'SINGLE', 2, 450.00, 'Elegant room with marble bathroom', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '309', 'SINGLE', 2, 450.00, 'Sophisticated city view room', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '310', 'SINGLE', 2, 450.00, 'Premium room with luxury amenities', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '311', 'SINGLE', 2, 450.00, 'Modern luxury accommodation', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '312', 'SINGLE', 2, 450.00, 'Elegant room with sitting area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '313', 'SINGLE', 2, 450.00, 'Luxury room with premium fixtures', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '314', 'SINGLE', 2, 450.00, 'Sophisticated accommodation', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '315', 'SINGLE', 2, 450.00, 'Premium city view room', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '316', 'SINGLE', 2, 450.00, 'Elegant luxury accommodation', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '317', 'SINGLE', 2, 450.00, 'Modern room with premium amenities', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '318', 'SINGLE', 2, 450.00, 'Luxury room with work station', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '319', 'SINGLE', 2, 450.00, 'Sophisticated urban accommodation', 'CLEANING', false, NOW(), NOW()),
(1, 'grandlux-hotels', '320', 'SINGLE', 2, 450.00, 'Premium room with city views', 'AVAILABLE', true, NOW(), NOW()),

-- Floor 4 (Representative of floors 4-15)
(1, 'grandlux-hotels', '401', 'SINGLE', 2, 465.00, 'Higher floor luxury room with enhanced views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '402', 'SINGLE', 2, 465.00, 'Premium room with elevated city panorama', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '403', 'SINGLE', 2, 465.00, 'Elegant accommodation with superior views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '404', 'SINGLE', 2, 465.00, 'Luxury room with panoramic city views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '405', 'DOUBLE', 2, 465.00, 'Twin room with enhanced amenities', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '406', 'SINGLE', 2, 465.00, 'Premium accommodation with city views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '407', 'SINGLE', 2, 465.00, 'Sophisticated room with luxury finishes', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '408', 'SINGLE', 2, 465.00, 'Modern luxury room with work area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '409', 'SINGLE', 2, 465.00, 'Elegant city view accommodation', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '410', 'SINGLE', 2, 465.00, 'Premium room with marble bathroom', 'AVAILABLE', true, NOW(), NOW()),

-- Floors 16-30: Deluxe Rooms (300 rooms - showing sample)
(1, 'grandlux-hotels', '1601', 'DELUXE', 2, 650.00, 'Spacious deluxe room with panoramic city views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1602', 'DELUXE', 2, 650.00, 'Luxurious deluxe accommodation with premium amenities', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1603', 'DELUXE', 2, 650.00, 'Elegant deluxe room with separate seating area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1604', 'DELUXE', 2, 650.00, 'Premium deluxe room with enhanced city views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1605', 'DELUXE', 2, 650.00, 'Sophisticated deluxe accommodation', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1606', 'DELUXE', 2, 650.00, 'Spacious room with luxury furnishings', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1607', 'DELUXE', 2, 650.00, 'Deluxe room with marble bathroom and sitting area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1608', 'DELUXE', 2, 650.00, 'Premium accommodation with city panorama', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1609', 'DELUXE', 2, 650.00, 'Elegant deluxe room with work station', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '1610', 'DELUXE', 2, 650.00, 'Luxurious deluxe accommodation', 'AVAILABLE', true, NOW(), NOW()),

-- Floors 31-45: Executive Suites (150 rooms - showing sample)
(1, 'grandlux-hotels', '3101', 'SUITE', 4, 950.00, 'Executive suite with separate living room and bedroom', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3102', 'SUITE', 4, 950.00, 'Luxury suite with panoramic city views', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3103', 'SUITE', 4, 950.00, 'Spacious executive suite with dining area', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3104', 'SUITE', 4, 950.00, 'Premium suite with conference table', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3105', 'SUITE', 6, 1150.00, 'Large family suite with two bedrooms', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3106', 'SUITE', 4, 950.00, 'Executive suite with kitchenette', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3107', 'SUITE', 4, 950.00, 'Luxury suite with home theater system', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '3108', 'SUITE', 4, 950.00, 'Sophisticated suite with wine bar', 'AVAILABLE', true, NOW(), NOW()),

-- Floors 46-50: Presidential and VIP Suites (90 rooms - showing sample)
(1, 'grandlux-hotels', '4601', 'PRESIDENTIAL', 8, 2500.00, 'Presidential suite with private elevator and butler service', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '4602', 'PRESIDENTIAL', 6, 2200.00, 'VIP suite with rooftop terrace access', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '4603', 'PRESIDENTIAL', 8, 2500.00, 'Luxury presidential suite with full kitchen', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '4604', 'PRESIDENTIAL', 10, 3000.00, 'Grand presidential suite with meeting room', 'AVAILABLE', true, NOW(), NOW()),
(1, 'grandlux-hotels', '4605', 'PRESIDENTIAL', 6, 2200.00, 'Executive VIP suite with private dining', 'AVAILABLE', true, NOW(), NOW()),

-- Royal Palace Miami Beach (Hotel ID 4) - Beach Resort with 300 rooms
-- Oceanfront rooms
(4, 'royal-resorts', '101', 'SINGLE', 2, 380.00, 'Direct oceanfront room with private balcony', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '102', 'SINGLE', 2, 380.00, 'Beachfront accommodation with ocean views', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '103', 'SINGLE', 2, 380.00, 'Oceanview room with tropical decor', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '104', 'SINGLE', 2, 380.00, 'Beachside room with modern amenities', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '105', 'DELUXE', 2, 520.00, 'Deluxe oceanfront with enhanced amenities', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '106', 'DELUXE', 2, 520.00, 'Premium beachfront accommodation', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '107', 'SINGLE', 2, 380.00, 'Ocean view room with beach access', 'CLEANING', false, NOW(), NOW()),
(4, 'royal-resorts', '108', 'SINGLE', 2, 380.00, 'Tropical oceanfront accommodation', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '109', 'SINGLE', 2, 380.00, 'Beachfront room with private patio', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '110', 'SINGLE', 2, 380.00, 'Ocean view room with luxury amenities', 'AVAILABLE', true, NOW(), NOW()),

-- Second floor ocean view
(4, 'royal-resorts', '201', 'DELUXE', 2, 580.00, 'Elevated oceanfront deluxe room', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '202', 'DELUXE', 2, 580.00, 'Premium ocean view with enhanced space', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '203', 'DELUXE', 2, 580.00, 'Luxury beachfront accommodation', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '204', 'SUITE', 4, 850.00, 'Ocean view suite with living area', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '205', 'SUITE', 4, 850.00, 'Beachfront suite with kitchenette', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '206', 'DELUXE', 2, 580.00, 'Premium oceanfront deluxe room', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '207', 'DELUXE', 2, 580.00, 'Elevated beach view accommodation', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '208', 'DELUXE', 2, 580.00, 'Luxury ocean view room', 'AVAILABLE', true, NOW(), NOW()),

-- Penthouse level
(4, 'royal-resorts', '501', 'PRESIDENTIAL', 8, 1800.00, 'Oceanfront presidential suite with private beach access', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '502', 'PRESIDENTIAL', 6, 1600.00, 'Luxury penthouse with panoramic ocean views', 'AVAILABLE', true, NOW(), NOW()),
(4, 'royal-resorts', '503', 'PRESIDENTIAL', 10, 2200.00, 'Grand penthouse suite with private pool', 'AVAILABLE', true, NOW(), NOW());

-- Continue with more hotels (showing key examples)

-- Smart Stay Times Square (Hotel ID 17) - Budget hotel with 150 rooms
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
(17, 'smart-stay', '301', 'SINGLE', 2, 149.00, 'Clean comfortable room in Times Square', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '302', 'SINGLE', 2, 149.00, 'Budget-friendly accommodation with modern amenities', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '303', 'DOUBLE', 2, 149.00, 'Twin bed room perfect for business travelers', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '304', 'SINGLE', 2, 149.00, 'Affordable room with city views', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '305', 'SINGLE', 2, 149.00, 'Compact efficient room design', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '306', 'SINGLE', 2, 149.00, 'Budget room with essential amenities', 'MAINTENANCE', false, NOW(), NOW()),
(17, 'smart-stay', '307', 'SINGLE', 2, 149.00, 'Clean comfortable accommodation', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '308', 'SINGLE', 2, 149.00, 'Modern budget room with efficient layout', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '309', 'SINGLE', 2, 149.00, 'Affordable Times Square accommodation', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '310', 'SINGLE', 2, 149.00, 'Budget-friendly room with modern fixtures', 'AVAILABLE', true, NOW(), NOW()),

-- Higher floors
(17, 'smart-stay', '801', 'DELUXE', 2, 179.00, 'Upgraded room with better city views', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '802', 'DELUXE', 2, 179.00, 'Enhanced budget accommodation', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '803', 'SUITE', 4, 229.00, 'Family suite with separate sleeping areas', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '804', 'DELUXE', 2, 179.00, 'Premium budget room with amenities', 'AVAILABLE', true, NOW(), NOW()),
(17, 'smart-stay', '805', 'DELUXE', 2, 179.00, 'Upgraded accommodation with city views', 'AVAILABLE', true, NOW(), NOW());

-- Artisan Collection Charleston (Hotel ID 23) - Boutique with 45 rooms
INSERT INTO rooms (hotel_id, tenant_id, room_number, room_type, capacity, price_per_night, description, status, is_available, created_at, updated_at) VALUES
(23, 'artisan-collection', '101', 'SINGLE', 2, 245.00, 'Artist-themed room with original local artwork', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '102', 'SINGLE', 2, 245.00, 'Unique room featuring Charleston artists', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '103', 'SINGLE', 2, 245.00, 'Creative space with historic charm', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '104', 'DELUXE', 2, 295.00, 'Deluxe room overlooking arts district', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '105', 'DELUXE', 2, 295.00, 'Enhanced artistic accommodation', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '106', 'SINGLE', 2, 245.00, 'Gallery room with rotating art exhibits', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '107', 'SINGLE', 2, 245.00, 'Boutique room with handcrafted furniture', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '108', 'SINGLE', 2, 245.00, 'Artist studio-inspired accommodation', 'AVAILABLE', true, NOW(), NOW()),

-- Second floor
(23, 'artisan-collection', '201', 'DELUXE', 2, 325.00, 'Premium artistic room with balcony', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '202', 'DELUXE', 2, 325.00, 'Elevated creative space with city views', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '203', 'SUITE', 4, 445.00, 'Artist suite with studio space', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '204', 'SUITE', 4, 445.00, 'Creative suite with workshop area', 'AVAILABLE', true, NOW(), NOW()),
(23, 'artisan-collection', '205', 'DELUXE', 2, 325.00, 'Premium room with gallery views', 'AVAILABLE', true, NOW(), NOW()),

-- Penthouse
(23, 'artisan-collection', '301', 'PRESIDENTIAL', 6, 695.00, 'Penthouse studio with private art gallery', 'AVAILABLE', true, NOW(), NOW());

-- This concludes Phase 1 of the comprehensive test data script
-- Next phases will include users, staff, tasks, and maintenance records
