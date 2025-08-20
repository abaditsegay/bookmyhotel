-- V3: Add IP address and user agent columns to booking_history table
-- These columns are used for audit trail and security tracking

ALTER TABLE booking_history 
ADD COLUMN ip_address VARCHAR(45),
ADD COLUMN user_agent VARCHAR(500);

-- Add index for IP address for security analytics
CREATE INDEX idx_booking_history_ip_address ON booking_history (ip_address);
