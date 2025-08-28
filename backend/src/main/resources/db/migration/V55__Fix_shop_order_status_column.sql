-- Fix shop order status column to ensure compatibility with JPA enum mapping
-- This migration ensures the status column can properly handle OrderStatus enum values

-- Update the status column to be a VARCHAR instead of ENUM to avoid truncation issues
-- This provides more flexibility and avoids MySQL ENUM limitations with JPA
ALTER TABLE shop_orders 
MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'UNPAID';

-- Update any existing data to use the simplified status values
UPDATE shop_orders 
SET status = 'UNPAID' 
WHERE status NOT IN ('UNPAID', 'PAID');

-- Update any paid orders to use 'PAID' status
UPDATE shop_orders 
SET status = 'PAID' 
WHERE is_paid = TRUE;

-- Add an index on the status column for better query performance
CREATE INDEX IF NOT EXISTS idx_shop_order_status_varchar ON shop_orders(status);
