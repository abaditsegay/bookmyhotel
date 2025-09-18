-- V1 Initial Schema
-- Creates all tables based on entity relationships
-- Multi-tenant hotel booking system with hotel-scoped entities

-- Create tenants table (System Entity)
CREATE TABLE tenants (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tenant_name (name),
    INDEX idx_tenant_active (is_active)
);

-- Create users table (System Entity)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('SYSTEM_ADMIN', 'HOTEL_ADMIN', 'FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE', 'GUEST') NOT NULL,
    tenant_id VARCHAR(36),
    hotel_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    account_locked_until TIMESTAMP NULL,
    password_changed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_user_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_tenant (tenant_id),
    INDEX idx_user_hotel (hotel_id),
    INDEX idx_user_role (role),
    INDEX idx_user_active (is_active),
    INDEX idx_user_email (email),
    INDEX idx_user_username (username)
);

-- Create hotels table (Base Entity)
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    address VARCHAR(200) NOT NULL,
    city VARCHAR(50),
    country VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    tenant_id VARCHAR(36) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_hotel_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_hotel_tenant (tenant_id),
    INDEX idx_hotel_name (name),
    INDEX idx_hotel_active (is_active)
);

-- Add hotel foreign key to users table (after hotels table is created)
ALTER TABLE users 
ADD CONSTRAINT fk_user_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Create rooms table (Hotel Scoped Entity)
CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    room_type ENUM('STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL', 'FAMILY', 'ACCESSIBLE') NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'OUT_OF_ORDER', 'MAINTENANCE', 'CLEANING', 'DIRTY') NOT NULL DEFAULT 'AVAILABLE',
    price_per_night DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL,
    description VARCHAR(500),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_room_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_room_hotel (hotel_id),
    INDEX idx_room_number (room_number),
    INDEX idx_room_type (room_type),
    INDEX idx_room_status (status),
    INDEX idx_room_available (is_available),
    
    -- Unique constraint
    UNIQUE KEY uk_room_hotel_number (hotel_id, room_number)
);

-- Create room_type_pricing table (Hotel Scoped Entity)
CREATE TABLE room_type_pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_type ENUM('STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL', 'FAMILY', 'ACCESSIBLE') NOT NULL,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    weekend_price DECIMAL(10,2),
    holiday_price DECIMAL(10,2),
    peak_season_price DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    currency VARCHAR(3) DEFAULT 'USD',
    effective_from DATE,
    effective_until DATE,
    description VARCHAR(500),
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_room_type_pricing_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_room_type_pricing_hotel (hotel_id),
    INDEX idx_room_type_pricing_room_type (room_type),
    INDEX idx_room_type_pricing_active (is_active),
    
    -- Unique constraint
    UNIQUE KEY uk_room_type_pricing_hotel_type (hotel_id, room_type)
);

-- Create reservations table (Hotel Scoped Entity)
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    special_requests VARCHAR(500),
    payment_intent_id VARCHAR(100),
    payment_method VARCHAR(100),
    confirmation_number VARCHAR(20) UNIQUE,
    actual_check_in_time TIMESTAMP NULL,
    actual_check_out_time TIMESTAMP NULL,
    cancellation_reason VARCHAR(500),
    cancelled_at TIMESTAMP NULL,
    promotional_code VARCHAR(50),
    
    -- Room Type Booking fields
    room_type ENUM('STANDARD', 'DELUXE', 'SUITE', 'PRESIDENTIAL', 'FAMILY', 'ACCESSIBLE') NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    number_of_guests INT NOT NULL DEFAULT 1,
    
    -- Optional room assignment
    assigned_room_id BIGINT,
    room_assigned_at TIMESTAMP NULL,
    
    -- Guest information (embedded)
    guest_name VARCHAR(100),
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    
    -- Optional registered user reference
    guest_id BIGINT,
    
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reservation_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_assigned_room FOREIGN KEY (assigned_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_reservation_guest FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_reservation_hotel (hotel_id),
    INDEX idx_reservation_room_type (room_type),
    INDEX idx_reservation_assigned_room (assigned_room_id),
    INDEX idx_reservation_guest (guest_id),
    INDEX idx_reservation_dates (check_in_date, check_out_date),
    INDEX idx_reservation_status (status),
    INDEX idx_reservation_guest_email (guest_email),
    INDEX idx_reservation_confirmation (confirmation_number)
);

