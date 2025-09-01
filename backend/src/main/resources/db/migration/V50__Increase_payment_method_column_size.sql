-- Increase payment_method column size to prevent truncation errors
-- This addresses the "Data truncated for column 'payment_method'" error

-- Update reservations table
ALTER TABLE reservations 
MODIFY COLUMN payment_method VARCHAR(100);

-- Update shop_orders table if it exists  
ALTER TABLE shop_orders 
MODIFY COLUMN payment_method VARCHAR(100);
