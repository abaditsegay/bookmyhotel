-- Remove synthetic mobile payment numbers introduced by sample-data defaults.
--
-- Production data must not depend on hotel-name-specific or ID-derived fallback
-- values. Real payment phone numbers should be set explicitly per hotel.

UPDATE hotels
SET mobile_payment_phone = NULL
WHERE mobile_payment_phone IN ('0911234567', '0911111111')
   OR mobile_payment_phone = CONCAT('091', LPAD(id, 7, '0'));

UPDATE hotels
SET mobile_payment_phone2 = NULL
WHERE mobile_payment_phone2 IN ('0922345678', '0922222222')
   OR mobile_payment_phone2 = CONCAT('092', LPAD(id, 7, '0'));