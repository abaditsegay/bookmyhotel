#!/bin/bash

# BookMyHotel EC2 User Data Script
# This script sets up the complete environment on Ubuntu 22.04

set -e

# Logging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting BookMyHotel deployment setup..."

# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y \
    docker.io \
    docker-compose \
    nginx \
    openjdk-21-jdk \
    maven \
    nodejs \
    npm \
    git \
    curl \
    wget \
    unzip \
    certbot \
    python3-certbot-nginx \
    awscli \
    jq

# Enable and start Docker
systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# Install latest Node.js (18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Create application directories
mkdir -p /opt/bookmyhotel/{backend,frontend,mysql-data,logs}
chown -R ubuntu:ubuntu /opt/bookmyhotel

# Environment variables
cat > /opt/bookmyhotel/.env << 'EOF'
# MySQL Configuration
MYSQL_ROOT_PASSWORD=${mysql_root_password}
MYSQL_DATABASE=bookmyhotel
MYSQL_USER=bookmyhotel
MYSQL_PASSWORD=${mysql_root_password}

# Backend Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/bookmyhotel
SPRING_DATASOURCE_USERNAME=bookmyhotel
SPRING_DATASOURCE_PASSWORD=${mysql_root_password}
SPRING_PROFILES_ACTIVE=production

# JWT Configuration
JWT_SECRET_KEY=${jwt_secret_key}

# Microsoft Graph OAuth2
MICROSOFT_GRAPH_CLIENT_ID=${microsoft_graph_client_id}
MICROSOFT_GRAPH_TENANT_ID=${microsoft_graph_tenant_id}
MICROSOFT_GRAPH_CLIENT_SECRET=${microsoft_graph_client_secret}

# Stripe Configuration
STRIPE_SECRET_KEY=${stripe_secret_key}

# Email Configuration
APP_EMAIL_FROM=${app_email_from}
APP_FRONTEND_URL=https://${domain_name}/bookmyhotel

# Application Configuration
SERVER_ADDRESS=127.0.0.1
SERVER_PORT=8080
EOF

# Secure the environment file
chmod 600 /opt/bookmyhotel/.env
chown ubuntu:ubuntu /opt/bookmyhotel/.env

# Setup MySQL with Docker
cat > /opt/bookmyhotel/docker-compose.yml << 'EOF'
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: bookmyhotel-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${mysql_root_password}
      MYSQL_DATABASE: bookmyhotel
      MYSQL_USER: bookmyhotel
      MYSQL_PASSWORD: ${mysql_root_password}
    ports:
      - "127.0.0.1:3306:3306"
    volumes:
      - /opt/bookmyhotel/mysql-data:/var/lib/mysql
      - /opt/bookmyhotel/mysql-init:/docker-entrypoint-initdb.d
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
EOF

# Create MySQL initialization script for security
mkdir -p /opt/bookmyhotel/mysql-init
cat > /opt/bookmyhotel/mysql-init/01-security.sql << 'EOF'
-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';

-- Create application user with limited privileges
CREATE USER IF NOT EXISTS 'bookmyhotel'@'localhost' IDENTIFIED BY '${mysql_root_password}';
GRANT SELECT, INSERT, UPDATE, DELETE ON bookmyhotel.* TO 'bookmyhotel'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;
EOF

# Secure MySQL initialization files
chmod 600 /opt/bookmyhotel/mysql-init/01-security.sql
chown -R ubuntu:ubuntu /opt/bookmyhotel/mysql-init

# Start MySQL
cd /opt/bookmyhotel
docker-compose up -d mysql

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
sleep 30

# Clone application repository
cd /opt/bookmyhotel
git clone https://github.com/abaditsegay/bookmyhotel.git app
cd app
git checkout stage

# Build Backend
cd /opt/bookmyhotel/app/backend
mvn clean package -DskipTests

