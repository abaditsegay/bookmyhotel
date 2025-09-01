-- BookMyHotel Initial Schema
-- This migration represents the complete initial database schema

-- Create tenants table
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tenants_slug (slug),
    INDEX idx_tenants_domain (domain),
    INDEX idx_tenants_active (is_active)
);

-- Create hotels table
CREATE TABLE hotels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    check_in_time TIME DEFAULT '15:00:00',
    check_out_time TIME DEFAULT '11:00:00',
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    amenities JSON,
    policies JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hotels_tenant_id (tenant_id),
    INDEX idx_hotels_city (city),
    INDEX idx_hotels_active (is_active),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    profile_picture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_users_email_tenant (email, tenant_id),
    INDEX idx_users_tenant_id (tenant_id),
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Create user_roles table
CREATE TABLE user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role ENUM('GUEST', 'ADMIN', 'HOTEL_ADMIN', 'FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE', 'SYSTEM_ADMIN', 'OPERATIONS_SUPERVISOR') NOT NULL,
    hotel_id BIGINT,
    granted_by BIGINT,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_roles_user_id (user_id),
    INDEX idx_user_roles_role (role),
    INDEX idx_user_roles_hotel_id (hotel_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create rooms table
CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type ENUM('STANDARD','DELUXE','SUITE','PRESIDENTIAL','FAMILY','ACCESSIBLE') NOT NULL,
    floor_number INT,
    max_occupancy INT NOT NULL DEFAULT 2,
    size_sqm DECIMAL(6,2),
    bed_configuration VARCHAR(100),
    price_per_night DECIMAL(10,2) NOT NULL,
    amenities JSON,
    description TEXT,
    images JSON,
    is_available BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    last_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_rooms_hotel_number (hotel_id, room_number),
    INDEX idx_rooms_hotel_id (hotel_id),
    INDEX idx_rooms_type (room_type),
    INDEX idx_rooms_available (is_available),
    INDEX idx_rooms_status (status),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create reservations table
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    confirmation_number VARCHAR(20) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    guest_address TEXT,
    guest_id_type VARCHAR(50),
    guest_id_number VARCHAR(100),
    room_type ENUM('STANDARD','DELUXE','SUITE','PRESIDENTIAL','FAMILY','ACCESSIBLE') NOT NULL,
    assigned_room_id BIGINT,
    assigned_at TIMESTAMP NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    actual_check_in TIMESTAMP NULL,
    actual_check_out TIMESTAMP NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'PENDING',
    special_requests TEXT,
    payment_method VARCHAR(100) DEFAULT 'CREDIT_CARD',
    payment_status ENUM('PENDING','PARTIAL','PAID','REFUNDED') DEFAULT 'PENDING',
    payment_intent_id VARCHAR(255),
    source ENUM('DIRECT','BOOKING_COM','EXPEDIA','AGODA','AIRBNB','PHONE','WALK_IN') DEFAULT 'DIRECT',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    actual_check_in_time TIMESTAMP NULL,
    actual_check_out_time TIMESTAMP NULL,
    room_assigned_at TIMESTAMP NULL,
    number_of_guests INT DEFAULT 1,
    price_per_night DECIMAL(10,2) DEFAULT 100.00,
    promotional_code VARCHAR(50),
    guest_id BIGINT,
    cancellation_reason VARCHAR(500),
    cancelled_at TIMESTAMP NULL,
    UNIQUE KEY uk_reservations_confirmation (confirmation_number),
    INDEX idx_reservations_hotel_id (hotel_id),
    INDEX idx_reservations_guest_email (guest_email),
    INDEX idx_reservations_check_in (check_in_date),
    INDEX idx_reservations_status (status),
    INDEX idx_reservations_assigned_room (assigned_room_id),
    INDEX idx_reservations_created_by (created_by),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create room_charges table
CREATE TABLE room_charges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL,
    charge_type VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    charged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    charged_by BIGINT,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_date TIMESTAMP NULL,
    notes TEXT,
    INDEX idx_room_charges_hotel_id (hotel_id),
    INDEX idx_room_charges_reservation_id (reservation_id),
    INDEX idx_room_charges_tenant_id (tenant_id),
    INDEX idx_room_charges_type (charge_type),
    INDEX idx_room_charges_paid (is_paid),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (charged_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create room_type_pricing table
CREATE TABLE room_type_pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_type ENUM('STANDARD','DELUXE','SUITE','PRESIDENTIAL','FAMILY','ACCESSIBLE') NOT NULL,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    weekend_price DECIMAL(10,2),
    holiday_price DECIMAL(10,2),
    peak_season_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_until DATE,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_room_type_pricing_hotel_type (hotel_id, room_type),
    INDEX idx_room_type_pricing_hotel_id (hotel_id),
    INDEX idx_room_type_pricing_room_type (room_type),
    INDEX idx_room_type_pricing_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    sku VARCHAR(100),
    stock_quantity INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_products_hotel_id (hotel_id),
    INDEX idx_products_tenant_id (tenant_id),
    INDEX idx_products_category (category),
    INDEX idx_products_available (is_available),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create shop_orders table
CREATE TABLE shop_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    reservation_id BIGINT,
    customer_name VARCHAR(255),
    room_number VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(100) DEFAULT 'CASH',
    status ENUM('PENDING', 'PAID') DEFAULT 'PENDING',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP NULL,
    notes TEXT,
    INDEX idx_shop_orders_hotel_id (hotel_id),
    INDEX idx_shop_orders_tenant_id (tenant_id),
    INDEX idx_shop_orders_reservation_id (reservation_id),
    INDEX idx_shop_orders_status (status),
    INDEX idx_shop_orders_created_by (created_by),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create shop_order_items table
CREATE TABLE shop_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_shop_order_items_order_id (order_id),
    INDEX idx_shop_order_items_product_id (product_id),
    FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create housekeeping_staff table
CREATE TABLE housekeeping_staff (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    employee_id VARCHAR(50),
    role ENUM('HOUSEKEEPER', 'SUPERVISOR', 'LAUNDRY', 'MAINTENANCE') DEFAULT 'HOUSEKEEPER',
    status ENUM('AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY') DEFAULT 'AVAILABLE',
    shift_start TIME,
    shift_end TIME,
    assigned_floors JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_housekeeping_staff_user_hotel (user_id, hotel_id),
    INDEX idx_housekeeping_staff_hotel_id (hotel_id),
    INDEX idx_housekeeping_staff_role (role),
    INDEX idx_housekeeping_staff_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create housekeeping_tasks table
CREATE TABLE housekeeping_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    assigned_to BIGINT,
    task_type ENUM('CLEANING', 'MAINTENANCE', 'INSPECTION', 'LAUNDRY', 'RESTOCKING') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    description TEXT,
    estimated_duration INT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_housekeeping_tasks_hotel_id (hotel_id),
    INDEX idx_housekeeping_tasks_room_id (room_id),
    INDEX idx_housekeeping_tasks_assigned_to (assigned_to),
    INDEX idx_housekeeping_tasks_status (status),
    INDEX idx_housekeeping_tasks_priority (priority),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create maintenance_requests table
CREATE TABLE maintenance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_id BIGINT,
    area VARCHAR(255),
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    reported_by BIGINT,
    assigned_to BIGINT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    scheduled_date DATE,
    completed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maintenance_requests_hotel_id (hotel_id),
    INDEX idx_maintenance_requests_room_id (room_id),
    INDEX idx_maintenance_requests_status (status),
    INDEX idx_maintenance_requests_priority (priority),
    INDEX idx_maintenance_requests_assigned_to (assigned_to),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create maintenance_tasks table
CREATE TABLE maintenance_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    task_description TEXT NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    assigned_to BIGINT,
    estimated_duration INT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_maintenance_tasks_request_id (request_id),
    INDEX idx_maintenance_tasks_assigned_to (assigned_to),
    INDEX idx_maintenance_tasks_status (status),
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create staff_schedules table
CREATE TABLE staff_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    shift_date DATE NOT NULL,
    shift_start TIME NOT NULL,
    shift_end TIME NOT NULL,
    role VARCHAR(100),
    department ENUM('FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE', 'KITCHEN', 'SECURITY', 'MANAGEMENT') NOT NULL,
    status ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_staff_schedules_hotel_id (hotel_id),
    INDEX idx_staff_schedules_user_id (user_id),
    INDEX idx_staff_schedules_date (shift_date),
    INDEX idx_staff_schedules_department (department),
    INDEX idx_staff_schedules_status (status),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create todos table
CREATE TABLE todos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    assigned_to BIGINT,
    due_date DATE,
    category VARCHAR(100),
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_todos_hotel_id (hotel_id),
    INDEX idx_todos_assigned_to (assigned_to),
    INDEX idx_todos_status (status),
    INDEX idx_todos_priority (priority),
    INDEX idx_todos_due_date (due_date),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create ads table
CREATE TABLE ads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    target_url VARCHAR(500),
    position_priority INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ads_hotel_id (hotel_id),
    INDEX idx_ads_tenant_id (tenant_id),
    INDEX idx_ads_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create booking_history table
CREATE TABLE booking_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL,
    action_type ENUM('CREATED', 'MODIFIED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'PAYMENT_UPDATED') NOT NULL,
    action_details TEXT,
    financial_impact DECIMAL(10,2) DEFAULT 0.00,
    ip_address VARCHAR(45),
    user_agent TEXT,
    performed_by BIGINT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking_history_reservation (reservation_id),
    INDEX idx_booking_history_hotel (hotel_id),
    INDEX idx_booking_history_tenant (tenant_id),
    INDEX idx_booking_history_action_type (action_type),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create hotel_registrations table
CREATE TABLE hotel_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255) NOT NULL UNIQUE,
    business_phone VARCHAR(20),
    business_address TEXT,
    contact_person_name VARCHAR(255) NOT NULL,
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(20),
    number_of_rooms INT,
    hotel_type VARCHAR(100),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    registration_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by BIGINT NULL,
    created_tenant_id VARCHAR(36) NULL,
    INDEX idx_hotel_reg_status (status),
    INDEX idx_hotel_reg_email (business_email),
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create pricing_strategies table
CREATE TABLE pricing_strategies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    strategy_type ENUM('DYNAMIC', 'SEASONAL', 'FIXED', 'OCCUPANCY_BASED') NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    adjustment_percentage DECIMAL(5,2) DEFAULT 0.00,
    min_rate DECIMAL(10,2),
    max_rate DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pricing_strategies_hotel (hotel_id),
    INDEX idx_pricing_strategies_tenant (tenant_id),
    INDEX idx_pricing_strategies_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create promotional_codes table
CREATE TABLE promotional_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_booking_amount DECIMAL(10,2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10,2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_room_types TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_promotional_codes_code_hotel (code, hotel_id),
    INDEX idx_promotional_codes_hotel (hotel_id),
    INDEX idx_promotional_codes_tenant (tenant_id),
    INDEX idx_promotional_codes_active (is_active),
    INDEX idx_promotional_codes_validity (valid_from, valid_until),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

-- Create seasonal_rates table
CREATE TABLE seasonal_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    room_type ENUM('STANDARD','DELUXE','SUITE','PRESIDENTIAL','FAMILY','ACCESSIBLE') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rate_per_night DECIMAL(10,2) NOT NULL,
    adjustment_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    adjustment_value DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_seasonal_rates_hotel (hotel_id),
    INDEX idx_seasonal_rates_tenant (tenant_id),
    INDEX idx_seasonal_rates_room_type (room_type),
    INDEX idx_seasonal_rates_dates (start_date, end_date),
    INDEX idx_seasonal_rates_active (is_active),
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);
