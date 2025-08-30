# Quick Deployment Checklist

## Immediate Actions (30 minutes total)

### 1. Configure Credentials (15 min)
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with:
- [ ] Microsoft Graph Client ID
- [ ] Microsoft Graph Tenant ID  
- [ ] Microsoft Graph Client Secret
- [ ] Stripe API Key
- [ ] Stripe Webhook Secret
- [ ] Strong database passwords

### 2. Build Applications (10 min)
```bash
# Backend
cd backend
mvn clean package -DskipTests

# Frontend
cd ../frontend
npm install
npm run build
cd ..
```

### 3. Deploy Infrastructure (5 min)
```bash
cd terraform
./deploy.sh
```

## Post-Deployment (15 min)

### 4. Upload Applications
Use the IP addresses from Terraform output:

```bash
# Backend JAR upload
scp -i ~/.ssh/bookmyhotel-test-key backend/target/backend-1.0.0.jar ubuntu@BACKEND_IP:/tmp/

# Frontend build upload  
scp -r -i ~/.ssh/bookmyhotel-test-key frontend/build/* ubuntu@FRONTEND_IP:/tmp/

# Deploy backend
ssh -i ~/.ssh/bookmyhotel-test-key ubuntu@BACKEND_IP
sudo mv /tmp/backend-1.0.0.jar /app/bookmyhotel-backend.jar
sudo /app/deploy.sh
```

### 5. Verify Deployment
- [ ] Frontend accessible: `http://FRONTEND_IP:3000`
- [ ] Backend health: `http://BACKEND_IP:8080/actuator/health`
- [ ] Login functionality working
- [ ] API responses correct

## Ready to Deploy?
✅ Yes - All configurations and scripts are prepared
⏳ Need credentials in terraform.tfvars
