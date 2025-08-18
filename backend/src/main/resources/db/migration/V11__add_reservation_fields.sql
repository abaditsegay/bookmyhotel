-- Add new fields to reservations table for front desk operations
ALTER TABLE reservations 
ADD COLUMN confirmation_number VARCHAR(20) NOT NULL DEFAULT '',
ADD COLUMN guest_name VARCHAR(200) NULL,
ADD COLUMN actual_check_in_time DATETIME NULL,
ADD COLUMN actual_check_out_time DATETIME NULL,
ADD COLUMN cancellation_reason VARCHAR(500) NULL,
ADD COLUMN cancelled_at DATETIME NULL;

-- Add status field to rooms table
ALTER TABLE rooms 
ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE';

-- Create unique index on confirmation_number
CREATE UNIQUE INDEX idx_reservations_confirmation_number ON reservations(confirmation_number);
