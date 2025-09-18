#!/bin/bash

# Build Frontend and Deploy with rsync to AWS Lightsail
# Usage: ./build-and-deploy-frontend.sh

set -e

# Configuration
SERVER_IP="44.204.49.94"
SSH_KEY="~/.ssh/bookmyhotel-aws"
SERVER_USER="ubuntu"
REMOTE_PATH="/opt/bookmyhotel"
LOCAL_FRONTEND_DIR="/Users/samuel/Projects2/bookmyhotel/frontend"
NGINX_CONFIG_DIR="/Users/samuel/Projects2/bookmyhotel/aws/lightsail/nginx"

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

print_status "🚀 Starting Frontend Build and Deployment Process"
print_status "Target Server: $SERVER_IP"
print_status "SSH Key: $SSH_KEY"
print_status "Local Frontend: $LOCAL_FRONTEND_DIR"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    print_error "❌ SSH key file not found: $SSH_KEY"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$LOCAL_FRONTEND_DIR" ]; then
    print_error "❌ Frontend directory not found: $LOCAL_FRONTEND_DIR"
    exit 1
fi

# Step 1: Install dependencies
print_step "📦 Installing frontend dependencies..."
cd "$LOCAL_FRONTEND_DIR"

if npm install --legacy-peer-deps; then
    print_status "✅ Dependencies installed successfully"
else
    print_error "❌ Failed to install dependencies"
    exit 1
fi

# Step 2: Build Frontend with production environment
print_step "🏗️ Building React Frontend for production..."

if NODE_ENV=production npm run build; then
    print_status "✅ Frontend build successful"
else
    print_error "❌ Frontend build failed"
    exit 1
fi

# Step 3: Verify build directory exists
BUILD_DIR="build"
if [ ! -d "$BUILD_DIR" ]; then
    print_error "❌ Build directory not found: $BUILD_DIR"
    exit 1
fi

print_status "Build directory verified: $BUILD_DIR"

# Step 4: Create remote directories
print_step "📁 Creating remote directories..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    sudo mkdir -p $REMOTE_PATH/frontend
    sudo mkdir -p /var/www/html
    sudo chown -R ubuntu:ubuntu $REMOTE_PATH/frontend
    sudo chown -R www-data:www-data /var/www/html
"

# Step 5: Deploy frontend build using rsync
print_step "🚀 Deploying frontend build using rsync..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
    "$BUILD_DIR/" \
    "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/frontend/"

print_status "✅ Frontend files deployed successfully"

# Step 6: Copy frontend files to nginx web root
print_step "📄 Copying files to nginx web root..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    sudo rsync -av $REMOTE_PATH/frontend/ /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
    sudo chmod -R 755 /var/www/html
"

print_status "✅ Files copied to nginx web root"

# Step 7: Update nginx configuration (if config exists)
print_step "⚙️ Updating nginx configuration..."
if [ -f "$NGINX_CONFIG_DIR/bookmyhotel.conf" ]; then
    rsync -avz -e "ssh -i $SSH_KEY" \
        "$NGINX_CONFIG_DIR/bookmyhotel.conf" \
        "$SERVER_USER@$SERVER_IP:/tmp/"
    
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
        sudo cp /tmp/bookmyhotel.conf /etc/nginx/sites-available/bookmyhotel
        sudo ln -sf /etc/nginx/sites-available/bookmyhotel /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
    "
    print_status "✅ Nginx configuration updated"
else
    print_warning "⚠️ Nginx config not found at: $NGINX_CONFIG_DIR/bookmyhotel.conf"
    print_status "Using existing nginx configuration"
fi

# Step 8: Test and reload nginx
print_step "🔧 Testing and reloading nginx..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    # Test nginx configuration
    if sudo nginx -t; then
        echo '✅ Nginx configuration test passed'
        # Reload nginx
        sudo systemctl reload nginx
        echo '✅ Nginx reloaded successfully'
    else
        echo '❌ Nginx configuration test failed'
        exit 1
    fi
"

# Step 9: Verify nginx is running
print_step "🔍 Verifying nginx status..."
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "
    if sudo systemctl is-active --quiet nginx; then
        echo '✅ Nginx is running'
        sudo systemctl status nginx --no-pager -l | head -10
    else
        echo '❌ Nginx is not running'
        sudo systemctl status nginx --no-pager -l
        exit 1
    fi
"

# Step 10: Test the deployment
print_step "🧪 Testing frontend deployment..."
sleep 3

# Test HTTP endpoint
print_status "Testing HTTP endpoint..."
HTTP_RESPONSE=$(curl -s -w '%{http_code}' -o /dev/null "http://$SERVER_IP/" 2>/dev/null || echo "000")

if [ "$HTTP_RESPONSE" = "200" ]; then
    print_status "✅ HTTP test passed (Status: $HTTP_RESPONSE)"
elif [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "302" ]; then
    print_status "✅ HTTP redirect working (Status: $HTTP_RESPONSE)"
else
    print_warning "⚠️ HTTP test returned status: $HTTP_RESPONSE"
fi

# Test HTTPS endpoint
print_status "Testing HTTPS endpoint..."
HTTPS_RESPONSE=$(curl -s -w '%{http_code}' -o /dev/null "https://www.shegeroom.com/" 2>/dev/null || echo "000")

if [ "$HTTPS_RESPONSE" = "200" ]; then
    print_status "✅ HTTPS test passed (Status: $HTTPS_RESPONSE)"
else
    print_warning "⚠️ HTTPS test returned status: $HTTPS_RESPONSE"
fi

# Step 11: Check if React app is properly served
print_step "🔍 Verifying React app deployment..."
REACT_CHECK=$(curl -s "https://www.shegeroom.com/" | grep -o "<title>.*</title>" | head -1 || echo "")
if [ -n "$REACT_CHECK" ]; then
    print_status "✅ React app is being served: $REACT_CHECK"
else
    print_warning "⚠️ Could not verify React app content"
fi

# Final summary
print_step "📊 Frontend Deployment Summary"
echo ""
echo -e "${GREEN}🎉 Frontend Deployment Completed Successfully!${NC}"
echo ""
echo "📋 Deployment Details:"
echo "  • Build Type: Production (NODE_ENV=production)"
echo "  • Server: $SERVER_IP"
echo "  • Remote Path: $REMOTE_PATH/frontend/"
echo "  • Web Root: /var/www/html/"
echo "  • Build Tool: npm run build"
echo ""
echo "🌐 Access URLs:"
echo "  • HTTP: http://$SERVER_IP/"
echo "  • HTTPS: https://www.shegeroom.com/"
echo "  • Direct IP: http://$SERVER_IP/"
echo ""
echo "🔧 Management Commands:"
echo "  • Nginx Status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo systemctl status nginx'"
echo "  • Nginx Reload: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo systemctl reload nginx'"
echo "  • View Logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/access.log'"
echo "  • Check Files: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'ls -la /var/www/html/'"
echo ""
echo -e "${BLUE}📝 Note: Frontend deployed using rsync with --delete flag for clean updates${NC}"

# Optional: Show nginx access logs
print_step "📋 Recent Nginx Access Logs (last 5 lines):"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "sudo tail -5 /var/log/nginx/access.log 2>/dev/null || echo 'No recent access logs found'"

print_status "🏁 Frontend deployment process completed!"
