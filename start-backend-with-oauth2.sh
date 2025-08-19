#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

echo "🏨 Starting BookMyHotel Backend with OAuth2 Credentials"
echo "======================================================"
echo ""
echo "✅ Environment Variables Loaded:"
echo "   - MICROSOFT_GRAPH_CLIENT_ID: ${MICROSOFT_GRAPH_CLIENT_ID:0:8}..."
echo "   - MICROSOFT_GRAPH_TENANT_ID: ${MICROSOFT_GRAPH_TENANT_ID:0:8}..."
echo "   - MICROSOFT_GRAPH_CLIENT_SECRET: ${MICROSOFT_GRAPH_CLIENT_SECRET:0:3}..."
echo "   - APP_EMAIL_FROM: $APP_EMAIL_FROM"
echo ""

# Navigate to backend directory and start the application
cd backend

echo "🚀 Starting Spring Boot Application..."
mvn spring-boot:run
