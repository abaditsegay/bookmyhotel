-- Insert two realistic hotels for Sam's Hotels tenant with detailed information and rooms
-- This script adds The Maritime Grand Hotel (luxury seaside) and Urban Business Hub (modern business hotel)

SET @sams_tenant_id = 'ed55191d-36e0-4cd4-8b53-0aa6306b802b';

-- Hotel 1: The Maritime Grand Hotel (Luxury Seaside Resort)
INSERT INTO hotels (
    tenant_id, 
    name, 
    description, 
    address, 
    city, 
    country, 
    phone, 
    email, 
    is_active,
    created_at,
    updated_at
) VALUES (
    @sams_tenant_id,
    'The Maritime Grand Hotel',
    'A luxurious oceanfront resort featuring stunning sea views, world-class spa facilities, multiple dining venues, private beach access, and elegantly appointed rooms and suites. Perfect for romantic getaways, family vacations, and special celebrations.',
    '1500 Ocean Boulevard, Waterfront District',
    'San Diego',
    'USA',
    '+1-619-555-0200',
    'reservations@maritimegrand.com',
    TRUE,
    NOW(),
    NOW()
);

SET @maritime_hotel_id = LAST_INSERT_ID();

-- Hotel 2: Urban Business Hub (Modern Business Hotel)
INSERT INTO hotels (
    tenant_id, 
    name, 
    description, 
    address, 
    city, 
    country, 
    phone, 
    email, 
    is_active,
    created_at,
    updated_at
) VALUES (
    @sams_tenant_id,
    'Urban Business Hub',
    'A contemporary business hotel in the heart of downtown, featuring state-of-the-art conference facilities, high-speed internet throughout, 24/7 business center, fitness center, and modern accommodations designed for the discerning business traveler.',
    '750 Financial Street, Downtown Core',
    'Chicago',
    'USA',
    '+1-312-555-0300',
    'bookings@urbanbusinesshub.com',
    TRUE,
    NOW(),
    NOW()
);

SET @urban_hotel_id = LAST_INSERT_ID();

-- Rooms for The Maritime Grand Hotel (Luxury Seaside Resort)
INSERT INTO rooms (
    tenant_id,
    hotel_id,
    room_number,
    room_type,
    price_per_night,
    capacity,
    description,
    status,
    is_available,
    created_at,
    updated_at
) VALUES
-- Standard Ocean View Rooms
(@sams_tenant_id, @maritime_hotel_id, '201', 'SINGLE', 289.00, 2, 'Ocean view room with king bed, private balcony, marble bathroom, mini-bar, WiFi, 55" smart TV, coffee maker, and luxury amenities', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @maritime_hotel_id, '202', 'SINGLE', 289.00, 2, 'Ocean view room with king bed, private balcony, marble bathroom, mini-bar, WiFi, 55" smart TV, coffee maker, and luxury amenities', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @maritime_hotel_id, '203', 'SINGLE', 289.00, 2, 'Ocean view room with king bed, private balcony, marble bathroom, mini-bar, WiFi, 55" smart TV, coffee maker, and luxury amenities', 'AVAILABLE', TRUE, NOW(), NOW()),

-- Deluxe Ocean View Rooms  
(@sams_tenant_id, @maritime_hotel_id, '301', 'DELUXE', 389.00, 3, 'Spacious deluxe room with panoramic ocean views, king bed, separate seating area, walk-in closet, marble bathroom with soaking tub, premium amenities', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @maritime_hotel_id, '302', 'DELUXE', 389.00, 3, 'Spacious deluxe room with panoramic ocean views, king bed, separate seating area, walk-in closet, marble bathroom with soaking tub, premium amenities', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @maritime_hotel_id, '303', 'DELUXE', 389.00, 3, 'Spacious deluxe room with panoramic ocean views, king bed, separate seating area, walk-in closet, marble bathroom with soaking tub, premium amenities', 'AVAILABLE', TRUE, NOW(), NOW()),

