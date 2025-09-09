#!/bin/bash
# Complete the deployment for BookMyHotel
# Run this after Maven build completes

set -e

INSTANCE_IP="54.235.230.218"
DATABASE_HOST="ls-8311e96711f66659c24704361078cb72180ec867.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"

echo "🚀 Completing BookMyHotel deployment..."

# Setup frontend
echo "📦 Setting up React frontend..."
cd /opt/bookmyhotel/frontend

# Install dependencies if not done
npm install

# Create production environment file
cat > .env << EOF
REACT_APP_API_BASE_URL=http://${INSTANCE_IP}/api
REACT_APP_ENVIRONMENT=production
EOF

# Build React app
echo "🔨 Building React frontend..."
npm run build

# Install and configure Nginx
echo "🔧 Installing Nginx..."
sudo apt-get update
sudo apt-get install -y nginx

# Create Nginx configuration
echo "🔧 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/bookmyhotel > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (React)
    location / {
        root /opt/bookmyhotel/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Access-Control-Allow-Origin *;
    }

    # Backend health check
    location /actuator/ {
        proxy_pass http://localhost:8080/actuator/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Create systemd service for backend
echo "🔧 Creating backend service..."
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'EOF'
[Unit]
Description=BookMyHotel Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel/backend
ExecStart=/usr/bin/java -jar target/backend-1.0.0.jar --spring.profiles.active=aws
Restart=always
RestartSec=10
Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
Environment=JAVA_OPTS=-Xms512m -Xmx1g

[Install]
WantedBy=multi-user.target
EOF

# Test and start services
echo "🚀 Starting services..."

# Test nginx configuration
sudo nginx -t

# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Start backend service
sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend.service
sudo systemctl start bookmyhotel-backend.service

# Wait a moment for services to start
sleep 10

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Service Status:"
sudo systemctl status nginx --no-pager -l | head -10
echo ""
sudo systemctl status bookmyhotel-backend.service --no-pager -l | head -10
echo ""
echo "🌐 Your application is available at:"
echo "   Frontend: http://${INSTANCE_IP}"
echo "   Backend API: http://${INSTANCE_IP}/api"
echo "   Health Check: http://${INSTANCE_IP}/actuator/health"
echo ""
echo "🔍 Test the application:"
echo "   curl http://${INSTANCE_IP}/actuator/health"
