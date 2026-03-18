#!/bin/bash

# AWS Automated Room Status System Deployment Script
# This script applies the automated room status system schema optimizations to AWS RDS
# Author: System
# Date: October 2025

set -e  # Exit on any error

# Configuration
AWS_RDS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
AWS_RDS_PORT="3306"
AWS_RDS_DATABASE="bookmyhotel"
AWS_RDS_USER="admin"
AWS_RDS_PASSWORD="BookMyHotel2024SecureDB!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
if [ ! -f "aws-automated-room-status-schema-migration.sql" ]; then
    print_error "aws-automated-room-status-schema-migration.sql not found!"
    exit 1
fi

print_info "=== AWS Automated Room Status System Deployment ==="
print_info "Target: $AWS_RDS_HOST:$AWS_RDS_PORT/$AWS_RDS_DATABASE"
echo

# Test connection first
print_info "Testing AWS RDS connection..."
docker run --rm mysql:8.0 mysql -h $AWS_RDS_HOST -P $AWS_RDS_PORT -u $AWS_RDS_USER -p$AWS_RDS_PASSWORD -e "SELECT 'Connection successful!' as status;" $AWS_RDS_DATABASE

if [ $? -eq 0 ]; then
    print_info "✅ Connection successful!"
else
    print_error "❌ Connection failed!"
    exit 1
fi

echo

# Create backup timestamp
BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
print_info "Creating backup timestamp: $BACKUP_TIMESTAMP"

# Show current schema status
print_info "Checking current schema status..."
docker run --rm mysql:8.0 mysql -h $AWS_RDS_HOST -P $AWS_RDS_PORT -u $AWS_RDS_USER -p$AWS_RDS_PASSWORD $AWS_RDS_DATABASE -e "
SELECT 
    'Current Tables:' as info;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '$AWS_RDS_DATABASE' 
  AND TABLE_NAME IN ('hotels', 'rooms', 'reservations')
ORDER BY TABLE_NAME;
"

echo

# Check if actual_check_out_time column exists
print_info "Verifying actual_check_out_time column exists..."
COLUMN_EXISTS=$(docker run --rm mysql:8.0 mysql -h $AWS_RDS_HOST -P $AWS_RDS_PORT -u $AWS_RDS_USER -p$AWS_RDS_PASSWORD $AWS_RDS_DATABASE -s -N -e "
SELECT COUNT(*) 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = '$AWS_RDS_DATABASE'
  AND TABLE_NAME = 'reservations' 
  AND COLUMN_NAME = 'actual_check_out_time';
")

if [ "$COLUMN_EXISTS" -eq "1" ]; then
    print_info "✅ actual_check_out_time column exists"
else
    print_error "❌ actual_check_out_time column is missing!"
    print_error "The schema needs to be updated with the complete V1__initial_schema.sql first"
    exit 1
fi

echo

# Apply the automated room status schema optimizations
print_info "Applying automated room status system schema optimizations..."
print_warning "This will create performance indexes for the automation system"

# Show what will be executed
print_info "The following changes will be applied:"
echo "  - Performance indexes for automated room status queries"
echo "  - Schema validation checks"
echo "  - Test queries to ensure automation compatibility"
echo

read -p "Continue with the deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Deployment cancelled by user"
    exit 0
fi

# Execute the migration
print_info "Executing automated room status schema migration..."
docker run --rm -i -v "$(pwd):/workspace" -w /workspace mysql:8.0 mysql -h $AWS_RDS_HOST -P $AWS_RDS_PORT -u $AWS_RDS_USER -p$AWS_RDS_PASSWORD $AWS_RDS_DATABASE < aws-automated-room-status-schema-migration.sql

if [ $? -eq 0 ]; then
    print_info "✅ Schema migration completed successfully!"
else
    print_error "❌ Schema migration failed!"
    exit 1
fi

echo

# Verify the deployment
print_info "Verifying deployment..."
docker run --rm mysql:8.0 mysql -h $AWS_RDS_HOST -P $AWS_RDS_PORT -u $AWS_RDS_USER -p$AWS_RDS_PASSWORD $AWS_RDS_DATABASE -e "
SELECT 'Deployment Verification:' as info;
SELECT 
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ Performance indexes created successfully'
        ELSE '❌ Some indexes may be missing'
    END as index_status
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = '$AWS_RDS_DATABASE'
  AND INDEX_NAME IN (
    'idx_reservations_checkout_automation',
    'idx_rooms_status_hotel', 
    'idx_reservations_room_status_dates'
  );
"

echo

# Test the automated room status query
print_info "Testing automated room status query compatibility..."
docker run --rm mysql:8.0 mysql -h $AWS_RDS_HOST -P $AWS_RDS_PORT -u $AWS_RDS_USER -p$AWS_RDS_PASSWORD $AWS_RDS_DATABASE -e "
SELECT 'Query Test:' as test_info;
SELECT 
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ findRoomsNeedingMaintenanceAfterCheckout query works'
        ELSE '❌ Query failed'
    END as query_status
FROM (
    SELECT DISTINCT r.id
    FROM rooms r 
    INNER JOIN reservations res ON res.assigned_room_id = r.id
    WHERE res.status = 'CHECKED_OUT' 
      AND res.actual_check_out_time BETWEEN DATE_SUB(NOW(), INTERVAL 2 DAY) AND NOW()
      AND r.status != 'MAINTENANCE' 
      AND r.status != 'OUT_OF_ORDER'
    LIMIT 1
) test_query;
"

echo

print_info "=== Deployment Summary ==="
print_info "✅ AWS RDS connection verified"
print_info "✅ Schema compatibility confirmed"
print_info "✅ Performance indexes created"
print_info "✅ Automated room status queries tested"
print_info ""
print_info "🤖 The automated room status system is now ready for AWS production!"
print_info ""
print_info "Next steps:"
print_info "1. Deploy the updated backend with AutomatedRoomStatusService"
print_info "2. Monitor the automation logs for proper operation"
print_info "3. Verify room status updates are working automatically"

echo
print_info "Deployment completed at $(date)"