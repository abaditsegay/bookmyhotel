# AWS Lightsail Mobile Access Configuration

## Overview
This document outlines the changes made to enable mobile device access to your BookMyHotel application deployed on AWS Lightsail.

## Problem
The original deployment was configured to only accept connections from localhost and specific IP addresses, preventing mobile devices on different networks from accessing the application.

## Solution Applied

### 1. Backend Configuration Changes

**File:** `aws/lightsail/config/application-prod.properties`

**Changes Made:**
```properties
# BEFORE
server.port=8080
server.servlet.context-path=/managemyhotel

# AFTER  
server.port=8080
server.address=0.0.0.0  # ← Added: Bind to all network interfaces
server.servlet.context-path=/managemyhotel
```

**CORS Configuration Updated:**
```properties
# BEFORE
app.cors.allowed-origins=http://54.235.230.218,https://54.235.230.218,http://localhost:3000,https://your-cloudfront-domain.cloudfront.net

# AFTER
app.cors.allowed-origins=http://54.235.230.218,https://54.235.230.218,http://54.235.230.218:3000,https://54.235.230.218:3000,http://localhost:3000,https://your-cloudfront-domain.cloudfront.net,*
```

### 2. Frontend Configuration Changes

**File:** `aws/lightsail/scripts/deploy-frontend-simple.sh`

**Changes Made:**
```bash
# BEFORE
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=REACT_APP_API_URL=http://localhost:8080/managemyhotel/api
Environment=REACT_APP_SERVER_URL=http://localhost:8080/managemyhotel

# AFTER
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0  # ← Added: Bind to all network interfaces
Environment=REACT_APP_API_URL=http://54.235.230.218:8080/managemyhotel/api
Environment=REACT_APP_SERVER_URL=http://54.235.230.218:8080/managemyhotel
```

### 3. New Mobile Access Update Script

**File:** `aws/lightsail/scripts/update-for-mobile-access.sh`

This script automates the process of updating your existing AWS Lightsail deployment with mobile access capabilities.

**Features:**
- Updates backend systemd service configuration
- Updates frontend systemd service configuration  
- Configures firewall rules for mobile access
- Updates Nginx configuration for CORS and mobile support
- Restarts services with new configuration
- Tests the updated deployment

## How to Apply the Mobile Access Fix

### Option 1: Use the Update Script (Recommended)
```bash
# Make script executable (already done)
chmod +x aws/lightsail/scripts/update-for-mobile-access.sh

# Run the update script
./aws/lightsail/scripts/update-for-mobile-access.sh 54.235.230.218 ~/.ssh/your-lightsail-key.pem
```

### Option 2: Redeploy with Updated Configuration
```bash
# Deploy backend with updated configuration
./aws/lightsail/scripts/deploy-backend.sh 54.235.230.218 ~/.ssh/your-lightsail-key.pem

# Deploy frontend with updated configuration  
./aws/lightsail/scripts/deploy-frontend-simple.sh 54.235.230.218 ~/.ssh/your-lightsail-key.pem
```

## Mobile Access URLs

After applying the fix, your application will be accessible from mobile devices at:

- **Frontend:** `http://54.235.230.218:3000`
- **Backend API:** `http://54.235.230.218:8080/managemyhotel/api`
- **Health Check:** `http://54.235.230.218:8080/managemyhotel/actuator/health`

## Key Changes Summary

1. **Backend Binding:** Changed from `localhost` to `0.0.0.0` to accept connections from any network interface
2. **Frontend Binding:** Added `HOST=0.0.0.0` to React dev server to accept external connections
3. **CORS Configuration:** Expanded allowed origins to include mobile access patterns
4. **API Configuration:** Updated frontend to use public IP instead of localhost
5. **Firewall Rules:** Opened ports 8080 and 3000 for external access
6. **Nginx Configuration:** Added CORS headers and mobile-friendly routing

## Testing Mobile Access

1. **Connect your mobile device to any WiFi network**
2. **Open mobile browser and navigate to:** `http://54.235.230.218:3000`
3. **Try logging in** - API calls should now work without `ERR_CONNECTION_REFUSED`
4. **Test API directly:** `http://54.235.230.218:8080/managemyhotel/api/hotels`

## Troubleshooting

If mobile access doesn't work:

1. **Check service status:**
   ```bash
   ssh -i ~/.ssh/your-key.pem ubuntu@54.235.230.218 'sudo systemctl status bookmyhotel-backend.service bookmyhotel-frontend.service'
   ```

2. **Check logs:**
   ```bash
   ssh -i ~/.ssh/your-key.pem ubuntu@54.235.230.218 'sudo journalctl -u bookmyhotel-backend.service -f'
   ssh -i ~/.ssh/your-key.pem ubuntu@54.235.230.218 'sudo journalctl -u bookmyhotel-frontend.service -f'
   ```

3. **Test connectivity:**
   ```bash
   curl http://54.235.230.218:8080/managemyhotel/actuator/health
   curl http://54.235.230.218:3000
   ```

## Security Considerations

- The `*` in CORS origins allows access from any domain - consider restricting this in production
- Firewall rules now allow external access - ensure your authentication is robust
- Monitor logs for suspicious activity from external IPs

## Production Recommendations

For production use, consider:
1. Using HTTPS with SSL certificates
2. Implementing rate limiting
3. Restricting CORS to specific domains
4. Using a CDN for frontend assets
5. Implementing proper monitoring and logging
