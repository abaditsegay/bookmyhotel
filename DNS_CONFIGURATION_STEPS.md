# DNS Configuration Steps for shegeroom.com

## Current Issue 🚨
Your domain `shegeroom.com` is currently pointing to a GoDaddy parking page instead of your AWS server (44.204.49.94).

## DNS Records That Need to Be Updated

### Step 1: Log into Your Domain Registrar
Go to your domain registrar (where you purchased shegeroom.com) and access the DNS management section.

### Step 2: Update DNS Records
You need to set up the following DNS records:

#### Remove All Existing A Records
First, delete any existing A records for:
- @ (root domain)
- www
- * (wildcard)

#### Add New A Record
```
Type: A
Name: @ (or leave blank for root domain)
Value: 44.204.49.94
TTL: 300 (or 5 minutes)
```

#### Add WWW CNAME Record (Optional)
```
Type: CNAME
Name: www
Value: shegeroom.com
TTL: 300
```

### Step 3: Wait for DNS Propagation
- DNS changes can take 5 minutes to 24 hours to propagate
- You can check propagation status at: https://dnschecker.org/

### Step 4: Test DNS Resolution
Once propagated, test with:
```bash
nslookup shegeroom.com
# Should return only: 44.204.49.94
```

### Step 5: Obtain SSL Certificate
After DNS is properly configured, run:
```bash
ssh -i ~/.ssh/bookmyhotel-aws ubuntu@44.204.49.94 "sudo certbot --nginx -d shegeroom.com --non-interactive --agree-tos --email admin@shegeroom.com"
```

## Current Working URLs (While Waiting for DNS) 🔗
Your application is fully functional at:
- Frontend: http://44.204.49.94/
- Backend API: http://44.204.49.94/managemyhotel/
- Health Check: http://44.204.49.94/managemyhotel/actuator/health

## Final URLs (After DNS + SSL) 🎯
Once DNS and SSL are configured:
- Frontend: https://shegeroom.com/
- Backend API: https://shegeroom.com/managemyhotel/
- Health Check: https://shegeroom.com/managemyhotel/actuator/health

## Configuration Files Already Updated ✅
- Backend configuration: Uses shegeroom.com domain
- Nginx configuration: Serves shegeroom.com domain
- CORS settings: Allow shegeroom.com requests
- Email configuration: Uses noreply@shegeroom.com

The migration is complete on the server side. You just need to update the DNS records at your domain registrar.
