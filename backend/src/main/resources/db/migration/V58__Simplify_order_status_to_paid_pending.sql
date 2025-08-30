-- Simplify order status to just PAID/PENDING for simple sales workflow
-- This migration updates the order status to focus on payment status only

-- Step 1: Migrate existing data
-- Map all paid/completed statuses to PAID, others to PENDING
UPDATE shop_orders 
SET status = 'PAID' 
WHERE status IN ('CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'DELIVERED') 
   OR is_paid = TRUE;

UPDATE shop_orders 
SET status = 'PENDING' 
WHERE status IN ('PENDING', 'CANCELLED', 'REFUNDED');

-- Step 2: Update the enum to only include PAID and PENDING
ALTER TABLE shop_orders 
MODIFY COLUMN status ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING';

-- Step 3: Ensure the default is set correctly
ALTER TABLE shop_orders 
ALTER COLUMN status SET DEFAULT 'PENDING';
