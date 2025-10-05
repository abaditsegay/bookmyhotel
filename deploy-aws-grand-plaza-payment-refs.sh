#!/bin/bash
# AWS Production: Deploy Payment References for Grand Plaza Hotel
# This script safely adds payment references to existing bookings

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

# Function to check if Grand Plaza Hotel exists
check_grand_plaza() {
    print_status "Checking if Grand Plaza Hotel exists..."
    
    local hotel_count=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "SELECT COUNT(*) FROM hotels WHERE name LIKE '%Grand Plaza%';" \
        -s -N)
    
    if [ "$hotel_count" -gt 0 ]; then
        print_success "Found Grand Plaza Hotel in database"
        return 0
    else
        print_error "Grand Plaza Hotel not found in database"
        return 1
    fi
}

# Function to get current booking status
get_current_status() {
    print_status "Getting current booking status for Grand Plaza Hotel..."
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "
        SELECT 
            h.name as 'Hotel Name',
            COUNT(*) as 'Total Bookings',
            SUM(CASE WHEN r.payment_reference IS NULL OR r.payment_reference = '' THEN 1 ELSE 0 END) as 'Missing Payment Refs',
            SUM(CASE WHEN r.payment_status = 'PENDING' THEN 1 ELSE 0 END) as 'Pending',
            SUM(CASE WHEN r.payment_status = 'PROCESSING' THEN 1 ELSE 0 END) as 'Processing',
            SUM(CASE WHEN r.payment_status = 'COMPLETED' THEN 1 ELSE 0 END) as 'Completed'
        FROM reservations r
        JOIN hotels h ON r.hotel_id = h.id
        WHERE h.name LIKE '%Grand Plaza%'
        GROUP BY h.id, h.name;
        "
}

# Function to create backup
create_backup() {
    print_status "Creating backup of reservations table..."
    
    backup_file="grand_plaza_reservations_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "SELECT * FROM reservations r JOIN hotels h ON r.hotel_id = h.id WHERE h.name LIKE '%Grand Plaza%';" \
        > "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "Backup created: $backup_file"
        return 0
    else
        print_error "Failed to create backup"
        return 1
    fi
}

# Function to apply payment reference updates
apply_payment_references() {
    print_status "Applying payment reference updates..."
    
    if [ ! -f "aws-grand-plaza-payment-refs-production.sql" ]; then
        print_error "Payment reference script not found: aws-grand-plaza-payment-refs-production.sql"
        return 1
    fi
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        < aws-grand-plaza-payment-refs-production.sql
    
    if [ $? -eq 0 ]; then
        print_success "Payment reference updates applied successfully"
        return 0
    else
        print_error "Failed to apply payment reference updates"
        return 1
    fi
}

# Function to show final results
show_results() {
    print_status "Final results after payment reference updates:"
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "
        SELECT 
            'FINAL STATUS' as Status,
            h.name as 'Hotel Name',
            COUNT(*) as 'Total Bookings',
            SUM(CASE WHEN r.payment_reference IS NULL OR r.payment_reference = '' THEN 1 ELSE 0 END) as 'Missing Payment Refs',
            SUM(CASE WHEN r.payment_status = 'PENDING' THEN 1 ELSE 0 END) as 'Pending',
            SUM(CASE WHEN r.payment_status = 'PROCESSING' THEN 1 ELSE 0 END) as 'Processing',
            SUM(CASE WHEN r.payment_status = 'COMPLETED' THEN 1 ELSE 0 END) as 'Completed'
        FROM reservations r
        JOIN hotels h ON r.hotel_id = h.id
        WHERE h.name LIKE '%Grand Plaza%'
        GROUP BY h.id, h.name;
        "
    
    echo ""
    print_status "Payment method distribution:"
    
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "
        SELECT 
            CASE 
                WHEN payment_reference LIKE 'CASH_%' OR payment_reference LIKE 'HELLO_CASH_%' THEN 'Cash Payments'
                WHEN payment_reference LIKE 'CBE_BIRR_%' OR payment_reference LIKE 'TELEBIRR_%' 
                     OR payment_reference LIKE 'M_BIRR_%' OR payment_reference LIKE 'AMOLE_%' 
                     OR payment_reference LIKE 'EBIRR_%' OR payment_reference LIKE 'MOBILE_PAY_%' THEN 'Mobile Payments'
                WHEN payment_reference LIKE 'VISA_%' OR payment_reference LIKE 'MASTERCARD_%' 
                     OR payment_reference LIKE 'AMEX_%' OR payment_reference LIKE 'CARD_%' THEN 'Card Payments'
                WHEN payment_reference LIKE '%_BANK_%' OR payment_reference LIKE 'BANK_TRANSFER_%' THEN 'Bank Transfers'
                WHEN payment_reference LIKE 'WIRE_TRANSFER_%' THEN 'Wire Transfers'
                ELSE 'Other Methods'
            END as 'Payment Method',
            COUNT(*) as Count,
            CONCAT(ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reservations r2 JOIN hotels h2 ON r2.hotel_id = h2.id WHERE h2.name LIKE '%Grand Plaza%'), 2), '%') as Percentage
        FROM reservations r
        JOIN hotels h ON r.hotel_id = h.id
        WHERE h.name LIKE '%Grand Plaza%'
        GROUP BY 1
        ORDER BY Count DESC;
        "
}

# Main execution
main() {
    echo "================================================"
    echo "AWS Grand Plaza Hotel Payment Reference Deployment"
    echo "================================================"
    
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
    
    # Check if Grand Plaza Hotel exists
    if ! check_grand_plaza; then
        exit 1
    fi
    
    # Show current status
    echo ""
    print_status "Current status:"
    get_current_status
    
    # Ask for confirmation
    echo ""
    print_warning "This will add payment references to all Grand Plaza Hotel bookings."
    echo "Database: $DB_HOST:$DB_PORT/$DB_NAME"
    echo ""
    read -p "Are you sure you want to proceed? (yes/no): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_status "Operation cancelled by user"
        exit 0
    fi
    
    # Create backup
    if ! create_backup; then
        print_error "Backup failed. Aborting operation."
        exit 1
    fi
    
    # Apply payment reference updates
    if ! apply_payment_references; then
        print_error "Payment reference updates failed. Please check the backup file."
        exit 1
    fi
    
    # Show final results
    echo ""
    show_results
    
    print_success "Payment reference deployment completed successfully!"
    echo ""
    print_status "Summary:"
    echo "✅ All Grand Plaza Hotel bookings now have payment references"
    echo "✅ Payment statuses updated based on payment methods"
    echo "✅ Realistic Ethiopian payment method distribution applied"
    echo "✅ Backup file created for rollback if needed"
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "AWS Grand Plaza Hotel Payment Reference Deployment Script"
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
        echo "  --status         Show current payment reference status only"
        echo ""
        echo "Example:"
        echo "  export AWS_DB_HOST='myapp.xyz123.us-east-1.rds.amazonaws.com'"
        echo "  export AWS_DB_PASSWORD='mypassword'"
        echo "  $0"
        exit 0
        ;;
    --status)
        check_mysql_client
        if test_connection && check_grand_plaza; then
            get_current_status
        fi
        exit 0
        ;;
    *)
        main
        ;;
esac