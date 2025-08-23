#!/bin/bash

# Ethiopian Payment Gateway Environment Setup Script
# This script creates the environment configuration files for M-birr and Telebirr integration

echo "🇪🇹 Setting up Ethiopian Payment Gateway Environment Variables"
echo "============================================================="

# Create environment variables file for development
cat > ethiopian-payment.env << 'EOF'
# Ethiopian Mobile Payment Gateway Configuration
# Copy these variables to your .env file or environment setup

# =============================================================================
# M-BIRR CONFIGURATION
# =============================================================================
MBIRR_API_BASE_URL=https://api.mbirr.et
MBIRR_API_KEY=your_mbirr_api_key_here
MBIRR_API_SECRET=your_mbirr_api_secret_here
MBIRR_MERCHANT_ID=your_mbirr_merchant_id_here
MBIRR_MERCHANT_CODE=your_mbirr_merchant_code_here
MBIRR_WEBHOOK_SECRET=your_mbirr_webhook_secret_here

# =============================================================================
# TELEBIRR CONFIGURATION
# =============================================================================
TELEBIRR_API_BASE_URL=https://api.telebirr.et
TELEBIRR_API_KEY=your_telebirr_api_key_here
TELEBIRR_API_SECRET=your_telebirr_api_secret_here
TELEBIRR_MERCHANT_ID=your_telebirr_merchant_id_here
TELEBIRR_MERCHANT_CODE=your_telebirr_merchant_code_here
TELEBIRR_WEBHOOK_SECRET=your_telebirr_webhook_secret_here

# =============================================================================
# SANDBOX/TESTING CONFIGURATION (Use for development)
# =============================================================================
# For M-birr Sandbox
MBIRR_API_BASE_URL_SANDBOX=https://sandbox.mbirr.et
MBIRR_API_KEY_SANDBOX=sandbox_mbirr_api_key
MBIRR_API_SECRET_SANDBOX=sandbox_mbirr_api_secret
MBIRR_MERCHANT_ID_SANDBOX=sandbox_merchant_id

# For Telebirr Sandbox
TELEBIRR_API_BASE_URL_SANDBOX=https://sandbox.telebirr.et
TELEBIRR_API_KEY_SANDBOX=sandbox_telebirr_api_key
TELEBIRR_API_SECRET_SANDBOX=sandbox_telebirr_api_secret
TELEBIRR_MERCHANT_ID_SANDBOX=sandbox_merchant_id

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
ETHIOPIAN_PAYMENT_RETURN_URL=http://localhost:3000/booking-confirmation
ETHIOPIAN_PAYMENT_CANCEL_URL=http://localhost:3000/booking-failed
ETHIOPIAN_PAYMENT_WEBHOOK_URL=http://localhost:8080/api/payments/ethiopian

EOF

# Create Docker environment file
cat > docker-ethiopian-payment.env << 'EOF'
# Docker Environment Variables for Ethiopian Payment Integration
# This file is used with docker-compose for containerized deployment

MBIRR_API_BASE_URL=https://api.mbirr.et
MBIRR_API_KEY=${MBIRR_API_KEY}
MBIRR_API_SECRET=${MBIRR_API_SECRET}
MBIRR_MERCHANT_ID=${MBIRR_MERCHANT_ID}
MBIRR_MERCHANT_CODE=${MBIRR_MERCHANT_CODE}
MBIRR_WEBHOOK_SECRET=${MBIRR_WEBHOOK_SECRET}

TELEBIRR_API_BASE_URL=https://api.telebirr.et
TELEBIRR_API_KEY=${TELEBIRR_API_KEY}
TELEBIRR_API_SECRET=${TELEBIRR_API_SECRET}
TELEBIRR_MERCHANT_ID=${TELEBIRR_MERCHANT_ID}
TELEBIRR_MERCHANT_CODE=${TELEBIRR_MERCHANT_CODE}
TELEBIRR_WEBHOOK_SECRET=${TELEBIRR_WEBHOOK_SECRET}

EOF

# Create Azure/Production environment template
cat > azure-ethiopian-payment.env << 'EOF'
# Azure App Service Environment Variables for Ethiopian Payment Integration
# Configure these in Azure App Service Configuration -> Application Settings

{
  "MBIRR_API_BASE_URL": "https://api.mbirr.et",
  "MBIRR_API_KEY": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=mbirr-api-key)",
  "MBIRR_API_SECRET": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=mbirr-api-secret)",
  "MBIRR_MERCHANT_ID": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=mbirr-merchant-id)",
  "MBIRR_MERCHANT_CODE": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=mbirr-merchant-code)",
  "MBIRR_WEBHOOK_SECRET": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=mbirr-webhook-secret)",
  
  "TELEBIRR_API_BASE_URL": "https://api.telebirr.et",
  "TELEBIRR_API_KEY": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=telebirr-api-key)",
  "TELEBIRR_API_SECRET": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=telebirr-api-secret)",
  "TELEBIRR_MERCHANT_ID": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=telebirr-merchant-id)",
  "TELEBIRR_MERCHANT_CODE": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=telebirr-merchant-code)",
  "TELEBIRR_WEBHOOK_SECRET": "@Microsoft.KeyVault(VaultName=your-keyvault;SecretName=telebirr-webhook-secret)"
}

EOF

echo ""
echo "✅ Environment configuration files created:"
echo "   - ethiopian-payment.env (Development)"
echo "   - docker-ethiopian-payment.env (Docker)"
echo "   - azure-ethiopian-payment.env (Azure/Production)"
echo ""
echo "📋 Next Steps:"
echo "   1. Obtain API keys from M-birr and Telebirr providers"
echo "   2. Update the placeholder values in ethiopian-payment.env"
echo "   3. Source the environment file: source ethiopian-payment.env"
echo "   4. For production, store secrets in Azure Key Vault"
echo ""
echo "🔐 Security Notes:"
echo "   - Never commit actual API keys to version control"
echo "   - Use .env files for local development only"
echo "   - Store production secrets in secure vaults"
echo "   - Rotate API keys regularly"
echo ""
echo "📞 Provider Contact Information:"
echo "   - M-birr Support: [Contact your M-birr representative]"
echo "   - Telebirr Support: [Contact your Telebirr representative]"
echo "   - Ethiopian National Bank: [Regulatory guidance]"
echo ""
echo "🛠️  Testing:"
echo "   - Use sandbox credentials for development"
echo "   - Test with small amounts first"
echo "   - Verify webhook endpoints are accessible"
echo ""

# Make the script executable
chmod +x "$0"

echo "Environment setup complete! 🎉"
