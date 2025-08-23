-- Create room_type_pricing table for managing pricing by room type
CREATE TABLE room_type_pricing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_type VARCHAR(20) NOT NULL,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    weekend_multiplier DECIMAL(5,2) DEFAULT 1.20,
    holiday_multiplier DECIMAL(5,2) DEFAULT 1.50,
    peak_season_multiplier DECIMAL(5,2) DEFAULT 1.30,
    is_active BOOLEAN DEFAULT TRUE,
    currency VARCHAR(3) DEFAULT 'USD',
    description VARCHAR(500),
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_room_type_pricing_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_type_pricing_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Unique constraint for hotel-room_type combination
    CONSTRAINT uk_room_type_pricing_hotel_type UNIQUE (hotel_id, room_type)
);

-- Create indexes for better performance
CREATE INDEX idx_room_type_pricing_tenant ON room_type_pricing(tenant_id);
CREATE INDEX idx_room_type_pricing_hotel ON room_type_pricing(hotel_id);
CREATE INDEX idx_room_type_pricing_room_type ON room_type_pricing(room_type);

-- Insert default pricing for existing hotels (if any)
-- This will be handled by the application service when hotel admins access the pricing feature
