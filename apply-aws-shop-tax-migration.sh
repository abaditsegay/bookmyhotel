#!/bin/bash

# AWS RDS Migration Script: Apply shop order tax columns migration
# This script adds separate VAT and Service Tax columns to shop_orders table in AWS RDS

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
MIGRATION_FILE="add-shop-order-tax-columns.sql"

print_status "Starting AWS RDS migration: Add separate VAT and Service Tax columns"
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

# Create backup query to check current state
print_status "Checking current database state..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT COUNT(*) as total_shop_orders FROM shop_orders;
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 'Columns vat_amount and service_tax_amount already exist'
            ELSE 'Columns do not exist - migration needed'
        END as column_status
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '$RDS_DATABASE' 
      AND TABLE_NAME = 'shop_orders' 
      AND COLUMN_NAME IN ('vat_amount', 'service_tax_amount');
"

# Execute the migration
print_status "Executing migration script..."
if "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" < "$MIGRATION_FILE"; then
    print_status "✅ Migration executed successfully"
else
    print_error "❌ Migration failed"
    exit 1
fi

# Verify the migration results
print_status "Verifying migration results..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    -- Show column information
    SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_COMMENT 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '$RDS_DATABASE' 
      AND TABLE_NAME = 'shop_orders' 
      AND COLUMN_NAME IN ('vat_amount', 'service_tax_amount')
    ORDER BY COLUMN_NAME;
    
    -- Show sample shop orders with tax breakdown
    SELECT 
        'Sample shop orders with tax breakdown:' as info;
    SELECT 
        id, 
        order_number,
        total_amount, 
        tax_amount,
        vat_amount, 
        service_tax_amount,
        (vat_amount + service_tax_amount) as calculated_tax
    FROM shop_orders 
    WHERE tax_amount > 0
    ORDER BY id DESC
    LIMIT 5;
    
    -- Show statistics
    SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN tax_amount > 0 THEN 1 END) as orders_with_tax,
        SUM(total_amount) as total_revenue,
        SUM(vat_amount) as total_vat_collected,
        SUM(service_tax_amount) as total_service_tax_collected
    FROM shop_orders;
"

print_status "🎉 AWS RDS migration completed successfully!"
print_status ""
print_status "Migration Summary:"
print_status "- Added vat_amount column (15% VAT)"
print_status "- Added service_tax_amount column (5% Service Tax)"
print_status "- Migrated existing tax_amount data proportionally"
print_status ""
print_status "Next steps:"
print_status "1. Deploy updated backend code to AWS Lightsail"
print_status "2. Test the tax breakdown in production receipts"
print_status "3. Verify payment amounts include correct tax breakdown"
print_status ""
print_status "Migration file: $MIGRATION_FILE"
print_status "AWS RDS Database: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"