-- Family Suites
(@sams_tenant_id, @maritime_hotel_id, '401', 'SUITE', 589.00, 6, 'Two-bedroom family suite with ocean views, king bed in master, bunk beds in second room, living area, kitchenette, two bathrooms, private balcony', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @maritime_hotel_id, '402', 'SUITE', 589.00, 6, 'Two-bedroom family suite with ocean views, king bed in master, bunk beds in second room, living area, kitchenette, two bathrooms, private balcony', 'AVAILABLE', TRUE, NOW(), NOW()),

-- Presidential Suite
(@sams_tenant_id, @maritime_hotel_id, '501', 'PRESIDENTIAL', 1289.00, 8, 'Luxury presidential suite with panoramic ocean views, master bedroom, guest bedroom, formal dining room, full kitchen, living room, study, 3 bathrooms, wraparound terrace, butler service', 'AVAILABLE', TRUE, NOW(), NOW());

-- Rooms for Urban Business Hub (Modern Business Hotel)
INSERT INTO rooms (
    tenant_id,
    hotel_id,
    room_number,
    room_type,
    price_per_night,
    capacity,
    description,
    status,
    is_available,
    created_at,
    updated_at
) VALUES
-- Standard Business Rooms
(@sams_tenant_id, @urban_hotel_id, '501', 'SINGLE', 189.00, 2, 'Modern business room with king bed, work desk, ergonomic chair, high-speed WiFi, 49" smart TV, coffee station, city views, blackout curtains', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @urban_hotel_id, '502', 'SINGLE', 189.00, 2, 'Modern business room with king bed, work desk, ergonomic chair, high-speed WiFi, 49" smart TV, coffee station, city views, blackout curtains', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @urban_hotel_id, '503', 'SINGLE', 189.00, 2, 'Modern business room with king bed, work desk, ergonomic chair, high-speed WiFi, 49" smart TV, coffee station, city views, blackout curtains', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @urban_hotel_id, '504', 'SINGLE', 189.00, 2, 'Modern business room with king bed, work desk, ergonomic chair, high-speed WiFi, 49" smart TV, coffee station, city views, blackout curtains', 'AVAILABLE', TRUE, NOW(), NOW()),

-- Executive Double Rooms
(@sams_tenant_id, @urban_hotel_id, '601', 'DOUBLE', 249.00, 4, 'Executive room with two queen beds, expanded work area, mini-fridge, premium WiFi, 55" smart TV, coffee/tea station, city skyline views', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @urban_hotel_id, '602', 'DOUBLE', 249.00, 4, 'Executive room with two queen beds, expanded work area, mini-fridge, premium WiFi, 55" smart TV, coffee/tea station, city skyline views', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @urban_hotel_id, '603', 'DOUBLE', 249.00, 4, 'Executive room with two queen beds, expanded work area, mini-fridge, premium WiFi, 55" smart TV, coffee/tea station, city skyline views', 'AVAILABLE', TRUE, NOW(), NOW()),

-- Business Suites
(@sams_tenant_id, @urban_hotel_id, '701', 'SUITE', 449.00, 4, 'Business suite with king bed, separate living room, conference table for 6, kitchenette, two 55" TVs, printer/scanner, premium city views', 'AVAILABLE', TRUE, NOW(), NOW()),
(@sams_tenant_id, @urban_hotel_id, '702', 'SUITE', 449.00, 4, 'Business suite with king bed, separate living room, conference table for 6, kitchenette, two 55" TVs, printer/scanner, premium city views', 'AVAILABLE', TRUE, NOW(), NOW()),

-- Executive Suite
(@sams_tenant_id, @urban_hotel_id, '801', 'DELUXE', 689.00, 6, 'Premium executive suite with king bed, formal meeting area, full kitchen, dining room, study, multiple workstations, panoramic city views, concierge access', 'AVAILABLE', TRUE, NOW(), NOW());

-- Create hotel administrators for Sam's Hotels
INSERT INTO users (
    tenant_id,
    hotel_id,
    email,
    password,
    first_name,
    last_name,
    phone,
    is_active,
    created_at,
    updated_at
) VALUES
-- Maritime Grand Hotel Admin
(@sams_tenant_id, @maritime_hotel_id, 'admin@maritimegrand.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Martinez', '+1-619-555-0201', TRUE, NOW(), NOW()),
-- Urban Business Hub Admin  
(@sams_tenant_id, @urban_hotel_id, 'admin@urbanbusinesshub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Chen', '+1-312-555-0301', TRUE, NOW(), NOW());

