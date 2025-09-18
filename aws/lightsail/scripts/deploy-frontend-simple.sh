#!/bin/bash

# Optimized Frontend Deployment Script for AWS Lightsail
# Builds locally and deploys artifacts to avoid AWS memory issues

SERVER_IP="${1}"
SSH_KEY="${2}"

if [ -z "$SERVER_IP" ] || [ -z "$SSH_KEY" ]; then
    echo "Usage: $0 <server_ip> <ssh_key>"
    echo "Example: $0 35.174.170.75 ~/.ssh/bookmyhotel-aws"
    exit 1
fi

echo "🚀 Starting optimized frontend deployment to $SERVER_IP"

# Step 1: Build React app locally (avoid AWS memory issues)
echo "📦 Building React application locally..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi

echo "✅ React build completed successfully"

# Step 2: Create deployment package
echo "📦 Creating deployment package..."
cd build
tar -czf frontend-build.tar.gz *
cd ..

# Step 3: Upload build artifacts to server
echo "🚀 Uploading build artifacts to server..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no build/frontend-build.tar.gz ubuntu@"$SERVER_IP":/tmp/

# Step 4: Deploy on server
echo "🔧 Deploying on server..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ubuntu@"$SERVER_IP" << 'EOF'
set -e

# Remove old frontend files if they exist
sudo rm -rf /var/www/html/*

# Extract new build
cd /tmp
tar -xzf frontend-build.tar.gz -C /var/www/html/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Configure nginx for React SPA
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name bookmystay.251solutions.com;

    ssl_certificate /etc/letsencrypt/live/bookmystay.251solutions.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bookmystay.251solutions.com/privkey.pem;

    # Frontend React SPA
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /managemyhotel/api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://bookmystay.251solutions.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
NGINX_EOF

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Clean up
rm -f /tmp/frontend-build.tar.gz

echo "✅ Frontend deployment completed successfully!"
echo "🌐 Access your application at: https://bookmystay.251solutions.com"
EOF

# Step 5: Clean up local build artifacts
echo "🧹 Cleaning up local build artifacts..."
rm -f build/frontend-build.tar.gz

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Your application is available at: https://bookmystay.251solutions.com"
echo "📝 Login credentials:"
echo "   - Admin: admin@bookmyhotel.com / Admin@123"
echo "   - Manager: manager@hotel1.com / Manager@123"
echo "   - Staff: staff@hotel1.com / Staff@123"
