# 🚀 AWS Lightsail Deployment Checklist

## Pre-Deployment Requirements ✅

### 1. AWS Account Setup
- [ ] AWS account with billing enabled
- [ ] AWS CLI installed and configured: `aws configure`
- [ ] Terraform installed (v1.0+): `terraform --version`
- [ ] Verify AWS credentials: `aws sts get-caller-identity`

### 2. SSH Key Setup
- [ ] Generate SSH key pair: `ssh-keygen -t rsa -b 4096 -C "your-email@example.com"`
- [ ] Copy public key content: `cat ~/.ssh/id_rsa.pub`
- [ ] Update terraform.tfvars with your public key

### 3. Configuration Files
- [ ] Copy terraform.tfvars.example to terraform.tfvars: `cp terraform.tfvars.example terraform.tfvars`
- [ ] Update database_password with secure password
- [ ] Update jwt_secret with 32+ character secure key
- [ ] Update github_repo_url with your repository
- [ ] Update notification_email
- [ ] Update ssh_public_key with your actual key

### 4. Code Repository
- [ ] Code committed to Git repository
- [ ] Repository accessible (public or with proper credentials)
- [ ] Correct branch specified in terraform.tfvars

## Deployment Steps 📋

### Step 1: Validate Configuration
```bash
cd terraform
./deploy.sh validate
```

### Step 2: Plan Deployment
```bash
./deploy.sh plan
```

### Step 3: Deploy Infrastructure
```bash
./deploy.sh deploy
```

### Step 4: Monitor Deployment
- [ ] Watch Terraform output for errors
- [ ] Check AWS Lightsail console for resource creation
- [ ] Monitor deployment logs on instances

## Post-Deployment Verification ✅

### 1. Infrastructure Validation
- [ ] Backend instance running: `terraform output backend_public_ip`
- [ ] Frontend instance running: `terraform output frontend_public_ip`
- [ ] Database instance running: `terraform output database_endpoint`
- [ ] Static IPs assigned correctly

### 2. Application Health Checks
- [ ] Backend health: `curl http://BACKEND_IP:8080/actuator/health`
- [ ] Frontend accessible: `curl http://FRONTEND_IP:3000`
- [ ] Database connectivity test

### 3. Service Verification
- [ ] Backend logs: `ssh -i ~/.ssh/id_rsa ubuntu@BACKEND_IP "sudo journalctl -u bookmyhotel-backend -f"`
- [ ] Frontend logs: `ssh -i ~/.ssh/id_rsa ubuntu@FRONTEND_IP "sudo pm2 logs"`
- [ ] Nginx status: `ssh -i ~/.ssh/id_rsa ubuntu@INSTANCE_IP "sudo systemctl status nginx"`

### 4. Functional Testing
- [ ] Can access login page
- [ ] Authentication works
- [ ] API endpoints responding
- [ ] Database operations working

## Troubleshooting 🔧

### Common Issues and Solutions

#### 1. SSH Key Issues
```bash
# Problem: Invalid SSH key format
# Solution: Ensure key is properly formatted
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
cat ~/.ssh/id_rsa.pub  # Copy the ENTIRE output
```

#### 2. Database Connection Issues
```bash
# Problem: Backend can't connect to database
# Solution: Check security groups and connection string
# SSH into backend instance and check logs
ssh -i ~/.ssh/id_rsa ubuntu@BACKEND_IP
sudo journalctl -u bookmyhotel-backend -n 50
```

#### 3. CORS Issues
```bash
# Problem: Frontend can't reach backend
# Solution: Check CORS configuration in application.properties
# Verify backend is accessible: curl http://BACKEND_IP:8080/actuator/health
```

#### 4. Deployment Failures
```bash
# Problem: Terraform deployment fails
# Solution: Check AWS credentials and permissions
aws sts get-caller-identity
terraform destroy  # Clean up and retry
```

### Useful Commands

#### SSH into Instances
```bash
# Backend instance
ssh -i ~/.ssh/id_rsa ubuntu@$(terraform output -raw backend_public_ip)

# Frontend instance  
ssh -i ~/.ssh/id_rsa ubuntu@$(terraform output -raw frontend_public_ip)
```

#### Check Service Status
```bash
# Backend service
sudo systemctl status bookmyhotel-backend
sudo journalctl -u bookmyhotel-backend -f

# Frontend service
sudo pm2 status
sudo pm2 logs bookmyhotel-frontend

# Nginx
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

#### Database Operations
```bash
# Connect to database (from backend instance)
mysql -h $(terraform output -raw database_endpoint) -u admin -p bookmyhotel

# Check database connectivity
telnet $(terraform output -raw database_endpoint) 3306
```

## Cost Optimization 💰

### Current Configuration Costs (Monthly)
- Backend Instance (medium_2_0): ~$20/month
- Frontend Instance (small_2_0): ~$12/month  
- Database (medium_2_0): ~$30/month
- Static IPs (2): ~$2/month
- **Total: ~$64/month**

### Cost Reduction Options
- [ ] Use smaller instance sizes for testing
- [ ] Disable backups for development
- [ ] Use shared instances instead of dedicated
- [ ] Consider container services for smaller workloads

## Security Hardening 🔒

### Applied Security Measures
- [ ] Firewall rules configured
- [ ] SSH key-based authentication
- [ ] Database in private network
- [ ] Fail2ban installed
- [ ] Automatic security updates
- [ ] Non-root application users

### Additional Security Steps
- [ ] Change default SSH port
- [ ] Enable SSL/TLS with custom domain
- [ ] Set up AWS CloudWatch alerts
- [ ] Regular security updates
- [ ] Database backups tested

## Maintenance Tasks 📝

### Daily
- [ ] Monitor application logs
- [ ] Check system resources
- [ ] Verify backup completion

### Weekly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Performance monitoring

### Monthly
- [ ] Security patches
- [ ] Cost review
- [ ] Backup testing
- [ ] Performance optimization

## Emergency Procedures 🚨

### Application Down
1. Check service status: `sudo systemctl status bookmyhotel-backend`
2. Restart services: `sudo systemctl restart bookmyhotel-backend`
3. Check logs: `sudo journalctl -u bookmyhotel-backend -n 50`

### Database Issues
1. Check database connectivity: `telnet DB_ENDPOINT 3306`
2. Review database logs in AWS console
3. Restart database if necessary

### Complete Rollback
```bash
# Destroy all infrastructure
terraform destroy

# Restore from backup
# (Requires backup strategy implementation)
```

## Success Criteria ✨

### Deployment Successful When:
- [ ] All Terraform resources created successfully
- [ ] Applications accessible via public IPs
- [ ] Health checks passing
- [ ] Database operations working
- [ ] Authentication flows functional
- [ ] No critical errors in logs

### Performance Benchmarks:
- [ ] Backend response time < 500ms
- [ ] Frontend load time < 3 seconds
- [ ] Database query response < 100ms
- [ ] System uptime > 99%

---

## Quick Start Commands

```bash
# 1. Setup configuration
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 2. Validate and deploy
cd terraform
./deploy.sh validate
./deploy.sh plan
./deploy.sh deploy

# 3. Get connection info
terraform output

# 4. Test deployment
curl http://$(terraform output -raw backend_public_ip):8080/actuator/health
curl http://$(terraform output -raw frontend_public_ip):3000
```

**Estimated Deployment Time: 10-15 minutes**
**Monthly Cost: ~$64 (can be optimized to ~$25 for smaller instances)**
