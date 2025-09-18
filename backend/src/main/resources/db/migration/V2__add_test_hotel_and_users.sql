-- Add test hotel and users for login testing

-- First, create the tenant for the hotel
INSERT INTO tenants (id, name, subdomain, is_active, created_at) 
VALUES ('addis-sunshine', 'Addis Sunshine Hotels', 'addis-sunshine', true, NOW())
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    subdomain = VALUES(subdomain),
    is_active = VALUES(is_active);

-- Create the Addis Sunshine Grand Hotel
INSERT INTO hotels (name, address, phone, email, is_active, created_at, tenant_id, city, country, description)
VALUES (
    'Addis Sunshine Grand Hotel',
    'Bole Atlas, Addis Ababa, Ethiopia',
    '+251-11-618-0000',
    'info@addissunshine.com',
    true,
    NOW(),
    'addis-sunshine',
    'Addis Ababa',
    'Ethiopia',
    'A luxury 5-star hotel in the heart of Addis Ababa with 50 well-appointed rooms, modern amenities, and exceptional service.'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    phone = VALUES(phone),
    email = VALUES(email),
    is_active = VALUES(is_active),
    city = VALUES(city),
    country = VALUES(country),
    description = VALUES(description);

-- Create Hotel Admin user
-- Password: password123 (BCrypt encoded)
INSERT INTO users (first_name, last_name, email, password, is_active, created_at, hotel_id)
SELECT 'Hotel', 'Administrator', 'admin@addissunshine.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, NOW(), h.id
FROM hotels h WHERE h.name = 'Addis Sunshine Grand Hotel'
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    password = VALUES(password),
    is_active = VALUES(is_active);

-- Create Front Desk user
-- Password: password123 (BCrypt encoded) 
INSERT INTO users (first_name, last_name, email, password, is_active, created_at, hotel_id)
SELECT 'Front Desk', 'Staff', 'frontdesk@addissunshine.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, NOW(), h.id
FROM hotels h WHERE h.name = 'Addis Sunshine Grand Hotel'
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    password = VALUES(password),
    is_active = VALUES(is_active);

-- Assign HOTEL_ADMIN role to the hotel admin user
INSERT INTO user_roles (user_id, role)
SELECT id, 'HOTEL_ADMIN'
FROM users
WHERE email = 'admin@addissunshine.com'
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Assign FRONTDESK role to the front desk user
INSERT INTO user_roles (user_id, role)
SELECT id, 'FRONTDESK'
FROM users
WHERE email = 'frontdesk@addissunshine.com'
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Add some sample rooms for the hotel
INSERT INTO rooms (room_number, room_type, capacity, price_per_night, is_available, hotel_id, created_at, description, status)
SELECT '101', 'STANDARD', 2, 120.00, true, h.id, NOW(), 'Standard room with city view', 'AVAILABLE'
FROM hotels h WHERE h.name = 'Addis Sunshine Grand Hotel'
UNION ALL
SELECT '102', 'STANDARD', 2, 120.00, true, h.id, NOW(), 'Standard room with city view', 'AVAILABLE'
FROM hotels h WHERE h.name = 'Addis Sunshine Grand Hotel'
UNION ALL
SELECT '201', 'DELUXE', 2, 180.00, true, h.id, NOW(), 'Deluxe room with mountain view', 'AVAILABLE'
FROM hotels h WHERE h.name = 'Addis Sunshine Grand Hotel'
UNION ALL
SELECT '301', 'SUITE', 4, 300.00, true, h.id, NOW(), 'Luxury suite with panoramic view', 'AVAILABLE'
FROM hotels h WHERE h.name = 'Addis Sunshine Grand Hotel'
ON DUPLICATE KEY UPDATE
    room_type = VALUES(room_type),
    capacity = VALUES(capacity),
    price_per_night = VALUES(price_per_night),
    description = VALUES(description);
