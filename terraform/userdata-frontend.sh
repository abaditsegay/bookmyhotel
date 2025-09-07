#!/bin/bash
# User Data Script for BookMyHotel Frontend Instance (React on port 3000)

set -e

# Log all output
exec > >(tee /var/log/user-data.log) 2>&1

echo "Starting BookMyHotel Frontend setup at $(date)"

# Update system
apt-get update -y
apt-get upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install additional packages
apt-get install -y \
    git \
    curl \
    wget \
    unzip \
    nginx \
    supervisor \
    htop \
    vim \
    build-essential

# Verify Node.js and npm installation
node --version
npm --version

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

# Create environment file for frontend
cat > /opt/bookmyhotel/frontend/.env.production << EOF
# Production Environment Variables for BookMyHotel Frontend

# API Configuration
REACT_APP_API_BASE_URL=http://${backend_host}:${backend_port}/api
REACT_APP_BACKEND_URL=http://${backend_host}:${backend_port}

# Application Configuration
REACT_APP_ENVIRONMENT=${app_environment}
REACT_APP_VERSION=1.0.0

# Build Configuration
GENERATE_SOURCEMAP=false
BUILD_PATH=build

# Performance Configuration  
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
EOF

# Install dependencies and build
cd /opt/bookmyhotel/frontend
sudo -u bookmyhotel npm ci --production=false
sudo -u bookmyhotel npm run build

# Install PM2 globally for process management
npm install -g pm2

# Create PM2 ecosystem file
cat > /opt/bookmyhotel/frontend/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'bookmyhotel-frontend',
    script: 'serve',
    args: '-s build -l 3000 -n',
    cwd: '/opt/bookmyhotel/frontend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/bookmyhotel/frontend-error.log',
    out_file: '/var/log/bookmyhotel/frontend-out.log',
    log_file: '/var/log/bookmyhotel/frontend-combined.log',
    time: true
  }]
};
EOF

# Install serve globally
npm install -g serve

# Create log directory
mkdir -p /var/log/bookmyhotel
chown bookmyhotel:bookmyhotel /var/log/bookmyhotel

# Start application with PM2
cd /opt/bookmyhotel/frontend
sudo -u bookmyhotel pm2 start ecosystem.config.js
sudo -u bookmyhotel pm2 save
sudo -u bookmyhotel pm2 startup

# Get startup script and run it
PM2_STARTUP_SCRIPT=$(sudo -u bookmyhotel pm2 startup ubuntu -u bookmyhotel --hp /home/bookmyhotel | tail -1)
eval $PM2_STARTUP_SCRIPT

# Configure Nginx as reverse proxy and static file server
cat > /etc/nginx/sites-available/bookmyhotel-frontend << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    root /opt/bookmyhotel/frontend/build;
    index index.html index.htm;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://${backend_host}:${backend_port}/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check for the React app
    location /health {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ @rewrites;
    }
    
    location @rewrites {
        rewrite ^(.+)$ /index.html last;
    }
    
    # Fallback to PM2 served app if static files not found
    location @pm2 {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}

# Additional server block for port 3000 access
server {
    listen 3000;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable nginx site
ln -sf /etc/nginx/sites-available/bookmyhotel-frontend /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t

# Start and enable nginx
systemctl enable nginx
systemctl start nginx

# Setup log rotation
cat > /etc/logrotate.d/bookmyhotel-frontend << EOF
/var/log/bookmyhotel/frontend-*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 bookmyhotel bookmyhotel
    postrotate
        sudo -u bookmyhotel pm2 reload bookmyhotel-frontend
    endscript
}
EOF

# Create deployment script for updates
cat > /opt/bookmyhotel/deploy-frontend.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting frontend deployment at $(date)"

# Pull latest changes
git pull origin ${github_branch}

# Install dependencies and build
cd frontend
npm ci --production=false
npm run build

# Reload PM2 process
sudo -u bookmyhotel pm2 reload bookmyhotel-frontend

# Reload nginx to serve new static files
systemctl reload nginx

echo "Frontend deployment completed at $(date)"
EOF

chmod +x /opt/bookmyhotel/deploy-frontend.sh
chown bookmyhotel:bookmyhotel /opt/bookmyhotel/deploy-frontend.sh

# Setup firewall
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 3000
ufw allow 443

# Create health check script
cat > /opt/bookmyhotel/health-check.sh << EOF
#!/bin/bash
# Health check script for frontend

FRONTEND_URL="http://localhost:3000"
MAX_RETRIES=3
RETRY_COUNT=0

while [ \$RETRY_COUNT -lt \$MAX_RETRIES ]; do
    if curl -f -s \$FRONTEND_URL > /dev/null; then
        echo "Frontend is healthy"
        exit 0
    else
        echo "Frontend health check failed, attempt \$((RETRY_COUNT + 1))"
        RETRY_COUNT=\$((RETRY_COUNT + 1))
        sleep 10
    fi
done

echo "Frontend is unhealthy after \$MAX_RETRIES attempts"
exit 1
EOF

chmod +x /opt/bookmyhotel/health-check.sh

# Wait for application to start
echo "Waiting for frontend application to start..."
sleep 30

# Final health check
if /opt/bookmyhotel/health-check.sh; then
    echo "Frontend setup completed successfully at $(date)"
else
    echo "Frontend setup completed but health check failed at $(date)"
fi

# Log PM2 and nginx status
sudo -u bookmyhotel pm2 status
systemctl status nginx --no-pager
