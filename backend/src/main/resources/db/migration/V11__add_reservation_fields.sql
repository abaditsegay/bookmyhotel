-- Add new fields to reservations table for front desk operations
-- Check if columns exist before adding them to avoid duplicate column errors
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS confirmation_number VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(200) NULL,
ADD COLUMN IF NOT EXISTS actual_check_in_time DATETIME NULL,
ADD COLUMN IF NOT EXISTS actual_check_out_time DATETIME NULL,
ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS cancelled_at DATETIME NULL;

-- Add status field to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE';

-- Update existing reservations with unique confirmation numbers (only if they don't have one)
UPDATE reservations 
SET confirmation_number = CONCAT('CNF-', LPAD(id, 6, '0')) 
WHERE confirmation_number IS NULL OR confirmation_number = '';

-- Now make confirmation_number NOT NULL and add unique index if it doesn't exist
-- Check if the index already exists before creating it
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_confirmation_number ON reservations(confirmation_number);
