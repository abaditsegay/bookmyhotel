#!/bin/bash

# Stop Local Deployment Script for BookMyHotel
echo "🛑 Stopping BookMyHotel local deployment..."

# Stop Docker containers
echo "Stopping MySQL..."
docker-compose -f infra/docker-compose.yml down

# Kill any running Spring Boot processes
echo "Stopping backend..."
pkill -f "spring-boot:run" || true
pkill -f "BookMyHotelApplication" || true

# Kill any running npm processes
echo "Stopping frontend..."
pkill -f "npm start" || true
pkill -f "react-scripts" || true

# Check for processes on specific ports and kill them
for port in 8080 3000; do
    PID=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        echo "Killing process on port $port (PID: $PID)"
        kill -9 $PID 2>/dev/null || true
    fi
done

echo "✅ All services stopped"
