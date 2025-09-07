#!/bin/bash

SERVER_IP="$1"
DATABASE_ENDPOINT="$2"

if [ -z "$SERVER_IP" ] || [ -z "$DATABASE_ENDPOINT" ]; then
    echo "Usage: $0 <server-ip> <database-endpoint>"
    echo "Example: $0 54.235.230.218 ls-xxx.c6nugs2ycbsp.us-east-1.rds.amazonaws.com"
    exit 1
fi

echo "🚀 Simple Direct Deployment to AWS..."
echo "Backend will run directly on port 8080"
echo "Frontend will connect directly to http://$SERVER_IP:8080"

# 1. Build Backend Locally
echo "📦 Building backend locally..."
cd backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
cd ..

# 2. Build Frontend Locally with Direct Connection
echo "📦 Building frontend with direct backend connection..."
cd frontend
REACT_APP_API_URL=http://$SERVER_IP:8080/api npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

# 3. Deploy to AWS
echo "📤 Deploying to AWS..."

# Create directories
ssh -i ~/.ssh/bookmyhotel-aws ubuntu@$SERVER_IP "mkdir -p /opt/bookmyhotel/{backend,frontend}"

# Copy backend JAR
echo "Copying backend JAR..."
scp -i ~/.ssh/bookmyhotel-aws backend/target/backend-1.0.0.jar ubuntu@$SERVER_IP:/opt/bookmyhotel/backend/

# Copy application properties
scp -i ~/.ssh/bookmyhotel-aws application-simple.properties ubuntu@$SERVER_IP:/opt/bookmyhotel/backend/application.properties

# Copy frontend build
echo "Copying frontend build..."
scp -i ~/.ssh/bookmyhotel-aws -r frontend/build/* ubuntu@$SERVER_IP:/opt/bookmyhotel/frontend/

# 4. Setup Services
echo "🔧 Setting up services..."
ssh -i ~/.ssh/bookmyhotel-aws ubuntu@$SERVER_IP "
# Install Java 21 if needed
if ! java -version 2>&1 | grep -q '21\.'; then
    sudo apt-get update
    sudo apt-get install -y openjdk-21-jdk
fi

# Create simple backend service
sudo tee /etc/systemd/system/bookmyhotel-backend.service << 'EOF'
[Unit]
Description=BookMyHotel Backend - Direct Access
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel/backend
ExecStart=/usr/bin/java -jar backend-1.0.0.jar --spring.config.location=file:./application.properties
Restart=always
RestartSec=10
Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

[Install]
WantedBy=multi-user.target
EOF

# Simple Nginx for frontend only (port 80)
sudo tee /etc/nginx/sites-available/bookmyhotel << 'EOF'
server {
    listen 80;
    server_name _;
    root /opt/bookmyhotel/frontend;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Enable services
sudo ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend
sudo systemctl restart bookmyhotel-backend
sudo systemctl reload nginx

echo '✅ Deployment complete!'
echo 'Frontend: http://$SERVER_IP (port 80)'
echo 'Backend: http://$SERVER_IP:8080'
echo 'Health: http://$SERVER_IP:8080/actuator/health'
"

echo ""
echo "🎉 SIMPLE DEPLOYMENT COMPLETE!"
echo "================================"
echo "Frontend URL: http://$SERVER_IP"
echo "Backend URL: http://$SERVER_IP:8080" 
echo "API Health: http://$SERVER_IP:8080/actuator/health"
echo ""
echo "The frontend connects directly to the backend on port 8080"
echo "No reverse proxy complexity!"
