#!/bin/bash

# Script to recreate the database with the fresh hotel-centric schema
# This script will drop the existing database and create a new one with the correct structure

DB_NAME="bookmyhotel"
DB_USER="root"
DB_PASSWORD="password"
DB_HOST="localhost"
DB_PORT="3307"
MYSQL_CONTAINER="bookmyhotel-mysql"

echo "🔄 Starting fresh database schema creation..."

# Check if MySQL container is running
echo "📋 Checking MySQL container status..."
if ! docker ps | grep -q "$MYSQL_CONTAINER"; then
    echo "❌ MySQL container is not running. Please start it."
    echo "💡 You can start MySQL using: docker-compose -f infra/docker-compose.yml up -d mysql"
    exit 1
fi

echo "✅ MySQL container is running"

# Test connection using Docker exec
echo "🔗 Testing database connection..."
if ! docker exec "$MYSQL_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to MySQL inside container."
    exit 1
fi

echo "✅ Database connection successful"

# Drop and recreate the database
echo "🗑️  Dropping existing database (if exists)..."
docker exec "$MYSQL_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $DB_NAME;"

echo "🆕 Creating fresh database..."
docker exec "$MYSQL_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "🏗️  Applying hotel-centric schema..."
docker exec -i "$MYSQL_CONTAINER" mysql -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < create-hotel-centric-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Fresh database schema created successfully!"
    echo ""
    echo "📊 Database Summary:"
    echo "   - Database: $DB_NAME"
    echo "   - Architecture: Hotel-Centric Multi-Tenant"
    echo "   - Hierarchy: Tenant → Hotel → Entity"
    echo "   - Tables: All hotel operations are now hotel-scoped"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Start the backend application"
    echo "   2. Test the new hotel-centric architecture"
    echo "   3. Verify all operations work correctly"
    echo ""
    echo "🚀 You can now start your application!"
else
    echo "❌ Error applying schema. Please check the SQL file for issues."
    exit 1
fi
