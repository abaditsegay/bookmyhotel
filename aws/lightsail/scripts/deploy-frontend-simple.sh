#!/bin/bash

# Simple Frontend Deployment Script for AWS Lightsail
# This script deploys the React frontend directly to Lightsail instance and runs it on port 3000

set -e

# Configuration
LIGHTSAIL_IP="$1"
LIGHTSAIL_USER="ubuntu"
SSH_KEY="$2"
FRONTEND_DIR="/opt/bookmyhotel-frontend"
SERVICE_NAME="bookmyhotel-frontend"

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

# Check if required parameters are provided
if [ -z "$LIGHTSAIL_IP" ]; then
    print_error "Usage: $0 <lightsail-ip> [ssh-key-path]"
    print_error "Example: $0 54.235.230.218 ~/.ssh/bookmyhotel-aws"
    exit 1
fi

# Set default SSH key path if not provided
if [ -z "$SSH_KEY" ]; then
    SSH_KEY="~/.ssh/bookmyhotel-aws"
    print_warning "No SSH key specified, using default: $SSH_KEY"
fi

# Expand tilde in SSH_KEY path
SSH_KEY="${SSH_KEY/#\~/$HOME}"

print_status "Using SSH key: $SSH_KEY"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key file not found: $SSH_KEY"
    exit 1
fi

# SSH options
SSH_OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

print_status "Starting frontend deployment to $LIGHTSAIL_IP"

# Step 1: Prepare local frontend code
print_status "Preparing frontend code..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_FRONTEND_DIR="$SCRIPT_DIR/../../../frontend"

