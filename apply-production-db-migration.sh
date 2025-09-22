#!/bin/bash

# Apply Production Database Migration
# Usage: ./apply-production-db-migration.sh

set -e

# Configuration
SERVER_IP="44.204.49.94"
SSH_KEY="~/.ssh/bookmyhotel-aws"
SERVER_USER="ubuntu"
DB_NAME="bookmyhotel"
DB_USER="admin"
DB_PASSWORD="BookMyHotel2024SecureDB!"
MIGRATION_FILE="add-booking-notifications-table.sql"

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

# Expand tilde in SSH_KEY path
SSH_KEY="${SSH_KEY/#\~/$HOME}"

print_status "🚀 Starting Production Database Migration"
print_status "Target Server: $SERVER_IP"
print_status "Database: $DB_NAME"
print_status "Migration File: $MIGRATION_FILE"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "❌ SSH key file not found: $SSH_KEY"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    print_error "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Step 1: Upload migration file to server
print_step "📤 Uploading migration file to server..."
scp -i "$SSH_KEY" "$MIGRATION_FILE" "$SERVER_USER@$SERVER_IP:/tmp/"
print_status "✅ Migration file uploaded"

# Step 2: Backup current database (just in case)
print_step "🔄 Creating database backup..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    echo 'Creating backup...'
    mysqldump -u $DB_USER -p'$DB_PASSWORD' $DB_NAME > /tmp/bookmyhotel_backup_\$(date +%Y%m%d_%H%M%S).sql
    echo 'Backup created successfully'
"
print_status "✅ Database backup created"

# Step 3: Check current database structure
print_step "🔍 Checking current database structure..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    echo 'Current tables in database:'
    mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME -e 'SHOW TABLES;'
    
    echo 'Checking if booking_notifications table exists:'
    mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME -e 'SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_schema = \"$DB_NAME\" AND table_name = \"booking_notifications\";'
"

# Step 4: Apply migration
print_step "🛠️ Applying database migration..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    echo 'Applying migration script...'
    mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME < /tmp/$MIGRATION_FILE
    
    if [ \$? -eq 0 ]; then
        echo '✅ Migration applied successfully'
    else
        echo '❌ Migration failed'
        exit 1
    fi
"
print_status "✅ Migration applied successfully"

# Step 5: Verify migration
print_step "✅ Verifying migration..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    echo 'Verifying booking_notifications table structure:'
    mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME -e 'DESCRIBE booking_notifications;'
    
    echo 'Checking table indexes:'
    mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME -e 'SHOW INDEXES FROM booking_notifications;'
    
    echo 'Table row count:'
    mysql -u $DB_USER -p'$DB_PASSWORD' $DB_NAME -e 'SELECT COUNT(*) as row_count FROM booking_notifications;'
"

# Step 6: Clean up
print_step "🧹 Cleaning up temporary files..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    rm -f /tmp/$MIGRATION_FILE
    echo 'Temporary files cleaned up'
"

# Final summary
print_step "📊 Migration Summary"
echo ""
echo -e "${GREEN}🎉 Database Migration Completed Successfully!${NC}"
echo ""
echo "📋 Migration Details:"
echo "  • Database: $DB_NAME"
echo "  • Server: $SERVER_IP"
echo "  • Table Added: booking_notifications"
echo "  • Backup Created: /tmp/bookmyhotel_backup_[timestamp].sql"
echo ""
echo "🔧 Next Steps:"
echo "  • Run ./build-and-deploy-backend.sh to restart the backend"
echo "  • Test the application functionality"
echo ""

print_status "🏁 Migration process completed!"