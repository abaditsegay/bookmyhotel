-- Initial schema creation and test data for BookMyHotel application
-- This migration creates all tables and adds essential test users

-- ============================================
-- CORE SCHEMA TABLES
-- ============================================

-- Tenants table for multi-tenancy support
CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenant_active (is_active)
) ENGINE=InnoDB;

-- Hotels table
CREATE TABLE hotels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    address VARCHAR(200) NOT NULL,
    city VARCHAR(50),
    country VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hotel_tenant (tenant_id),
    INDEX idx_hotel_name (name),
    INDEX idx_hotel_active (is_active),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Room types and rooms
CREATE TABLE rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    hotel_id BIGINT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    description VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_room_per_hotel (hotel_id, room_number),
    INDEX idx_room_tenant (tenant_id),
    INDEX idx_room_hotel (hotel_id),
    INDEX idx_room_number (room_number),
    INDEX idx_room_type (room_type),
    INDEX idx_room_available (is_available),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Users table supporting both tenant-bound and system-wide users
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NULL, -- NULL for system-wide users (ADMIN, GUEST)
    hotel_id BIGINT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_tenant (tenant_id),
    INDEX idx_user_email (email),
    INDEX idx_user_hotel (hotel_id),
    INDEX idx_user_active (is_active),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- User roles table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Reservations table
CREATE TABLE reservations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    room_id BIGINT NOT NULL,
    guest_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    special_requests VARCHAR(500),
    payment_intent_id VARCHAR(100),
    payment_method VARCHAR(50),
    confirmation_number VARCHAR(20) UNIQUE,
    guest_name VARCHAR(100),
    actual_check_in_time TIMESTAMP NULL,
    actual_check_out_time TIMESTAMP NULL,
    cancellation_reason VARCHAR(500),
    cancelled_at TIMESTAMP NULL,
    promotional_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reservation_tenant (tenant_id),
    INDEX idx_reservation_room (room_id),
    INDEX idx_reservation_guest (guest_id),
    INDEX idx_reservation_dates (check_in_date, check_out_date),
    INDEX idx_reservation_status (status),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Booking history for audit trail
CREATE TABLE booking_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reservation_id BIGINT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    old_values VARCHAR(2000),
    new_values VARCHAR(2000),
    changed_by VARCHAR(100),
    change_reason VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking_history_reservation (reservation_id),
    INDEX idx_booking_history_action (action_type),
    INDEX idx_booking_history_date (created_at),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Room pricing table for dynamic pricing
CREATE TABLE room_pricing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    season_type VARCHAR(10) DEFAULT 'LOW',
    base_price DECIMAL(10,2) NOT NULL,
    weekend_multiplier DECIMAL(4,2) DEFAULT 1.0,
    holiday_multiplier DECIMAL(4,2) DEFAULT 1.0,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pricing_hotel_type (hotel_id, room_type),
    INDEX idx_pricing_dates (effective_from, effective_to),
    INDEX idx_pricing_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Pricing strategies for dynamic pricing
CREATE TABLE pricing_strategies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    strategy_type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    base_rate_multiplier DECIMAL(5,3) NOT NULL,
    min_occupancy_threshold DECIMAL(5,2),
    max_occupancy_threshold DECIMAL(5,2),
    advance_booking_days INT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    room_type VARCHAR(20),
    weekday_multiplier DECIMAL(5,3),
    weekend_multiplier DECIMAL(5,3),
    holiday_multiplier DECIMAL(5,3),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pricing_strategy_hotel (hotel_id),
    INDEX idx_pricing_strategy_type (strategy_type),
    INDEX idx_pricing_strategy_dates (effective_from, effective_to),
    INDEX idx_pricing_strategy_active (is_active),
    INDEX idx_pricing_strategy_priority (priority),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Promotional codes for discount offers
CREATE TABLE promotional_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_booking_amount DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    per_customer_limit INT,
    applicable_room_type VARCHAR(20),
    first_time_customer_only BOOLEAN NOT NULL DEFAULT FALSE,
    min_nights INT,
    max_nights INT,
    advance_booking_days INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    INDEX idx_promotional_code (code),
    INDEX idx_promotional_hotel (hotel_id),
    INDEX idx_promotional_dates (valid_from, valid_to),
    INDEX idx_promotional_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Hotel registrations for new hotel approval workflow