-- Create housekeeping_staff table (Hotel Scoped Entity)
CREATE TABLE housekeeping_staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role ENUM('HOUSEKEEPER', 'SUPERVISOR', 'INSPECTOR', 'LAUNDRY_ATTENDANT', 'PUBLIC_AREA_ATTENDANT') NOT NULL,
    shift ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT') NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED') NOT NULL,
    hourly_rate DECIMAL(10,2),
    performance_rating DECIMAL(3,2) DEFAULT 3.0,
    tasks_completed_today INT DEFAULT 0,
    average_task_duration DECIMAL(5,2),
    quality_score_average DECIMAL(3,2) DEFAULT 3.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    current_workload INT DEFAULT 0,
    average_rating DECIMAL(3,2),
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_housekeeping_staff_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_housekeeping_staff_hotel (hotel_id),
    INDEX idx_housekeeping_staff_employee_id (employee_id),
    INDEX idx_housekeeping_staff_role (role),
    INDEX idx_housekeeping_staff_status (status),
    INDEX idx_housekeeping_staff_active (is_active)
);

-- Create housekeeping_tasks table (Hotel Scoped Entity)
CREATE TABLE housekeeping_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    assigned_staff_id BIGINT,
    task_type ENUM('ROOM_CLEANING', 'CHECKOUT_CLEANING', 'MAINTENANCE_CLEANING', 'DEEP_CLEANING', 
                   'INSPECTION', 'MAINTENANCE_TASK', 'RESTOCKING', 'LAUNDRY', 'SPECIAL_REQUEST', 
                   'EMERGENCY_CLEANUP', 'PREVENTIVE_MAINTENANCE', 'PUBLIC_AREA_CLEANING', 
                   'BATHROOM_DEEP_CLEAN', 'CARPET_CLEANING', 'EQUIPMENT_CHECK', 'HVAC_MAINTENANCE', 
                   'SEASONAL_PREPARATION', 'QUALITY_CHECK', 'GUEST_COMPLAINT_FOLLOWUP') NOT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'COMPLETED_WITH_ISSUES', 
                'PENDING_INSPECTION', 'APPROVED', 'REJECTED', 'CANCELLED', 'RESCHEDULED', 
                'ESCALATED', 'QUALITY_ISSUE', 'GUEST_COMPLAINT') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    description TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    quality_score INT CHECK (quality_score >= 1 AND quality_score <= 5),
    inspector_notes TEXT,
    hotel_id BIGINT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_housekeeping_task_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_housekeeping_task_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_housekeeping_task_staff FOREIGN KEY (assigned_staff_id) REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_housekeeping_task_hotel (hotel_id),
    INDEX idx_housekeeping_task_room (room_id),
    INDEX idx_housekeeping_task_staff (assigned_staff_id),
    INDEX idx_housekeeping_task_status (status),
    INDEX idx_housekeeping_task_priority (priority),
    INDEX idx_housekeeping_task_type (task_type)
);

-- Create maintenance_tasks table (Hotel Scoped Entity)
CREATE TABLE maintenance_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT,
    task_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'VERIFIED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
    assigned_to BIGINT,
    created_by BIGINT NOT NULL,
    reported_by BIGINT,
    location VARCHAR(200),
    equipment_type VARCHAR(100),
    estimated_duration_minutes INT,
    actual_duration_minutes INT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_start_time TIMESTAMP NULL,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    parts_required TEXT,
    tools_required TEXT,
    safety_requirements TEXT,
    work_performed TEXT,
    parts_used TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP NULL,
    follow_up_notes TEXT,
    verification_notes TEXT,
    verified_by BIGINT,
    verification_time TIMESTAMP NULL,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_maintenance_task_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_task_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_task_assigned_to FOREIGN KEY (assigned_to) REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_task_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_task_reported_by FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_maintenance_task_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_maintenance_task_hotel (hotel_id),
    INDEX idx_maintenance_task_room (room_id),
    INDEX idx_maintenance_task_assigned_to (assigned_to),
    INDEX idx_maintenance_task_status (status),
    INDEX idx_maintenance_task_priority (priority),
    INDEX idx_maintenance_task_type (task_type),
    INDEX idx_maintenance_task_created_by (created_by)
);

-- Create staff_schedules table (Hotel Scoped Entity)
CREATE TABLE staff_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id BIGINT NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FULL_DAY', 'SPLIT_SHIFT') NOT NULL,
    department ENUM('FRONTDESK', 'HOUSEKEEPING', 'MAINTENANCE', 'SECURITY', 'RESTAURANT', 'CONCIERGE', 'MANAGEMENT') NOT NULL,
    notes VARCHAR(500),
    status ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    created_by BIGINT,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_staff_schedule_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_schedule_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_schedule_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_staff_schedule_hotel (hotel_id),
    INDEX idx_staff_schedule_staff (staff_id),
    INDEX idx_staff_schedule_date (schedule_date),
    INDEX idx_staff_schedule_shift_type (shift_type),
    INDEX idx_staff_schedule_department (department),
    INDEX idx_staff_schedule_status (status)
);

