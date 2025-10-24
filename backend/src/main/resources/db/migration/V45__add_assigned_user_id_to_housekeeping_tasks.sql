-- Migration to add assigned_user_id column to housekeeping_tasks table
-- This replaces the assigned_staff_id relationship with a direct user relationship

-- Add the new assigned_user_id column
ALTER TABLE housekeeping_tasks 
ADD COLUMN assigned_user_id BIGINT NULL;

-- Add foreign key constraint to users table
ALTER TABLE housekeeping_tasks 
ADD CONSTRAINT fk_housekeeping_tasks_assigned_user 
FOREIGN KEY (assigned_user_id) REFERENCES users(id);

-- Create index for better query performance
CREATE INDEX idx_housekeeping_tasks_assigned_user_id 
ON housekeeping_tasks(assigned_user_id);

-- Migrate existing data: Find users with HOUSEKEEPING role that correspond to assigned staff
-- This assumes that housekeeping staff records have matching user records
UPDATE housekeeping_tasks ht
JOIN housekeeping_staff hs ON ht.assigned_staff_id = hs.id
JOIN users u ON (u.first_name = hs.first_name AND u.last_name = hs.last_name AND u.hotel_id = hs.hotel_id)
SET ht.assigned_user_id = u.id
WHERE ht.assigned_staff_id IS NOT NULL
  AND u.roles LIKE '%HOUSEKEEPING%';

-- Drop the old assigned_staff_id column and its constraint
ALTER TABLE housekeeping_tasks 
DROP FOREIGN KEY fk_housekeeping_tasks_assigned_staff;

ALTER TABLE housekeeping_tasks 
DROP COLUMN assigned_staff_id;