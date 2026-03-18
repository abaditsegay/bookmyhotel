#!/bin/bash
# AWS Payment System Migration Deployment Script
# This script applies all payment-related migrations to the AWS production database

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values (override with environment variables)
DB_HOST=${AWS_DB_HOST:-"your-aws-rds-endpoint"}
DB_PORT=${AWS_DB_PORT:-"3306"}
DB_NAME=${AWS_DB_NAME:-"bookmyhotel"}
DB_USER=${AWS_DB_USER:-"admin"}
DB_PASSWORD=${AWS_DB_PASSWORD:-"your-password"}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if MySQL client is available
check_mysql_client() {
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL client is not installed. Please install MySQL client first."
        echo "On macOS: brew install mysql-client"
        echo "On Ubuntu: sudo apt-get install mysql-client"
        echo "On CentOS/RHEL: sudo yum install mysql"
        exit 1
    fi
}

# Function to test database connection
test_connection() {
    print_status "Testing database connection..."
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" &>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Failed to connect to database"
        echo "Host: $DB_HOST:$DB_PORT"
        echo "Database: $DB_NAME"
        echo "User: $DB_USER"
        return 1
    fi
}

# Function to create backup
create_backup() {
    print_status "Creating database backup before migration..."
    
    backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction --routines --triggers "$DB_NAME" > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "Backup created: $backup_file"
        return 0
    else
        print_error "Failed to create backup"
        return 1
    fi
}

# Function to apply migration
apply_migration() {
    local migration_file="$1"
    local description="$2"
    
    print_status "Applying $description..."
    
    if [ ! -f "$migration_file" ]; then
        print_error "Migration file not found: $migration_file"
        return 1
    fi
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration_file"
    
    if [ $? -eq 0 ]; then
        print_success "$description completed"
        return 0
    else
        print_error "$description failed"
        return 1
    fi
}

# Function to run verification queries
run_verification() {
    print_status "Running post-migration verification..."
    
    # Check if columns exist
    column_check=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'reservations' AND COLUMN_NAME IN ('payment_status', 'payment_reference');" \
        -s -N)
    
    if [ "$column_check" -eq 2 ]; then
        print_success "Both payment_status and payment_reference columns exist"
    else
        print_error "Migration verification failed - missing columns"
        return 1
    fi
    
    # Check Grand Plaza Hotel data
    grand_plaza_check=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "SELECT COUNT(*) FROM reservations r JOIN hotels h ON r.hotel_id = h.id WHERE h.name LIKE '%Grand Plaza%' AND (r.payment_reference IS NULL OR r.payment_reference = '');" \
        -s -N)
    
    if [ "$grand_plaza_check" -eq 0 ]; then
        print_success "All Grand Plaza Hotel bookings have payment references"
    else
        print_warning "$grand_plaza_check Grand Plaza Hotel bookings still missing payment references"
    fi
    
    return 0
}

# Function to show migration summary
show_summary() {
    print_status "Migration Summary:"
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "
        SELECT 
            'MIGRATION SUMMARY' as status,
            h.name as hotel_name,
            COUNT(*) as total_bookings,
            SUM(CASE WHEN r.payment_reference IS NULL OR r.payment_reference = '' THEN 1 ELSE 0 END) as missing_refs,
            SUM(CASE WHEN r.payment_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN r.payment_status = 'PENDING' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN r.payment_status = 'PROCESSING' THEN 1 ELSE 0 END) as processing
        FROM reservations r
        JOIN hotels h ON r.hotel_id = h.id
        WHERE h.name LIKE '%Grand Plaza%'
        GROUP BY h.id, h.name;
        "
}

# Main execution
main() {
    echo "=============================================="
    echo "AWS Payment System Migration Deployment"
    echo "=============================================="
    
    # Check prerequisites
    check_mysql_client
    
    # Validate environment variables
    if [ "$DB_HOST" = "your-aws-rds-endpoint" ] || [ "$DB_PASSWORD" = "your-password" ]; then
        print_error "Please set the required environment variables:"
        echo "export AWS_DB_HOST='your-rds-endpoint.region.rds.amazonaws.com'"
        echo "export AWS_DB_PASSWORD='your-actual-password'"
        echo "export AWS_DB_USER='your-db-user'"
        echo "export AWS_DB_NAME='your-database-name'"
        exit 1
    fi
    
    # Test connection
    if ! test_connection; then
        exit 1
    fi
    
    # Ask for confirmation
    echo ""
    print_warning "This will apply payment system migrations to the production database:"
    echo "- Host: $DB_HOST"
    echo "- Database: $DB_NAME"
    echo "- User: $DB_USER"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_status "Migration cancelled by user"
        exit 0
    fi
    
    # Create backup
    if ! create_backup; then
        print_error "Backup failed. Aborting migration."
        exit 1
    fi
    
    # Apply master migration
    if ! apply_migration "aws-master-payment-migration.sql" "Master Payment System Migration"; then
        print_error "Master migration failed. Please check the backup file."
        exit 1
    fi
    
    # Run verification
    if ! run_verification; then
        print_error "Verification failed. Please check the migration results."
        exit 1
    fi
    
    # Show summary
    show_summary
    
    print_success "Payment system migration completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Test the payment status functionality in the application"
    echo "2. Verify that Grand Plaza Hotel bookings show payment references"
    echo "3. Check that payment status updates work correctly"
    echo "4. Monitor application logs for any issues"
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "AWS Payment System Migration Deployment Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Environment Variables:"
        echo "  AWS_DB_HOST      - RDS endpoint (required)"
        echo "  AWS_DB_PORT      - Database port (default: 3306)"
        echo "  AWS_DB_NAME      - Database name (default: bookmyhotel)"
        echo "  AWS_DB_USER      - Database user (default: admin)"
        echo "  AWS_DB_PASSWORD  - Database password (required)"
        echo ""
        echo "Options:"
        echo "  --help, -h       Show this help message"
        echo "  --dry-run        Show what would be done without executing"
        echo ""
        echo "Example:"
        echo "  export AWS_DB_HOST='myapp.xyz123.us-east-1.rds.amazonaws.com'"
        echo "  export AWS_DB_PASSWORD='mypassword'"
        echo "  $0"
        exit 0
        ;;
    --dry-run)
        echo "DRY RUN MODE - Showing what would be executed:"
        echo "1. Check MySQL client availability"
        echo "2. Test database connection to $DB_HOST:$DB_PORT"
        echo "3. Create backup of $DB_NAME database"
        echo "4. Apply aws-master-payment-migration.sql"
        echo "5. Run verification queries"
        echo "6. Show migration summary"
        exit 0
        ;;
    *)
        main
        ;;
esac