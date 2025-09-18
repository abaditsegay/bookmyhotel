# AWS Lightsail Deployment Guide

## Overview
This guide helps you deploy the BookMyHotel application to your existing AWS Lightsail infrastructure.

## Prerequisites
- ✅ AWS Lightsail instance (already created)
- ✅ AWS Lightsail MySQL database (already created)
- SSH access to your Lightsail instance
- Domain name (optional)

## Deployment Architecture
```
Internet → CloudFront (CDN) → S3 (Frontend)
                            ↓
Internet → Lightsail Instance (Backend) → Lightsail MySQL Database
```

## Directory Structure
```
aws/lightsail/
├── README.md                    # This guide
├── scripts/
│   ├── deploy-backend.sh        # Backend deployment script
│   ├── deploy-frontend.sh       # Frontend deployment script
│   ├── setup-instance.sh        # Instance configuration script
│   └── update-app.sh           # Application update script
├── config/
│   ├── nginx.conf              # Nginx configuration
│   ├── application.properties   # Spring Boot production config
│   └── ecosystem.config.js     # PM2 configuration (if using Node.js process manager)
└── terraform/
    ├── main.tf                 # S3 + CloudFront for frontend only
    ├── variables.tf            # Variables for S3/CloudFront
    └── outputs.tf              # Deployment outputs
```

## Quick Start

### 1. Configure Your Lightsail Instance
```bash
# SSH to your Lightsail instance
ssh -i your-key.pem ubuntu@your-lightsail-ip

# Run the setup script
curl -sSL https://raw.githubusercontent.com/yourusername/bookmyhotel/main/aws/lightsail/scripts/setup-instance.sh | bash
```

### 2. Configure Database Connection
Update your application properties with Lightsail database details:
- Database endpoint
- Database credentials
- Connection settings

### 3. Deploy Backend to Lightsail
```bash
# From your local machine
./aws/lightsail/scripts/deploy-backend.sh your-lightsail-ip
```

### 4. Deploy Frontend to S3/CloudFront
```bash
# Configure AWS credentials
aws configure

# Deploy frontend
./aws/lightsail/scripts/deploy-frontend.sh
```

## Configuration Steps

### Backend Configuration
1. **Application Properties**: Update database connection details
2. **Environment Variables**: Set production environment variables
3. **Reverse Proxy**: Configure Nginx for SSL and load balancing
4. **Process Management**: Use PM2 or systemd for process management

### Frontend Configuration
1. **Build Configuration**: Update API base URL for production
2. **S3 Bucket**: Create S3 bucket for static hosting
3. **CloudFront**: Set up CDN for global distribution
4. **Domain**: Configure custom domain (optional)

## Security Considerations
- Configure Lightsail firewall rules
- Use HTTPS with SSL certificates
- Secure database access
- Configure CORS policies
- Set up monitoring and logging

## Monitoring
- Lightsail monitoring metrics
- CloudWatch logs for Lambda functions
- Application performance monitoring
- Database performance monitoring

## Cost Optimization
- Lightsail fixed pricing (already optimized)
- S3 storage costs for frontend
- CloudFront data transfer costs
- Consider Reserved Capacity for RDS

## Troubleshooting
- Check Lightsail instance logs
- Verify database connectivity
- Test API endpoints
- Validate frontend deployment

## Support
For issues with this deployment:
1. Check application logs on Lightsail instance
2. Verify database connection
3. Test S3/CloudFront configuration
4. Review security group settings
