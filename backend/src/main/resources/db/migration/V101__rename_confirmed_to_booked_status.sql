-- Migration: Rename reservation status CONFIRMED to BOOKED
-- This ensures consistency across database, backend, and frontend

-- Step 1: Alter the ENUM to add BOOKED
ALTER TABLE reservations 
    MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'BOOKED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') NOT NULL DEFAULT 'PENDING';

-- Step 2: Update existing data from CONFIRMED to BOOKED
UPDATE reservations SET status = 'BOOKED' WHERE status = 'CONFIRMED';

-- Step 3: Remove CONFIRMED from the ENUM (now that no rows use it)
ALTER TABLE reservations 
    MODIFY COLUMN status ENUM('PENDING', 'BOOKED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') NOT NULL DEFAULT 'PENDING';
