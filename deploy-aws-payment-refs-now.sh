#!/bin/bash
# Quick AWS Payment Reference Deployment
# Run this script to add payment references to AWS Grand Plaza Hotel bookings

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if AWS credentials are set
if [ -z "$AWS_DB_HOST" ] || [ -z "$AWS_DB_PASSWORD" ]; then
    print_error "Please set AWS database credentials:"
    echo ""
    echo "export AWS_DB_HOST='your-rds-endpoint.region.rds.amazonaws.com'"
    echo "export AWS_DB_PASSWORD='your-password'"
    echo "export AWS_DB_USER='admin'  # optional, default: admin"
    echo "export AWS_DB_NAME='bookmyhotel'  # optional, default: bookmyhotel"
    echo ""
    echo "Then run: $0"
    exit 1
fi

# Set defaults
DB_HOST=${AWS_DB_HOST}
DB_USER=${AWS_DB_USER:-admin}
DB_PASSWORD=${AWS_DB_PASSWORD}
DB_NAME=${AWS_DB_NAME:-bookmyhotel}
DB_PORT=${AWS_DB_PORT:-3306}

print_status "🚀 Deploying payment references to AWS Grand Plaza Hotel..."
print_status "Database: $DB_HOST:$DB_PORT/$DB_NAME"

# Test connection
print_status "Testing database connection..."
if ! mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" "$DB_NAME" &>/dev/null; then
    print_error "❌ Failed to connect to AWS database"
    print_error "Please check your credentials and network connection"
    exit 1
fi
print_success "✅ Connected to AWS database"

# Check if Grand Plaza exists
print_status "Checking for Grand Plaza Hotel..."
hotel_count=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    -e "SELECT COUNT(*) FROM hotels WHERE name LIKE '%Grand Plaza%';" -s -N)

if [ "$hotel_count" -eq 0 ]; then
    print_error "❌ Grand Plaza Hotel not found in AWS database"
    print_status "Available hotels:"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
        -e "SELECT id, name FROM hotels ORDER BY name;"
    exit 1
fi
print_success "✅ Found Grand Plaza Hotel in AWS database"

# Show current status
print_status "📊 Current payment reference status:"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
    -e "
    SELECT 
        h.name as 'Hotel',
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

# Ask for confirmation
echo ""
print_warning "⚠️  This will add payment references to ALL Grand Plaza Hotel bookings in AWS"
read -p "Do you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_status "❌ Operation cancelled"
    exit 0
fi

# Apply the migration
print_status "🔄 Applying payment reference migration..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
   < aws-grand-plaza-payment-refs-production.sql; then
    print_success "✅ Payment reference migration applied successfully!"
else
    print_error "❌ Migration failed!"
    exit 1
fi

print_success "🎉 AWS Grand Plaza Hotel payment references deployed successfully!"
print_status "📈 Payment references have been added with realistic Ethiopian payment methods"
print_status "💳 Distribution: ~45% Mobile, ~25% Bank, ~20% Card, ~10% Cash/Other"

echo ""
print_status "🔍 You can now check your AWS application UI to see the payment references!"