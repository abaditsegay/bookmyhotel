#!/bin/bash

# BookMyHotel - Microsoft Graph OAuth2 Setup Script
# This script helps you create an Azure AD application for email functionality

echo "🏨 BookMyHotel - Microsoft Graph OAuth2 Setup"
echo "=============================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed."
    echo "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo "🔐 Please login to Azure CLI first:"
    az login
fi

echo "📋 Current Azure subscription:"
az account show --query "{name:name, id:id, tenantId:tenantId}" --output table
echo ""

read -p "Do you want to continue with this subscription? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please run 'az account set --subscription <subscription-id>' to change subscription"
    exit 1
fi

# Get tenant ID
TENANT_ID=$(az account show --query tenantId --output tsv)
echo "✅ Tenant ID: $TENANT_ID"

# App registration name
APP_NAME="BookMyHotel-EmailService"
echo ""
echo "🚀 Creating Azure AD App Registration: $APP_NAME"

# Create the app registration
APP_ID=$(az ad app create \
    --display-name "$APP_NAME" \
    --web-redirect-uris "https://localhost:8080/auth/callback" \
    --required-resource-accesses '[
        {
            "resourceAppId": "00000003-0000-0000-c000-000000000000",
            "resourceAccess": [
                {
                    "id": "64a6cdd6-aab1-4aaf-94b8-3cc8405e90d0",
                    "type": "Scope"
                },
                {
                    "id": "e1fe6dd8-ba31-4d61-89e7-88639da4683d",
                    "type": "Scope"
                }
            ]
        }
    ]' \
    --query appId --output tsv)

if [ $? -eq 0 ]; then
    echo "✅ App Registration created successfully!"
    echo "   App ID: $APP_ID"
else
    echo "❌ Failed to create App Registration"
    exit 1
fi

# Create a client secret
echo ""
echo "🔑 Creating client secret..."
CLIENT_SECRET=$(az ad app credential reset --id $APP_ID --append --display-name "BookMyHotel-Secret" --query password --output tsv)

if [ $? -eq 0 ]; then
    echo "✅ Client secret created successfully!"
else
    echo "❌ Failed to create client secret"
    exit 1
fi

# Generate environment variables file
ENV_FILE="oauth2-credentials.env"
echo ""
echo "📄 Creating environment variables file: $ENV_FILE"

cat > $ENV_FILE << EOF
# Microsoft Graph OAuth2 Configuration for BookMyHotel
# Generated on $(date)

# Azure AD Application Registration Details
export MICROSOFT_GRAPH_CLIENT_ID="$APP_ID"
export MICROSOFT_GRAPH_TENANT_ID="$TENANT_ID"
export MICROSOFT_GRAPH_CLIENT_SECRET="$CLIENT_SECRET"

# Email Configuration
export APP_EMAIL_FROM="your-email@yourdomain.com"

# Instructions:
# 1. Replace 'your-email@yourdomain.com' with your actual email address
# 2. Source this file: source $ENV_FILE
# 3. Restart your Spring Boot application
EOF

echo "✅ Environment variables saved to: $ENV_FILE"
echo ""
echo "🔧 IMPORTANT NEXT STEPS:"
echo "========================"
echo ""
echo "1. 📧 UPDATE EMAIL ADDRESS:"
echo "   Edit $ENV_FILE and replace 'your-email@yourdomain.com' with your actual email"
echo ""
echo "2. 🔐 GRANT ADMIN CONSENT:"
echo "   Go to: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/$APP_ID"
echo "   Click 'Grant admin consent' for the Mail permissions"
echo ""
echo "3. 🚀 APPLY CONFIGURATION:"
echo "   Run: source $ENV_FILE"
echo "   Then restart your Spring Boot application"
echo ""
echo "4. ✅ TEST EMAIL FUNCTIONALITY:"
echo "   Try sending a booking confirmation email through your application"
echo ""
echo "📋 Application Details:"
echo "   Name: $APP_NAME"
echo "   Client ID: $APP_ID"
echo "   Tenant ID: $TENANT_ID"
echo ""
echo "🔒 SECURITY NOTE: Keep your client secret secure and never commit it to version control!"

# Make the env file executable for sourcing
chmod +x $ENV_FILE

echo ""
echo "✨ Setup complete! Please follow the next steps above."
