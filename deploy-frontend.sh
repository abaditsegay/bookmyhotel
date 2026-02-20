#!/bin/bash

# Frontend Deployment Script for AWS Lightsail
# Server: 44.204.49.94
# Deploy path: /var/www/bookmyhotel

set -e

# Configuration
SERVER_IP="44.204.49.94"
SSH_KEY="$HOME/.ssh/bookmyhotel-aws"
DEPLOY_PATH="/var/www/bookmyhotel"
REMOTE_USER="ubuntu"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if [ ! -f "$SSH_KEY" ]; then
        print_error "SSH key not found: $SSH_KEY"
        exit 1
    fi
    print_status "SSH key found"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install Node.js and npm"
        exit 1
    fi
    print_status "npm found: $(npm --version)"
    
    if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$REMOTE_USER@$SERVER_IP" "echo 'connected'" &>/dev/null; then
        print_error "Cannot connect to server: $SERVER_IP"
        exit 1
    fi
    print_status "Server connection verified"
}

# Build React application
build_frontend() {
    print_header "Building Frontend"
    
    cd frontend
    
    print_info "Installing dependencies..."
    if ! npm install --legacy-peer-deps; then
        print_error "npm install failed"
        exit 1
    fi
    print_status "Dependencies installed"
    
    print_info "Building React application for production..."
    if ! npm run build; then
        print_error "Build failed"
        exit 1
    fi
    print_status "Build completed successfully"
    
    cd ..
}

# Create deployment package
create_package() {
    print_header "Creating Deployment Package"
    
    cd frontend/build
    
    print_info "Creating compressed archive..."
    # Use --no-xattrs to avoid macOS extended attributes warnings on Linux
    tar --no-xattrs -czf ../frontend-build.tar.gz *
    print_status "Package created: frontend-build.tar.gz"
    
    cd ../..
}

# Upload to server
upload_package() {
    print_header "Uploading to Server"
    
    print_info "Uploading package to $SERVER_IP..."
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no frontend/frontend-build.tar.gz "$REMOTE_USER@$SERVER_IP:/tmp/"
    print_status "Package uploaded successfully"
}

# Deploy on server
deploy_on_server() {
    print_header "Deploying on Server"
    
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_USER@$SERVER_IP" << 'EOF'
set -e

echo "📦 Extracting build files..."
# Create directory if it doesn't exist
sudo mkdir -p /var/www/bookmyhotel
# Backup existing frontend (optional)
if [ -d /var/www/bookmyhotel ] && [ "$(ls -A /var/www/bookmyhotel)" ]; then
    BACKUP_DIR="/tmp/frontend-backup-$(date +%Y%m%d-%H%M%S)"
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r /var/www/bookmyhotel/* "$BACKUP_DIR/" 2>/dev/null || true
    echo "✓ Backup created: $BACKUP_DIR"
fi

# Remove old frontend files
sudo rm -rf /var/www/bookmyhotel/*

# Extract new build
cd /tmp
sudo tar -xzf frontend-build.tar.gz -C /var/www/bookmyhotel/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/bookmyhotel
sudo chmod -R 755 /var/www/bookmyhotel

# Clean up
rm -f /tmp/frontend-build.tar.gz

echo "✓ Files deployed to /var/www/bookmyhotel"

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
echo "Deployed files: $(sudo ls /var/www/bookmyhotel | wc -l) items"
echo "Total size: $(sudo du -sh /var/www/bookmyhotel | cut -f1)"
echo "Nginx status: $(sudo systemctl is-active nginx)"
echo ""
EOF
    
    print_status "Deployment completed on server"
}

# Cleanup local files
cleanup() {
    print_header "Cleaning Up"
    
    if [ -f frontend/frontend-build.tar.gz ]; then
        rm -f frontend/frontend-build.tar.gz
        print_status "Local package removed"
    fi
}

# Main deployment flow
main() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║        BookMyHotel - Frontend Deployment Tool        ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    print_info "Target Server: $SERVER_IP"
    print_info "Deploy Path: $DEPLOY_PATH"
    echo ""
    
    # Confirm deployment
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    check_prerequisites
    build_frontend
    create_package
    upload_package
    deploy_on_server
    cleanup
    
    print_header "Deployment Complete! 🎉"
    echo ""
    print_status "Frontend deployed successfully to $SERVER_IP"
    print_info "Access your application at: http://$SERVER_IP"
    echo ""
    print_info "To check deployment:"
    print_info "  ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP"
    print_info "  ls -la /var/www/bookmyhotel"
    echo ""
}

# Run main function
main
