#!/bin/bash
# User Data Script for BookMyHotel Backend Instance (Spring Boot on port 8080)

set -e

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1

echo "Starting BookMyHotel Backend setup at $(date)"

# Update system
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y \
    openjdk-17-jdk \
    maven \
    git \
    curl \
    wget \
    unzip \
    nginx \
    mysql-client \
    supervisor \
    htop \
    vim \
    software-properties-common

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> /etc/environment
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> /etc/environment
source /etc/environment

# Create application user
useradd -m -s /bin/bash bookmyhotel
usermod -aG sudo bookmyhotel

# Create application directory
mkdir -p /opt/bookmyhotel
chown bookmyhotel:bookmyhotel /opt/bookmyhotel

# Clone repository
cd /opt/bookmyhotel
sudo -u bookmyhotel git clone ${github_repo_url} .
sudo -u bookmyhotel git checkout ${github_branch}

# Wait for database to be available
echo "Waiting for database to be ready..."
until mysql -h ${database_host} -P ${database_port} -u ${database_username} -p${database_password} -e "SELECT 1" >/dev/null 2>&1; do
    echo "Database not ready yet, waiting 30 seconds..."
    sleep 30
done
echo "Database is ready!"

# Create application.properties for production
cat > /opt/bookmyhotel/backend/src/main/resources/application-production.properties << EOF
# Production Configuration for BookMyHotel Backend
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://${database_host}:${database_port}/${database_name}?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=${database_username}
spring.datasource.password=${database_password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Flyway Configuration
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# JWT Configuration
app.jwt.secret=${jwt_secret}
app.jwt.expiration=86400000

# Logging Configuration
logging.level.root=INFO
logging.level.com.bookmyhotel=INFO
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.file.name=/var/log/bookmyhotel/backend.log

# CORS Configuration
app.cors.allowed-origins=http://*:3000,https://*
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
app.cors.allowed-headers=*

# Profile
spring.profiles.active=${app_environment}

# Actuator endpoints
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
EOF

# Create log directory
mkdir -p /var/log/bookmyhotel
chown bookmyhotel:bookmyhotel /var/log/bookmyhotel

# Build the application
cd /opt/bookmyhotel/backend
sudo -u bookmyhotel mvn clean package -DskipTests

# Create systemd service for backend
cat > /etc/systemd/system/bookmyhotel-backend.service << EOF
[Unit]
Description=BookMyHotel Backend Service
After=network.target

[Service]
Type=simple
User=bookmyhotel
Group=bookmyhotel
WorkingDirectory=/opt/bookmyhotel/backend
ExecStart=/usr/bin/java -Xmx512m -Xms256m -jar target/bookmyhotel-*.jar --spring.profiles.active=production
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-backend

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx as reverse proxy
cat > /etc/nginx/sites-available/bookmyhotel-backend << EOF
server {
    listen 80;
    server_name _;
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8080/actuator/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Direct access to backend on port 8080
    location / {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/bookmyhotel-backend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

# Start and enable services
systemctl daemon-reload
systemctl enable bookmyhotel-backend
systemctl enable nginx
systemctl start nginx
systemctl start bookmyhotel-backend

# Setup log rotation
cat > /etc/logrotate.d/bookmyhotel << EOF
/var/log/bookmyhotel/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 bookmyhotel bookmyhotel
    postrotate
        systemctl reload bookmyhotel-backend
    endscript
}
EOF

# Create deployment script for updates
cat > /opt/bookmyhotel/deploy-backend.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting backend deployment at $(date)"

# Pull latest changes
git pull origin ${github_branch}

# Build application
cd backend
mvn clean package -DskipTests

# Restart service
sudo systemctl restart bookmyhotel-backend

echo "Backend deployment completed at $(date)"
EOF

chmod +x /opt/bookmyhotel/deploy-backend.sh
chown bookmyhotel:bookmyhotel /opt/bookmyhotel/deploy-backend.sh

# Setup firewall
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 8080
ufw allow from ${database_host} to any port 3306

# Create health check script
cat > /opt/bookmyhotel/health-check.sh << EOF
#!/bin/bash
# Health check script for backend

BACKEND_URL="http://localhost:8080/actuator/health"
MAX_RETRIES=3
RETRY_COUNT=0

while [ \$RETRY_COUNT -lt \$MAX_RETRIES ]; do
    if curl -f -s \$BACKEND_URL > /dev/null; then
        echo "Backend is healthy"
        exit 0
    else
        echo "Backend health check failed, attempt \$((RETRY_COUNT + 1))"
        RETRY_COUNT=\$((RETRY_COUNT + 1))
        sleep 10
    fi
done

echo "Backend is unhealthy after \$MAX_RETRIES attempts"
exit 1
EOF

chmod +x /opt/bookmyhotel/health-check.sh

# Wait for application to start
echo "Waiting for backend application to start..."
sleep 60

# Final health check
if /opt/bookmyhotel/health-check.sh; then
    echo "Backend setup completed successfully at $(date)"
else
    echo "Backend setup completed but health check failed at $(date)"
fi

# Log system status
systemctl status bookmyhotel-backend --no-pager
systemctl status nginx --no-pager
