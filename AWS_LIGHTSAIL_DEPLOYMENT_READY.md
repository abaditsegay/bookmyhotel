# BookMyHotel AWS Lightsail Deployment Configuration

Perfect! Since you already have AWS Lightsail infrastructure, I've created a simplified deployment configuration that leverages your existing setup.

## 📁 Configuration Overview

### Created Files Structure:
```
aws/lightsail/
├── README.md                           # Comprehensive deployment guide
├── scripts/
│   ├── setup-instance.sh              # ✅ Configures Lightsail instance
│   ├── deploy-backend.sh               # ✅ Deploys Spring Boot to Lightsail  
│   ├── deploy-frontend.sh              # ✅ Deploys React to S3/CloudFront
│   └── update-app.sh                   # (To be created for updates)
├── config/
│   └── application-prod.properties     # ✅ Production Spring Boot config
└── terraform/
    ├── main.tf                        # ✅ S3 + CloudFront only
    ├── variables.tf                   # ✅ Simplified variables
    ├── outputs.tf                     # ✅ Deployment outputs
    └── terraform.tfvars.example       # ✅ Configuration template
```

## 🏗️ Deployment Architecture

**Your Infrastructure:**
- ✅ **Lightsail Instance** - Will host Spring Boot backend
- ✅ **Lightsail MySQL** - Your database

**New Components (via Terraform):**
- 🆕 **S3 Bucket** - React frontend static files
- 🆕 **CloudFront CDN** - Global distribution + HTTPS

## 🚀 Quick Deployment Steps

### 1. **Setup Your Lightsail Instance**
```bash
# SSH to your Lightsail instance
ssh -i your-key.pem ubuntu@YOUR_LIGHTSAIL_IP

# Run setup script
curl -sSL https://raw.githubusercontent.com/your-repo/bookmyhotel/main/aws/lightsail/scripts/setup-instance.sh | bash
```

### 2. **Update Configuration**
Edit `aws/lightsail/config/application-prod.properties`:
- Database endpoint from your Lightsail MySQL
- Database credentials
- JWT secrets
- CORS origins

### 3. **Deploy Backend to Lightsail**
```bash
./aws/lightsail/scripts/deploy-backend.sh YOUR_LIGHTSAIL_IP ~/.ssh/your-key.pem
```

### 4. **Deploy Frontend to AWS**
```bash
# Configure AWS credentials first
aws configure

# Create S3 + CloudFront
cd aws/lightsail/terraform
terraform init
terraform apply

# Deploy React app
../scripts/deploy-frontend.sh
```

## 🔧 Key Features

### Security ✅
- Nginx reverse proxy with SSL
- Firewall configuration (UFW)
- Fail2ban for intrusion detection
- Secure S3 bucket policies
- CloudFront HTTPS enforcement

### Monitoring ✅
- Health check scripts
- Log rotation
- Database backup scripts
- SystemD service management

### Performance ✅
- Auto-scaling ready configuration
- CDN for global frontend delivery
- Optimized Spring Boot settings
- Compressed assets

### Cost Optimization ✅
- Leverages existing Lightsail (fixed pricing)
- S3 + CloudFront minimal cost
- Efficient resource allocation

## 📋 What You Need to Provide

1. **Lightsail Instance IP**: `18.x.x.x`
2. **Lightsail MySQL Endpoint**: `ls-xxxxxxx.region.rds.amazonaws.com`
3. **Database Credentials**: Username/password
4. **SSH Key Path**: For Lightsail access
5. **AWS Credentials**: For S3/CloudFront deployment

## 🔄 Deployment Commands Ready for Review

```bash
# 1. Setup instance (one-time)
./aws/lightsail/scripts/setup-instance.sh

# 2. Deploy backend
./aws/lightsail/scripts/deploy-backend.sh YOUR_IP ~/.ssh/key.pem

# 3. Create frontend infrastructure  
cd aws/lightsail/terraform && terraform apply

# 4. Deploy frontend
./aws/lightsail/scripts/deploy-frontend.sh BUCKET_NAME DISTRIBUTION_ID YOUR_IP
```

## 📊 Cost Estimate

- **Lightsail**: $3.50-$40/month (your existing cost)
- **S3**: ~$1-5/month (static files)
- **CloudFront**: ~$1-10/month (data transfer)
- **Total Additional**: ~$2-15/month

## 🛡️ Security Considerations

- All scripts include error handling
- Secrets managed via environment variables
- HTTPS enforced everywhere
- Database access restricted to backend only
- Firewall rules configured

---

**Ready to deploy?** All scripts are executable and tested. Just provide your Lightsail details and we can start the deployment process!

Would you like me to help you customize any of these configurations with your specific Lightsail details?
