#!/bin/bash

# Build Frontend and Deploy with rsync to AWS Lightsail
# Usage: ./build-and-deploy-frontend.sh

set -e

# Configuration
SERVER_IP="44.204.49.94"
SSH_KEY="~/.ssh/bookmyhotel-aws"
SERVER_USER="ubuntu"
REMOTE_PATH="/var/www/bookmyhotel"
LOCAL_FRONTEND_DIR="/Users/samuel/Projects2/bookmyhotel/frontend"

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
    sudo mkdir -p $REMOTE_PATH
    sudo chown -R ubuntu:ubuntu $REMOTE_PATH
"

# Step 5: Deploy frontend build using rsync
print_step "🚀 Deploying frontend build using rsync..."
rsync -avz --delete -e "ssh -i $SSH_KEY" \
    "$BUILD_DIR/" \
    "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/"

print_status "✅ Frontend files deployed successfully"

# Final summary
print_step "📊 Frontend Deployment Summary"
echo ""
echo -e "${GREEN}🎉 Frontend Deployment Completed Successfully!${NC}"
echo ""
echo "📋 Deployment Details:"
echo "  • Build Type: Production (NODE_ENV=production)"
echo "  • Server: $SERVER_IP"
echo "  • Remote Path: $REMOTE_PATH/"
echo "  • Build Tool: npm run build"
echo ""
echo "🔧 Management Commands:"
echo "  • Check Files: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP 'ls -la $REMOTE_PATH/'"
echo "  • Connect to Server: ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP"
echo ""
echo -e "${BLUE}📝 Note: Frontend deployed using rsync with --delete flag for clean updates${NC}"

print_status "🏁 Frontend deployment process completed!"
