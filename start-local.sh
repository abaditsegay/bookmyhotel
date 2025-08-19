#!/bin/bash

# Local Deployment Script for BookMyHotel
set -e

echo "🏨 BookMyHotel Local Deployment Script"
echo "======================================"

# Load environment variables if .env file exists
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  No .env file found. Copy .env.example to .env and configure your credentials."
    echo "   Some features like email service may not work without proper configuration."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking required ports..."
if ! check_port 3307; then
    echo "MySQL port 3307 is in use. Attempting to stop existing containers..."
    docker-compose -f infra/docker-compose.yml down
fi

if ! check_port 8080; then
    echo "❌ Backend port 8080 is in use. Please stop the process using it."
    echo "You can check what's using it with: lsof -i :8080"
    exit 1
fi

if ! check_port 3000; then
    echo "❌ Frontend port 3000 is in use. Please stop the process using it."
    echo "You can check what's using it with: lsof -i :3000"
    exit 1
fi

echo "✅ All required ports are available"

# Start MySQL
echo "🗄️  Starting MySQL database..."
docker-compose -f infra/docker-compose.yml up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Check if MySQL is healthy
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if docker-compose -f infra/docker-compose.yml exec -T mysql mysqladmin ping -h"localhost" -uroot -ppassword 2>/dev/null; then
        echo "✅ MySQL is ready"
        break
    fi
    echo "Waiting for MySQL... (attempt $attempt/$max_attempts)"
    sleep 2
    ((attempt++))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ MySQL failed to start within expected time"
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Build backend
echo "🔨 Building backend..."
cd backend
mvn clean compile -q
cd ..

echo "🚀 Starting services..."
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:3000"
echo "MySQL is running on port: 3307"
echo ""
echo "📝 To stop all services:"
echo "  - Press Ctrl+C to stop this script"
echo "  - Run: docker-compose -f infra/docker-compose.yml down"
echo ""
echo "🔧 Optional development tools:"
echo "  - PhpMyAdmin: docker-compose -f infra/docker-compose.yml --profile dev up -d phpmyadmin"
echo "  - Then access PhpMyAdmin at: http://localhost:8081"
echo ""

# Start backend and frontend
echo "Starting backend..."
cd backend && mvn spring-boot:run &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 15

echo "Starting frontend..."
cd ../frontend && npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    docker-compose -f infra/docker-compose.yml down
    echo "✅ All services stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Wait for user to stop
echo "✅ All services are starting up!"
echo "Press Ctrl+C to stop all services"
wait
