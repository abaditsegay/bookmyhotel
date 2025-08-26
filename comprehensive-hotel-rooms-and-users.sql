-- Comprehensive Hotel Rooms and Standardized Users Setup
-- This script adds room data to all hotels and standardizes user credentials
-- All passwords will be set to "password" and standardized email patterns

-- First, let's get the bcrypt hash for "password"
-- Generated using: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Update all existing user passwords to the standardized bcrypt hash for "password"
UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Get hotel domains for email creation
-- Hotel ID 1: Grand Plaza Hotel -> @grandplaza.com
-- Hotel ID 2: Grand Test Hotel -> @grandtesthotel.com  
-- Hotel ID 3: MyHotel test -> @myhoteltest.com
-- Hotel ID 4: Test Grand Hotel -> @testgrandhotel.com
-- Hotel ID 5: Sunshine Family Resort -> @sunshineresort.com
-- Hotel ID 6: Grand Luxury Resort & Spa -> @grandluxuryresort.com
-- Hotel ID 7: Metropolitan Business Hotel -> @metrobusinesshotel.com
-- Hotel ID 8: The Maritime Grand Hotel -> @maritimegrand.com
-- Hotel ID 9: Urban Business Hub -> @urbanbusinesshub.com  
-- Hotel ID 10: The Maritime Grand Hotel -> @maritimegrand.com
-- Hotel ID 11: Urban Business Hub -> @urbanbusinesshub.com
-- Hotel ID 12: Addis Sunshine Hotel -> @addissunshine.com
-- Hotel ID 13: Global International Hotel -> @globalhotel.co.uk

-- =======================================================================
-- ROOM DATA SECTION - Add comprehensive room data to all hotels
-- =======================================================================

-- Hotel ID 3: MyHotel test (currently has no rooms)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
-- Basic room mix for MyHotel test
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, '101', 'SINGLE', 'AVAILABLE', 120.00, 1, 'Comfortable single room with WiFi, TV, and air conditioning', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, '102', 'SINGLE', 'AVAILABLE', 120.00, 1, 'Comfortable single room with WiFi, TV, and air conditioning', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, '201', 'DOUBLE', 'AVAILABLE', 180.00, 2, 'Spacious double room with two beds, WiFi, TV, and mini fridge', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, '202', 'DOUBLE', 'AVAILABLE', 180.00, 2, 'Spacious double room with two beds, WiFi, TV, and mini fridge', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, '301', 'SUITE', 'AVAILABLE', 300.00, 4, 'Luxury suite with separate living area, kitchenette, and premium amenities', 1);

-- Hotel ID 5: Sunshine Family Resort (currently has no rooms)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
-- Family-oriented resort rooms
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '101', 'SINGLE', 'AVAILABLE', 150.00, 2, 'Cozy room with king bed, balcony view, and family amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '102', 'SINGLE', 'AVAILABLE', 150.00, 2, 'Cozy room with king bed, balcony view, and family amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '103', 'SINGLE', 'AVAILABLE', 150.00, 2, 'Cozy room with king bed, balcony view, and family amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '201', 'DOUBLE', 'AVAILABLE', 220.00, 4, 'Family room with two queen beds, sitting area, and connecting bathroom', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '202', 'DOUBLE', 'AVAILABLE', 220.00, 4, 'Family room with two queen beds, sitting area, and connecting bathroom', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '203', 'DOUBLE', 'AVAILABLE', 220.00, 4, 'Family room with two queen beds, sitting area, and connecting bathroom', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '301', 'SUITE', 'AVAILABLE', 380.00, 6, 'Two-bedroom family suite with full kitchen, dining area, and resort view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '302', 'SUITE', 'AVAILABLE', 380.00, 6, 'Two-bedroom family suite with full kitchen, dining area, and resort view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '401', 'DELUXE', 'AVAILABLE', 280.00, 4, 'Premium family room with upgraded amenities, pool view, and mini bar', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, '402', 'DELUXE', 'AVAILABLE', 280.00, 4, 'Premium family room with upgraded amenities, pool view, and mini bar', 1);

