#!/bin/bash

# AWS RDS Migration Script: Apply refund policy migration
# This script applies the refund policy migration to the AWS RDS MySQL database

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# AWS RDS connection details from your production config
RDS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
RDS_PORT="3306"
RDS_DATABASE="bookmyhotel"
RDS_USERNAME="admin"
RDS_PASSWORD="BookMyHotel2024SecureDB!"

# Migration file
MIGRATION_FILE="aws-refund-policy-migration.sql"

print_status "Starting AWS RDS migration: Add configurable refund policy columns"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

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
    print_error "MySQL client is not installed or not found in PATH. Please install it first:"
    print_error "  macOS: brew install mysql-client"
    print_error "  Ubuntu/Debian: sudo apt-get install mysql-client-core-8.0"
    exit 1
fi

print_status "Using MySQL client: $MYSQL_CMD"

print_status "Testing connection to AWS RDS..."

# Test connection
if ! "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    print_error "Failed to connect to AWS RDS database"
    print_error "Please check your connection details and network access"
    exit 1
fi

print_status "✅ Connection to AWS RDS successful"

# Check current database state
print_status "Checking current database state..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT COUNT(*) as total_pricing_configs FROM hotel_pricing_config;
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 'Refund policy columns already exist'
            ELSE 'Refund policy columns do not exist - migration needed'
        END as column_status
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '$RDS_DATABASE' 
      AND TABLE_NAME = 'hotel_pricing_config' 
      AND COLUMN_NAME LIKE 'refund_policy_%';
"

# Execute the migration
print_status "Executing refund policy migration script..."
if "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" < "$MIGRATION_FILE"; then
    print_status "✅ Migration executed successfully"
else
    print_error "❌ Migration failed"
    exit 1
fi

# Verify the migration results
print_status "Verifying migration results..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    -- Show all refund policy columns
    SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_COMMENT 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '$RDS_DATABASE' 
      AND TABLE_NAME = 'hotel_pricing_config' 
      AND COLUMN_NAME LIKE 'refund_policy_%'
    ORDER BY COLUMN_NAME;
    
    -- Show sample pricing configurations with refund policies
    SELECT 
        'Sample pricing configurations with refund policies:' as info;
    SELECT 
        id, 
        hotel_id,
        refund_policy_7_plus_days as '7+ days',
        refund_policy_3_to_7_days as '3-7 days',
        refund_policy_1_to_2_days as '1-2 days',
        refund_policy_same_day as 'same day'
    FROM hotel_pricing_config 
    ORDER BY id 
    LIMIT 5;
    
    -- Show statistics
    SELECT 
        COUNT(*) as total_configs,
        COUNT(refund_policy_7_plus_days) as configs_with_7plus_policy,
        COUNT(refund_policy_3_to_7_days) as configs_with_3to7_policy,
        COUNT(refund_policy_1_to_2_days) as configs_with_1to2_policy,
        COUNT(refund_policy_same_day) as configs_with_sameday_policy,
        AVG(refund_policy_7_plus_days) as avg_7plus_refund_rate,
        AVG(refund_policy_3_to_7_days) as avg_3to7_refund_rate,
        AVG(refund_policy_1_to_2_days) as avg_1to2_refund_rate,
        AVG(refund_policy_same_day) as avg_sameday_refund_rate
    FROM hotel_pricing_config;
"

print_status "🎉 AWS RDS refund policy migration completed successfully!"
print_status ""
print_status "Migration Summary:"
print_status "✅ Added refund_policy_7_plus_days column (default: 100% refund)"
print_status "✅ Added refund_policy_3_to_7_days column (default: 50% refund)"
print_status "✅ Added refund_policy_1_to_2_days column (default: 25% refund)"
print_status "✅ Added refund_policy_same_day column (default: 0% refund)"
print_status "✅ Applied proper constraints (0.0000-1.0000)"
print_status "✅ Updated existing configurations with default values"
print_status ""
print_status "Next steps:"
print_status "1. The backend code is already deployed with refund policy support"
print_status "2. Hotels can now configure their refund policies in the Pricing & Tax page"
print_status "3. Cancellation refunds will be automatically calculated based on these policies"
print_status ""
print_status "Migration file: $MIGRATION_FILE"
print_status "AWS RDS Database: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"