if [ ! -d "$LOCAL_FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $LOCAL_FRONTEND_DIR"
    exit 1
fi

cd "$LOCAL_FRONTEND_DIR"

# Update API configuration to point to public IP (since frontend is accessed from external browsers)
print_status "Updating API configuration for public IP deployment..."
cat > src/config/apiConfig.ts << 'EOF'
/**
 * Centralized API Configuration
 * This file contains all API-related configuration for the frontend application.
 */

// Environment variables with fallback to production server for AWS deployment
export const API_CONFIG = {
  // Main API base URL - used for all backend API calls
  BASE_URL: process.env.REACT_APP_API_URL || 'http://54.235.230.218:8080/managemyhotel/api',
  
  // Backend server URL (without /api suffix) - for direct server calls if needed
  SERVER_URL: process.env.REACT_APP_SERVER_URL || 'http://54.235.230.218:8080/managemyhotel',
  
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
    BY_ID: (id: string | number) => `/hotels/${id}`,
    SEARCH: '/hotels/search',
  },
  
  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    BY_ID: (id: string | number) => `/bookings/${id}`,
    SEARCH: '/bookings/search',
    CANCEL: '/bookings/cancel',
    MODIFY: '/bookings/modify',
  },
  
  // Rooms
  ROOMS: {
    LIST: (hotelId: string | number) => `/hotels/${hotelId}/rooms`,
    BY_ID: (hotelId: string | number, roomId: string | number) => `/hotels/${hotelId}/rooms/${roomId}`,
  },
  
  // Staff
  STAFF: {
    LIST: (hotelId: string | number) => `/hotels/${hotelId}/staff`,
    BY_ID: (hotelId: string | number, staffId: string | number) => `/hotels/${hotelId}/staff/${staffId}`,
    SCHEDULES: (hotelId: string | number) => `/hotels/${hotelId}/staff-schedules`,
  },
  
  // Shop/Products
  SHOP: {
    PRODUCTS: (hotelId: string | number) => `/hotels/${hotelId}/shop/products`,
    PRODUCT_BY_ID: (hotelId: string | number, productId: string | number) => `/hotels/${hotelId}/shop/products/${productId}`,
    INVENTORY: (hotelId: string | number) => `/hotels/${hotelId}/shop/inventory`,
  },
  
  // Todos
  TODOS: {
    LIST: '/todos',
    BY_ID: (id: string | number) => `/todos/${id}`,
    TOGGLE: (id: string | number) => `/todos/${id}/toggle`,
    FILTERED: '/todos/filtered',
    PENDING_COUNT: '/todos/pending/count',
    OVERDUE: '/todos/overdue',
  },
  
  // Operations
  OPERATIONS: {
    DASHBOARD: (hotelId: string | number) => `/hotels/${hotelId}/operations`,
    TASKS: (hotelId: string | number) => `/hotels/${hotelId}/operations/tasks`,
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
    : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
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
EOF

print_status "API configuration updated to use public IP: 54.235.230.218:8080"

# Step 2: Create deployment directory on Lightsail instance
print_status "Creating frontend deployment directory on Lightsail instance..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
    sudo mkdir -p $FRONTEND_DIR
    sudo chown ubuntu:ubuntu $FRONTEND_DIR
    mkdir -p $FRONTEND_DIR/logs
EOF

# Step 3: Upload frontend code to Lightsail instance
print_status "Uploading frontend code to Lightsail instance..."

# Create a temporary tar file with frontend code (excluding node_modules and build)
tar -czf /tmp/frontend.tar.gz --exclude='node_modules' --exclude='build' --exclude='.git' .

# Upload and extract
scp $SSH_OPTS /tmp/frontend.tar.gz $LIGHTSAIL_USER@$LIGHTSAIL_IP:$FRONTEND_DIR/
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
    cd $FRONTEND_DIR
    tar -xzf frontend.tar.gz
    rm frontend.tar.gz
EOF

# Clean up local temp file
rm /tmp/frontend.tar.gz

print_status "Frontend code uploaded successfully"

# Step 4: Install Node.js and npm if not already installed
print_status "Installing Node.js and npm on Lightsail instance..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        echo "Node.js is already installed: $(node --version)"
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "Installing npm..."
        sudo apt-get install -y npm
    else
        echo "npm is already installed: $(npm --version)"
    fi
EOF

# Step 5: Install frontend dependencies on Lightsail instance
print_status "Installing frontend dependencies on Lightsail instance..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
    cd $FRONTEND_DIR
    npm install --legacy-peer-deps --production=false
EOF

# Step 6: Create systemd service for frontend
print_status "Creating systemd service for frontend..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << 'SERVICE'
[Unit]
Description=BookMyHotel Frontend Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$FRONTEND_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bookmyhotel-frontend

# Environment variables - Updated for mobile access
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0
Environment=REACT_APP_API_URL=http://54.235.230.218:8080/managemyhotel/api
Environment=REACT_APP_SERVER_URL=http://54.235.230.218:8080/managemyhotel

[Install]
WantedBy=multi-user.target
SERVICE

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME.service
EOF

# Step 7: Configure firewall to allow port 3000
print_status "Configuring firewall to allow port 3000..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'EOF'
    sudo ufw allow 3000
    echo "✅ Port 3000 opened in firewall"
EOF

# Step 8: Start the frontend service
print_status "Starting frontend service..."
ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP << EOF
    sudo systemctl stop $SERVICE_NAME.service 2>/dev/null || true
    sudo systemctl start $SERVICE_NAME.service
    
    # Wait a moment for service to start
    sleep 10
    
    # Check service status
    if sudo systemctl is-active --quiet $SERVICE_NAME.service; then
        echo "✅ Frontend service started successfully"
        sudo systemctl status $SERVICE_NAME.service --no-pager
    else
        echo "❌ Frontend service failed to start"
        sudo journalctl -u $SERVICE_NAME.service --no-pager --lines=20
        exit 1
    fi
EOF

# Step 9: Test the frontend deployment
print_status "Testing frontend deployment..."
sleep 5

# Test if frontend is responding
if ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "curl -f http://localhost:3000" &>/dev/null; then
    print_status "✅ Frontend is responding on port 3000!"
else
    print_error "❌ Frontend test failed"
    ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP "sudo journalctl -u $SERVICE_NAME.service --no-pager --lines=20"
    exit 1
fi

# Final status
print_status "🎉 Frontend deployment completed successfully!"
print_status "Frontend URL: http://$LIGHTSAIL_IP:3000"
print_status "Backend URL: http://$LIGHTSAIL_IP:8080/managemyhotel/api/"
print_status ""
print_status "To view frontend logs: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo journalctl -u $SERVICE_NAME.service -f'"
print_status "To restart frontend: ssh $SSH_OPTS $LIGHTSAIL_USER@$LIGHTSAIL_IP 'sudo systemctl restart $SERVICE_NAME.service'"

print_status ""
print_status "🔗 Complete Application URLs:"
print_status "   Frontend: http://$LIGHTSAIL_IP:3000"
print_status "   Backend API: http://$LIGHTSAIL_IP:8080/managemyhotel/api/"
print_status "   Backend Health: http://$LIGHTSAIL_IP:8080/managemyhotel/actuator/health"