-- Hotel ID 6: Grand Luxury Resort & Spa (currently has no rooms)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
-- Luxury resort with premium amenities
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '101', 'SINGLE', 'AVAILABLE', 250.00, 2, 'Elegant ocean-view room with marble bathroom and luxury amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '102', 'SINGLE', 'AVAILABLE', 250.00, 2, 'Elegant ocean-view room with marble bathroom and luxury amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '103', 'SINGLE', 'AVAILABLE', 250.00, 2, 'Elegant ocean-view room with marble bathroom and luxury amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '201', 'DOUBLE', 'AVAILABLE', 350.00, 4, 'Premium room with two king beds, spa access, and ocean terrace', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '202', 'DOUBLE', 'AVAILABLE', 350.00, 4, 'Premium room with two king beds, spa access, and ocean terrace', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '301', 'SUITE', 'AVAILABLE', 550.00, 6, 'Luxury suite with living room, dining area, and panoramic ocean views', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '302', 'SUITE', 'AVAILABLE', 550.00, 6, 'Luxury suite with living room, dining area, and panoramic ocean views', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '401', 'DELUXE', 'AVAILABLE', 450.00, 4, 'Deluxe spa room with in-room jacuzzi, private balcony, and butler service', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '402', 'DELUXE', 'AVAILABLE', 450.00, 4, 'Deluxe spa room with in-room jacuzzi, private balcony, and butler service', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, '501', 'PRESIDENTIAL', 'AVAILABLE', 800.00, 8, 'Presidential suite with private chef access, spa services, and helicopter pad', 1);

-- Hotel ID 7: Metropolitan Business Hotel (currently has no rooms)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
-- Business-focused hotel with work amenities
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '101', 'SINGLE', 'AVAILABLE', 140.00, 1, 'Business room with work desk, high-speed WiFi, and city view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '102', 'SINGLE', 'AVAILABLE', 140.00, 1, 'Business room with work desk, high-speed WiFi, and city view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '103', 'SINGLE', 'AVAILABLE', 140.00, 1, 'Business room with work desk, high-speed WiFi, and city view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '104', 'SINGLE', 'AVAILABLE', 140.00, 1, 'Business room with work desk, high-speed WiFi, and city view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '201', 'DOUBLE', 'AVAILABLE', 200.00, 2, 'Executive room with meeting area, printer access, and premium WiFi', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '202', 'DOUBLE', 'AVAILABLE', 200.00, 2, 'Executive room with meeting area, printer access, and premium WiFi', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '203', 'DOUBLE', 'AVAILABLE', 200.00, 2, 'Executive room with meeting area, printer access, and premium WiFi', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '301', 'SUITE', 'AVAILABLE', 320.00, 4, 'Business suite with conference table, full office setup, and lounge access', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '302', 'SUITE', 'AVAILABLE', 320.00, 4, 'Business suite with conference table, full office setup, and lounge access', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, '401', 'DELUXE', 'AVAILABLE', 280.00, 3, 'Premium executive room with city skyline view and concierge service', 1);

-- Hotel ID 12: Addis Sunshine Hotel (currently has no rooms)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
-- Mid-range hotel with good amenities
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '101', 'SINGLE', 'AVAILABLE', 85.00, 1, 'Comfortable room with traditional decor, WiFi, and mountain view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '102', 'SINGLE', 'AVAILABLE', 85.00, 1, 'Comfortable room with traditional decor, WiFi, and mountain view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '103', 'SINGLE', 'AVAILABLE', 85.00, 1, 'Comfortable room with traditional decor, WiFi, and mountain view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '201', 'DOUBLE', 'AVAILABLE', 130.00, 2, 'Spacious room with two beds, sitting area, and cultural artwork', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '202', 'DOUBLE', 'AVAILABLE', 130.00, 2, 'Spacious room with two beds, sitting area, and cultural artwork', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '203', 'DOUBLE', 'AVAILABLE', 130.00, 2, 'Spacious room with two beds, sitting area, and cultural artwork', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '301', 'SUITE', 'AVAILABLE', 200.00, 4, 'Family suite with kitchenette, living area, and panoramic city view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, '302', 'SUITE', 'AVAILABLE', 200.00, 4, 'Family suite with kitchenette, living area, and panoramic city view', 1);

