#!/bin/bash

# Backend Deployment Script for AWS Lightsail
# This script deploys the Spring Boot backend to your Lightsail instance

set -e

# Configuration
LIGHTSAIL_IP="44.204.49.94"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="$HOME/.ssh/bookmyhotel-aws"
CONFIG_ENV="${1:-prod}"  # Allow specifying prod or prod-new (default: prod)
MEMORY_XMX="${2:-1g}"    # Configurable max memory (default: 1g)
MEMORY_XMS="${3:-512m}"  # Configurable initial memory (default: 512m)
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

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key file not found: $SSH_KEY"
    print_error "Make sure you're using the correct path to your PRIVATE key file"
    exit 1
fi

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

print_status "Deploying to: $LIGHTSAIL_IP"
print_status "Using SSH key: $SSH_KEY"
print_status "Configuration: application-${CONFIG_ENV}.properties"
print_status "Memory settings: -Xmx${MEMORY_XMX} -Xms${MEMORY_XMS}"

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

# Step 2.5: Backup existing JAR
print_status "Backing up current JAR (if exists)..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    if [ -f /opt/bookmyhotel/app.jar ]; then
        cp /opt/bookmyhotel/app.jar /opt/bookmyhotel/app.jar.backup
        echo "✅ Backup created: app.jar.backup"
    else
        echo "No existing JAR to backup (first deployment)"
    fi
EOF

# Step 3: Copy JAR file to Lightsail instance
print_status "Uploading JAR file to Lightsail instance..."
scp $SSH_OPTS target/*.jar $LIGHTSAIL_USER@$LIGHTSAIL_IP:/opt/bookmyhotel/app.jar

# Step 4: Copy application properties
print_status "Uploading production configuration..."
CONFIG_FILE="$SCRIPT_DIR/../config/application-${CONFIG_ENV}.properties"
if [ -f "$CONFIG_FILE" ]; then
    scp $SSH_OPTS "$CONFIG_FILE" $LIGHTSAIL_USER@$LIGHTSAIL_IP:/opt/bookmyhotel/config/
    print_status "Uploaded: application-${CONFIG_ENV}.properties"
else
    print_error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Step 5: Create systemd service
print_status "Creating systemd service..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel
ExecStart=/usr/bin/java -jar -Xmx${MEMORY_XMX} -Xms${MEMORY_XMS} -Dspring.profiles.active=prod app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-backend

# Environment variables
Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
SERVICE

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend.service
EOF

# Step 5.5: Apply required schema patches before restart
print_status "Applying database schema patches (safe, idempotent)..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
set -e
CONFIG_FILE="/opt/bookmyhotel/config/application-${CONFIG_ENV}.properties"

if [ ! -f "\$CONFIG_FILE" ]; then
    echo "❌ Config file not found: \$CONFIG_FILE"
    exit 1
fi

DB_URL=\$(grep '^spring.datasource.url=' "\$CONFIG_FILE" | cut -d'=' -f2-)
DB_USER=\$(grep '^spring.datasource.username=' "\$CONFIG_FILE" | cut -d'=' -f2-)
DB_PASS=\$(grep '^spring.datasource.password=' "\$CONFIG_FILE" | cut -d'=' -f2-)

if [ -z "\$DB_URL" ] || [ -z "\$DB_USER" ] || [ -z "\$DB_PASS" ]; then
    echo "❌ Could not parse datasource properties from \$CONFIG_FILE"
    exit 1
fi

if ! command -v mysql >/dev/null 2>&1; then
    echo "Installing mysql client..."
    sudo apt-get update -y >/dev/null
    sudo apt-get install -y mysql-client >/dev/null
fi

DB_URL_NO_PREFIX=\$(echo "\$DB_URL" | sed -E 's#^jdbc:mysql://##')
DB_URL_NO_PARAMS=\$(echo "\$DB_URL_NO_PREFIX" | sed -E 's/\?.*$//')
DB_HOST_PORT=\$(echo "\$DB_URL_NO_PARAMS" | cut -d'/' -f1)
DB_NAME=\$(echo "\$DB_URL_NO_PARAMS" | cut -d'/' -f2)
DB_HOST=\$(echo "\$DB_HOST_PORT" | cut -d':' -f1)
DB_PORT=\$(echo "\$DB_HOST_PORT" | cut -s -d':' -f2)
DB_PORT=\${DB_PORT:-3306}

mysql -h "\$DB_HOST" -P "\$DB_PORT" -u "\$DB_USER" -p"\$DB_PASS" "\$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS payment_callback_events (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        provider VARCHAR(32) NOT NULL,
        transaction_id VARCHAR(128) NOT NULL,
        provider_transaction_id VARCHAR(128),
        event_id VARCHAR(128),
        callback_status VARCHAR(32) NOT NULL,
        idempotency_key VARCHAR(64) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_payment_callback_idempotency (idempotency_key),
        INDEX idx_payment_callback_transaction (transaction_id),
        INDEX idx_payment_callback_provider (provider),
        INDEX idx_payment_callback_created_at (created_at)
);

    CREATE TABLE IF NOT EXISTS system_settings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL,
        setting_value VARCHAR(255) NOT NULL,
        description VARCHAR(500),
        updated_by VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_system_settings_key (setting_key)
    );

    INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
    VALUES (
        'payment.gateway.mode',
        'MOCK',
        'Controls whether booking checkout uses mock payment processing or live Ethiopian wallet gateways.',
        'deployment-script'
    )
    ON DUPLICATE KEY UPDATE
        description = VALUES(description);
SQL

echo "✅ Database schema patch applied successfully"
EOF

# Step 6: Start the service
print_status "Starting backend service..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    sudo systemctl stop bookmyhotel-backend.service 2>/dev/null || true
    sudo systemctl start bookmyhotel-backend.service
    
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
print_status "Waiting for application to start (up to 3 minutes)..."

# Retry-based health check with 3-minute timeout
for i in {1..30}; do
    if ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "curl -sf http://localhost:8080/actuator/health" &>/dev/null; then
        echo ""  # New line after dots
        print_status "✅ Backend health check passed!"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo ""  # New line after dots
        print_error "❌ Application failed to start within 3 minutes"
        print_error "Showing last 30 lines of service logs:"
        ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "sudo journalctl -u bookmyhotel-backend.service --no-pager --lines=30"
        print_warning "To rollback, run: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'cd /opt/bookmyhotel && cp app.jar.backup app.jar && sudo systemctl restart bookmyhotel-backend.service'"
        exit 1
    fi
    
    echo -n "."
    sleep 6
done

# Final status
print_status "🎉 Backend deployment completed successfully!"
print_status "Backend URL: http://$LIGHTSAIL_IP/api/"
print_status "Health Check: http://$LIGHTSAIL_IP/actuator/health"
print_status ""
print_status "To view logs: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo journalctl -u bookmyhotel-backend.service -f'"
print_status "To restart service: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo systemctl restart bookmyhotel-backend.service'"
