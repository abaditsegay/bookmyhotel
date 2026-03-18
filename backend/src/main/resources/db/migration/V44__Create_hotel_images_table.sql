-- Create hotel_images table for AWS S3 image management
CREATE TABLE hotel_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100) NOT NULL,
    hotel_id BIGINT NOT NULL,
    room_type_id BIGINT DEFAULT NULL,
    image_category VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    alt_text VARCHAR(255) DEFAULT NULL,
    file_size BIGINT DEFAULT NULL,
    mime_type VARCHAR(100) DEFAULT NULL,
    width INT DEFAULT NULL,
    height INT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0,
    
    -- Indexes for performance
    INDEX idx_tenant_hotel (tenant_id, hotel_id),
    INDEX idx_room_type (room_type_id),
    INDEX idx_image_category (image_category),
    INDEX idx_display_order (display_order),
    INDEX idx_active (is_active),
    
    -- Constraints
    CONSTRAINT chk_image_category CHECK (image_category IN ('hotel_hero', 'hotel_gallery', 'room_type_hero', 'room_type_gallery')),
    CONSTRAINT chk_hero_room_type CHECK (
        -- Hotel hero/gallery images should not have room_type_id
        (image_category IN ('hotel_hero', 'hotel_gallery') AND room_type_id IS NULL) OR
        -- Room type hero/gallery images must have room_type_id
        (image_category IN ('room_type_hero', 'room_type_gallery') AND room_type_id IS NOT NULL)
    ),
    
    -- Foreign key constraints
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
    -- Note: room_type_id references a room type category, not a separate table
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: MySQL doesn't support filtered indexes with WHERE clauses
-- Business logic will ensure only one hero image per hotel/room type
-- through application-level constraints