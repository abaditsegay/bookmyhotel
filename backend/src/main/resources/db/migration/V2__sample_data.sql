-- V2__sample_data.sql
-- Sample data for development and testing

-- Insert sample tenants
INSERT INTO tenants (id, name, subdomain, is_active) VALUES
('default', 'Default Hotel Chain', 'demo', TRUE),
('hilton', 'Hilton Hotels', 'hilton', TRUE),
('marriott', 'Marriott Hotels', 'marriott', TRUE);

-- Insert sample hotels for default tenant
INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email) VALUES
('default', 'Grand Plaza Hotel', 'Luxurious hotel in the heart of the city', '123 Main Street', 'New York', 'USA', '+1-555-0123', 'info@grandplaza.com'),
('default', 'Seaside Resort', 'Beautiful beachfront resort with stunning ocean views', '456 Beach Avenue', 'Miami', 'USA', '+1-555-0456', 'reservations@seasideresort.com');

-- Insert sample users for default tenant
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active) VALUES
('default', 'admin@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Admin', '+1-555-0001', TRUE),
('default', 'manager@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Manager', '+1-555-0002', TRUE),
('default', 'guest@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob', 'Customer', '+1-555-0003', TRUE);

-- Insert sample user roles
INSERT INTO user_roles (user_id, role) VALUES
(1, 'ADMIN'),
(2, 'HOTEL_MANAGER'),
(2, 'FRONTDESK'),
(3, 'CUSTOMER');

-- Insert sample rooms for Grand Plaza Hotel (hotel_id = 1)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', 1, '101', 'SINGLE', 129.99, 1, 'Comfortable single room with city view', TRUE),
('default', 1, '102', 'DOUBLE', 179.99, 2, 'Spacious double room with modern amenities', TRUE),
('default', 1, '103', 'SUITE', 299.99, 4, 'Luxury suite with separate living area', TRUE),
('default', 1, '201', 'SINGLE', 139.99, 1, 'Premium single room on second floor', TRUE),
('default', 1, '202', 'DOUBLE', 189.99, 2, 'Deluxe double room with balcony', TRUE),
('default', 1, '301', 'PRESIDENTIAL', 599.99, 6, 'Presidential suite with panoramic city views', TRUE);

-- Insert sample rooms for Seaside Resort (hotel_id = 2)
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES
('default', 2, 'A101', 'DOUBLE', 249.99, 2, 'Ocean view double room with private balcony', TRUE),
('default', 2, 'A102', 'SUITE', 399.99, 4, 'Beachfront suite with direct beach access', TRUE),
('default', 2, 'B201', 'DELUXE', 329.99, 3, 'Deluxe room with partial ocean view', TRUE),
('default', 2, 'B202', 'PRESIDENTIAL', 799.99, 8, 'Presidential oceanfront suite', TRUE);
