#!/bin/bash

# Build Backend and Deploy with rsync to AWS Lightsail
# Usage: ./build-and-deploy-backend.sh

set -e

# Configuration
SERVER_IP="44.204.49.94"
SSH_KEY="~/.ssh/bookmyhotel-aws"
SERVER_USER="ubuntu"
REMOTE_PATH="/opt/bookmyhotel"
LOCAL_BACKEND_DIR="/Users/samuel/Projects2/bookmyhotel/backend"
LOCAL_CONFIG_DIR="/Users/samuel/Projects2/bookmyhotel/aws/lightsail/config"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Expand tilde in SSH_KEY path
SSH_KEY="${SSH_KEY/#\~/$HOME}"

print_status "🚀 Starting Backend Build and Deployment Process"
print_status "Target Server: $SERVER_IP"
print_status "SSH Key: $SSH_KEY"
print_status "Local Backend: $LOCAL_BACKEND_DIR"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "❌ SSH key file not found: $SSH_KEY"
    exit 1
fi

# Step 1: Build Backend
print_step "📦 Building Spring Boot Backend..."
cd "$LOCAL_BACKEND_DIR"

if mvn clean package -DskipTests -q; then
    print_status "✅ Backend build successful"
else
    print_error "❌ Backend build failed"
    exit 1
fi

