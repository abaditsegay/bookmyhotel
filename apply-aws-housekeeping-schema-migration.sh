#!/bin/bash

# AWS RDS Migration Script: Apply housekeeping task schema updates
# This script applies the assigned_user_id and room_number schema changes to AWS RDS MySQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# AWS RDS connection details from production configuration
RDS_HOST="${AWS_DB_HOST:-ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com}"
RDS_PORT="${AWS_DB_PORT:-3306}"
RDS_DATABASE="${AWS_DB_NAME:-bookmyhotel}"
RDS_USERNAME="${AWS_DB_USER:-admin}"
RDS_PASSWORD="${AWS_DB_PASSWORD:-BookMyHotel2024SecureDB!}"

# Migration file
MIGRATION_FILE="aws-housekeeping-task-schema-migration.sql"
BACKUP_FILE="housekeeping_tasks_backup_$(date +%Y%m%d_%H%M%S).sql"

print_status "Starting AWS RDS migration: Housekeeping Task Schema Updates"
print_status "Changes: assigned_user_id column + room_id → room_number"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

# Check if password is provided (either via environment or default)
if [ -z "$RDS_PASSWORD" ]; then
    print_error "Database password not provided. Please set AWS_DB_PASSWORD environment variable."
    print_warning "Example: export AWS_DB_PASSWORD='your-password'"
    print_warning "Or run: AWS_DB_PASSWORD='your-password' $0"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Find MySQL client
MYSQL_CMD=""
for mysql_path in "/usr/local/Cellar/mysql-client/9.4.0/bin/mysql" "/usr/local/bin/mysql" "/usr/local/mysql/bin/mysql" "/opt/homebrew/bin/mysql" "mysql"; do
    if command -v "$mysql_path" &> /dev/null; then
        MYSQL_CMD="$mysql_path"
        break
    fi
done

if [ -z "$MYSQL_CMD" ]; then
    print_error "MySQL client not found. Please install MySQL client."
    print_warning "On macOS: brew install mysql-client"
    exit 1
fi

print_status "Using MySQL client: $MYSQL_CMD"

# Test database connection
print_step "Testing database connection..."
if ! "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "SELECT 1;" &> /dev/null; then
    print_error "Failed to connect to AWS RDS database"
    print_error "Please check your connection details and credentials"
    exit 1
fi
print_status "Database connection successful"

# Create backup of current housekeeping_tasks table
print_step "Creating backup of housekeeping_tasks table..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" \
    -e "SELECT * FROM housekeeping_tasks;" > "$BACKUP_FILE" 2>/dev/null

if [ -f "$BACKUP_FILE" ]; then
    print_status "Backup created: $BACKUP_FILE"
else
    print_warning "Backup creation failed, but continuing with migration"
fi

# Show current table structure
print_step "Current housekeeping_tasks table structure:"
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" \
    -e "DESCRIBE housekeeping_tasks;"

# Apply migration
print_step "Applying migration..."
if "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" < "$MIGRATION_FILE"; then
    print_status "Migration applied successfully!"
else
    print_error "Migration failed!"
    print_warning "Check the error messages above"
    print_warning "You can restore from backup if needed: $BACKUP_FILE"
    exit 1
fi

# Verify migration
print_step "Verifying migration results..."
echo ""
print_status "Updated table structure:"
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" \
    -e "DESCRIBE housekeeping_tasks;"

echo ""
print_status "Foreign key constraints:"
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" \
    -e "SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'housekeeping_tasks' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;"

echo ""
print_status "Sample data (first 3 records):"
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" \
    -e "SELECT id, title, room_number, assigned_user_id, status, created_at 
        FROM housekeeping_tasks 
        LIMIT 3;"

echo ""
print_status "Migration completed successfully!"
print_status "Backup file: $BACKUP_FILE"
print_warning "Keep the backup file until you verify everything works correctly"

# Optional: Show migration summary
echo ""
print_step "Migration Summary:"
echo "✅ Added assigned_user_id column with foreign key to users table"
echo "✅ Migrated data from assigned_staff_id to assigned_user_id"
echo "✅ Removed assigned_staff_id column"
echo "✅ Added room_number column"
echo "✅ Migrated data from room_id to room_number"
echo "✅ Removed room_id column and constraints"
echo "✅ Added performance indexes"
echo ""
print_status "Your AWS database schema is now updated and ready to use!"