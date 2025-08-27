-- ============================================
-- HOTEL SHOP SYSTEM MIGRATION
-- ============================================
-- This migration creates tables for the hotel shop system with support for:
-- 1. Hotel-specific product inventory
-- 2. Guest room charging capability  
-- 3. Multi-payment options including room charges
-- Version: V49
-- Date: 2025-08-27

-- ============================================
-- PRODUCT CATALOG TABLE
-- ============================================
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sku VARCHAR(50) NOT NULL,
    category ENUM('BEVERAGES', 'SNACKS', 'CULTURAL_CLOTHING', 'SOUVENIRS', 'TOILETRIES', 'OTHER') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_stock_level INT DEFAULT 5,
    maximum_stock_level INT DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    weight_grams INT,
    image_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_product_tenant (tenant_id),
    INDEX idx_product_hotel (hotel_id),
    INDEX idx_product_sku (sku),
    INDEX idx_product_category (category),
    INDEX idx_product_active (is_active),
    INDEX idx_product_available (is_available),
    INDEX idx_product_stock (stock_quantity),
    
    -- Unique constraint for SKU per hotel
    UNIQUE KEY uk_product_hotel_sku (hotel_id, sku),
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- SHOP ORDERS TABLE
-- ============================================
CREATE TABLE shop_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    hotel_id BIGINT NOT NULL,
    order_number VARCHAR(20) NOT NULL,
    
    -- Customer information (supports both registered guests and walk-ins)
    guest_id BIGINT NULL, -- References users table for registered guests
    reservation_id BIGINT NULL, -- Link to reservation if guest is staying
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    room_number VARCHAR(10), -- If customer is hotel guest
    
    -- Order details
    status ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Payment information
    payment_method VARCHAR(50), -- CREDIT_CARD, MOBILE_MONEY, PAY_AT_FRONT_DESK, MBIRR, TELEBIRR, CASH, ROOM_CHARGE
    payment_intent_id VARCHAR(100), -- For stripe/payment processor
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP NULL,
    payment_reference VARCHAR(100),
    
    -- Delivery/Pickup options
    is_delivery BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_address VARCHAR(500),
    delivery_time TIMESTAMP NULL,
    delivery_type ENUM('PICKUP', 'ROOM_DELIVERY') DEFAULT 'PICKUP',
    
    -- Order lifecycle
    notes TEXT, -- Special instructions
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_shop_order_tenant (tenant_id),
    INDEX idx_shop_order_hotel (hotel_id),
    INDEX idx_shop_order_guest (guest_id),
    INDEX idx_shop_order_reservation (reservation_id),
    INDEX idx_shop_order_number (order_number),
    INDEX idx_shop_order_status (status),
    INDEX idx_shop_order_date (order_date),
    INDEX idx_shop_order_room (room_number),
    INDEX idx_shop_order_payment_method (payment_method),
    
    -- Unique constraint for order number per hotel
    UNIQUE KEY uk_shop_order_hotel_number (hotel_id, order_number),
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- SHOP ORDER ITEMS TABLE
-- ============================================
CREATE TABLE shop_order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    
    -- Order item details
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    
    -- Snapshot of product details at time of order (in case product changes later)
    product_name VARCHAR(100) NOT NULL,
    product_description TEXT,
    product_sku VARCHAR(50) NOT NULL,
    notes VARCHAR(500), -- Special instructions for this item
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_shop_order_item_tenant (tenant_id),
    INDEX idx_shop_order_item_order (order_id),
    INDEX idx_shop_order_item_product (product_id),
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT -- Prevent deletion of products with order history
) ENGINE=InnoDB;

