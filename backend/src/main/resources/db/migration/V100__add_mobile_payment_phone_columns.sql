-- Add mobile payment phone columns to hotels table

ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS mobile_payment_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS mobile_payment_phone2 VARCHAR(20);

-- Update existing hotels with sample mobile payment phone numbers
-- You should replace these with actual payment phone numbers for each hotel

-- Update Addis Sunshine Grand Hotel (assuming it exists)
UPDATE hotels 
SET mobile_payment_phone = '0911234567',
    mobile_payment_phone2 = '0922345678'
WHERE name = 'Addis Sunshine Grand Hotel';

-- Update Grand Plaza Hotel (if it exists)
UPDATE hotels 
SET mobile_payment_phone = '0911111111',
    mobile_payment_phone2 = '0922222222'
WHERE name = 'Grand Plaza Hotel';

-- Set default mobile payment phone for any hotels without one
UPDATE hotels 
SET mobile_payment_phone = CONCAT('091', LPAD(id, 7, '0'))
WHERE mobile_payment_phone IS NULL OR mobile_payment_phone = '';
