#!/bin/bash

# Backend Deployment Script for AWS Lightsail
# This script deploys the Spring Boot backend to your Lightsail instance

set -e

# Configuration
LIGHTSAIL_IP="$1"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="$2"
APP_NAME="bookmyhotel"
BACKEND_DIR="/opt/${APP_NAME}"
SERVICE_NAME="${APP_NAME}-backend"

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
    print_error "Example: $0 18.232.145.123 ~/.ssh/LightsailDefaultKey-us-east-1.pem"
    exit 1
fi

# Set default SSH key path if not provided
if [ -z "$SSH_KEY" ]; then
    SSH_KEY="~/.ssh/bookmyhotel_key.pem"
    print_warning "No SSH key specified, using default: $SSH_KEY"
    print_warning "Note: Make sure to use the PRIVATE key (.pem), not the public key (.pub)"
fi

# Expand tilde in SSH_KEY path
SSH_KEY="${SSH_KEY/#\~/$HOME}"

print_status "Using SSH key: $SSH_KEY"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key file not found: $SSH_KEY"
    print_error "Make sure you're using the correct path to your PRIVATE key file"
    exit 1
fi

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

print_status "Starting backend deployment to $LIGHTSAIL_IP"

# Step 1: Build the application locally
print_status "Building Spring Boot application..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_BACKEND_DIR="$SCRIPT_DIR/../../../backend"

print_status "Script directory: $SCRIPT_DIR"
print_status "Backend directory: $LOCAL_BACKEND_DIR"

# Check if backend directory exists
if [ ! -d "$LOCAL_BACKEND_DIR" ]; then
    print_error "Backend directory not found: $LOCAL_BACKEND_DIR"
    exit 1
fi

cd "$LOCAL_BACKEND_DIR"
if ! mvn clean package -DskipTests; then
    print_error "Maven build failed"
    exit 1
fi

# Step 2: Create deployment directory on Lightsail instance
print_status "Creating deployment directory on Lightsail instance..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    sudo mkdir -p /opt/bookmyhotel
    sudo chown ubuntu:ubuntu /opt/bookmyhotel
    mkdir -p /opt/bookmyhotel/logs
    mkdir -p /opt/bookmyhotel/config
EOF

# Step 3: Copy JAR file to Lightsail instance
print_status "Uploading JAR file to Lightsail instance..."
scp $SSH_OPTS target/*.jar $LIGHTSAIL_USER@$LIGHTSAIL_IP:/opt/bookmyhotel/app.jar

# Step 4: Copy application properties
print_status "Uploading production configuration..."
CONFIG_FILE="$SCRIPT_DIR/../config/application-prod.properties"
if [ -f "$CONFIG_FILE" ]; then
    scp $SSH_OPTS "$CONFIG_FILE" $LIGHTSAIL_USER@$LIGHTSAIL_IP:/opt/bookmyhotel/config/
else
    print_warning "Configuration file not found: $CONFIG_FILE"
fi

# Step 5: Create systemd service
print_status "Creating systemd service..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel
ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m -Dspring.profiles.active=prod app.jar
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

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend.service
EOF

# Step 6: Start the service
print_status "Starting backend service..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    sudo systemctl stop bookmyhotel-backend.service 2>/dev/null || true
    sudo systemctl start bookmyhotel-backend.service
    
    # Wait a moment for service to start
    sleep 5
    
    # Check service status
    if sudo systemctl is-active --quiet bookmyhotel-backend.service; then
        echo "✅ Backend service started successfully"
        sudo systemctl status bookmyhotel-backend.service --no-pager
    else
        echo "❌ Backend service failed to start"
        sudo journalctl -u bookmyhotel-backend.service --no-pager --lines=20
        exit 1
    fi
EOF

# Step 7: Configure Nginx (if not already configured)
print_status "Configuring Nginx reverse proxy..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        sudo apt update
        sudo apt install -y nginx
    fi
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/bookmyhotel > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Health check endpoint
    location /actuator/health {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve static files or redirect to frontend CDN
    location / {
        return 301 https://your-cloudfront-domain.cloudfront.net$request_uri;
    }
}
NGINX

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    sudo nginx -t
    sudo systemctl reload nginx
    sudo systemctl enable nginx
EOF

# Step 8: Test the deployment
print_status "Testing backend deployment..."
sleep 10

# Test health endpoint
if ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "curl -f http://localhost:8080/actuator/health" &>/dev/null; then
    print_status "✅ Backend health check passed!"
else
    print_error "❌ Backend health check failed"
    ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "sudo journalctl -u bookmyhotel-backend.service --no-pager --lines=20"
    exit 1
fi

# Final status
print_status "🎉 Backend deployment completed successfully!"
print_status "Backend URL: http://$LIGHTSAIL_IP/api/"
print_status "Health Check: http://$LIGHTSAIL_IP/actuator/health"
print_status ""
print_status "To view logs: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo journalctl -u bookmyhotel-backend.service -f'"
print_status "To restart service: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo systemctl restart bookmyhotel-backend.service'"
