#!/bin/bash

# BookMyHotel - Local Environment Setup Script
# This script loads OAuth2 credentials from .env file

echo "🏨 BookMyHotel - Loading OAuth2 Configuration"
echo "============================================="
echo ""

# Export OAuth2 environment variables
export MICROSOFT_GRAPH_CLIENT_ID="8e1e8dd6-e1df-48a9-9ffd-499aa6b04130"
export MICROSOFT_GRAPH_TENANT_ID="d7e8b101-46f9-4942-8442-45e0903b9467"
export MICROSOFT_GRAPH_CLIENT_SECRET="your-client-secret-here"
export APP_EMAIL_FROM="noreply@251solutions.com"

# Export database configuration
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3307/bookmyhotel?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="password"

# Export other configurations
export JWT_SECRET_KEY="bookmyhotelverylongsecretkeythatisatleast512bitslongforsecuritywithjwtandhs512algorithmthisisasupersecurekey2024bookmyhotelapp"
export APP_FRONTEND_URL="http://localhost:3000"

echo "✅ Environment variables loaded successfully!"
echo ""
echo "📋 Microsoft Graph OAuth2 Configuration:"
echo "   Client ID: $MICROSOFT_GRAPH_CLIENT_ID"
echo "   Tenant ID: $MICROSOFT_GRAPH_TENANT_ID"
echo "   Email From: $APP_EMAIL_FROM"
echo ""
echo "🚀 Ready to start Spring Boot application with OAuth2 email support!"