-- Create products table (Hotel Scoped Entity)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    category ENUM('BEVERAGES', 'SNACKS', 'CULTURAL_CLOTHING', 'SOUVENIRS', 'TOILETRIES', 'OTHER') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    weight_grams INT,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_product_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_product_hotel (hotel_id),
    INDEX idx_product_category (category),
    INDEX idx_product_active (is_active),
    INDEX idx_product_available (is_available),
    INDEX idx_product_sku (sku)
);

-- Create shop_orders table (Hotel Scoped Entity)
CREATE TABLE shop_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    guest_id BIGINT,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    room_number VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(100),
    special_instructions TEXT,
    delivery_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    delivery_requested_at TIMESTAMP NULL,
    prepared_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason VARCHAR(500),
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_shop_order_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_order_guest FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_shop_order_hotel (hotel_id),
    INDEX idx_shop_order_guest (guest_id),
    INDEX idx_shop_order_number (order_number),
    INDEX idx_shop_order_status (status),
    INDEX idx_shop_order_payment_status (payment_status),
    INDEX idx_shop_order_room (room_number)
);

-- Create shop_order_items table (Hotel Scoped Entity)
CREATE TABLE shop_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions VARCHAR(500),
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_shop_order_item_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_order_item_order FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_order_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_shop_order_item_hotel (hotel_id),
    INDEX idx_shop_order_item_order (order_id),
    INDEX idx_shop_order_item_product (product_id)
);

-- Create hotel_registrations table (Hotel Scoped Entity)
CREATE TABLE hotel_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(200) NOT NULL,
    city VARCHAR(50),
    country VARCHAR(50),
    registration_code VARCHAR(20) UNIQUE,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    hotel_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_hotel_registration_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_hotel_registration_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_hotel_registration_status (status),
    INDEX idx_hotel_registration_email (email),
    INDEX idx_hotel_registration_code (registration_code),
    INDEX idx_hotel_registration_hotel (hotel_id)
);

-- Create room_charges table (Hotel Scoped Entity)
CREATE TABLE room_charges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    guest_id BIGINT,
    reservation_id BIGINT,
    charge_type ENUM('ROOM_SERVICE', 'MINIBAR', 'PHONE', 'INTERNET', 'LAUNDRY', 'SPA', 'OTHER') NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('PENDING', 'CONFIRMED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    charged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    notes VARCHAR(500),
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_room_charge_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_charge_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_charge_guest FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_room_charge_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_room_charge_hotel (hotel_id),
    INDEX idx_room_charge_room (room_id),
    INDEX idx_room_charge_guest (guest_id),
    INDEX idx_room_charge_reservation (reservation_id),
    INDEX idx_room_charge_type (charge_type),
    INDEX idx_room_charge_status (status)
);

-- Additional tables for comprehensive functionality

-- Create promotional_codes table (Hotel Scoped Entity)
CREATE TABLE promotional_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2),
    maximum_discount DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    applicable_room_types TEXT, -- JSON array of room types
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_promotional_code_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_promotional_code_hotel (hotel_id),
    INDEX idx_promotional_code_code (code),
    INDEX idx_promotional_code_active (is_active),
    INDEX idx_promotional_code_valid (valid_from, valid_until),
    
    -- Unique constraint
    UNIQUE KEY uk_promotional_code_hotel_code (hotel_id, code)
);

-- Create booking_history table for audit trail (Hotel Scoped Entity)
CREATE TABLE booking_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    action_type ENUM('CREATED', 'MODIFIED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'ROOM_ASSIGNED', 'PAYMENT_UPDATED') NOT NULL,
    description TEXT,
    old_values JSON,
    new_values JSON,
    changed_by BIGINT,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_booking_history_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_history_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_booking_history_hotel (hotel_id),
    INDEX idx_booking_history_reservation (reservation_id),
    INDEX idx_booking_history_action_type (action_type),
    INDEX idx_booking_history_changed_by (changed_by),
    INDEX idx_booking_history_created_at (created_at)
);

-- Create ads table for hotel advertisements (Hotel Scoped Entity)
CREATE TABLE ads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    target_url VARCHAR(500),
    ad_type ENUM('BANNER', 'POPUP', 'SIDEBAR', 'INLINE') NOT NULL,
    placement ENUM('HOME', 'BOOKING', 'SHOP', 'PROFILE', 'ALL') NOT NULL DEFAULT 'ALL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    display_order INT DEFAULT 0,
    click_count INT DEFAULT 0,
    impression_count INT DEFAULT 0,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_ad_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_ad_hotel (hotel_id),
    INDEX idx_ad_type (ad_type),
    INDEX idx_ad_placement (placement),
    INDEX idx_ad_active (is_active),
    INDEX idx_ad_dates (start_date, end_date),
    INDEX idx_ad_display_order (display_order)
);
