# 🌐 DNS Configuration Guide for www.251solutions.com

This guide shows you exactly how to configure your domain provider to work with your BookMyHotel AWS deployment.

## 📋 Quick Setup Steps

### Step 1: Deploy Infrastructure
```bash
cd terraform
./deploy.sh deploy
```

### Step 2: Get Your Server IP
```bash
# After deployment completes, get your Elastic IP
terraform output instance_public_ip
# Example: 54.123.456.789
```

### Step 3: Configure DNS
Go to your domain provider and create this DNS record:

```
Type: A Record
Name: www
Host: www.251solutions.com
Value: [Your Elastic IP from Step 2]
TTL: 300 (5 minutes)
```

### Step 4: Test DNS (Wait 5-15 minutes)
```bash
# Test if DNS is working
nslookup www.251solutions.com
# Should return your Elastic IP

# Alternative test
ping www.251solutions.com
```

### Step 5: Setup SSL Certificate
```bash
# SSH into your server (use IP from Step 2)
ssh -i ~/.ssh/bookmyhotel_key ubuntu@[YOUR_ELASTIC_IP]

# Run SSL setup script (only after DNS is working!)
sudo /opt/bookmyhotel/setup-ssl.sh
```

### Step 6: Access Your Application
🎉 **Your app will be available at:**
- **Frontend**: https://www.251solutions.com/bookmyhotel
- **API**: https://www.251solutions.com/bookmyhotel/api

## 🏢 Domain Provider Specific Instructions

### GoDaddy
1. Login to GoDaddy
2. Go to "My Products" → "DNS"
3. Click "Manage" next to your domain
4. Add/Edit A Record:
   - **Type**: A
   - **Name**: www
   - **Value**: [Your Elastic IP]
   - **TTL**: 600 seconds

### Namecheap
1. Login to Namecheap
2. Go to "Domain List" → "Manage"
3. Click "Advanced DNS" tab
4. Add New Record:
   - **Type**: A Record
   - **Host**: www
   - **Value**: [Your Elastic IP]
   - **TTL**: Automatic

### Cloudflare
1. Login to Cloudflare
2. Select your domain
3. Go to "DNS" → "Records"
4. Add record:
   - **Type**: A
   - **Name**: www
   - **IPv4 address**: [Your Elastic IP]
   - **TTL**: Auto
   - **Proxy status**: DNS only (gray cloud)

### Google Domains
1. Login to Google Domains
2. Select your domain
3. Go to "DNS" tab
4. Custom records → Add:
   - **Type**: A
   - **Name**: www
   - **Data**: [Your Elastic IP]
   - **TTL**: 300

## 🔍 Troubleshooting

### DNS Not Working?
```bash
# Check current DNS resolution
nslookup www.251solutions.com

# Check from different DNS servers
nslookup www.251solutions.com 8.8.8.8
nslookup www.251solutions.com 1.1.1.1

# Use online DNS checker
# Visit: https://dnschecker.org
```

### SSL Certificate Issues?
```bash
# SSH into server
ssh -i ~/.ssh/bookmyhotel_key ubuntu@[ELASTIC_IP]

# Check if domain resolves to your server
curl -I http://www.251solutions.com/health

# If above works, run SSL setup
sudo /opt/bookmyhotel/setup-ssl.sh

# Check certificate status
sudo certbot certificates
```

### Application Not Loading?
```bash
# SSH into server
ssh -i ~/.ssh/bookmyhotel_key ubuntu@[ELASTIC_IP]

# Run status check
sudo /opt/bookmyhotel/status-check.sh

# Check individual services
sudo systemctl status nginx
sudo systemctl status bookmyhotel-backend
docker ps
```

## ⏱️ Timeline Expectations

| Step | Time | What's Happening |
|------|------|------------------|
| Deploy Infrastructure | 5-10 minutes | AWS resources being created |
| DNS Propagation | 5-15 minutes | DNS records spreading globally |
| SSL Certificate | 2-3 minutes | Let's Encrypt validation |
| **Total Setup Time** | **15-30 minutes** | **Complete deployment** |

## 🎯 Success Indicators

✅ **DNS Working**: `nslookup www.251solutions.com` returns your Elastic IP  
✅ **HTTP Working**: `curl http://www.251solutions.com/health` returns "healthy"  
✅ **SSL Working**: `curl https://www.251solutions.com/health` returns "healthy"  
✅ **App Working**: Browser shows BookMyHotel at https://www.251solutions.com/bookmyhotel  

## 🚨 Common Issues

### "DNS_PROBE_FINISHED_NXDOMAIN"
- **Problem**: DNS record not created or not propagated
- **Solution**: Double-check DNS record creation, wait longer

### "Connection Refused"
- **Problem**: AWS Security Group or server not running
- **Solution**: Check security groups, restart services

### "Certificate Error"
- **Problem**: SSL not setup or DNS not working when SSL was attempted
- **Solution**: Ensure DNS works first, then re-run SSL setup

### "502 Bad Gateway"
- **Problem**: Nginx running but backend not responding
- **Solution**: Check backend service status

## 📞 Need Help?

If you encounter issues:

1. **Check the status**: `terraform output` and `./deploy.sh status`
2. **Test step by step**: DNS → HTTP → SSL → HTTPS
3. **Review logs**: SSH into server and check `/var/log/nginx/` and `journalctl -u bookmyhotel-backend`

---

**🎉 Once DNS is configured, your BookMyHotel application will be live at https://www.251solutions.com/bookmyhotel!**