-- Hotel ID 13: Global International Hotel (currently has no rooms)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
-- International business hotel in London
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '101', 'SINGLE', 'AVAILABLE', 180.00, 1, 'Modern room with British decor, work desk, and Thames view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '102', 'SINGLE', 'AVAILABLE', 180.00, 1, 'Modern room with British decor, work desk, and Thames view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '103', 'SINGLE', 'AVAILABLE', 180.00, 1, 'Modern room with British decor, work desk, and Thames view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '201', 'DOUBLE', 'AVAILABLE', 280.00, 2, 'Executive room with sitting area, mini bar, and London skyline view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '202', 'DOUBLE', 'AVAILABLE', 280.00, 2, 'Executive room with sitting area, mini bar, and London skyline view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '301', 'SUITE', 'AVAILABLE', 450.00, 4, 'Luxury suite with dining area, office space, and Big Ben view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '302', 'SUITE', 'AVAILABLE', 450.00, 4, 'Luxury suite with dining area, office space, and Big Ben view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '401', 'DELUXE', 'AVAILABLE', 380.00, 3, 'Premium room with upgraded amenities and exclusive concierge access', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, '501', 'PRESIDENTIAL', 'AVAILABLE', 750.00, 6, 'Presidential suite with multiple rooms, private entrance, and butler service', 1);

-- Add more rooms to existing hotels with limited room counts

-- Hotel ID 2: Grand Test Hotel (currently has only 1 SINGLE room)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, '102', 'SINGLE', 'AVAILABLE', 110.00, 1, 'Cozy single room with modern amenities and city view', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, '201', 'DOUBLE', 'AVAILABLE', 160.00, 2, 'Comfortable double room with two beds and workspace', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, '202', 'DOUBLE', 'AVAILABLE', 160.00, 2, 'Comfortable double room with two beds and workspace', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, '301', 'SUITE', 'AVAILABLE', 250.00, 4, 'Spacious suite with living area and kitchenette', 1);

-- Hotel ID 4: Test Grand Hotel (currently has only 1 SINGLE room)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, status, price_per_night, capacity, description, is_available) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, '102', 'SINGLE', 'AVAILABLE', 115.00, 1, 'Standard single room with essential amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, '103', 'SINGLE', 'AVAILABLE', 115.00, 1, 'Standard single room with essential amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, '201', 'DOUBLE', 'AVAILABLE', 170.00, 2, 'Twin bed room with work area and complimentary WiFi', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, '202', 'DOUBLE', 'AVAILABLE', 170.00, 2, 'Twin bed room with work area and complimentary WiFi', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, '301', 'SUITE', 'AVAILABLE', 280.00, 4, 'Junior suite with separate seating area and premium amenities', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, '401', 'DELUXE', 'AVAILABLE', 220.00, 3, 'Deluxe room with upgraded furnishings and enhanced services', 1);

-- =======================================================================
-- USERS AND ROLES SECTION - Standardize user accounts for all hotels
-- =======================================================================

-- Remove any existing staff users that don't follow the standard pattern
-- We'll keep some existing users but ensure all hotels have the standard four roles

-- Create standardized staff for each hotel
-- Pattern: hoteladmin@[domain], frontdesk@[domain], housekeeping@[domain], maintenance@[domain]

-- Hotel ID 1: Grand Plaza Hotel (@grandplaza.com) - Keep existing users, just ensure password is updated

-- Hotel ID 2: Grand Test Hotel (@grandtesthotel.com)
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, 'hoteladmin@grandtesthotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-555-999-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, 'frontdesk@grandtesthotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-555-999-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, 'housekeeping@grandtesthotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-555-999-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 2, 'maintenance@grandtesthotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-555-999-0004', 1);

-- Hotel ID 3: MyHotel test (@myhoteltest.com)
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'hoteladmin@myhoteltest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-555-888-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'frontdesk@myhoteltest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-555-888-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'housekeeping@myhoteltest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-555-888-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'maintenance@myhoteltest.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-555-888-0004', 1);

-- Hotel ID 4: Test Grand Hotel (@testgrandhotel.com) - Has some existing users, add missing ones
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, 'hoteladmin@testgrandhotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-555-777-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, 'frontdesk@testgrandhotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-555-777-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, 'housekeeping@testgrandhotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-555-777-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 4, 'maintenance@testgrandhotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-555-777-0004', 1);

-- Hotel ID 5: Sunshine Family Resort (@sunshineresort.com)
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'hoteladmin@sunshineresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-407-555-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'frontdesk@sunshineresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-407-555-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'housekeeping@sunshineresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-407-555-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'maintenance@sunshineresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-407-555-0004', 1);

-- Hotel ID 6: Grand Luxury Resort & Spa (@grandluxuryresort.com)
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'hoteladmin@grandluxuryresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-305-555-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'frontdesk@grandluxuryresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-305-555-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'housekeeping@grandluxuryresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-305-555-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'maintenance@grandluxuryresort.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-305-555-0004', 1);

