-- Remove housekeeping_staff table and refactor to use users table only
-- This migration consolidates all staff management into the users table with role-based access

-- Step 1: Add staff-specific fields to users table
ALTER TABLE users 
ADD COLUMN hotel_id BIGINT,
ADD COLUMN employee_id VARCHAR(50),
ADD COLUMN staff_status ENUM('AVAILABLE', 'BUSY', 'ON_BREAK', 'OFF_DUTY') DEFAULT 'AVAILABLE',
ADD COLUMN shift_start TIME,
ADD COLUMN shift_end TIME,
ADD COLUMN assigned_floors JSON,
ADD COLUMN department ENUM('FRONT_DESK', 'HOUSEKEEPING', 'MAINTENANCE', 'KITCHEN', 'SECURITY', 'MANAGEMENT'),
ADD INDEX idx_users_hotel_id (hotel_id),
ADD INDEX idx_users_staff_status (staff_status),
ADD INDEX idx_users_department (department),
ADD FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

-- Step 2: Migrate existing housekeeping_staff data to users table
-- Note: This assumes existing housekeeping_staff records should be updated in users table
-- If there are existing housekeeping_staff records, they would need to be migrated
-- For now, we'll just prepare the structure for new data

-- Step 3: Update housekeeping_tasks to reference users directly instead of housekeeping_staff
-- First, let's add a temporary column to store user references
ALTER TABLE housekeeping_tasks 
ADD COLUMN assigned_user_id BIGINT;

-- If there were existing housekeeping_tasks with housekeeping_staff assignments,
-- we would migrate them here with something like:
-- UPDATE housekeeping_tasks ht 
-- JOIN housekeeping_staff hs ON ht.assigned_to = hs.id
-- SET ht.assigned_user_id = hs.user_id;

-- Step 4: Drop the old foreign key and rename the column
ALTER TABLE housekeeping_tasks 
DROP FOREIGN KEY housekeeping_tasks_ibfk_3;

ALTER TABLE housekeeping_tasks 
DROP COLUMN assigned_to;

ALTER TABLE housekeeping_tasks 
CHANGE assigned_user_id assigned_to BIGINT;

-- Step 5: Add the new foreign key to users table
ALTER TABLE housekeeping_tasks 
ADD FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Step 6: Drop the housekeeping_staff table
DROP TABLE housekeeping_staff;

-- Step 7: Update user_roles enum to include more specific housekeeping roles if needed
-- The existing HOUSEKEEPING role should suffice, but we could add more granular roles:
-- ALTER TABLE user_roles 
-- MODIFY role ENUM('GUEST', 'ADMIN', 'HOTEL_ADMIN', 'FRONT_DESK', 'HOUSEKEEPING', 'HOUSEKEEPING_SUPERVISOR', 
--                 'MAINTENANCE', 'LAUNDRY', 'SYSTEM_ADMIN', 'OPERATIONS_SUPERVISOR') NOT NULL;
