#!/bin/bash

# Simple AWS RDS Deployment for Automated Room Status System
# Connects directly to AWS RDS MySQL database

set -e

# Database credentials
DB_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
DB_PORT="3306"
DB_NAME="bookmyhotel"
DB_USER="admin"
DB_PASS="BookMyHotel2024SecureDB!"

echo "🚀 AWS RDS Schema Optimization for Automated Room Status System"
echo "Target: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""

# Test connection first
echo "Testing connection..."
if mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "SELECT 'Connected!' as status;" $DB_NAME 2>/dev/null; then
    echo "✅ Connection successful!"
else
    echo "❌ Connection failed. Trying alternative method..."
    # Try with SSL disabled
    if mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS --ssl-mode=DISABLED -e "SELECT 'Connected!' as status;" $DB_NAME; then
        echo "✅ Connection successful with SSL disabled!"
        SSL_FLAG="--ssl-mode=DISABLED"
    else
        echo "❌ Could not connect to AWS RDS. Please check credentials."
        exit 1
    fi
fi

echo ""
echo "Applying schema optimizations..."

# Execute the SQL script
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $SSL_FLAG $DB_NAME < aws-deploy-simple.sql

echo ""
echo "✅ AWS RDS schema optimization completed!"
echo ""
echo "🤖 Your database is now ready for the automated room status system!"
echo ""
echo "Next steps:"
echo "1. Deploy your updated backend with AutomatedRoomStatusService"
echo "2. The system will automatically handle room status updates every 5 minutes"
echo "3. No more manual 'Fix Status' operations needed!"