-- ============================================
-- ROOM CHARGES TABLE (for charging to room)
-- ============================================
CREATE TABLE room_charges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50) NOT NULL,
    hotel_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL,
    shop_order_id BIGINT NULL, -- Link to shop order if charge is from shop
    
    -- Charge details
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    charge_type ENUM('SHOP_PURCHASE', 'MINIBAR', 'LAUNDRY', 'TELEPHONE', 'RESTAURANT', 'SPA', 'OTHER') NOT NULL,
    charge_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Status tracking
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP NULL,
    payment_reference VARCHAR(100),
    notes TEXT,
    
    -- Audit fields
    created_by BIGINT, -- Staff member who added the charge
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_room_charge_tenant (tenant_id),
    INDEX idx_room_charge_hotel (hotel_id),
    INDEX idx_room_charge_reservation (reservation_id),
    INDEX idx_room_charge_shop_order (shop_order_id),
    INDEX idx_room_charge_type (charge_type),
    INDEX idx_room_charge_date (charge_date),
    INDEX idx_room_charge_paid (is_paid),
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_order_id) REFERENCES shop_orders(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample products for testing (assuming hotel_id 1 exists)
INSERT IGNORE INTO products (tenant_id, hotel_id, name, description, sku, category, price, cost_price, stock_quantity, minimum_stock_level, is_active, is_available) VALUES
-- Beverages
('sams-hotels', 1, 'Coca Cola', 'Classic Coca Cola 330ml can', 'BEV-COLA-001', 'BEVERAGES', 25.00, 15.00, 50, 10, TRUE, TRUE),
('sams-hotels', 1, 'Ethiopian Coffee', 'Authentic Ethiopian coffee beans 250g', 'BEV-COFFEE-001', 'BEVERAGES', 120.00, 80.00, 30, 5, TRUE, TRUE),
('sams-hotels', 1, 'Dashen Beer', 'Local Ethiopian beer 330ml', 'BEV-BEER-001', 'BEVERAGES', 35.00, 20.00, 40, 8, TRUE, TRUE),
('sams-hotels', 1, 'Mineral Water', 'Highland Spring water 500ml', 'BEV-WATER-001', 'BEVERAGES', 15.00, 8.00, 100, 20, TRUE, TRUE),

-- Snacks
('sams-hotels', 1, 'Roasted Barley', 'Traditional Ethiopian roasted barley snack', 'SNK-BARLEY-001', 'SNACKS', 45.00, 25.00, 25, 5, TRUE, TRUE),
('sams-hotels', 1, 'Kolo Mix', 'Mixed roasted grains and nuts', 'SNK-KOLO-001', 'SNACKS', 30.00, 18.00, 35, 8, TRUE, TRUE),
('sams-hotels', 1, 'Chocolate Bar', 'Ethiopian chocolate bar 50g', 'SNK-CHOC-001', 'SNACKS', 40.00, 22.00, 60, 10, TRUE, TRUE),

-- Cultural Clothing & Souvenirs
('sams-hotels', 1, 'Traditional Scarf', 'Handwoven Ethiopian cotton scarf', 'CLT-SCARF-001', 'CULTURAL_CLOTHING', 250.00, 150.00, 15, 3, TRUE, TRUE),
('sams-hotels', 1, 'Coffee Ceremony Set', 'Traditional Ethiopian coffee ceremony set', 'SOU-COFFEE-001', 'SOUVENIRS', 450.00, 280.00, 8, 2, TRUE, TRUE),
('sams-hotels', 1, 'Habesha Kemis', 'Traditional Ethiopian dress - Small', 'CLT-KEMIS-S', 'CULTURAL_CLOTHING', 800.00, 500.00, 5, 1, TRUE, TRUE),
('sams-hotels', 1, 'Wooden Cross', 'Hand-carved Ethiopian Orthodox cross', 'SOU-CROSS-001', 'SOUVENIRS', 180.00, 100.00, 12, 3, TRUE, TRUE),

-- Toiletries
('sams-hotels', 1, 'Shampoo Travel Size', 'Hotel quality shampoo 50ml', 'TOI-SHAM-001', 'TOILETRIES', 65.00, 35.00, 40, 8, TRUE, TRUE),
('sams-hotels', 1, 'Toothbrush Set', 'Toothbrush and toothpaste travel kit', 'TOI-TOOTH-001', 'TOILETRIES', 55.00, 30.00, 25, 5, TRUE, TRUE);

-- Insert a sample shop order for testing
INSERT IGNORE INTO shop_orders (
    tenant_id, hotel_id, order_number, customer_name, customer_email, 
    room_number, status, total_amount, payment_method, is_delivery, 
    delivery_type, notes
) VALUES (
    'sams-hotels', 1, 'SHP-001', 'Test Customer', 'test@example.com',
    '101', 'PENDING', 95.00, 'ROOM_CHARGE', FALSE,
    'PICKUP', 'Sample order for testing shop system'
);

-- Insert sample order items (assuming order_id 1 was just created)
INSERT IGNORE INTO shop_order_items (
    tenant_id, order_id, product_id, quantity, unit_price, 
    product_name, product_sku
) VALUES 
    ('sams-hotels', 1, 1, 2, 25.00, 'Coca Cola', 'BEV-COLA-001'),
    ('sams-hotels', 1, 2, 1, 45.00, 'Roasted Barley', 'SNK-BARLEY-001');

-- Create a room charge for the shop order
INSERT IGNORE INTO room_charges (
    tenant_id, hotel_id, reservation_id, shop_order_id, 
    description, amount, charge_type, notes
) VALUES (
    'sams-hotels', 1, 1, 1,
    'Shop Purchase - Order SHP-001', 95.00, 'SHOP_PURCHASE',
    'Room charge for shop items purchased by guest'
);
