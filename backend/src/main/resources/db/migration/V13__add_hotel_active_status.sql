-- Add is_active column to hotels table to support filtering inactive hotels
ALTER TABLE hotels ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add index for performance
CREATE INDEX idx_hotel_active ON hotels(is_active);

-- Update all existing hotels to be active by default
UPDATE hotels SET is_active = TRUE;
