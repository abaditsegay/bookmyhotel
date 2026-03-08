#!/bin/bash

# AWS RDS Migration Script: Rename reservation status CONFIRMED to BOOKED
# This script updates the reservations table ENUM to use BOOKED instead of CONFIRMED

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
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

print_status "Starting AWS RDS migration: Rename reservation status CONFIRMED → BOOKED"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

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
if ! "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    print_error "Failed to connect to AWS RDS database"
    exit 1
fi
print_status "✅ Connection to AWS RDS successful"

# Check current state
print_status "Checking current reservation statuses..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT status, COUNT(*) as count FROM reservations GROUP BY status ORDER BY status;
"

# Check if CONFIRMED still exists
CONFIRMED_COUNT=$("$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -N -e "
    SELECT COUNT(*) FROM reservations WHERE status = 'CONFIRMED';
")

if [ "$CONFIRMED_COUNT" -eq 0 ]; then
    print_warning "No reservations with CONFIRMED status found. Checking if migration already applied..."
    BOOKED_COUNT=$("$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -N -e "
        SELECT COUNT(*) FROM reservations WHERE status = 'BOOKED';
    ")
    if [ "$BOOKED_COUNT" -gt 0 ]; then
        print_status "✅ Migration appears to already be applied ($BOOKED_COUNT BOOKED reservations found)"
        exit 0
    fi
    print_status "No CONFIRMED or BOOKED reservations found. Proceeding with ENUM change anyway..."
fi

print_status "Found $CONFIRMED_COUNT reservations with CONFIRMED status"
print_warning "This will rename CONFIRMED → BOOKED in the reservations table"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Migration cancelled"
    exit 0
fi

# Step 1: Add BOOKED to ENUM
print_status "Step 1/3: Adding BOOKED to status ENUM..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    ALTER TABLE reservations 
        MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'BOOKED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') NOT NULL DEFAULT 'PENDING';
"
print_status "✅ BOOKED added to ENUM"

# Step 2: Update data
print_status "Step 2/3: Updating CONFIRMED → BOOKED..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    UPDATE reservations SET status = 'BOOKED' WHERE status = 'CONFIRMED';
"
print_status "✅ Data updated"

# Step 3: Remove CONFIRMED from ENUM
print_status "Step 3/3: Removing CONFIRMED from ENUM..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    ALTER TABLE reservations 
        MODIFY COLUMN status ENUM('PENDING', 'BOOKED', 'CANCELLED', 'CHECKED_IN', 'CHECKED_OUT', 'NO_SHOW') NOT NULL DEFAULT 'PENDING';
"
print_status "✅ CONFIRMED removed from ENUM"

# Also update booking_history if it references CONFIRMED
print_status "Updating booking_history records..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    UPDATE booking_history SET status = 'BOOKED' WHERE status = 'CONFIRMED';
    UPDATE booking_history SET previous_status = 'BOOKED' WHERE previous_status = 'CONFIRMED';
    UPDATE booking_history SET action = 'BOOKED' WHERE action = 'CONFIRMED';
" 2>/dev/null || print_warning "booking_history update skipped (table may not exist or columns differ)"

# Verify
print_status "Verifying migration..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT status, COUNT(*) as count FROM reservations GROUP BY status ORDER BY status;
"

REMAINING=$("$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -N -e "
    SELECT COUNT(*) FROM reservations WHERE status = 'CONFIRMED';
" 2>/dev/null || echo "0")

if [ "$REMAINING" -eq 0 ]; then
    print_status "✅ Migration completed successfully! No CONFIRMED reservations remain."
else
    print_error "⚠️  $REMAINING reservations still have CONFIRMED status"
fi

print_status ""
print_status "After verifying, restart the backend service:"
print_status "  sudo systemctl restart bookmyhotel-backend"
