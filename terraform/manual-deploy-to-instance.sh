#!/bin/bash
# Deploy BookMyHotel to an existing AWS Lightsail instance
# Usage: ./manual-deploy-to-instance.sh [INSTANCE_IP] [DATABASE_HOST]

INSTANCE_IP=$1
DATABASE_HOST=$2

if [ -z "$INSTANCE_IP" ] || [ -z "$DATABASE_HOST" ]; then
    echo "Usage: $0 [INSTANCE_IP] [DATABASE_HOST]"
    echo "Example: $0 3.83.45.123 ls-a1b2c3d4e5f6g7h8.cz123abc456def.us-east-1.rds.amazonaws.com"
    exit 1
fi

echo "🚀 Deploying BookMyHotel to AWS Lightsail Instance"
echo "Instance IP: $INSTANCE_IP"
echo "Database Host: $DATABASE_HOST"
echo ""

# Create deployment script
cat > deploy-to-server.sh << 'EOL'
#!/bin/bash
# Server-side deployment script for BookMyHotel

set -e

# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Java 11
sudo apt-get install -y openjdk-11-jdk

# Install Maven
sudo apt-get install -y maven

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /opt/bookmyhotel
sudo chown ubuntu:ubuntu /opt/bookmyhotel
cd /opt/bookmyhotel

# Clone repository
git clone https://github.com/abaditsegay/bookmyhotel.git .
git checkout stage

# Configure backend
cd backend
cat > src/main/resources/application-aws.properties << EOF
# AWS Production Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://${DATABASE_HOST}:3306/bookmyhotel?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=admin
spring.datasource.password=BookMyHotel2024SecureDB!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
app.jwt.secret=bookmyhotelverylongsecretkeythatisatleast512bitslongforsecuritywithjwtandhs512algorithmthisisasupersecurekey2024bookmyhotelapp
app.jwt.expiration=86400000

# Microsoft Graph Configuration
microsoft.graph.client-id=8e1e8dd6-e1df-48a9-9ffd-499aa6b04130
microsoft.graph.tenant-id=d7e8b101-46f9-4942-8442-45e0903b9467
microsoft.graph.client-secret=\${MICROSOFT_GRAPH_CLIENT_SECRET}
microsoft.graph.scopes=https://graph.microsoft.com/.default

# Email Configuration
app.email.from=noreply@251solutions.com

# CORS Configuration
app.cors.allowed-origins=http://${INSTANCE_IP}:3000,http://localhost:3000
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
app.cors.allowed-headers=*
app.cors.allow-credentials=true

# Logging
logging.level.com.bookmyhotel=INFO
EOF

# Build backend
echo "Building backend..."
mvn clean package -DskipTests -Dspring.profiles.active=aws

# Install frontend dependencies
echo "Setting up frontend..."
cd ../frontend
npm install

# Configure frontend environment
cat > .env << EOF
REACT_APP_API_BASE_URL=http://${INSTANCE_IP}:8080/api
REACT_APP_ENVIRONMENT=production
EOF

# Build frontend
npm run build

# Create systemd service for backend
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << EOF
[Unit]
Description=BookMyHotel Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel/backend
ExecStart=/usr/bin/java -jar target/bookmyhotel-backend-1.0.0.jar --spring.profiles.active=aws
Restart=always
RestartSec=10
Environment=JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

[Install]
WantedBy=multi-user.target
EOF

# Install and configure Nginx
sudo apt-get install -y nginx

# Configure Nginx
sudo tee /etc/nginx/sites-available/bookmyhotel > /dev/null << EOF
server {
    listen 80;
    server_name _;

    # Frontend (React)
    location / {
        root /opt/bookmyhotel/frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend health check
    location /actuator/ {
        proxy_pass http://localhost:8080/actuator/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Start backend service
sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend.service
sudo systemctl start bookmyhotel-backend.service

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Service Status:"
sudo systemctl status bookmyhotel-backend.service --no-pager
echo ""
echo "🌐 Your application should be available at:"
echo "   Frontend: http://${INSTANCE_IP}"
echo "   Backend API: http://${INSTANCE_IP}/api"
echo "   Health Check: http://${INSTANCE_IP}/actuator/health"
echo ""
echo "📊 To monitor logs:"
echo "   Backend: sudo journalctl -fu bookmyhotel-backend.service"
echo "   Nginx: sudo tail -f /var/log/nginx/access.log"
EOL

# Make deployment script executable
chmod +x deploy-to-server.sh

echo "📤 Copying deployment script to server..."
scp -i ~/.ssh/bookmyhotel-aws -o StrictHostKeyChecking=no deploy-to-server.sh ubuntu@$INSTANCE_IP:~/

echo "🚀 Running deployment on server..."
ssh -i ~/.ssh/bookmyhotel-aws -o StrictHostKeyChecking=no ubuntu@$INSTANCE_IP "chmod +x deploy-to-server.sh && ./deploy-to-server.sh"

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌐 Your BookMyHotel application is now available at:"
echo "   http://$INSTANCE_IP"
echo ""
echo "🔧 To SSH into your server:"
echo "   ssh -i ~/.ssh/bookmyhotel-aws ubuntu@$INSTANCE_IP"
echo ""
echo "📊 Monitor your application:"
echo "   Backend logs: ssh -i ~/.ssh/bookmyhotel-aws ubuntu@$INSTANCE_IP 'sudo journalctl -fu bookmyhotel-backend.service'"
echo "   System status: ssh -i ~/.ssh/bookmyhotel-aws ubuntu@$INSTANCE_IP 'sudo systemctl status bookmyhotel-backend nginx'"
