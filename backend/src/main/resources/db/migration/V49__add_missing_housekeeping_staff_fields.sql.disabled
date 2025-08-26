-- V48__add_missing_housekeeping_staff_fields.sql
-- Add only the specific missing fields needed for current operations

-- Add current_workload column if it doesn't exist
ALTER TABLE housekeeping_staff 
ADD COLUMN IF NOT EXISTS current_workload INT DEFAULT 0 COMMENT 'Number of tasks currently assigned';

-- Add average_rating column if it doesn't exist
ALTER TABLE housekeeping_staff 
ADD COLUMN IF NOT EXISTS average_rating DOUBLE DEFAULT NULL COMMENT 'Average rating from completed tasks';
