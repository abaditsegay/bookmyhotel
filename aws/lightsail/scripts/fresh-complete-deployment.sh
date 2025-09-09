#!/bin/bash

# Fresh Complete Deployment Script for AWS Lightsail
# Deploys both backend and frontend to a clean server instance
# Requires Java 21 to be pre-installed on the server

set -e

# Configuration
SERVER_IP="${1}"
SSH_KEY="${2}"
DOMAIN="${3:-bookmyhotel.251solutions.com}"

if [ -z "$SERVER_IP" ] || [ -z "$SSH_KEY" ]; then
    echo "Usage: $0 <server_ip> <ssh_key> [domain]"
    echo "Example: $0 44.204.49.94 ~/.ssh/bookmyhotel-aws bookmyhotel.251solutions.com"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for colored output
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

print_header "Starting Fresh Complete Deployment to $SERVER_IP"

# Step 1: Test server connectivity and Java 21 installation
print_status "Testing server connectivity and Java version..."
JAVA_VERSION=$(ssh $SSH_OPTS ubuntu@$SERVER_IP "java -version 2>&1 | head -1" || echo "Java not found")
echo "Server Java version: $JAVA_VERSION"

if [[ $JAVA_VERSION != *"21"* ]]; then
    print_error "Java 21 is required but not found. Please install Java 21 on the server first."
    print_error "Run: sudo apt update && sudo apt install -y openjdk-21-jdk"
    exit 1
fi

print_status "✅ Java 21 detected on server"

# Step 2: Install required packages on server
print_header "Installing Required Packages"
ssh $SSH_OPTS ubuntu@$SERVER_IP << 'EOF'
set -e

# Update system
sudo apt update

# Install required packages
sudo apt install -y nginx mysql-client curl wget unzip

# Install Node.js 18 (for frontend if needed)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Configure firewall
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw --force enable

echo "✅ System setup completed"
EOF

# Step 3: Build backend locally
print_header "Building Backend Application"
print_status "Building Spring Boot application with Maven..."
cd backend

if ! mvn clean package -DskipTests; then
    print_error "Maven build failed"
    exit 1
fi

print_status "✅ Backend build completed"

# Step 4: Build frontend locally
print_header "Building Frontend Application"
print_status "Building React application..."
cd ../frontend

# Ensure we have the latest API configuration with all required exports
cat > src/config/apiConfig.ts << 'EOF_CONFIG'
/**
 * Centralized API Configuration
 * This file contains all API-related configuration for the frontend application.
 */