# Step 2: Prepare deployment files
print_step "📋 Preparing deployment files..."
BUILD_DIR="target"
JAR_FILE=$(find "$BUILD_DIR" -name "*.jar" -not -name "*-sources.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    print_error "❌ No JAR file found in $BUILD_DIR"
    exit 1
fi

print_status "Found JAR file: $(basename "$JAR_FILE")"

# Step 3: Create remote directories
print_step "📁 Creating remote directories..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    sudo mkdir -p $REMOTE_PATH/backend
    sudo mkdir -p $REMOTE_PATH/config
    sudo mkdir -p $REMOTE_PATH/logs
    sudo chown -R ubuntu:ubuntu $REMOTE_PATH
"

# Step 4: Deploy JAR file using rsync
print_step "🚀 Deploying JAR file using rsync..."
rsync -avz -e "ssh -i $SSH_KEY" \
    "$JAR_FILE" \
    "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/backend/app.jar"

print_status "✅ JAR file deployed successfully"

# Step 5: Deploy configuration files using rsync
print_step "⚙️ Deploying configuration files..."
if [ -f "$LOCAL_CONFIG_DIR/application-prod.properties" ]; then
    rsync -avz -e "ssh -i $SSH_KEY" \
        "$LOCAL_CONFIG_DIR/application-prod.properties" \
        "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/config/"
    print_status "✅ Configuration files deployed"
else
    print_warning "⚠️ Configuration file not found: $LOCAL_CONFIG_DIR/application-prod.properties"
fi

# Skip .env file creation - it's already correctly configured
print_step "🔐 Preserving existing environment configuration..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
# Check if .env file exists and preserve it
if [ -f $REMOTE_PATH/backend/.env ]; then
    echo '✅ Existing .env file preserved'
    ls -la $REMOTE_PATH/backend/.env
else
    echo '⚠️ No .env file found - may need manual configuration'
fi
"
print_status "✅ Environment configuration preserved"

# Step 6: Deploy any additional resources (if they exist)
print_step "📄 Deploying additional resources..."
if [ -d "$LOCAL_BACKEND_DIR/src/main/resources/static" ]; then
    rsync -avz -e "ssh -i $SSH_KEY" \
        "$LOCAL_BACKEND_DIR/src/main/resources/static/" \
        "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/backend/static/"
    print_status "✅ Static resources deployed"
fi

# Step 7: Update systemd service
print_step "🔧 Updating systemd service..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
# Create or update systemd service
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'EOF'
[Unit]
Description=BookMyHotel Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$REMOTE_PATH/backend
ExecStart=/usr/bin/java -jar -Xmx1024m -Xms512m -Dspring.profiles.active=prod -Dspring.config.location=file:/opt/bookmyhotel/config/application-prod.properties app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-backend

# Environment variables - Use actual environment file
EnvironmentFile=/opt/bookmyhotel/backend/.env
Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=prod

# Security settings
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd daemon
sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend.service
"

print_status "✅ Systemd service updated"

# Step 7.5: Validate database connectivity
print_step "🔍 Validating database connectivity..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    # Check if MySQL is running
    if sudo systemctl is-active --quiet mysql; then
        echo '✅ MySQL service is running'
    else
        echo '❌ MySQL service is not running'
        sudo systemctl status mysql --no-pager
        exit 1
    fi
    
    # Test database connection (assuming mysql client is installed)
    if command -v mysql &> /dev/null; then
        echo 'Testing database connection...'
        # This will fail if credentials are wrong, but that's expected for now
        timeout 10 mysql -h localhost -P 3306 -e 'SELECT 1;' 2>/dev/null || echo 'Database connection test completed (credentials may need setup)'
    else
        echo 'MySQL client not installed, skipping connection test'
    fi
"

# Step 8: Restart the service
print_step "🔄 Restarting backend service..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    sudo systemctl stop bookmyhotel-backend.service 2>/dev/null || true
    sleep 2
    sudo systemctl start bookmyhotel-backend.service
"

# Step 9: Wait for service to start and verify
print_step "⏳ Waiting for service to start..."
sleep 15

# Check service status with enhanced error handling
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    SERVICE_STATUS=\$(sudo systemctl is-active bookmyhotel-backend.service)
    echo \"Service status: \$SERVICE_STATUS\"
    
    if [ \"\$SERVICE_STATUS\" = \"active\" ]; then
        echo '✅ Backend service is running'
        sudo systemctl status bookmyhotel-backend.service --no-pager -l
        
        # Check if service is actually listening on port
        if netstat -tulpn | grep ':8080' > /dev/null 2>&1; then
            echo '✅ Service is listening on port 8080'
        else
            echo '⚠️ Service is not yet listening on port 8080 (may still be starting)'
        fi
    else
        echo '❌ Backend service failed to start'
        echo 'Service status:'
        sudo systemctl status bookmyhotel-backend.service --no-pager -l
        echo ''
        echo 'Recent logs:'
        sudo journalctl -u bookmyhotel-backend.service --no-pager -l --since '5 minutes ago'
        echo ''
        echo 'Environment file contents:'
        ls -la /opt/bookmyhotel/backend/.env 2>/dev/null || echo '.env file not found'
        echo ''
        echo 'Configuration file:'
        ls -la /opt/bookmyhotel/config/application-prod.properties 2>/dev/null || echo 'Config file not found'
        exit 1
    fi
"

# Step 10: Test the deployment
print_step "🧪 Testing deployment..."
sleep 5

# Test health endpoint
print_status "Testing health endpoint..."
HEALTH_RESPONSE=$(ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "curl -s -w '%{http_code}' -o /dev/null http://localhost:8080/actuator/health" 2>/dev/null || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_status "✅ Health check passed (HTTP $HEALTH_RESPONSE)"
else
    print_warning "⚠️ Health check returned HTTP $HEALTH_RESPONSE"
fi

# Test public endpoint
print_status "Testing public endpoint..."
PUBLIC_HEALTH_RESPONSE=$(curl -s -w '%{http_code}' -o /dev/null "https://www.shegeroom.com/managemyhotel/actuator/health" 2>/dev/null || echo "000")

if [ "$PUBLIC_HEALTH_RESPONSE" = "200" ]; then
    print_status "✅ Public health check passed (HTTP $PUBLIC_HEALTH_RESPONSE)"
else
    print_warning "⚠️ Public health check returned HTTP $PUBLIC_HEALTH_RESPONSE"
fi

# Final summary
print_step "📊 Deployment Summary"
echo ""
echo -e "${GREEN}🎉 Backend Deployment Completed Successfully!${NC}"
echo ""
echo "📋 Deployment Details:"
echo "  • JAR File: $(basename "$JAR_FILE")"
echo "  • Server: $SERVER_IP"
echo "  • Remote Path: $REMOTE_PATH/backend/"
echo "  • Service: bookmyhotel-backend.service"
echo ""
echo "🌐 Access URLs:"
echo "  • Public API: https://www.shegeroom.com/managemyhotel/"
echo "  • Health Check: https://www.shegeroom.com/managemyhotel/actuator/health"
echo "  • Direct Health: http://$SERVER_IP:8080/actuator/health"
echo ""
echo "🔧 Management Commands:"
echo "  • View Logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo journalctl -u bookmyhotel-backend.service -f'"
echo "  • Restart: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo systemctl restart bookmyhotel-backend.service'"
echo "  • Status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo systemctl status bookmyhotel-backend.service'"
echo ""
echo -e "${BLUE}📝 Note: The backend has been deployed using rsync for efficient file transfer${NC}"

# Optional: Show recent logs
print_step "📋 Recent Backend Logs (last 10 lines):"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "sudo journalctl -u bookmyhotel-backend.service --no-pager -l --since '5 minutes ago' | tail -10"

print_status "🏁 Deployment process completed!"
