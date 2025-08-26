-- V48__add_housekeeping_staff_tracking_fields.sql
-- Add missing fields to housekeeping_staff table for workload tracking

-- Add current_workload column
ALTER TABLE housekeeping_staff 
ADD COLUMN current_workload INT DEFAULT 0 COMMENT 'Number of tasks currently assigned';

-- Add average_rating column (this will be calculated from completed tasks)
ALTER TABLE housekeeping_staff 
ADD COLUMN average_rating DOUBLE DEFAULT NULL COMMENT 'Average rating from completed tasks';

-- Add additional tracking fields that the entity expects but were missing from original schema
ALTER TABLE housekeeping_staff 
ADD COLUMN hourly_rate DOUBLE DEFAULT NULL COMMENT 'Staff hourly rate',
ADD COLUMN experience_level INT DEFAULT NULL COMMENT 'Years of experience',
ADD COLUMN is_supervisor BOOLEAN DEFAULT FALSE COMMENT 'Whether staff member is a supervisor',
ADD COLUMN total_tasks_completed INT DEFAULT 0 COMMENT 'Total number of tasks completed',
ADD COLUMN average_completion_time DOUBLE DEFAULT NULL COMMENT 'Average completion time in minutes',
ADD COLUMN quality_score DOUBLE DEFAULT NULL COMMENT 'Average quality score from inspections',
ADD COLUMN last_training_date DATETIME DEFAULT NULL COMMENT 'Date of last training',
ADD COLUMN certification_expiry DATETIME DEFAULT NULL COMMENT 'Certification expiry date',
ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether staff member is currently active',
ADD COLUMN start_date DATETIME DEFAULT NULL COMMENT 'Employment start date',
ADD COLUMN end_date DATETIME DEFAULT NULL COMMENT 'Employment end date';

-- Add missing shift_type enum column to replace the separate shift_start/shift_end
ALTER TABLE housekeeping_staff 
ADD COLUMN shift_type ENUM('MORNING', 'AFTERNOON', 'NIGHT', 'SPLIT') DEFAULT 'MORNING' COMMENT 'Shift type';

-- Update indexes for new fields
CREATE INDEX idx_housekeeping_staff_current_workload ON housekeeping_staff(current_workload);
CREATE INDEX idx_housekeeping_staff_active ON housekeeping_staff(is_active);
CREATE INDEX idx_housekeeping_staff_supervisor ON housekeeping_staff(is_supervisor);
CREATE INDEX idx_housekeeping_staff_shift_type ON housekeeping_staff(shift_type);
