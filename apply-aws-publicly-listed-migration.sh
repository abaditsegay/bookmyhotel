#!/bin/bash

# AWS RDS Migration Script: Add is_publicly_listed column to hotels table
# Decouples hotel public visibility from hotel-admin management access (is_active)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status()  { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# AWS RDS connection details
RDS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
RDS_PORT="3306"
RDS_DATABASE="bookmyhotel"
RDS_USERNAME="admin"
RDS_PASSWORD="BookMyHotel2024SecureDB!"

print_status "Starting AWS RDS migration: Add is_publicly_listed to hotels"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

# Locate MySQL client
MYSQL_CMD=""
for mysql_path in "/usr/local/Cellar/mysql-client/9.4.0/bin/mysql" \
                  "/usr/local/bin/mysql" \
                  "/usr/local/mysql/bin/mysql" \
                  "/opt/homebrew/bin/mysql" \
                  "mysql"; do
    if command -v "$mysql_path" &>/dev/null; then
        MYSQL_CMD="$mysql_path"
        break
    fi
done

if [ -z "$MYSQL_CMD" ]; then
    print_error "MySQL client not found. Install it with: brew install mysql-client"
    exit 1
fi

print_status "Using MySQL client: $MYSQL_CMD"

# Test connection
print_status "Testing connection to AWS RDS..."
if ! "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" \
        -e "SELECT 1;" &>/dev/null; then
    print_error "Failed to connect to AWS RDS. Check connection details and network access."
    exit 1
fi
print_status "✅ Connected to AWS RDS"

# Check current state
print_status "Checking current schema state..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT
        CASE
            WHEN COUNT(*) > 0 THEN 'Column is_publicly_listed already exists — migration may have been applied by Flyway'
            ELSE 'Column is_publicly_listed does not exist — migration needed'
        END AS column_status
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '$RDS_DATABASE'
      AND TABLE_NAME   = 'hotels'
      AND COLUMN_NAME  = 'is_publicly_listed';
"

# Check if column already exists (handles case where Flyway already applied it)
COLUMN_EXISTS=$("$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" \
    --skip-column-names --batch "$RDS_DATABASE" -e "
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '$RDS_DATABASE'
      AND TABLE_NAME   = 'hotels'
      AND COLUMN_NAME  = 'is_publicly_listed';" 2>/dev/null)

# Run ALTER TABLE only if column is missing
if [ "$COLUMN_EXISTS" -eq 0 ]; then
    print_status "Adding is_publicly_listed column..."
    "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
        ALTER TABLE hotels
            ADD COLUMN is_publicly_listed BOOLEAN NOT NULL DEFAULT FALSE;"
    print_status "✅ Column added"
else
    print_warning "Column is_publicly_listed already exists — skipping ALTER TABLE"
fi

# Always run UPDATE (idempotent — sets publicly listed for all currently-active hotels)
print_status "Setting is_publicly_listed = TRUE for all active hotels..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    UPDATE hotels SET is_publicly_listed = TRUE WHERE is_active = TRUE;"
print_status "✅ Migration executed successfully"

# Verify results
print_status "Verifying migration results..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '$RDS_DATABASE'
      AND TABLE_NAME   = 'hotels'
      AND COLUMN_NAME  = 'is_publicly_listed';

    SELECT
        COUNT(*)                                          AS total_hotels,
        SUM(is_active = 1)                               AS active_hotels,
        SUM(is_publicly_listed = 1)                      AS publicly_listed_hotels
    FROM hotels;
"

print_status "🎉 Migration completed successfully!"
print_status ""
print_status "Summary:"
print_status "  • is_publicly_listed = FALSE  →  hotel admin can manage (if is_active=true), but hidden from guest search"
print_status "  • is_publicly_listed = TRUE   →  hotel appears in public guest search"
print_status "  • All previously-active hotels have been set to publicly listed (backward compat)"
