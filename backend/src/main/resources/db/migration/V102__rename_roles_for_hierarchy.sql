-- V102: Rename legacy role names to match the new canonical role hierarchy.
--
-- Role mapping:
--   SYSTEM_ADMIN       -> SUPER_ADMIN        (top-level global administrator)
--   OPERATIONS_SUPERVISOR -> OPERATIONAL_ADMIN  (hotel-scoped operations lead)
--   HOTEL_MANAGER      -> HOTEL_ADMIN        (merged into existing role)
--   CONCIERGE          -> (removed; no direct mapping — users must be re-assigned manually)

-- 1. Rename SYSTEM_ADMIN to SUPER_ADMIN
UPDATE user_roles
SET    role = 'SUPER_ADMIN'
WHERE  role = 'SYSTEM_ADMIN';

-- 2. Rename OPERATIONS_SUPERVISOR to OPERATIONAL_ADMIN
UPDATE user_roles
SET    role = 'OPERATIONAL_ADMIN'
WHERE  role = 'OPERATIONS_SUPERVISOR';

-- 3. Promote HOTEL_MANAGER users to HOTEL_ADMIN
--    If a user already has HOTEL_ADMIN, delete the duplicate HOTEL_MANAGER row.
--    Otherwise promote the HOTEL_MANAGER row to HOTEL_ADMIN.
DELETE FROM user_roles
WHERE  role = 'HOTEL_MANAGER'
AND    user_id IN (
    SELECT user_id FROM (
        SELECT user_id FROM user_roles WHERE role = 'HOTEL_ADMIN'
    ) already_hotel_admin
);

UPDATE user_roles
SET    role = 'HOTEL_ADMIN'
WHERE  role = 'HOTEL_MANAGER';

-- 4. Remove CONCIERGE role assignments (no equivalent business role).
--    Affected users should be re-assigned manually after this migration.
DELETE FROM user_roles
WHERE  role = 'CONCIERGE';
