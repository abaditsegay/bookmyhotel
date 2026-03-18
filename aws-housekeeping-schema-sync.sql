-- AWS RDS Schema Synchronization Script
-- This script updates the AWS housekeeping_tasks table to match the local database exactly

-- Step 1: Drop the old assigned_staff_id column and its constraint
ALTER TABLE housekeeping_tasks 
DROP FOREIGN KEY FKhleediog0qhnait7vdtw6uh0y;

ALTER TABLE housekeeping_tasks 
DROP COLUMN assigned_staff_id;

-- Step 2: Modify room_number column to match local database (varchar(50) instead of varchar(255))
ALTER TABLE housekeeping_tasks 
MODIFY COLUMN room_number varchar(50) DEFAULT NULL;

-- Step 3: Update text columns to use the same collation as local database
ALTER TABLE housekeeping_tasks 
MODIFY COLUMN description text COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE housekeeping_tasks 
MODIFY COLUMN inspector_notes text COLLATE utf8mb4_0900_ai_ci;

ALTER TABLE housekeeping_tasks 
MODIFY COLUMN special_instructions text COLLATE utf8mb4_0900_ai_ci;

-- Step 4: Update enum columns to use the same collation as local database
ALTER TABLE housekeeping_tasks 
MODIFY COLUMN priority enum('CRITICAL','HIGH','LOW','NORMAL','URGENT') 
COLLATE utf8mb4_0900_ai_ci NOT NULL;

ALTER TABLE housekeeping_tasks 
MODIFY COLUMN status enum('APPROVED','ASSIGNED','CANCELLED','COMPLETED','COMPLETED_WITH_ISSUES','ESCALATED','GUEST_COMPLAINT','IN_PROGRESS','PAUSED','PENDING','PENDING_INSPECTION','QUALITY_ISSUE','REJECTED','RESCHEDULED') 
COLLATE utf8mb4_0900_ai_ci NOT NULL;

ALTER TABLE housekeeping_tasks 
MODIFY COLUMN task_type enum('BATHROOM_DEEP_CLEAN','CARPET_CLEANING','CHECKOUT_CLEANING','DEEP_CLEANING','EMERGENCY_CLEANUP','EQUIPMENT_CHECK','GUEST_COMPLAINT_FOLLOWUP','HVAC_MAINTENANCE','INSPECTION','LAUNDRY','MAINTENANCE_CLEANING','MAINTENANCE_TASK','PREVENTIVE_MAINTENANCE','PUBLIC_AREA_CLEANING','QUALITY_CHECK','RESTOCKING','ROOM_CLEANING','SEASONAL_PREPARATION','SPECIAL_REQUEST') 
COLLATE utf8mb4_0900_ai_ci NOT NULL;

-- Step 5: Remove comment from assigned_user_id column to match local exactly
ALTER TABLE housekeeping_tasks 
MODIFY COLUMN assigned_user_id bigint DEFAULT NULL;

-- Verification query to check the final structure
SELECT 'AWS Schema synchronization completed. Verifying structure...' AS status;