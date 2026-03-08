#!/bin/bash

# AWS RDS Migration Script: Add password_reset_tokens table
# This script creates the password_reset_tokens table on the production database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# AWS RDS connection details
RDS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
RDS_PORT="3306"
RDS_DATABASE="bookmyhotel"
RDS_USERNAME="admin"
RDS_PASSWORD="BookMyHotel2024SecureDB!"

MIGRATION_FILE="add-password-reset-tokens-table.sql"

print_status "Starting AWS RDS migration: Add password_reset_tokens table"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

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
    print_error "MySQL client not found. Install with: brew install mysql-client"
    exit 1
fi

print_status "Using MySQL client: $MYSQL_CMD"
print_status "Testing connection..."

if ! "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    print_error "Failed to connect to AWS RDS database"
    exit 1
fi

print_status "✅ Connection successful"

# Check if table already exists
print_status "Checking if password_reset_tokens table exists..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 'Table password_reset_tokens already exists'
            ELSE 'Table does not exist - migration needed'
        END as table_status
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = '$RDS_DATABASE' 
      AND TABLE_NAME = 'password_reset_tokens';
"

# Execute the migration
print_status "Executing migration script..."
if "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" < "$MIGRATION_FILE"; then
    print_status "✅ Migration executed successfully"
else
    print_error "❌ Migration failed"
    exit 1
fi

# Verify
print_status "Verifying migration..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "DESCRIBE password_reset_tokens;"

print_status "✅ Migration complete! You can now restart the backend service."
