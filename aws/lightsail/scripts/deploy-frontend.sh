#!/bin/bash

# Frontend Deployment Script for AWS S3 + CloudFront
# This script builds and deploys the React frontend to S3 with CloudFront distribution

set -e

# Configuration
BUCKET_NAME="${1:-bookmyhotel-frontend-prod}"
CLOUDFRONT_DISTRIBUTION_ID="$2"
LIGHTSAIL_BACKEND_IP="$3"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"

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

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first:"
    print_error "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    print_error "AWS credentials not configured. Run: aws configure"
    exit 1
fi

print_status "Starting frontend deployment..."

# Step 1: Update API configuration for production
print_status "Updating API configuration for production..."
cd "$(dirname "$0")/../../frontend"

if [ -n "$LIGHTSAIL_BACKEND_IP" ]; then
    # Update API base URL in config
    cat > src/config/apiConfig.ts << EOF
// API Configuration for production deployment
const isDevelopment = () => process.env.NODE_ENV === 'development';

export const API_CONFIG = {
  BASE_URL: isDevelopment() 
    ? 'http://localhost:8080' 
    : 'http://${LIGHTSAIL_BACKEND_IP}',
  SERVER_URL: isDevelopment() 
    ? 'http://localhost:8080' 
    : 'http://${LIGHTSAIL_BACKEND_IP}'
};

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout'
  },
  
  // System Management
  SYSTEM: {
    DASHBOARD: '/api/system/dashboard',
    TENANTS: '/api/system/tenants',
    USERS: '/api/system/users',
    HOTELS: '/api/system/hotels'
  },
  
  // Booking Management
  BOOKINGS: {
    LIST: '/api/bookings',
    CREATE: '/api/bookings',
    UPDATE: '/api/bookings',
    DELETE: '/api/bookings'
  },
  
  // Hotel Management
  HOTELS: {
    LIST: '/api/hotels',
    ROOMS: '/api/hotels/{hotelId}/rooms',
    PRODUCTS: '/api/hotels/{hotelId}/products'
  },
  
  // Todo Management
  TODOS: {
    LIST: '/api/todos',
    CREATE: '/api/todos',
    UPDATE: '/api/todos/{id}',
    DELETE: '/api/todos/{id}'
  }
};

export const buildApiUrl = (endpoint: string, params: Record<string, string> = {}): string => {
  let url = API_CONFIG.BASE_URL + endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach(key => {
    url = url.replace(\`{\${key}}\`, params[key]);
  });
  
  return url;
};
EOF
fi

# Step 2: Install dependencies and build
print_status "Installing dependencies..."
if ! npm ci; then
    print_warning "npm ci failed, trying npm install..."
    npm install
fi

print_status "Building React application for production..."
if ! npm run build; then
    print_error "React build failed"
    exit 1
fi

# Step 3: Create S3 bucket (if it doesn't exist)
print_status "Checking S3 bucket: $BUCKET_NAME"
if ! aws s3 ls "s3://$BUCKET_NAME" &>/dev/null; then
    print_status "Creating S3 bucket: $BUCKET_NAME"
    if [ "$REGION" = "us-east-1" ]; then
        aws s3 mb "s3://$BUCKET_NAME"
    else
        aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    fi
    
    # Configure bucket for static website hosting
    aws s3 website "s3://$BUCKET_NAME" --index-document index.html --error-document error.html
    
    # Set bucket policy for public read
    cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF
    
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
    rm /tmp/bucket-policy.json
fi

# Step 4: Upload build files to S3
print_status "Uploading files to S3..."
aws s3 sync build/ "s3://$BUCKET_NAME" --delete --cache-control "public, max-age=31536000" --exclude "*.html"
aws s3 sync build/ "s3://$BUCKET_NAME" --delete --cache-control "public, max-age=0, must-revalidate" --include "*.html"

# Step 5: Invalidate CloudFront distribution (if provided)
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "Invalidating CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" > /dev/null
    print_status "CloudFront invalidation initiated"
else
    print_warning "No CloudFront distribution ID provided. Cache may not be updated immediately."
fi

# Step 6: Display deployment information
print_status "🎉 Frontend deployment completed successfully!"
print_status ""
print_status "S3 Bucket: s3://$BUCKET_NAME"
print_status "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    print_status "CloudFront URL: https://$CLOUDFRONT_DISTRIBUTION_ID.cloudfront.net"
fi

print_status ""
print_status "Next steps:"
print_status "1. Set up CloudFront distribution for HTTPS and global CDN"
print_status "2. Configure custom domain name (optional)"
print_status "3. Update CORS settings in backend if needed"
print_status "4. Test the complete application flow"
