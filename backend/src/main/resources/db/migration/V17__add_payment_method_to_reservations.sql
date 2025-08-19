-- Add payment_method column to reservations table for tracking payment type
ALTER TABLE reservations 
ADD COLUMN payment_method VARCHAR(50) NULL DEFAULT NULL;

-- Update existing reservations to have a default payment method
UPDATE reservations 
SET payment_method = 'credit_card' 
WHERE payment_method IS NULL;
