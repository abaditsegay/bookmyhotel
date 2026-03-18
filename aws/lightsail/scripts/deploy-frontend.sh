#!/bin/bash

# Frontend Deployment Script for AWS Lightsail
# This script builds and deploys the React frontend to Lightsail VM at /var/www/bookmystay

set -e

# Configuration
SERVER_IP="${1:-44.204.49.94}"
SSH_KEY="${2:-$HOME/.ssh/bookmyhotel-aws}"
BACKEND_API_URL="${3}"
DEPLOY_PATH="/var/www/bookmystay"
REMOTE_USER="ubuntu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
if [ ! -f "$SSH_KEY" ]; then
    print_error "SSH key not found: $SSH_KEY"
    print_error "Usage: $0 <server_ip> <ssh_key_path> [backend_api_url]"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install Node.js and npm"
    exit 1
fi

if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$REMOTE_USER@$SERVER_IP" "echo 'connected'" &>/dev/null; then
    print_error "Cannot connect to server: $SERVER_IP"
    exit 1
fiNavigate to frontend directory
print_status "Navigating to frontend directory..."
cd "$(dirname "$0")/../../../frontend"

# Step 2: Install dependencies
print_status "Installing dependencies..."
if ! npm install --legacy-peer-deps; then
    print_error "npm install failed"
    exit 1
fi

# Step 3: Build React application
print_status "Building React application for production..."
if ! npm run build; then
    print_error "Build failed"
    exit 1
fi

# Step 4: Create deployment package
print_status "Creating deployment package..."
cd build
tar --no-xattrs -czf ../frontend-build.tar.gz *
cd ..

# Step 5: Upload to server
print_status "Uploading package to $SERVER_IP..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no frontend-build.tar.gz "$REMOTE_USER@$SERVER_IP:/tmp/"

# Step 6: Deploy on server
print_status "Deploying on server..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_USER@$SERVER_IP" << 'EOF'
set -e

echo "📦 Extracting build files..."

# Backup existing frontend (optional)
if [ -d /var/www/bookmystay ] && [ "$(ls -A /var/www/bookmystay 2>/dev/null)" ]; then
    BACKUP_DIR="/tmp/frontend-backup-$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r /var/www/bookmystay/* "$BACKUP_DIR/" 2>/dev/null || true
    echo "✓ Backup created: $BACKUP_DIR"
fi

# Create directory if it doesn't exist
sudo mkdir -p /var/www/bookmystay

# Remove old frontend files
sudo rm -rf /var/www/bookmystay/*

# Extract new build
cd /tmp
sudo tar -xzf frontend-build.tar.gz -C /var/www/bookmystay/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/bookmystay
sudo chmod -R 755 /var/www/bookmystay

# Clean up
rm -f /tmp/frontend-build.tar.gz

echo "✓ Files deployed to /var/www/bookmystay"

# Test nginx configuration
if sudo nginx -t 2>/dev/null; then
    echo "✓ Nginx configuration valid"
    
    # Reload nginx
    sudo systemctl reload nginx
    echo "✓ Nginx reloaded"
else
    echo "⚠ Warning: Nginx configuration test failed"
fi

# Display deployment info
echo ""
echo "═══════════════════════════════════════"
echo "  Deployment Information"
echo "═══════════════════════════════════════"
echo "Deployed files: $(sudo ls /var/www/bookmystay | wc -l) items"
echo "Total size: $(sudo du -sh /var/www/bookmystay | cut -f1)"
echo "Nginx status: $(sudo systemctl is-active nginx)"
echo ""
EOF

# Step 7: Cleanup local files
print_status "Cleaning up local files..."
rm -f frontend-build.tar.gz

# Step 8: Display deployment information
print_status "🎉 Frontend deployment completed successfully!"
print_status ""
print_status "Deployment Details:"
print_status "  Server: $SERVER_IP"
print_status "  Deploy Path: $DEPLOY_PATH"
print_status "  Access: http://$SERVER_IP"
print_status ""
print_status "To check deployment:"
print_status "  ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP"
print_status "  ls -la $DEPLOY_PATH
print_status "1. Set up CloudFront distribution for HTTPS and global CDN"
print_status "2. Configure custom domain name (optional)"
print_status "3. Update CORS settings in backend if needed"
print_status "4. Test the complete application flow"
