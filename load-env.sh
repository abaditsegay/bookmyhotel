#!/bin/bash

# BookMyHotel - Local Environment Setup Script
# This script loads OAuth2 credentials from .env file

echo "🏨 BookMyHotel - Loading OAuth2 Configuration"
echo "============================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your configuration values."
    echo "You can copy .env.example as a template."
    exit 1
fi

# Load environment variables from .env file
echo "📁 Loading environment variables from .env file..."
set -a  # automatically export all variables
source .env
set +a  # stop automatically exporting

echo "✅ Environment variables loaded successfully!"
echo ""
echo "📋 Microsoft Graph OAuth2 Configuration:"
echo "   Client ID: $MICROSOFT_GRAPH_CLIENT_ID"
echo "   Tenant ID: $MICROSOFT_GRAPH_TENANT_ID"
echo "   Email From: $APP_EMAIL_FROM"
echo ""
echo "🗄️  Database Configuration:"
echo "   URL: $SPRING_DATASOURCE_URL"
echo "   Username: $SPRING_DATASOURCE_USERNAME"
echo ""
echo "🚀 Ready to start Spring Boot application with OAuth2 email support!"
