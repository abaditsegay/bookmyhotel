#!/bin/bash

# BookMyHotel - Local Environment Setup Script
# This script loads OAuth2 credentials from .env file

echo "🏨 BookMyHotel - Loading OAuth2 Configuration"
echo "============================================="
echo ""

# Export OAuth2 environment variables (replace with your actual values)
export MICROSOFT_GRAPH_CLIENT_ID="your-client-id-here"
export MICROSOFT_GRAPH_TENANT_ID="your-tenant-id-here"
export MICROSOFT_GRAPH_CLIENT_SECRET="your-client-secret-here"
export APP_EMAIL_FROM="noreply@yourdomain.com"

# Export database configuration
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3307/bookmyhotel?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="password"

# Export other configurations (replace with your actual secret)
export JWT_SECRET_KEY="your-jwt-secret-key-here-should-be-at-least-512-bits-long"
export APP_FRONTEND_URL="http://localhost:3000"

echo "✅ Environment variables loaded successfully!"
echo ""
echo "📋 Microsoft Graph OAuth2 Configuration:"
echo "   Client ID: $MICROSOFT_GRAPH_CLIENT_ID"
echo "   Tenant ID: $MICROSOFT_GRAPH_TENANT_ID"
echo "   Email From: $APP_EMAIL_FROM"
echo ""
echo "🚀 Ready to start Spring Boot application with OAuth2 email support!"