CREATE TABLE hotel_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    address VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    contact_email VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    tax_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    tenant_id VARCHAR(50),
    approved_hotel_id BIGINT,
    reviewed_by BIGINT,
    review_comments VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hotel_reg_status (status),
    INDEX idx_hotel_reg_email (contact_email),
    INDEX idx_hotel_reg_tenant (tenant_id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seasonal rates for seasonal pricing adjustments
CREATE TABLE seasonal_rates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    season_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    room_type VARCHAR(20),
    rate_multiplier DECIMAL(5,3) NOT NULL,
    fixed_rate_adjustment DECIMAL(10,2),
    adjustment_type VARCHAR(20) NOT NULL,
    applies_to_weekends_only BOOLEAN NOT NULL DEFAULT FALSE,
    applies_to_weekdays_only BOOLEAN NOT NULL DEFAULT FALSE,
    min_nights INT,
    max_nights INT,
    priority INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seasonal_hotel (hotel_id),
    INDEX idx_seasonal_dates (start_date, end_date),
    INDEX idx_seasonal_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- INITIAL DATA AND TEST USERS
-- ============================================

-- Create default tenant
INSERT INTO tenants (id, name, description, is_active) VALUES 
('default', 'Default Tenant', 'Default tenant for sample data', TRUE),
('tenant1', 'Sample Tenant 1', 'First sample tenant for testing', TRUE);

-- Insert system admin user (tenant_id = NULL for system-wide users)
INSERT INTO users (first_name, last_name, email, password, phone, is_active, tenant_id)
VALUES ('System', 'Admin', 'admin@bookmyhotel.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0100', 1, NULL);

-- Get the admin user ID and assign ADMIN role
SET @admin_user_id = LAST_INSERT_ID();
INSERT INTO user_roles (user_id, role) VALUES (@admin_user_id, 'ADMIN');

-- Create sample hotel
INSERT INTO hotels (tenant_id, name, description, address, city, country, phone, email, is_active) VALUES 
('default', 'Grand Plaza Hotel', 'A luxury 5-star hotel in the heart of downtown with exceptional service and amenities.', '123 Main Street, Downtown', 'New York', 'USA', '+1-555-123-4567', 'info@grandplaza.com', TRUE);

SET @hotel_id = LAST_INSERT_ID();

-- Create hotel admin user (password: admin123)
INSERT INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES 
('default', @hotel_id, 'hotel.admin@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Manager', '+1-555-0001', TRUE);

SET @hotel_admin_id = LAST_INSERT_ID();
INSERT INTO user_roles (user_id, role) VALUES (@hotel_admin_id, 'HOTEL_ADMIN');

-- Create front desk user (password: frontdesk123)
INSERT INTO users (tenant_id, hotel_id, email, password, first_name, last_name, phone, is_active) VALUES 
('default', @hotel_id, 'frontdesk@grandplaza.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Desk', '+1-555-0002', TRUE);

SET @frontdesk_id = LAST_INSERT_ID();
INSERT INTO user_roles (user_id, role) VALUES (@frontdesk_id, 'FRONTDESK');

-- Create guest user (password: guest123)
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active) VALUES 
(NULL, 'guest@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test', 'Guest', '+1-555-0003', TRUE);

SET @guest_id = LAST_INSERT_ID();
INSERT INTO user_roles (user_id, role) VALUES (@guest_id, 'GUEST');

-- Create customer user (password: customer123)
INSERT INTO users (tenant_id, email, password, first_name, last_name, phone, is_active) VALUES 
(NULL, 'customer@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Customer', '+1-555-0004', TRUE);

SET @customer_id = LAST_INSERT_ID();
INSERT INTO user_roles (user_id, role) VALUES (@customer_id, 'CUSTOMER');

