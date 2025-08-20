-- Migration to add guest information fields and make guest_id nullable
-- File: V27__add_guest_info_fields.sql

-- Add guest email and phone columns to reservations table
ALTER TABLE reservations 
ADD COLUMN guest_email VARCHAR(100),
ADD COLUMN guest_phone VARCHAR(20);

-- Make guest_id nullable to support anonymous bookings
ALTER TABLE reservations 
MODIFY COLUMN guest_id BIGINT NULL;

-- Update existing reservations to populate new guest info fields from user data
UPDATE reservations r 
INNER JOIN users u ON r.guest_id = u.id 
SET r.guest_email = u.email, 
    r.guest_phone = u.phone;

-- Add NOT NULL constraint to guest_email after populating data
ALTER TABLE reservations 
MODIFY COLUMN guest_email VARCHAR(100) NOT NULL;

-- Add index for guest email for faster lookups
CREATE INDEX idx_reservation_guest_email ON reservations(guest_email);
