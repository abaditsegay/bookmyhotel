#!/bin/bash

# AWS RDS Migration Script: Apply minimum stock level migration
# This script applies the minimum stock level migration to the AWS RDS MySQL database

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
MIGRATION_FILE="aws-minimum-stock-level-migration.sql"

print_status "Starting AWS RDS migration: Add minimum stock level column"
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
    SELECT COUNT(*) as total_products FROM products;
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 'Column minimum_stock_level already exists'
            ELSE 'Column minimum_stock_level does not exist - migration needed'
        END as column_status
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = '$RDS_DATABASE' 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'minimum_stock_level';
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
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'minimum_stock_level';
    
    -- Show sample products with minimum stock levels
    SELECT 
        'Sample products with minimum stock levels:' as info;
    SELECT 
        id, 
        name, 
        stock_quantity, 
        minimum_stock_level, 
        (stock_quantity - minimum_stock_level) as available_for_order 
    FROM products 
    ORDER BY id 
    LIMIT 5;
    
    -- Show statistics
    SELECT 
        COUNT(*) as total_products,
        COUNT(minimum_stock_level) as products_with_min_stock,
        AVG(minimum_stock_level) as avg_min_stock_level,
        MIN(minimum_stock_level) as min_value,
        MAX(minimum_stock_level) as max_value
    FROM products;
"

print_status "🎉 AWS RDS migration completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Deploy updated backend code to AWS Lightsail"
print_status "2. Test the minimum stock level functionality in production"
print_status "3. Update product minimum stock levels as needed through the admin interface"
print_status ""
print_status "Migration file: $MIGRATION_FILE"
print_status "AWS RDS Database: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"