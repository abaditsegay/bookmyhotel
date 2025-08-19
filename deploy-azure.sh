#!/bin/bash

# Azure Deployment Script for BookMyHotel Backend
set -e

echo "🚀 Starting Azure deployment for BookMyHotel Backend..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if Azure Developer CLI is installed
if ! command -v azd &> /dev/null; then
    echo "❌ Azure Developer CLI is not installed. Please install it first."
    echo "Install azd: https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd"
    exit 1
fi

# Check if user is logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure CLI first..."
    az login
fi

echo "✅ Azure CLI login verified"

# Initialize azd if not already done
if [ ! -f ".azure/config.json" ]; then
    echo "🔧 Initializing Azure Developer CLI..."
    azd init
fi

# Set environment variables (you should update these with your actual values)
echo "🔧 Setting up environment variables..."

# Prompt for required secrets if not set
if [ -z "$JWT_SECRET_KEY" ]; then
    read -s -p "Enter JWT Secret Key (or press Enter for default): " JWT_SECRET_KEY
    echo
    if [ -z "$JWT_SECRET_KEY" ]; then
        JWT_SECRET_KEY="your-jwt-secret-key-here-make-it-long-and-secure-change-this-in-production"
    fi
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    read -s -p "Enter Stripe Secret Key: " STRIPE_SECRET_KEY
    echo
fi

if [ -z "$MAIL_USERNAME" ]; then
    read -p "Enter Email Username: " MAIL_USERNAME
fi

if [ -z "$MAIL_PASSWORD" ]; then
    read -s -p "Enter Email Password: " MAIL_PASSWORD
    echo
fi

if [ -z "$MYSQL_ADMIN_PASSWORD" ]; then
    read -s -p "Enter MySQL Admin Password (or press Enter for default): " MYSQL_ADMIN_PASSWORD
    echo
    if [ -z "$MYSQL_ADMIN_PASSWORD" ]; then
        MYSQL_ADMIN_PASSWORD="BookMyHotel@2024!"
    fi
fi

# Set azd environment variables
azd env set JWT_SECRET_KEY "$JWT_SECRET_KEY"
azd env set STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
azd env set MAIL_USERNAME "$MAIL_USERNAME"
azd env set MAIL_PASSWORD "$MAIL_PASSWORD"
azd env set MYSQL_ADMIN_PASSWORD "$MYSQL_ADMIN_PASSWORD"

echo "✅ Environment variables set"

# Build the application
echo "🔨 Building the backend application..."
cd backend
mvn clean package -DskipTests
cd ..

echo "✅ Backend build completed"

# Deploy to Azure
echo "🚀 Deploying to Azure..."
azd up

echo "✅ Deployment completed!"
echo ""
echo "🎉 Your BookMyHotel backend is now deployed to Azure!"
echo ""
echo "📝 Next steps:"
echo "1. Update your frontend configuration with the new backend URL"
echo "2. Configure your custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Run database migrations if needed"
echo ""
echo "🔍 To check deployment status: azd show"
echo "🏠 To view logs: azd logs"
echo "🗑️  To tear down resources: azd down"
