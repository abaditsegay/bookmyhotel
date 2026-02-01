#!/bin/bash

# Apply Performance Indexes Migration to AWS Production Database
# This script runs the migration on the AWS Lightsail server

set -e

echo "=========================================="
echo "Performance Indexes Migration"
echo "=========================================="
echo ""

# Database credentials from production config
DB_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
DB_USER="admin"
DB_PASSWORD="BookMyHotel2024SecureDB!"
DB_NAME="bookmyhotel"
DB_PORT="3306"

# AWS server details
AWS_HOST="bookmystay.shegersolutions.com"
AWS_USER="ubuntu"

echo "Step 1: Copying migration script to AWS server..."
scp add-performance-indexes.sql ${AWS_USER}@${AWS_HOST}:/tmp/
echo "✓ Migration script copied"
echo ""

echo "Step 2: Running migration on AWS server..."
ssh ${AWS_USER}@${AWS_HOST} << 'ENDSSH'
cd /tmp

# Install mysql client if not present
if ! command -v mysql &> /dev/null; then
    echo "Installing MySQL client..."
    sudo apt-get update
    sudo apt-get install -y mysql-client
fi

# Run the migration
echo "Executing migration script..."
mysql -h ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com \
      -u admin \
      -p'BookMyHotel2024SecureDB!' \
      -P 3306 \
      bookmyhotel < add-performance-indexes.sql

echo "✓ Migration completed successfully"

# Verify indexes
echo ""
echo "Verifying indexes..."
mysql -h ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com \
      -u admin \
      -p'BookMyHotel2024SecureDB!' \
      -P 3306 \
      bookmyhotel -e "SHOW INDEX FROM reservations WHERE Key_name IN ('idx_confirmation_number','idx_payment_reference','idx_hotel_status_checkin','idx_guest_email_status');"

# Clean up
rm /tmp/add-performance-indexes.sql
ENDSSH

echo ""
echo "=========================================="
echo "Migration completed successfully! ✓"
echo "=========================================="
