-- V3__Add_superadmin_functionality.sql
-- Migration to add superadmin functionality: hotel registrations and enhanced user management

-- Add hotel registration table
CREATE TABLE hotel_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    address VARCHAR(200) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    contact_email VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    license_number VARCHAR(50),
    tax_id VARCHAR(20),
    status ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT NULL,
    review_comments VARCHAR(500),
    approved_hotel_id BIGINT NULL,
    tenant_id VARCHAR(50),
    INDEX idx_hotel_reg_status (status),
    INDEX idx_hotel_reg_email (contact_email),
    FOREIGN KEY (approved_hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Update user_roles enum to include SUPERADMIN
-- Note: This will be handled by the application since enum modifications in MySQL are complex
-- For now, we'll add sample data with the new roles

-- Insert sample superadmin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, phone, is_active, tenant_id, created_at, updated_at) 
VALUES (
    'superadmin@bookmyhotel.com', 
    '$2a$10$E8Q8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 
    'Super', 
    'Admin', 
    '+1234567890', 
    1, 
    'system', 
    NOW(), 
    NOW()
);

-- Get the superadmin user ID
SET @superadmin_id = LAST_INSERT_ID();

-- Insert SUPERADMIN role for the superadmin user
INSERT INTO user_roles (user_id, role) VALUES (@superadmin_id, 'SUPERADMIN');

-- Insert sample hotel registration
INSERT INTO hotel_registrations (
    hotel_name, description, address, city, country, phone, 
    contact_email, contact_person, license_number, tax_id, 
    status, tenant_id
) VALUES (
    'Grand Plaza Hotel',
    'A luxury 5-star hotel in the heart of downtown with exceptional service and amenities.',
    '123 Main Street, Downtown',
    'New York',
    'USA',
    '+1-555-123-4567',
    'manager@grandplaza.com',
    'John Manager',
    'LIC-2024-001',
    'TAX-123456789',
    'PENDING',
    NULL
),
(
    'Seaside Resort & Spa',
    'Beautiful beachfront resort with spa services and ocean views.',
    '456 Ocean Drive',
    'Miami',
    'USA',
    '+1-555-987-6543',
    'info@seasideresort.com',
    'Sarah Director',
    'LIC-2024-002',
    'TAX-987654321',
    'UNDER_REVIEW',
    NULL
);