# Create backend service
cat > /etc/systemd/system/bookmyhotel-backend.service << 'EOF'
[Unit]
Description=BookMyHotel Backend
After=network.target
Requires=docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel/app/backend
EnvironmentFile=/opt/bookmyhotel/.env
ExecStart=/usr/bin/java -jar target/*.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Build Frontend
cd /opt/bookmyhotel/app/frontend

# Create production environment file
cat > .env.production << 'EOF'
REACT_APP_API_URL=/bookmyhotel/api
GENERATE_SOURCEMAP=false
EOF

npm install
npm run build

# Copy frontend build to nginx directory
mkdir -p /var/www/bookmyhotel
cp -r build/* /var/www/bookmyhotel/
chown -R www-data:www-data /var/www/bookmyhotel

# Configure Nginx
cat > /etc/nginx/sites-available/bookmyhotel << 'EOF'
server {
    listen 80;
    server_name ${domain_name};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend - Static files and React routing
    location /bookmyhotel {
        alias /var/www/bookmyhotel;
        try_files $uri $uri/ /bookmyhotel/index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - Proxy to internal backend (SECURE)
    location /bookmyhotel/api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block direct access to sensitive paths
    location ~ /(\.env|\.git|docker-compose|Dockerfile) {
        deny all;
        return 404;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Start services
systemctl enable nginx
systemctl start nginx
systemctl enable bookmyhotel-backend
systemctl start bookmyhotel-backend

# Setup SSL with Let's Encrypt (will run after DNS is configured)
cat > /opt/bookmyhotel/setup-ssl.sh << 'EOF'
#!/bin/bash
echo "Setting up SSL certificate..."
certbot --nginx -d ${domain_name} --non-interactive --agree-tos --email admin@${domain_name}
systemctl enable certbot.timer
EOF

chmod +x /opt/bookmyhotel/setup-ssl.sh

# Setup log rotation
cat > /etc/logrotate.d/bookmyhotel << 'EOF'
/opt/bookmyhotel/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

# Setup CloudWatch agent (optional)
cat > /opt/bookmyhotel/cloudwatch-config.json << 'EOF'
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/nginx/access.log",
                        "log_group_name": "/aws/ec2/bookmyhotel",
                        "log_stream_name": "{instance_id}/nginx/access"
                    },
                    {
                        "file_path": "/var/log/nginx/error.log", 
                        "log_group_name": "/aws/ec2/bookmyhotel",
                        "log_stream_name": "{instance_id}/nginx/error"
                    },
                    {
                        "file_path": "/opt/bookmyhotel/logs/application.log",
                        "log_group_name": "/aws/ec2/bookmyhotel", 
                        "log_stream_name": "{instance_id}/application"
                    }
                ]
            }
        }
    }
}
EOF

# Create status check script
cat > /opt/bookmyhotel/status-check.sh << 'EOF'
#!/bin/bash
echo "=== BookMyHotel Status Check ==="
echo "Timestamp: $(date)"
echo ""

echo "=== Docker Containers ==="
docker ps

echo ""
echo "=== Backend Service ==="
systemctl status bookmyhotel-backend --no-pager

echo ""
echo "=== Nginx Status ==="
systemctl status nginx --no-pager

echo ""
echo "=== Port Check ==="
netstat -tlnp | grep -E ':(80|443|3306|8080|3000)'

echo ""
echo "=== Backend Health ==="
curl -s http://127.0.0.1:8080/actuator/health || echo "Backend not responding"

echo ""
echo "=== Frontend Check ==="
curl -s -o /dev/null -w "%%{http_code}" http://localhost/bookmyhotel/

echo ""
echo "=== MySQL Check ==="
docker exec bookmyhotel-mysql mysqladmin ping -h localhost -u root -p${mysql_root_password} 2>/dev/null && echo "MySQL is running" || echo "MySQL not responding"
EOF

chmod +x /opt/bookmyhotel/status-check.sh

# Setup firewall (UFW)
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22
ufw allow 80
ufw allow 443

echo "Setup completed! Check status with: /opt/bookmyhotel/status-check.sh"
echo "After DNS is configured, run: /opt/bookmyhotel/setup-ssl.sh"

# Final status check
echo "=== Final Status Check ==="
sleep 10
/opt/bookmyhotel/status-check.sh

echo "BookMyHotel deployment setup completed!"
