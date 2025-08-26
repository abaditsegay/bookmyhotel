-- Migration to add missing financial_impact column to booking_history table
-- This column tracks monetary changes associated with booking actions (charges, refunds, etc.)

ALTER TABLE booking_history ADD COLUMN financial_impact DECIMAL(10,2) DEFAULT NULL COMMENT 'Financial impact: positive for charges, negative for refunds';

-- Add index for financial impact queries
CREATE INDEX idx_booking_history_financial_impact ON booking_history(financial_impact);

-- Update the table comment to reflect the new column
ALTER TABLE booking_history COMMENT = 'Booking history and audit trail with financial impact tracking';
