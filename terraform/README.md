# BookMyHotel AWS Terraform Deployment

This directory contains Terraform configuration for deploying BookMyHotel on AWS with a secure, single-server architecture.

## 🏗️ Architecture Overview

```
Internet → Nginx (80/443) → {
  /bookmyhotel/api/* → Backend (localhost:8080) [SECURE]
  /bookmyhotel/*     → Frontend (React app)
}
```

## 🔒 Security Features

- ✅ **Backend isolation**: Only accessible via localhost, not from internet
- ✅ **Nginx reverse proxy**: Single entry point for all traffic  
- ✅ **Security groups**: Only ports 80/443/22 open
- ✅ **SSL termination**: Let's Encrypt certificates
- ✅ **Firewall**: UFW configured with minimal access

## 📁 Files

- `main.tf` - Main infrastructure (VPC, EC2, Security Groups)
- `variables.tf` - Input variables and configuration
- `outputs.tf` - Important deployment information
- `userdata.sh` - EC2 bootstrap script
- `terraform.tfvars.example` - Example configuration file

## 🚀 Deployment Steps

### 1. Prerequisites

```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://terraform.io

# Generate SSH key pair if you don't have one
ssh-keygen -t rsa -b 4096 -f ~/.ssh/bookmyhotel_key
```

### 2. Configure Variables

```bash
# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars
```

**Important**: Update these values in `terraform.tfvars`:
- `public_key` - Your SSH public key content
- `ssh_cidr_block` - Your IP address (e.g., "123.456.789.0/32")
- `stripe_secret_key` - Your Stripe secret key

### 3. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan deployment (review changes)
terraform plan

# Apply infrastructure
terraform apply
```

### 4. DNS Configuration

After deployment, configure your DNS:

```bash
# Get the Elastic IP from output
terraform output instance_public_ip

# Follow the DNS setup guide
cat DNS_SETUP_GUIDE.md
```

**📋 Quick DNS Setup:**
- **Type**: A Record
- **Name**: www.251solutions.com  
- **Value**: [Elastic IP from output]
- **TTL**: 300 seconds

**📖 Detailed Instructions**: See `DNS_SETUP_GUIDE.md` for provider-specific steps.

### 5. SSL Setup

Once DNS is configured and pointing to your server:

```bash
# SSH into server
ssh -i ~/.ssh/bookmyhotel_key ubuntu@[ELASTIC_IP]

# Run SSL setup script
sudo /opt/bookmyhotel/setup-ssl.sh
```

## 📊 Monitoring & Management

### Check Application Status

```bash
# SSH into server
ssh -i ~/.ssh/bookmyhotel_key ubuntu@[ELASTIC_IP]

# Run status check
sudo /opt/bookmyhotel/status-check.sh
```

### Service Management

```bash
# Backend service
sudo systemctl status bookmyhotel-backend
sudo systemctl restart bookmyhotel-backend

# Nginx 
sudo systemctl status nginx
sudo systemctl restart nginx

# MySQL container
docker ps
docker logs bookmyhotel-mysql
```

### View Logs

```bash
# Application logs
sudo journalctl -u bookmyhotel-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# User data script log
sudo cat /var/log/user-data.log
```

## 🔧 Application URLs

After deployment:

- **Frontend**: `https://www.251solutions.com/bookmyhotel`
- **API**: `https://www.251solutions.com/bookmyhotel/api` (proxied to backend)
- **Health Check**: `https://www.251solutions.com/health`

## 🛠️ Troubleshooting

### Common Issues

1. **Backend not starting**:
   ```bash
   sudo journalctl -u bookmyhotel-backend -n 50
   sudo systemctl restart bookmyhotel-backend
   ```

2. **Frontend not loading**:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Database connection issues**:
   ```bash
   docker logs bookmyhotel-mysql
   docker restart bookmyhotel-mysql
   ```

4. **SSL certificate issues**:
   ```bash
   sudo certbot renew --dry-run
   sudo /opt/bookmyhotel/setup-ssl.sh
   ```

### Health Checks

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Frontend check  
curl -I http://localhost/bookmyhotel/

# Database check
docker exec bookmyhotel-mysql mysqladmin ping -h localhost -u root -p
```

## 💰 Cost Estimation

**Monthly AWS costs (US East 1)**:
- EC2 t3.small: ~$15/month
- EBS 30GB: ~$3/month  
- Elastic IP: ~$4/month
- Data Transfer: ~$3/month
- **Total**: ~$25/month

## 🔄 Updates & Maintenance

### Application Updates

```bash
# SSH into server
ssh -i ~/.ssh/bookmyhotel_key ubuntu@[ELASTIC_IP]

# Update application code
cd /opt/bookmyhotel/app
git pull origin stage

# Rebuild backend
cd backend && mvn clean package -DskipTests

# Rebuild frontend  
cd ../frontend && npm run build
sudo cp -r build/* /var/www/bookmyhotel/

# Restart services
sudo systemctl restart bookmyhotel-backend
sudo systemctl restart nginx
```

### Infrastructure Updates

```bash
# Update Terraform configuration
vim main.tf

# Plan and apply changes
terraform plan
terraform apply
```

## 🗑️ Cleanup

To destroy all resources:

```bash
terraform destroy
```

## 📞 Support

For issues:
1. Check the troubleshooting section above
2. Review logs on the server
3. Verify DNS configuration
4. Check security group settings

---

**Happy Deploying! 🚀**
