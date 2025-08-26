-- V47__add_housekeeping_staff_tracking_fields.sql
-- Add missing fields to housekeeping_staff table for workload tracking (safe version)

-- Add current_workload column if it doesn't exist
ALTER TABLE housekeeping_staff 
ADD COLUMN IF NOT EXISTS current_workload INT DEFAULT 0 COMMENT 'Number of tasks currently assigned';

-- Add average_rating column if it doesn't exist
ALTER TABLE housekeeping_staff 
ADD COLUMN IF NOT EXISTS average_rating DOUBLE DEFAULT NULL COMMENT 'Average rating from completed tasks';

-- Add additional tracking fields that the entity expects but were missing from original schema
ALTER TABLE housekeeping_staff 
ADD COLUMN IF NOT EXISTS hourly_rate DOUBLE DEFAULT NULL COMMENT 'Staff hourly rate',
ADD COLUMN IF NOT EXISTS experience_level INT DEFAULT NULL COMMENT 'Years of experience',
ADD COLUMN IF NOT EXISTS is_supervisor BOOLEAN DEFAULT FALSE COMMENT 'Whether staff member is a supervisor',
ADD COLUMN IF NOT EXISTS total_tasks_completed INT DEFAULT 0 COMMENT 'Total number of tasks completed',
ADD COLUMN IF NOT EXISTS average_completion_time DOUBLE DEFAULT NULL COMMENT 'Average completion time in minutes',
ADD COLUMN IF NOT EXISTS quality_score DOUBLE DEFAULT NULL COMMENT 'Average quality score from inspections',
ADD COLUMN IF NOT EXISTS last_training_date DATETIME DEFAULT NULL COMMENT 'Date of last training',
ADD COLUMN IF NOT EXISTS certification_expiry DATETIME DEFAULT NULL COMMENT 'Certification expiry date',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether staff member is currently active',
ADD COLUMN IF NOT EXISTS start_date DATETIME DEFAULT NULL COMMENT 'Employment start date',
ADD COLUMN IF NOT EXISTS end_date DATETIME DEFAULT NULL COMMENT 'Employment end date';

-- Add missing shift_type enum column if it doesn't exist
ALTER TABLE housekeeping_staff 
ADD COLUMN IF NOT EXISTS shift_type ENUM('MORNING', 'AFTERNOON', 'NIGHT', 'SPLIT') DEFAULT 'MORNING' COMMENT 'Shift type';

-- Update indexes for new fields (create only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_housekeeping_staff_current_workload ON housekeeping_staff(current_workload);
CREATE INDEX IF NOT EXISTS idx_housekeeping_staff_active ON housekeeping_staff(is_active);
CREATE INDEX IF NOT EXISTS idx_housekeeping_staff_supervisor ON housekeeping_staff(is_supervisor);
CREATE INDEX IF NOT EXISTS idx_housekeeping_staff_shift_type ON housekeeping_staff(shift_type);