// Environment variables with fallback to production server for AWS deployment
export const API_CONFIG = {
  // Main API base URL - used for all backend API calls
  BASE_URL: 'http://44.204.49.94/managemyhotel/api',
  
  // Backend server URL (without /api suffix) - for direct server calls if needed
  SERVER_URL: 'http://44.204.49.94/managemyhotel',
  
  // Timeout for API calls (in milliseconds)
  REQUEST_TIMEOUT: 30000,
  
  // Default headers for API requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

/**
 * API Endpoints - centralized endpoint definitions
 * Use these constants instead of hardcoding endpoint paths
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  
  // System Admin
  SYSTEM: {
    HOTELS: '/system/hotels',
    USERS: '/system/users', 
    TENANTS: '/system/tenants',
  },
  
  // Hotel Management
  HOTELS: {
    LIST: '/hotels',
    BY_ID: (id: string | number) => \`/hotels/\${id}\`,
    SEARCH: '/hotels/search',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    BY_ID: (id: string | number) => \`/bookings/\${id}\`,
    SEARCH: '/bookings/search',
    CANCEL: '/bookings/cancel',
    MODIFY: '/bookings/modify',
  },
  
  // Rooms
  ROOMS: {
    LIST: (hotelId: string | number) => \`/hotels/\${hotelId}/rooms\`,
    BY_ID: (hotelId: string | number, roomId: string | number) => \`/hotels/\${hotelId}/rooms/\${roomId}\`,
  },
  
  // Staff
  STAFF: {
    LIST: (hotelId: string | number) => \`/hotels/\${hotelId}/staff\`,
    BY_ID: (hotelId: string | number, staffId: string | number) => \`/hotels/\${hotelId}/staff/\${staffId}\`,
    SCHEDULES: (hotelId: string | number) => \`/hotels/\${hotelId}/staff-schedules\`,
  },
  
  // Shop/Products
  SHOP: {
    PRODUCTS: (hotelId: string | number) => \`/hotels/\${hotelId}/shop/products\`,
    PRODUCT_BY_ID: (hotelId: string | number, productId: string | number) => \`/hotels/\${hotelId}/shop/products/\${productId}\`,
    INVENTORY: (hotelId: string | number) => \`/hotels/\${hotelId}/shop/inventory\`,
  },
  
  // Todos
  TODOS: {
    LIST: '/todos',
    BY_ID: (id: string | number) => \`/todos/\${id}\`,
    TOGGLE: (id: string | number) => \`/todos/\${id}/toggle\`,
    FILTERED: '/todos/filtered',
    PENDING_COUNT: '/todos/pending/count',
    OVERDUE: '/todos/overdue',
  },
  
  // Operations
  OPERATIONS: {
    DASHBOARD: (hotelId: string | number) => \`/hotels/\${hotelId}/operations\`,
    TASKS: (hotelId: string | number) => \`/hotels/\${hotelId}/operations/tasks\`,
  },
} as const;

/**
 * Build complete API URL
 * @param endpoint - The endpoint path (use API_ENDPOINTS constants)
 * @returns Complete URL for API call
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : \`/\${endpoint}\`;
  
  return \`\${baseUrl}\${cleanEndpoint}\`;
};

/**
 * Get API configuration for environment
 * @returns Current API configuration
 */
export const getApiConfig = () => API_CONFIG;

/**
 * Check if we're in development mode
 * @returns true if running in development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || API_CONFIG.BASE_URL.includes('localhost');
};

// Backward compatibility - export the base URL for existing code
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Export default for convenience
export default API_CONFIG;
EOF_CONFIG

# Build the React application
if ! npm run build; then
    print_error "React build failed"
    exit 1
fi

print_status "✅ Frontend build completed"

# Step 5: Deploy backend
print_header "Deploying Backend to Server"
print_status "Creating backend directories..."
ssh $SSH_OPTS ubuntu@$SERVER_IP << 'EOF'
sudo mkdir -p /opt/bookmyhotel/{config,logs}
sudo chown -R ubuntu:ubuntu /opt/bookmyhotel
EOF

print_status "Uploading backend JAR..."
scp $SSH_OPTS ../backend/target/*.jar ubuntu@$SERVER_IP:/opt/bookmyhotel/app.jar

print_status "Creating backend systemd service..."
ssh $SSH_OPTS ubuntu@$SERVER_IP << 'EOF'
sudo tee /etc/systemd/system/bookmyhotel-backend.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Backend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/bookmyhotel
ExecStart=/usr/bin/java -jar -Xmx1g -Xms512m -Dspring.profiles.active=prod app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-backend

Environment=JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable bookmyhotel-backend.service
sudo systemctl start bookmyhotel-backend.service

echo "✅ Backend service started"
EOF

# Step 6: Deploy frontend
print_header "Deploying Frontend to Server"
print_status "Creating frontend package..."
cd build
tar -czf frontend-build.tar.gz *

print_status "Uploading frontend files..."
scp $SSH_OPTS frontend-build.tar.gz ubuntu@$SERVER_IP:/tmp/

print_status "Extracting frontend files on server..."
ssh $SSH_OPTS ubuntu@$SERVER_IP << 'EOF'
sudo mkdir -p /var/www/html
sudo rm -rf /var/www/html/*
cd /tmp
sudo tar -xzf frontend-build.tar.gz -C /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
rm -f frontend-build.tar.gz
echo "✅ Frontend files deployed"
EOF

# Step 7: Configure Nginx
print_header "Configuring Nginx"
ssh $SSH_OPTS ubuntu@$SERVER_IP << EOF
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name ${DOMAIN} ${SERVER_IP};

    # Frontend React SPA
    location / {
        root /var/www/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /managemyhotel/api/ {
        proxy_pass http://localhost:8080/managemyhotel/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "http://${SERVER_IP}" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        if (\$request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Health check endpoint
    location /managemyhotel/actuator/ {
        proxy_pass http://localhost:8080/managemyhotel/actuator/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_CONFIG

# Test and reload Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "✅ Nginx configured and started"
EOF

# Step 8: Wait for services and test
print_header "Testing Deployment"
print_status "Waiting for services to fully start..."
sleep 15

print_status "Testing backend health..."
if curl -f -m 10 http://$SERVER_IP/managemyhotel/actuator/health > /dev/null 2>&1; then
    print_status "✅ Backend health check passed!"
else
    print_warning "Backend health check failed, checking service status..."
    ssh $SSH_OPTS ubuntu@$SERVER_IP "sudo systemctl status bookmyhotel-backend.service --no-pager"
fi

print_status "Testing frontend..."
if curl -f -m 10 http://$SERVER_IP/ > /dev/null 2>&1; then
    print_status "✅ Frontend is accessible!"
else
    print_warning "Frontend test failed"
fi

# Step 9: Clean up local build artifacts
print_header "Cleaning Up"
cd ..
rm -f build/frontend-build.tar.gz
print_status "✅ Local build artifacts cleaned"

# Final summary
print_header "Deployment Summary"
echo -e "${GREEN}🎉 Fresh deployment completed successfully!${NC}"
echo ""
echo "📋 Deployment Details:"
echo "   Server IP: $SERVER_IP"
echo "   Domain: $DOMAIN"
echo "   Java Version: Java 21"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://$SERVER_IP/"
echo "   Backend API: http://$SERVER_IP/managemyhotel/api/"
echo "   Health Check: http://$SERVER_IP/managemyhotel/actuator/health"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Admin: admin@bookmyhotel.com / Admin@123"
echo "   Manager: manager@hotel1.com / Manager@123"
echo "   Staff: staff@hotel1.com / Staff@123"
echo ""
echo "🛠 Management Commands:"
echo "   SSH: ssh $SSH_OPTS ubuntu@$SERVER_IP"
echo "   Backend logs: sudo journalctl -u bookmyhotel-backend.service -f"
echo "   Restart backend: sudo systemctl restart bookmyhotel-backend.service"
echo "   Restart nginx: sudo systemctl restart nginx"
echo ""
print_status "Next steps: Configure SSL certificate if needed"