-- Hotel ID 7: Metropolitan Business Hotel (@metrobusinesshotel.com)
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'hoteladmin@metrobusinesshotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-212-555-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'frontdesk@metrobusinesshotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-212-555-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'housekeeping@metrobusinesshotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-212-555-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'maintenance@metrobusinesshotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-212-555-0004', 1);

-- Hotel ID 8: The Maritime Grand Hotel (@maritimegrand.com) - Has existing users, keep them

-- Hotel ID 9: Urban Business Hub (@urbanbusinesshub.com) - Has existing users, keep them

-- Hotel ID 10: The Maritime Grand Hotel (@maritimegrand.com) - Duplicate, but add users with ID 10
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 10, 'hoteladmin.10@maritimegrand.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-619-555-1001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 10, 'frontdesk.10@maritimegrand.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-619-555-1002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 10, 'housekeeping.10@maritimegrand.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-619-555-1003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 10, 'maintenance.10@maritimegrand.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-619-555-1004', 1);

-- Hotel ID 11: Urban Business Hub (@urbanbusinesshub.com) - Duplicate, but add users with ID 11
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 11, 'hoteladmin.11@urbanbusinesshub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+1-312-555-1001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 11, 'frontdesk.11@urbanbusinesshub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+1-312-555-1002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 11, 'housekeeping.11@urbanbusinesshub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+1-312-555-1003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 11, 'maintenance.11@urbanbusinesshub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+1-312-555-1004', 1);

-- Hotel ID 12: Addis Sunshine Hotel (@addissunshine.com) - Has some existing users, keep them

-- Hotel ID 13: Global International Hotel (@globalhotel.co.uk) - Has existing user, add missing ones  
INSERT IGNORE INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'hoteladmin@globalhotel.co.uk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hotel', 'Administrator', '+44-20-7555-0001', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'frontdesk@globalhotel.co.uk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Front', 'Desk', '+44-20-7555-0002', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'housekeeping@globalhotel.co.uk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'House', 'Keeping', '+44-20-7555-0003', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'maintenance@globalhotel.co.uk', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Main', 'Tenance', '+44-20-7555-0004', 1);

-- =======================================================================
-- ASSIGN ROLES TO ALL STANDARDIZED USERS
-- =======================================================================

-- We need to assign roles to all the new users we just created
-- Get user IDs and assign appropriate roles

-- For Hotel ID 2: Grand Test Hotel
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@grandtesthotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@grandtesthotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@grandtesthotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@grandtesthotel.com';

-- For Hotel ID 3: MyHotel test
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@myhoteltest.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@myhoteltest.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@myhoteltest.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@myhoteltest.com';

-- For Hotel ID 4: Test Grand Hotel
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@testgrandhotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@testgrandhotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@testgrandhotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@testgrandhotel.com';

-- For Hotel ID 5: Sunshine Family Resort
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@sunshineresort.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@sunshineresort.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@sunshineresort.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@sunshineresort.com';

-- For Hotel ID 6: Grand Luxury Resort & Spa
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@grandluxuryresort.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@grandluxuryresort.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@grandluxuryresort.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@grandluxuryresort.com';

-- For Hotel ID 7: Metropolitan Business Hotel
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@metrobusinesshotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@metrobusinesshotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@metrobusinesshotel.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@metrobusinesshotel.com';

-- For Hotel ID 10: The Maritime Grand Hotel (second instance)
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin.10@maritimegrand.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk.10@maritimegrand.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping.10@maritimegrand.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance.10@maritimegrand.com';

-- For Hotel ID 11: Urban Business Hub (second instance)
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin.11@urbanbusinesshub.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk.11@urbanbusinesshub.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping.11@urbanbusinesshub.com';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance.11@urbanbusinesshub.com';

-- For Hotel ID 13: Global International Hotel
INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOTEL_ADMIN' FROM users u WHERE u.email = 'hoteladmin@globalhotel.co.uk';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'FRONTDESK' FROM users u WHERE u.email = 'frontdesk@globalhotel.co.uk';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'HOUSEKEEPING' FROM users u WHERE u.email = 'housekeeping@globalhotel.co.uk';

INSERT IGNORE INTO user_roles (user_id, role) 
SELECT u.id, 'MAINTENANCE' FROM users u WHERE u.email = 'maintenance@globalhotel.co.uk';

