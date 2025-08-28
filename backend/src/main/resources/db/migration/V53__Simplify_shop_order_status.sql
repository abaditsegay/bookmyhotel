-- Simplify shop order status to just payment status
-- This migration simplifies the order workflow to focus on payment only

-- Step 1: Add the new simplified enum values
ALTER TABLE shop_orders 
MODIFY COLUMN status ENUM(
    'PENDING', 
    'CONFIRMED', 
    'PREPARING', 
    'READY_FOR_PICKUP',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
    'UNPAID',  -- new simplified value
    'PAID'     -- new simplified value
) NOT NULL DEFAULT 'UNPAID';

-- Step 2: Migrate existing data to simplified status
-- Map all non-paid statuses to UNPAID, and completed/delivered to PAID
UPDATE shop_orders 
SET status = 'UNPAID' 
WHERE status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'CANCELLED');

UPDATE shop_orders 
SET status = 'PAID' 
WHERE status IN ('DELIVERED', 'REFUNDED') OR is_paid = TRUE;

-- Step 3: Remove the old complex enum values, keeping only the simplified ones
ALTER TABLE shop_orders 
MODIFY COLUMN status ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID';

-- Step 4: Update the default for new orders
ALTER TABLE shop_orders 
ALTER COLUMN status SET DEFAULT 'UNPAID';
