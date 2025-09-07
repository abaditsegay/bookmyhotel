#!/bin/bash

# Script to Update AWS Lightsail Deployment for Mobile Access
# This script applies the mobile connectivity fix to your existing AWS deployment

set -e

# Configuration
LIGHTSAIL_IP="$1"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="$2"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required parameters are provided
if [ -z "$LIGHTSAIL_IP" ]; then
    print_error "Usage: $0 <lightsail-ip> [ssh-key-path]"
    print_error "Example: $0 54.235.230.218 ~/.ssh/bookmyhotel-aws"
    exit 1
fi

# Set default SSH key path if not provided
if [ -z "$SSH_KEY" ]; then
    SSH_KEY="~/.ssh/bookmyhotel-aws"
    print_warning "No SSH key specified, using default: $SSH_KEY"
fi

# Expand tilde in SSH_KEY path
SSH_KEY="${SSH_KEY/#\~/$HOME}"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key file not found: $SSH_KEY"
    exit 1
fi

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

print_status "🚀 Updating AWS Lightsail deployment for mobile access..."
print_status "Target IP: $LIGHTSAIL_IP"

# Step 1: Update backend configuration for mobile access
print_status "📱 Step 1: Updating backend configuration for mobile access..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPDATED_CONFIG_FILE="$SCRIPT_DIR/../config/application-prod.properties"

# Upload updated configuration
scp $SSH_OPTS "$UPDATED_CONFIG_FILE" $LIGHTSAIL_USER@$LIGHTSAIL_IP:/opt/bookmyhotel/config/

print_status "✅ Updated backend configuration uploaded"

# Step 2: Update backend systemd service configuration
print_status "⚙️  Step 2: Updating backend service configuration..."

ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
# Update the backend systemd service to bind to all interfaces
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel
ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m -Dspring.profiles.active=prod -Dserver.address=0.0.0.0 app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-backend

# Environment variables
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
SERVICE

# Reload systemd
sudo systemctl daemon-reload

echo "✅ Backend service configuration updated"
EOF

# Step 3: Update frontend service configuration for mobile access
print_status "🌐 Step 3: Updating frontend service for mobile access..."

ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
# Update the frontend systemd service to bind to all interfaces
sudo tee /etc/systemd/system/bookmyhotel-frontend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Frontend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel-frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-frontend

# Environment variables - Updated for mobile access
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0
Environment=REACT_APP_API_URL=http://$LIGHTSAIL_IP:8080/managemyhotel/api
Environment=REACT_APP_SERVER_URL=http://$LIGHTSAIL_IP:8080/managemyhotel

[Install]
WantedBy=multi-user.target
SERVICE

# Reload systemd
sudo systemctl daemon-reload

echo "✅ Frontend service configuration updated"
EOF

# Step 4: Update firewall rules to allow access from any IP
print_status "🔥 Step 4: Updating firewall rules for mobile access..."

ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
# Allow backend port from anywhere
sudo ufw allow from any to any port 8080

# Allow frontend port from anywhere  
sudo ufw allow from any to any port 3000

# Show current firewall status
echo "✅ Firewall rules updated:"
sudo ufw status
EOF

# Step 5: Update Nginx configuration for mobile access
print_status "🔧 Step 5: Updating Nginx configuration for mobile access..."

ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
# Update Nginx configuration to support mobile access
sudo tee /etc/nginx/sites-available/bookmyhotel > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;
    
    # Add CORS headers for mobile access
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
    
    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    # API routes - proxy to backend
    location /managemyhotel/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
    }
    
    # Health check endpoint
    location /actuator/health {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend routes - proxy to React dev server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support for React dev server
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }
}

# Direct access to backend on port 8080
server {
    listen 8080;
    server_name _;
    
    # Add CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
    
    # Handle preflight requests
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
    
    # Proxy to backend application
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
    }
}

# Direct access to frontend on port 3000
server {
    listen 3000;
    server_name _;
    
    # Proxy to React dev server
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support for React dev server
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

# Test and reload Nginx
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx configuration updated and reloaded"
else
    echo "❌ Nginx configuration test failed"
    exit 1
fi
EOF

# Step 6: Restart services
print_status "🔄 Step 6: Restarting services..."

ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
# Stop services
echo "Stopping services..."
sudo systemctl stop bookmyhotel-backend.service 2>/dev/null || true
sudo systemctl stop bookmyhotel-frontend.service 2>/dev/null || true

# Wait a moment
sleep 5

# Start backend service
echo "Starting backend service..."
sudo systemctl start bookmyhotel-backend.service

# Wait for backend to start
sleep 10

# Start frontend service  
echo "Starting frontend service..."
sudo systemctl start bookmyhotel-frontend.service

# Wait for frontend to start
sleep 10

# Check service status
echo ""
echo "=== SERVICE STATUS ==="
if sudo systemctl is-active --quiet bookmyhotel-backend.service; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    sudo journalctl -u bookmyhotel-backend.service --no-pager --lines=10
fi

if sudo systemctl is-active --quiet bookmyhotel-frontend.service; then
    echo "✅ Frontend service is running" 
else
    echo "❌ Frontend service failed to start"
    sudo journalctl -u bookmyhotel-frontend.service --no-pager --lines=10
fi
EOF

# Step 7: Test the mobile-accessible deployment
print_status "🧪 Step 7: Testing mobile-accessible deployment..."

sleep 15

# Test backend health
print_status "Testing backend health endpoint..."
if ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "curl -f -s http://127.0.0.1:8080/managemyhotel/actuator/health" &>/dev/null; then
    print_status "✅ Backend health check passed"
else
    print_warning "⚠️  Backend health check failed - checking logs..."
    ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "sudo journalctl -u bookmyhotel-backend.service --no-pager --lines=5"
fi

# Test frontend
print_status "Testing frontend accessibility..."
if ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "curl -f -s http://127.0.0.1:3000" &>/dev/null; then
    print_status "✅ Frontend accessibility check passed"
else
    print_warning "⚠️  Frontend accessibility check failed - checking logs..."
    ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "sudo journalctl -u bookmyhotel-frontend.service --no-pager --lines=5"
fi

# Final status and instructions
print_status ""
print_status "🎉 Mobile accessibility update completed!"
print_status ""
print_status "📱 MOBILE ACCESS URLS:"
print_status "   Frontend: http://$LIGHTSAIL_IP (port 80 with Nginx proxy)"
print_status "   Frontend Direct: http://$LIGHTSAIL_IP:3000"
print_status "   Backend API: http://$LIGHTSAIL_IP:8080/managemyhotel/api"
print_status "   Backend Health: http://$LIGHTSAIL_IP:8080/managemyhotel/actuator/health"
print_status ""
print_status "🔧 DEBUGGING COMMANDS:"
print_status "   Backend logs: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo journalctl -u bookmyhotel-backend.service -f'"
print_status "   Frontend logs: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo journalctl -u bookmyhotel-frontend.service -f'"
print_status "   Nginx logs: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo journalctl -u nginx -f'"
print_status ""
print_status "📋 NEXT STEPS FOR TESTING:"
print_status "1. Open your mobile browser"
print_status "2. Navigate to: http://$LIGHTSAIL_IP"
print_status "3. Try logging in - API calls should work without connection errors"
print_status "4. Test direct API access: http://$LIGHTSAIL_IP:8080/managemyhotel/api/hotels"
print_status ""
print_status "✨ Your AWS deployment is now accessible from mobile devices on any network!"