-- =======================================================================
-- ROOM TYPE PRICING SETUP
-- =======================================================================

-- Add room type pricing for hotels that may not have pricing configured

-- Hotel ID 3: MyHotel test
INSERT IGNORE INTO room_type_pricing (tenant_id, hotel_id, room_type, base_price_per_night, currency, description, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'SINGLE', 120.00, 'USD', 'Standard single room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'DOUBLE', 180.00, 'USD', 'Standard double room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 3, 'SUITE', 300.00, 'USD', 'Suite room pricing', 1);

-- Hotel ID 5: Sunshine Family Resort
INSERT IGNORE INTO room_type_pricing (tenant_id, hotel_id, room_type, base_price_per_night, currency, description, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'SINGLE', 150.00, 'USD', 'Family resort single room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'DOUBLE', 220.00, 'USD', 'Family resort double room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'SUITE', 380.00, 'USD', 'Family resort suite pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 5, 'DELUXE', 280.00, 'USD', 'Family resort deluxe room pricing', 1);

-- Hotel ID 6: Grand Luxury Resort & Spa
INSERT IGNORE INTO room_type_pricing (tenant_id, hotel_id, room_type, base_price_per_night, currency, description, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'SINGLE', 250.00, 'USD', 'Luxury resort single room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'DOUBLE', 350.00, 'USD', 'Luxury resort double room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'SUITE', 550.00, 'USD', 'Luxury resort suite pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'DELUXE', 450.00, 'USD', 'Luxury resort deluxe room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 6, 'PRESIDENTIAL', 800.00, 'USD', 'Luxury resort presidential suite pricing', 1);

-- Hotel ID 7: Metropolitan Business Hotel
INSERT IGNORE INTO room_type_pricing (tenant_id, hotel_id, room_type, base_price_per_night, currency, description, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'SINGLE', 140.00, 'USD', 'Business hotel single room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'DOUBLE', 200.00, 'USD', 'Business hotel double room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'SUITE', 320.00, 'USD', 'Business hotel suite pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 7, 'DELUXE', 280.00, 'USD', 'Business hotel deluxe room pricing', 1);

-- Hotel ID 12: Addis Sunshine Hotel
INSERT IGNORE INTO room_type_pricing (tenant_id, hotel_id, room_type, base_price_per_night, currency, description, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, 'SINGLE', 85.00, 'USD', 'Mid-range hotel single room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, 'DOUBLE', 130.00, 'USD', 'Mid-range hotel double room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 12, 'SUITE', 200.00, 'USD', 'Mid-range hotel suite pricing', 1);

-- Hotel ID 13: Global International Hotel
INSERT IGNORE INTO room_type_pricing (tenant_id, hotel_id, room_type, base_price_per_night, currency, description, is_active) VALUES
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'SINGLE', 180.00, 'GBP', 'International hotel single room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'DOUBLE', 280.00, 'GBP', 'International hotel double room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'SUITE', 450.00, 'GBP', 'International hotel suite pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'DELUXE', 380.00, 'GBP', 'International hotel deluxe room pricing', 1),
('d7b7e673-6788-45b2-8dad-4d48944a144e', 13, 'PRESIDENTIAL', 750.00, 'GBP', 'International hotel presidential suite pricing', 1);

-- =======================================================================
-- SUMMARY
-- =======================================================================

-- This script accomplishes:
-- 1. Updates ALL user passwords to "password" (bcrypt hash)
-- 2. Adds comprehensive room data to hotels that had none or limited rooms
-- 3. Creates standardized staff accounts for all hotels:
--    - hoteladmin@[domain] (HOTEL_ADMIN role)
--    - frontdesk@[domain] (FRONTDESK role) 
--    - housekeeping@[domain] (HOUSEKEEPING role)
--    - maintenance@[domain] (MAINTENANCE role)
-- 4. Sets up room type pricing for new room configurations
-- 5. Ensures consistent login patterns across all hotels

-- Login credentials for testing:
-- All passwords: "password"
-- 
-- Example for Grand Plaza Hotel:
-- - hotel.admin@grandplaza.com / password
-- - frontdesk@grandplaza.com / password
-- - housekeeping@grandplaza.com / password
-- - maintenance@grandplaza.com / password
--
-- This pattern applies to all hotels with their respective domains.

SELECT 'Setup completed! All hotels now have comprehensive room data and standardized staff accounts.' as STATUS;
