-- Migration to make customer_name nullable in shop_orders table for anonymous sales

-- Make customer_name column nullable
ALTER TABLE shop_orders MODIFY COLUMN customer_name VARCHAR(100) NULL;

-- Update any existing empty customer names to NULL for consistency
UPDATE shop_orders SET customer_name = NULL WHERE customer_name = '';

-- Add comment to document the change
ALTER TABLE shop_orders MODIFY COLUMN customer_name VARCHAR(100) NULL 
COMMENT 'Customer name - nullable for anonymous walk-in sales';
