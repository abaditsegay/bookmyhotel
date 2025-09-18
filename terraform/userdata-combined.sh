#!/bin/bash
# Combined UserData Script for BookMyHotel - Frontend & Backend on Single Instance
# This script installs Java 17, Node.js 18, PostgreSQL client, Nginx and sets up both applications

set -e

# Log everything to a file for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== BookMyHotel Combined Deployment Started at $(date) ==="

# Update system packages
echo "Updating system packages..."
apt-get update -y
apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    vim \
    htop \
    nginx \
    mysql-client \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Java 17 (OpenJDK)
echo "Installing Java 17..."
apt-get install -y openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo "export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64" >> /home/ubuntu/.bashrc

# Install Maven
echo "Installing Maven..."
apt-get install -y maven

# Install Node.js 18
echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally for process management
echo "Installing PM2..."
npm install -g pm2

# Create application directory
APP_DIR="/home/ubuntu/bookmyhotel"
mkdir -p $APP_DIR
chown ubuntu:ubuntu $APP_DIR

# Clone the repository
echo "Cloning repository..."
cd $APP_DIR
sudo -u ubuntu git clone ${github_repo_url} .
sudo -u ubuntu git checkout ${github_branch}

# Set up backend application
echo "Setting up backend application..."
cd $APP_DIR/backend

# Create application.properties for production
cat > src/main/resources/application.properties << EOF
# Production Configuration
server.port=${backend_port}
server.servlet.context-path=/

# Database Configuration
spring.datasource.url=jdbc:mysql://${database_endpoint}:${database_port}/${database_name}?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${database_username}
spring.datasource.password=${database_password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Connection Pool Configuration
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT Configuration
app.jwt.secret=${jwt_secret}
app.jwt.expiration=86400000

# Microsoft Graph OAuth2 Configuration
microsoft.graph.client-id=${microsoft_graph_client_id}
microsoft.graph.tenant-id=${microsoft_graph_tenant_id}
microsoft.graph.client-secret=${microsoft_graph_client_secret}
microsoft.graph.scopes=https://graph.microsoft.com/.default

# Email Configuration
app.email.from=${app_email_from}

# CORS Configuration
app.cors.allowed-origins=http://localhost:${frontend_port},http://*:${frontend_port}
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
app.cors.allowed-headers=*
app.cors.allow-credentials=true

# Logging Configuration
logging.level.root=INFO
logging.level.com.bookmyhotel=INFO
logging.file.name=/var/log/bookmyhotel/backend.log

# Actuator Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized

# Profile
spring.profiles.active=${app_environment}
EOF

# Build the backend application
echo "Building backend application..."
sudo -u ubuntu mvn clean package -DskipTests

# Create systemd service for backend
cat > /etc/systemd/system/bookmyhotel-backend.service << EOF
[Unit]
Description=BookMyHotel Backend Application
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=$APP_DIR/backend
ExecStart=/usr/bin/java -jar target/*.jar
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=bookmyhotel-backend
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

[Install]
WantedBy=multi-user.target
EOF

# Set up frontend application
echo "Setting up frontend application..."
cd $APP_DIR/frontend

# Create .env file for production
cat > .env << EOF
# Production Environment Variables
REACT_APP_API_BASE_URL=http://localhost:${backend_port}
REACT_APP_API_TIMEOUT=10000
REACT_APP_NAME="Manage My Hotel"
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
EOF

# Install frontend dependencies and build
echo "Installing frontend dependencies and building..."
sudo -u ubuntu npm install
sudo -u ubuntu npm run build

# Set up Nginx configuration
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/bookmyhotel << EOF
# BookMyHotel Nginx Configuration
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    # Frontend - Serve React build files
    location / {
        root $APP_DIR/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API - Proxy to Spring Boot
    location /api/ {
        proxy_pass http://localhost:${backend_port}/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Handle CORS preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Backend Actuator endpoints
    location /actuator/ {
        proxy_pass http://localhost:${backend_port}/actuator/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Frontend direct access (for development)
    location :${frontend_port}/ {
        return 301 /;
    }
    
    # Backend direct access (for API testing)
    location :${backend_port}/ {
        proxy_pass http://localhost:${backend_port}/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Create log directories
mkdir -p /var/log/bookmyhotel
chown ubuntu:ubuntu /var/log/bookmyhotel

# Create PM2 ecosystem file for additional frontend process (optional)
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bookmyhotel-frontend',
    script: 'serve',
    args: '-s build -l ${frontend_port}',
    cwd: '$APP_DIR/frontend',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

chown ubuntu:ubuntu $APP_DIR/ecosystem.config.js

# Install serve globally for serving React app directly (optional)
npm install -g serve

# Start services
echo "Starting services..."

# Start and enable backend service
systemctl daemon-reload
systemctl start bookmyhotel-backend
systemctl enable bookmyhotel-backend

# Start and reload Nginx
systemctl start nginx
systemctl enable nginx
systemctl reload nginx

# Set up automatic startup for PM2 (optional direct frontend serving)
sudo -u ubuntu pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo -u ubuntu pm2 start $APP_DIR/ecosystem.config.js
sudo -u ubuntu pm2 save

# Create health check script
cat > /home/ubuntu/health-check.sh << 'EOF'
#!/bin/bash
echo "=== Health Check $(date) ==="

# Check backend service
echo "Backend Service Status:"
systemctl status bookmyhotel-backend --no-pager -l

# Check backend port
echo "Backend Port Check:"
netstat -tlnp | grep :${backend_port}

# Check backend health endpoint
echo "Backend Health Endpoint:"
curl -s http://localhost:${backend_port}/actuator/health || echo "Health endpoint not responding"

# Check Nginx status
echo "Nginx Status:"
systemctl status nginx --no-pager -l

# Check Nginx port
echo "Nginx Port Check:"
netstat -tlnp | grep :80

# Check frontend files
echo "Frontend Build Files:"
ls -la $APP_DIR/frontend/build/ | head -5

# Test frontend access
echo "Frontend Access Test:"
curl -s -I http://localhost/ | head -3

# Database connectivity test
echo "Database Connectivity:"
mysql -h ${database_endpoint} -P ${database_port} -u ${database_username} -p${database_password} -e "SELECT 1;" ${database_name} && echo "Database connection successful" || echo "Database connection failed"

echo "=== Health Check Complete ==="
EOF

chmod +x /home/ubuntu/health-check.sh
chown ubuntu:ubuntu /home/ubuntu/health-check.sh

# Wait for services to start
echo "Waiting for services to initialize..."
sleep 30

# Run initial health check
echo "Running initial health check..."
/home/ubuntu/health-check.sh

echo "=== BookMyHotel Combined Deployment Completed at $(date) ==="

# Final service status
systemctl status bookmyhotel-backend --no-pager -l
systemctl status nginx --no-pager -l
sudo -u ubuntu pm2 list

echo "=== Deployment Summary ==="
echo "Frontend URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):80"
echo "Backend URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):${backend_port}"
echo "Health Check: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):${backend_port}/actuator/health"
echo "SSH Access: ssh -i ~/.ssh/your-key.pem ubuntu@$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "=== End of Deployment ==="
