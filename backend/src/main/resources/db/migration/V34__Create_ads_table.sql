-- Create ads table for hotel advertisements
CREATE TABLE ads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    discount_percentage DECIMAL(5,2),
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    priority_level INT DEFAULT 1,
    click_count INT DEFAULT 0,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_ads_hotel_id FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    CONSTRAINT fk_ads_tenant_id FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_ads_hotel_id ON ads(hotel_id);
CREATE INDEX idx_ads_tenant_id ON ads(tenant_id);
CREATE INDEX idx_ads_active ON ads(is_active);
CREATE INDEX idx_ads_valid_until ON ads(valid_until);
CREATE INDEX idx_ads_priority ON ads(priority_level);
