#!/bin/bash

# Fresh AWS Lightsail Deployment Script for BookMyHotel
# This script deploys both backend and frontend to organized directory structure

set -e  # Exit on any error

# Configuration
AWS_HOST="54.235.230.218"
SSH_KEY="$HOME/.ssh/bookmyhotel-aws"
BACKEND_JAR="backend/target/backend-1.0.0.jar"
FRONTEND_BUILD="frontend/build"
PROD_CONFIG="aws/lightsail/config/application-prod.properties"

echo "🚀 Starting Fresh AWS Deployment for BookMyHotel"
echo "================================================"

# Check if required files exist
echo "📋 Checking prerequisites..."
if [ ! -f "$BACKEND_JAR" ]; then
    echo "❌ Backend JAR not found: $BACKEND_JAR"
    echo "💡 Run: cd backend && mvn clean package"
    exit 1
fi

if [ ! -d "$FRONTEND_BUILD" ]; then
    echo "❌ Frontend build not found: $FRONTEND_BUILD"
    echo "💡 Run: cd frontend && npm run build"
    exit 1
fi

if [ ! -f "$PROD_CONFIG" ]; then
    echo "❌ Production config not found: $PROD_CONFIG"
    exit 1
fi

if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

echo "✅ All prerequisites found"

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 ubuntu@$AWS_HOST "echo 'Connection successful'" >/dev/null 2>&1; then
    echo "❌ Cannot connect to AWS instance"
    exit 1
fi
echo "✅ SSH connection successful"

