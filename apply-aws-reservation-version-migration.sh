#!/bin/bash

# AWS RDS Migration Script: Add optimistic locking version column to reservations
# MUST be run BEFORE deploying the new backend JAR.
# The @Version column on Reservation entity requires this column or the app will
# fail at startup with:
#   SchemaManagementException: missing column [version] in table [reservations]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status()  { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# AWS RDS connection details
RDS_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
RDS_PORT="3306"
RDS_DATABASE="bookmyhotel"
RDS_USERNAME="admin"
RDS_PASSWORD="BookMyHotel2024SecureDB!"

MIGRATION_FILE="$(dirname "$0")/add-reservation-version-column.sql"

print_status "Migration: Add version column to reservations table"
print_status "Target: $RDS_HOST:$RDS_PORT/$RDS_DATABASE"

# Locate MySQL client
MYSQL_CMD=""
for mysql_path in "/usr/local/Cellar/mysql-client/9.4.0/bin/mysql" "/usr/local/bin/mysql" \
                  "/usr/local/mysql/bin/mysql" "/opt/homebrew/bin/mysql" "mysql"; do
    if command -v "$mysql_path" &>/dev/null; then
        MYSQL_CMD="$mysql_path"
        break
    fi
done

if [ -z "$MYSQL_CMD" ]; then
    print_error "MySQL client not found. Install with: brew install mysql-client"
    exit 1
fi

print_status "Using MySQL client: $MYSQL_CMD"

if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Test connection
print_status "Testing connection to AWS RDS..."
if ! "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" \
        -e "SELECT 1;" &>/dev/null; then
    print_error "Cannot connect to AWS RDS. Check credentials and network access."
    exit 1
fi
print_status "✅ Connection successful"

# Show current state
print_status "Checking current schema state..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT
        CASE WHEN COUNT(*) > 0
            THEN 'version column already present'
            ELSE 'version column MISSING — migration required'
        END AS status
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '$RDS_DATABASE'
      AND TABLE_NAME   = 'reservations'
      AND COLUMN_NAME  = 'version';
"

# Apply migration
print_status "Applying migration..."
if "$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" \
        "$RDS_DATABASE" < "$MIGRATION_FILE"; then
    print_status "✅ Migration applied successfully"
else
    print_error "❌ Migration failed"
    exit 1
fi

# Verify
print_status "Verifying result..."
"$MYSQL_CMD" -h"$RDS_HOST" -P"$RDS_PORT" -u"$RDS_USERNAME" -p"$RDS_PASSWORD" "$RDS_DATABASE" -e "
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '$RDS_DATABASE'
      AND TABLE_NAME   = 'reservations'
      AND COLUMN_NAME  = 'version';

    SELECT COUNT(*) AS total_reservations,
           SUM(CASE WHEN version IS NULL THEN 1 ELSE 0 END) AS null_version_count
    FROM reservations;
"

print_status "🎉 Migration complete. You can now deploy the new backend JAR."
