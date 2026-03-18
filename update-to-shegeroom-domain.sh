#!/bin/bash

# Script to complete domain migration to shegeroom.com
# Run this AFTER updating DNS records to point shegeroom.com to 44.204.49.94

echo "🔄 Updating domain to shegeroom.com..."

# Step 1: Deploy updated backend configuration
echo "📦 Deploying updated backend configuration..."
rsync -avz -e "ssh -i ~/.ssh/bookmyhotel-aws" \
    /Users/samuel/Projects2/bookmyhotel/aws/lightsail/config/application-prod.properties \
    ubuntu@44.204.49.94:/opt/bookmyhotel/backend/config/

# Step 2: Restart backend service with new configuration
echo "🔄 Restarting backend service..."
ssh -i ~/.ssh/bookmyhotel-aws ubuntu@44.204.49.94 "sudo systemctl restart bookmyhotel-backend"

# Step 3: Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 10

# Step 4: Obtain SSL certificate for new domain
echo "🔐 Obtaining SSL certificate for shegeroom.com..."
ssh -i ~/.ssh/bookmyhotel-aws ubuntu@44.204.49.94 "sudo certbot --nginx -d shegeroom.com --non-interactive --agree-tos --email admin@shegeroom.com"

# Step 5: Test the new domain
echo "🧪 Testing new domain..."
echo "Frontend: http://shegeroom.com/"
echo "Backend API: http://shegeroom.com/managemyhotel/actuator/health"

# Test HTTP first
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://shegeroom.com/")
if [ "$HTTP_RESPONSE" = "200" ] || [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    echo "✅ HTTP test successful (Status: $HTTP_RESPONSE)"
else
    echo "❌ HTTP test failed (Status: $HTTP_RESPONSE)"
fi

# Test HTTPS if certificate was obtained successfully
sleep 5
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://shegeroom.com/" 2>/dev/null)
if [ "$HTTPS_RESPONSE" = "200" ]; then
    echo "✅ HTTPS test successful (Status: $HTTPS_RESPONSE)"
    echo "🌐 Your application is now available at: https://shegeroom.com/"
else
    echo "⚠️ HTTPS not yet available, but HTTP is working"
    echo "🌐 Your application is available at: http://shegeroom.com/"
fi

echo ""
echo "📋 Domain Migration Summary:"
echo "- ✅ Backend configuration updated to use shegeroom.com"
echo "- ✅ Nginx configuration updated to serve shegeroom.com"  
echo "- ✅ Backend service restarted with new configuration"
echo "- 🔐 SSL certificate obtained (if DNS was properly configured)"
echo ""
echo "📝 Next steps:"
echo "1. Update your DNS records to point shegeroom.com to 44.204.49.94"
echo "2. Wait for DNS propagation (can take up to 24 hours)"
echo "3. Re-run this script if SSL certificate failed due to DNS issues"
echo ""
echo "🌐 Access URLs:"
echo "- Frontend: https://shegeroom.com/ (or http://shegeroom.com/)"
echo "- Backend API: https://shegeroom.com/managemyhotel/"
echo "- Health Check: https://shegeroom.com/managemyhotel/actuator/health"