-- Add hotel admin roles
SET @maritime_admin_id = (SELECT id FROM users WHERE email = 'admin@maritimegrand.com' LIMIT 1);
SET @urban_admin_id = (SELECT id FROM users WHERE email = 'admin@urbanbusinesshub.com' LIMIT 1);

INSERT INTO user_roles (user_id, role) VALUES
(@maritime_admin_id, 'HOTEL_ADMIN'),
(@urban_admin_id, 'HOTEL_ADMIN');

-- Create front desk users for each hotel
INSERT INTO users (
    tenant_id,
    hotel_id,
    email,
    password,
    first_name,
    last_name,
    phone,
    is_active,
    created_at,
    updated_at
) VALUES
-- Maritime Grand Hotel Front Desk
(@sams_tenant_id, @maritime_hotel_id, 'frontdesk@maritimegrand.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emma', 'Rodriguez', '+1-619-555-0202', TRUE, NOW(), NOW()),
-- Urban Business Hub Front Desk
(@sams_tenant_id, @urban_hotel_id, 'frontdesk@urbanbusinesshub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'Kim', '+1-312-555-0302', TRUE, NOW(), NOW());

-- Add front desk roles
SET @maritime_frontdesk_id = (SELECT id FROM users WHERE email = 'frontdesk@maritimegrand.com' LIMIT 1);
SET @urban_frontdesk_id = (SELECT id FROM users WHERE email = 'frontdesk@urbanbusinesshub.com' LIMIT 1);

INSERT INTO user_roles (user_id, role) VALUES
(@maritime_frontdesk_id, 'FRONTDESK'),
(@urban_frontdesk_id, 'FRONTDESK');

-- Summary of created data
SELECT 
    'Hotels Created' as summary,
    COUNT(*) as count
FROM hotels 
WHERE tenant_id = @sams_tenant_id;

SELECT 
    h.name as hotel_name,
    COUNT(r.id) as room_count,
    MIN(r.price_per_night) as min_price,
    MAX(r.price_per_night) as max_price
FROM hotels h
LEFT JOIN rooms r ON h.id = r.hotel_id
WHERE h.tenant_id = @sams_tenant_id
GROUP BY h.id, h.name;

/*
=== SUMMARY OF CREATED DATA ===

Hotel 1: The Maritime Grand Hotel (San Diego)
- Location: 1500 Ocean Boulevard, Waterfront District, San Diego, USA
- Type: Luxury oceanfront resort
- Phone: +1-619-555-0200
- Email: reservations@maritimegrand.com
- Admin: admin@maritimegrand.com (password: admin123)
- Front Desk: frontdesk@maritimegrand.com (password: frontdesk123)
- Rooms: 9 rooms total
  * 3 Standard Ocean View (SINGLE) - $289/night
  * 3 Deluxe Ocean View (DELUXE) - $389/night  
  * 2 Family Suites (SUITE) - $589/night
  * 1 Presidential Suite (PRESIDENTIAL) - $1,289/night

Hotel 2: Urban Business Hub (Chicago)
- Location: 750 Financial Street, Downtown Core, Chicago, USA
- Type: Modern business hotel
- Phone: +1-312-555-0300
- Email: bookings@urbanbusinesshub.com
- Admin: admin@urbanbusinesshub.com (password: admin123)
- Front Desk: frontdesk@urbanbusinesshub.com (password: frontdesk123)
- Rooms: 10 rooms total
  * 4 Standard Business (SINGLE) - $189/night
  * 3 Executive Double (DOUBLE) - $249/night
  * 2 Business Suites (SUITE) - $449/night
  * 1 Executive Suite (DELUXE) - $689/night

All users are associated with Sam's Hotels tenant (ed55191d-36e0-4cd4-8b53-0aa6306b802b)
All passwords use the same pattern as existing users: admin123/frontdesk123
*/