# Create directory structure on AWS
echo "📁 Creating directory structure..."
ssh -i "$SSH_KEY" ubuntu@$AWS_HOST << 'EOF'
    # Stop any running services first
    sudo systemctl stop bookmyhotel-backend.service 2>/dev/null || true
    sudo systemctl stop bookmyhotel-frontend.service 2>/dev/null || true
    
    # Create directory structure
    sudo mkdir -p /opt/bookmyhotel/backend
    sudo mkdir -p /opt/bookmyhotel/frontend
    sudo mkdir -p /opt/bookmyhotel/logs
    sudo mkdir -p /opt/bookmyhotel/config
    
    # Set ownership
    sudo chown -R ubuntu:ubuntu /opt/bookmyhotel
    
    # Clean any existing files
    rm -rf /opt/bookmyhotel/backend/*
    rm -rf /opt/bookmyhotel/frontend/*
    
    echo "✅ Directory structure created"
EOF

# Upload backend files
echo "📤 Uploading backend files..."
echo "  - Uploading JAR file..."
scp -i "$SSH_KEY" "$BACKEND_JAR" ubuntu@$AWS_HOST:/opt/bookmyhotel/backend/app.jar

echo "  - Uploading production configuration..."
scp -i "$SSH_KEY" "$PROD_CONFIG" ubuntu@$AWS_HOST:/opt/bookmyhotel/backend/application-prod.properties

# Upload frontend build
echo "📤 Uploading frontend build..."
scp -i "$SSH_KEY" -r "$FRONTEND_BUILD"/* ubuntu@$AWS_HOST:/opt/bookmyhotel/frontend/

echo "✅ All files uploaded successfully"

# Set up environment and systemd services
echo "🔧 Setting up services..."
ssh -i "$SSH_KEY" ubuntu@$AWS_HOST << 'EOF'
    # Set file permissions
    chmod +x /opt/bookmyhotel/backend/app.jar
    
    # Install Node.js serve if not already installed
    if ! command -v serve &> /dev/null; then
        echo "📦 Installing Node.js serve..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        sudo npm install -g serve
    fi
    
    # Create backend systemd service
    sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Backend Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/bookmyhotel/backend
ExecStart=/usr/bin/java -jar -Xmx512m -Xms256m -Dspring.profiles.active=prod -Dspring.config.location=/opt/bookmyhotel/backend/application-prod.properties app.jar
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-backend
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

Environment=JAVA_OPTS="-Xmx512m -Xms256m"
Environment=DB_USERNAME=admin
Environment=DB_PASSWORD=Rootpassword123!
Environment=JWT_KEY=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
Environment=MICROSOFT_GRAPH_CLIENT_ID=your-client-id
Environment=MICROSOFT_GRAPH_TENANT_ID=your-tenant-id
Environment=MICROSOFT_GRAPH_CLIENT_SECRET=your-client-secret

[Install]
WantedBy=multi-user.target
SERVICE

    # Create frontend systemd service
    sudo tee /etc/systemd/system/bookmyhotel-frontend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Frontend Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/opt/bookmyhotel/frontend
ExecStart=/usr/bin/serve -s . -p 3000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-frontend
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=10

[Install]
WantedBy=multi-user.target
SERVICE

    # Reload systemd and enable services
    sudo systemctl daemon-reload
    sudo systemctl enable bookmyhotel-backend.service
    sudo systemctl enable bookmyhotel-frontend.service
    
    echo "✅ Systemd services configured"
EOF

# Set up nginx reverse proxy
echo "🌐 Setting up Nginx reverse proxy..."
ssh -i "$SSH_KEY" ubuntu@$AWS_HOST << 'EOF'
    # Install nginx if not already installed
    if ! command -v nginx &> /dev/null; then
        echo "📦 Installing Nginx..."
        sudo apt-get update
        sudo apt-get install -y nginx
    fi
    
    # Create nginx configuration
    sudo tee /etc/nginx/sites-available/bookmyhotel > /dev/null << 'NGINX'
server {
    listen 80;
    server_name 54.235.230.218 localhost;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # CORS headers for API requests
    location /api/ {
        proxy_pass http://localhost:8080/managemyhotel/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "http://54.235.230.218:3000" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "http://54.235.230.218:3000" always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
    }
    
    # Health check endpoint
    location /actuator/ {
        proxy_pass http://localhost:8080/managemyhotel/actuator/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend static files (fallback)
    location / {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/atom+xml image/svg+xml;
}
NGINX

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    sudo nginx -t
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo "✅ Nginx configured successfully"
    else
        echo "❌ Nginx configuration error"
        exit 1
    fi
EOF

# Configure firewall
echo "🔥 Configuring firewall..."
ssh -i "$SSH_KEY" ubuntu@$AWS_HOST << 'EOF'
    # Configure UFW firewall
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 3000/tcp
    sudo ufw allow 8080/tcp
    echo "✅ Firewall configured"
EOF

# Start services
echo "🚀 Starting services..."
ssh -i "$SSH_KEY" ubuntu@$AWS_HOST << 'EOF'
    echo "Starting backend service..."
    sudo systemctl start bookmyhotel-backend.service
    
    # Wait a moment for backend to start
    sleep 5
    
    echo "Starting frontend service..."
    sudo systemctl start bookmyhotel-frontend.service
    
    # Wait for services to be ready
    sleep 10
    
    echo "✅ Services started"
EOF

# Verify deployment
echo "🔍 Verifying deployment..."
sleep 15  # Give services time to fully start

# Check service status
echo "Checking service status..."
ssh -i "$SSH_KEY" ubuntu@$AWS_HOST << 'EOF'
    echo "Backend service status:"
    sudo systemctl is-active bookmyhotel-backend.service
    
    echo "Frontend service status:"
    sudo systemctl is-active bookmyhotel-frontend.service
    
    echo "Nginx service status:"
    sudo systemctl is-active nginx
EOF

# Test endpoints
echo "Testing endpoints..."
echo "  - Testing backend health check..."
if curl -s "http://$AWS_HOST/actuator/health" | grep -q "UP"; then
    echo "✅ Backend health check passed"
else
    echo "⚠️  Backend health check failed - check logs"
fi

echo "  - Testing frontend..."
if curl -s -o /dev/null -w "%{http_code}" "http://$AWS_HOST:3000" | grep -q "200"; then
    echo "✅ Frontend accessible"
else
    echo "⚠️  Frontend not accessible - check logs"
fi

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo "Frontend URL: http://$AWS_HOST:3000"
echo "Backend API: http://$AWS_HOST/api/"
echo "Health Check: http://$AWS_HOST/actuator/health"
echo ""
echo "📋 Management Commands:"
echo "ssh -i $SSH_KEY ubuntu@$AWS_HOST"
echo "sudo systemctl status bookmyhotel-backend.service"
echo "sudo systemctl status bookmyhotel-frontend.service"
echo "sudo journalctl -u bookmyhotel-backend.service -f"
echo "sudo journalctl -u bookmyhotel-frontend.service -f"
echo ""
echo "📁 Deployed Files:"
echo "Backend: /opt/bookmyhotel/backend/"
echo "Frontend: /opt/bookmyhotel/frontend/"
echo "Config: /opt/bookmyhotel/backend/application-prod.properties"
echo "Logs: /opt/bookmyhotel/logs/"
