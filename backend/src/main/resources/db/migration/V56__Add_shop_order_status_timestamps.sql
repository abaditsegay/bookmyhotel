-- ============================================
-- ADD STATUS TIMESTAMP COLUMNS TO SHOP ORDERS
-- ============================================
-- This migration adds status-specific timestamp columns to shop_orders table
-- to track the lifecycle of orders with precise timing
-- Version: V56
-- Date: 2025-08-27

-- Add new timestamp columns for order status tracking
ALTER TABLE shop_orders 
ADD COLUMN confirmed_at TIMESTAMP NULL AFTER completed_at,
ADD COLUMN preparing_at TIMESTAMP NULL AFTER confirmed_at,
ADD COLUMN ready_at TIMESTAMP NULL AFTER preparing_at,
ADD COLUMN cancelled_at TIMESTAMP NULL AFTER ready_at;

-- Add indexes for the new timestamp columns
ALTER TABLE shop_orders 
ADD INDEX idx_shop_order_confirmed_at (confirmed_at),
ADD INDEX idx_shop_order_preparing_at (preparing_at),
ADD INDEX idx_shop_order_ready_at (ready_at),
ADD INDEX idx_shop_order_cancelled_at (cancelled_at);
