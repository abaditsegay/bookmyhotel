-- V54: Simplify payment method enum for hotel shop
-- This migration updates the payment_method column in shop_orders table to use simplified values

-- Update existing payment methods to new simplified values
UPDATE shop_orders 
SET payment_method = CASE 
    WHEN payment_method IN ('CREDIT_CARD', 'credit_card') THEN 'CARD'
    WHEN payment_method IN ('MOBILE_MONEY', 'MBIRR', 'TELEBIRR', 'mobile_money', 'mbirr', 'telebirr') THEN 'MOBILE'
    WHEN payment_method IN ('PAY_AT_FRONTDESK', 'pay_at_frontdesk') THEN 'CASH'
    WHEN payment_method IN ('CASH', 'cash') THEN 'CASH'
    WHEN payment_method IN ('ROOM_CHARGE', 'room_charge') THEN 'ROOM_CHARGE'
    ELSE 'CASH'  -- Default to CASH for any unknown payment methods
END;

-- Update the enum constraint to only allow simplified values
ALTER TABLE shop_orders 
DROP CONSTRAINT IF EXISTS chk_payment_method;

ALTER TABLE shop_orders 
ADD CONSTRAINT chk_payment_method 
CHECK (payment_method IN ('ROOM_CHARGE', 'CASH', 'CARD', 'MOBILE'));

-- Update any related tables that might reference payment methods
-- (Add more UPDATE statements here if other tables use payment_method)

-- Add comment to document the simplified payment method values
COMMENT ON COLUMN shop_orders.payment_method IS 'Simplified payment method: ROOM_CHARGE, CASH, CARD, MOBILE';
