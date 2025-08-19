#!/bin/bash
set -e

echo "🚀 Starting BookMyHotel Backend Locally with Docker..."
echo "======================================================="

# Navigate to the project root
cd "$(dirname "$0")"

# Load environment variables if they exist
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env..."
    export $(cat .env | grep -v '#' | xargs)
fi

# Build the backend JAR
echo "🔨 Building backend JAR..."
cd backend
mvn clean package -DskipTests
cd ..

# Start the services
echo "🐳 Starting Docker Compose services..."
docker-compose -f infra/docker-compose.yml up --build -d mysql backend

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
echo "   - MySQL: http://localhost:3307"
echo "   - Backend API: http://localhost:8080"

# Check service status
sleep 5
echo ""
echo "📊 Service Status:"
docker-compose -f infra/docker-compose.yml ps

# Show logs for backend
echo ""
echo "📝 Backend logs (last 20 lines):"
docker-compose -f infra/docker-compose.yml logs --tail=20 backend

echo ""
echo "✅ Backend deployment complete!"
echo ""
echo "🌐 Available endpoints:"
echo "   - API Base: http://localhost:8080"
echo "   - Health Check: http://localhost:8080/actuator/health"
echo "   - API Documentation: http://localhost:8080/swagger-ui.html"
echo "   - Database: localhost:3307 (root/password)"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose -f infra/docker-compose.yml logs backend"
echo "   - Stop services: docker-compose -f infra/docker-compose.yml down"
echo "   - Restart backend: docker-compose -f infra/docker-compose.yml restart backend"
echo ""
echo "🎯 Test the API:"
echo "   curl http://localhost:8080/actuator/health"
echo ""
