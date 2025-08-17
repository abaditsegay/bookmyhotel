-- Add hotel relationship to users table
ALTER TABLE users ADD COLUMN hotel_id BIGINT;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT FK_user_hotel 
    FOREIGN KEY (hotel_id) REFERENCES hotels(id);

-- Create index for performance
CREATE INDEX idx_user_hotel ON users(hotel_id);
