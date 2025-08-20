-- V15__Create_Enhanced_Pricing_Tables.sql
-- Database migration for Phase 3.3: Enhanced Cost Calculation
-- Creates tables for pricing strategies, seasonal rates, and promotional codes

-- Create pricing_strategies table
CREATE TABLE IF NOT EXISTS pricing_strategies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    strategy_type ENUM('BASE', 'SEASONAL', 'DEMAND_BASED', 'EARLY_BIRD', 'LAST_MINUTE', 'WEEKEND', 'HOLIDAY', 'CORPORATE', 'GROUP', 'LENGTH_OF_STAY') NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    base_rate_multiplier DECIMAL(5,3) NOT NULL,
    min_occupancy_threshold DECIMAL(5,2),
    max_occupancy_threshold DECIMAL(5,2),
    advance_booking_days INT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    room_type ENUM('STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL'),
    weekday_multiplier DECIMAL(5,3),
    weekend_multiplier DECIMAL(5,3),
    holiday_multiplier DECIMAL(5,3),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_strategy_type (strategy_type),
    INDEX idx_effective_dates (effective_from, effective_to),
    INDEX idx_room_type (room_type),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active)
);

-- Create seasonal_rates table
CREATE TABLE IF NOT EXISTS seasonal_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    season_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    room_type ENUM('STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL'),
    rate_multiplier DECIMAL(5,3) NOT NULL,
    fixed_rate_adjustment DECIMAL(10,2),
    adjustment_type ENUM('MULTIPLIER', 'FIXED_ADJUSTMENT') NOT NULL,
    applies_to_weekends_only BOOLEAN NOT NULL DEFAULT FALSE,
    applies_to_weekdays_only BOOLEAN NOT NULL DEFAULT FALSE,
    min_nights INT,
    max_nights INT,
    priority INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_season_dates (start_date, end_date),
    INDEX idx_room_type (room_type),
    INDEX idx_priority (priority),
    INDEX idx_active (is_active)
);

-- Create promotional_codes table
CREATE TABLE IF NOT EXISTS promotional_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_booking_amount DECIMAL(10,2),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    per_customer_limit INT,
    applicable_room_type ENUM('STANDARD', 'DELUXE', 'SUITE', 'EXECUTIVE', 'PRESIDENTIAL'),
    first_time_customer_only BOOLEAN NOT NULL DEFAULT FALSE,
    min_nights INT,
    max_nights INT,
    advance_booking_days INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_code (code),
    INDEX idx_valid_dates (valid_from, valid_to),
    INDEX idx_room_type (applicable_room_type),
    INDEX idx_active (is_active),
    INDEX idx_usage (usage_count, usage_limit)
);

-- Add promotional_code column to reservations table for tracking usage (only if not exists)
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE table_schema = 'bookmyhotel' 
                     AND table_name = 'reservations' 
                     AND column_name = 'promotional_code');

SET @sql = IF(@column_exists = 0, 
              'ALTER TABLE reservations ADD COLUMN promotional_code VARCHAR(50)', 
              'SELECT "Column promotional_code already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
                    WHERE table_schema = 'bookmyhotel' 
                    AND table_name = 'reservations' 
                    AND index_name = 'idx_promotional_code');

SET @sql = IF(@index_exists = 0, 
              'ALTER TABLE reservations ADD INDEX idx_promotional_code (promotional_code)', 
              'SELECT "Index idx_promotional_code already exists" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert sample pricing strategies
INSERT IGNORE INTO pricing_strategies (hotel_id, strategy_type, name, description, base_rate_multiplier, effective_from, priority) VALUES
(1, 'EARLY_BIRD', 'Early Bird Discount', '15% discount for bookings made 14+ days in advance', 0.85, '2025-01-01', 10),
(1, 'LAST_MINUTE', 'Last Minute Deal', '20% discount for same-day bookings', 0.80, '2025-01-01', 5),
(1, 'LENGTH_OF_STAY', 'Weekly Stay Discount', '10% discount for stays of 7+ nights', 0.90, '2025-01-01', 8),
(1, 'WEEKEND', 'Weekend Premium', '25% premium for weekend stays', 1.25, '2025-01-01', 15),
(1, 'DEMAND_BASED', 'High Demand Pricing', '30% premium when occupancy > 80%', 1.30, '2025-01-01', 20);

UPDATE pricing_strategies SET 
    min_occupancy_threshold = 80.0, 
    max_occupancy_threshold = 100.0 
WHERE strategy_type = 'DEMAND_BASED';

UPDATE pricing_strategies SET 
    advance_booking_days = 14 
WHERE strategy_type = 'EARLY_BIRD';

UPDATE pricing_strategies SET 
    weekend_multiplier = 1.25 
WHERE strategy_type = 'WEEKEND';

-- Insert sample seasonal rates
INSERT IGNORE INTO seasonal_rates (hotel_id, season_name, description, start_date, end_date, rate_multiplier, adjustment_type, priority) VALUES
(1, 'Summer Peak', 'High season summer rates', '2025-06-01', '2025-08-31', 1.40, 'MULTIPLIER', 20),
(1, 'Winter Holiday', 'Holiday season premium', '2025-12-20', '2026-01-05', 1.50, 'MULTIPLIER', 25),
(1, 'Spring Special', 'Spring season rates', '2025-03-01', '2025-05-31', 1.15, 'MULTIPLIER', 10),
(1, 'Fall Discount', 'Autumn low season', '2025-09-01', '2025-11-30', 0.85, 'MULTIPLIER', 5);

-- Insert sample promotional codes
INSERT IGNORE INTO promotional_codes (hotel_id, code, name, description, discount_type, discount_value, valid_from, valid_to, usage_limit) VALUES
(1, 'WELCOME20', 'Welcome Discount', '20% off for first-time customers', 'PERCENTAGE', 20.00, '2025-01-01', '2025-12-31', 100),
(1, 'SAVE50', 'Fixed Discount', '$50 off bookings over $300', 'FIXED_AMOUNT', 50.00, '2025-01-01', '2025-12-31', 200),
(1, 'WEEKEND15', 'Weekend Special', '15% off weekend stays', 'PERCENTAGE', 15.00, '2025-01-01', '2025-12-31', 500),
(1, 'LONGSTAY', 'Extended Stay', '25% off stays of 7+ nights', 'PERCENTAGE', 25.00, '2025-01-01', '2025-12-31', 50);

UPDATE promotional_codes SET 
    min_booking_amount = 300.00,
    max_discount_amount = 100.00 
WHERE code = 'SAVE50';

UPDATE promotional_codes SET 
    first_time_customer_only = TRUE 
WHERE code = 'WELCOME20';

UPDATE promotional_codes SET 
    min_nights = 7 
WHERE code = 'LONGSTAY';
