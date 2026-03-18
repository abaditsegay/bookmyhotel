#!/bin/bash
# AWS Housekeeping Title Column Migration Script
# This script adds the title column to the housekeeping_tasks table on AWS RDS

echo "🔄 Starting AWS housekeeping title column migration..."

# AWS RDS connection details
AWS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
AWS_PORT="3306"
AWS_USER="admin"
AWS_PASS="BookMyHotel2024SecureDB!"
AWS_DB="bookmyhotel"

echo "📊 Connecting to AWS RDS MySQL instance..."

# Apply the migration
mysql -h "$AWS_HOST" -P "$AWS_PORT" -u "$AWS_USER" -p"$AWS_PASS" "$AWS_DB" << 'EOF'
-- Add title column to housekeeping_tasks table
-- This migration separates title from description to prevent combining them in the UI

-- Add the title column
ALTER TABLE housekeeping_tasks ADD COLUMN title VARCHAR(255) AFTER room_number;

-- Update existing records to extract title from description
-- For existing tasks, we'll use the first line of description as title
UPDATE housekeeping_tasks 
SET title = CASE 
    WHEN description IS NOT NULL AND description != '' THEN
        CASE 
            WHEN LOCATE('\n', description) > 0 THEN
                TRIM(SUBSTRING(description, 1, LOCATE('\n', description) - 1))
            ELSE
                CASE 
                    WHEN LENGTH(description) > 100 THEN
                        CONCAT(TRIM(SUBSTRING(description, 1, 97)), '...')
                    ELSE
                        TRIM(description)
                END
        END
    ELSE
        CONCAT(task_type, ' - Room ', COALESCE(room_number, 'General'))
END;

-- Clean up description to remove the title part if it was duplicated
UPDATE housekeeping_tasks 
SET description = CASE 
    WHEN description IS NOT NULL AND LOCATE('\n\n', description) > 0 THEN
        TRIM(SUBSTRING(description, LOCATE('\n\n', description) + 2))
    WHEN description = title THEN
        NULL
    ELSE
        description
END
WHERE title IS NOT NULL;

-- Make title column NOT NULL now that we've populated it
ALTER TABLE housekeeping_tasks MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- Add index on title for better search performance
CREATE INDEX idx_housekeeping_tasks_title ON housekeeping_tasks(title);

-- Verify the migration
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_tasks, COUNT(title) as tasks_with_title FROM housekeeping_tasks;
EOF

if [ $? -eq 0 ]; then
    echo "✅ AWS housekeeping title column migration completed successfully!"
else
    echo "❌ AWS housekeeping title column migration failed!"
    exit 1
fi