-- Create sample rooms for the hotel
INSERT INTO rooms (tenant_id, hotel_id, room_number, room_type, price_per_night, capacity, description, is_available) VALUES 
('default', @hotel_id, '101', 'SINGLE', 150.00, 1, 'WiFi, TV, Mini Bar, Air Conditioning', TRUE),
('default', @hotel_id, '102', 'SINGLE', 150.00, 1, 'WiFi, TV, Mini Bar, Air Conditioning', TRUE),
('default', @hotel_id, '201', 'DOUBLE', 200.00, 2, 'WiFi, TV, Mini Bar, Air Conditioning, Balcony', TRUE),
('default', @hotel_id, '202', 'DOUBLE', 200.00, 2, 'WiFi, TV, Mini Bar, Air Conditioning, Balcony', TRUE),
('default', @hotel_id, '301', 'SUITE', 350.00, 4, 'WiFi, TV, Mini Bar, Air Conditioning, Living Room, Kitchen', TRUE),
('default', @hotel_id, '302', 'DELUXE', 300.00, 3, 'WiFi, TV, Mini Bar, Air Conditioning, Premium View', TRUE),
('default', @hotel_id, '401', 'PRESIDENTIAL', 500.00, 4, 'WiFi, TV, Mini Bar, Air Conditioning, Executive Lounge Access, Butler Service', TRUE);

-- Create room pricing
INSERT INTO room_pricing (hotel_id, room_type, season_type, base_price, weekend_multiplier, holiday_multiplier, effective_from, effective_to, is_active) VALUES 
(@hotel_id, 'SINGLE', 'LOW', 150.00, 1.2, 1.5, '2025-01-01', '2025-12-31', TRUE),
(@hotel_id, 'DOUBLE', 'LOW', 200.00, 1.2, 1.5, '2025-01-01', '2025-12-31', TRUE),
(@hotel_id, 'SUITE', 'LOW', 350.00, 1.3, 1.8, '2025-01-01', '2025-12-31', TRUE),
(@hotel_id, 'DELUXE', 'LOW', 300.00, 1.25, 1.6, '2025-01-01', '2025-12-31', TRUE),
(@hotel_id, 'PRESIDENTIAL', 'LOW', 500.00, 1.4, 2.0, '2025-01-01', '2025-12-31', TRUE);

-- Create sample reservation
INSERT INTO reservations (tenant_id, room_id, guest_id, check_in_date, check_out_date, total_amount, status, payment_method, confirmation_number, special_requests) VALUES 
('default', 1, @guest_id, '2025-01-15', '2025-01-17', 300.00, 'CONFIRMED', 'CREDIT_CARD', 'BMH001', 'Late check-in requested'),
('default', 2, @guest_id, '2025-01-20', '2025-01-22', 400.00, 'PENDING', 'CREDIT_CARD', 'BMH002', NULL);

-- Create sample booking history entry
SET @reservation_id = LAST_INSERT_ID();
INSERT INTO booking_history (reservation_id, action_type, new_values, changed_by, change_reason) VALUES 
(@reservation_id, 'CREATED', '{"check_in_date":"2025-01-20","check_out_date":"2025-01-22","total_amount":400.00}', 'guest@example.com', 'Initial booking creation');

-- ============================================
-- SUMMARY OF TEST CREDENTIALS
-- ============================================
/*
Test User Credentials (All passwords use the pattern: {role}123):

1. System Admin:
   - Email: admin@bookmyhotel.com
   - Password: admin123
   - Role: ADMIN
   - Access: Full system access

2. Hotel Admin:
   - Email: hotel.admin@grandplaza.com  
   - Password: admin123
   - Role: HOTEL_ADMIN
   - Access: Grand Plaza Hotel management

3. Front Desk:
   - Email: frontdesk@grandplaza.com
   - Password: frontdesk123
   - Role: FRONTDESK
   - Access: Grand Plaza Hotel front desk operations

4. Guest:
   - Email: guest@example.com
   - Password: guest123
   - Role: GUEST
   - Access: Guest booking and management

5. Customer:
   - Email: customer@example.com
   - Password: customer123
   - Role: CUSTOMER
   - Access: Customer booking and management

Default Hotel: Grand Plaza Hotel (tenant: default)
Sample Reservation: BMH202508250001 for Test Guest
*/
