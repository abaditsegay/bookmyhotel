#!/bin/bash

echo "🛑 Stopping BookMyHotel Backend Services..."
echo "=============================================="

cd "$(dirname "$0")"

# Stop the services
docker-compose -f infra/docker-compose.yml down

echo ""
echo "✅ Services stopped successfully!"
echo "   - Backend API stopped"
echo "   - MySQL database stopped"
echo ""
echo "💡 To start again, run: ./start-backend-local.sh"
echo ""
