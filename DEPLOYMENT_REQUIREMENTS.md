# Deployment Input Requirements Summary

## Critical Information You Must Provide

### 1. Microsoft Graph OAuth Credentials (Required for Email)

**Where to Get:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "App registrations" 
3. Create new app or select existing
4. Note these values:

```
Application (client) ID: ________________________________________
Directory (tenant) ID:   ________________________________________
Client secret value:     ________________________________________ 
```

**How to Add to Configuration:**
Edit `terraform/terraform.tfvars`:
```hcl
microsoft_graph_client_id     = "your-client-id-here"
microsoft_graph_tenant_id     = "your-tenant-id-here"  
microsoft_graph_client_secret = "your-client-secret-here"
```

### 2. Stripe Payment Credentials (Required for Payments)

**Where to Get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to "Developers" → "API keys"
3. Copy test keys:

```
Test API Key:        ____________________________________________
Webhook Secret:      ____________________________________________
```

**How to Add to Configuration:**
Edit `terraform/terraform.tfvars`:
```hcl
stripe_api_key        = "sk_test_your_stripe_key_here"
stripe_webhook_secret = "whsec_your_webhook_secret_here"
```

### 3. Database Security (Recommended to Change)

**Default Values (Change These):**
```
Root Password: BookMyHotel2025!
App Password:  AppPassword2025!
```

**How to Add to Configuration:**
Edit `terraform/terraform.tfvars`:
```hcl
db_root_password = "YourSecureRootPassword2025!"
db_app_password  = "YourSecureAppPassword2025!"
```

## Quick Start Commands

### Step 1: Configure Credentials
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your credentials above
```

### Step 2: Deploy Everything
```bash
./deploy.sh
```

### Step 3: Confirm When Asked
```
Type "yes" when Terraform shows deployment plan
Choose "y" when asked about application deployment
```

## Confirmation Points During Deployment

### Terraform Approval
You'll see this prompt:
```
Plan: 15 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Enter a value: yes
```
**Type: `yes`**

### Application Deployment Choice
You'll see this prompt:
```
Do you want to deploy the application code now? (y/n)
```
**Type: `y` (recommended for automatic deployment)**

## What Happens Automatically

✅ **No Input Needed For These:**
- Infrastructure provisioning (3 AWS Lightsail instances)
- Security group configuration
- Database setup and user creation
- Application builds (Maven + npm)
- Service configuration and startup
- Health monitoring setup

## Total Time Investment

- **Your Active Time**: 5-10 minutes (editing config + confirmations)
- **Total Process Time**: 20-30 minutes (mostly automated)
- **Result**: Fully deployed hotel booking application

## After Deployment

You'll receive:
- Frontend URL: `http://YOUR_IP:3000`
- SSH access commands for all instances
- Health check URLs and commands
- Default login credentials for testing

## Troubleshooting Credentials

### Microsoft Graph Issues
- Ensure app registration has correct permissions
- Client secret must not be expired
- Tenant ID is the directory ID, not tenant name

### Stripe Issues  
- Use test keys (start with `sk_test_`)
- Webhook secret starts with `whsec_`
- Ensure webhook endpoint matches your domain

### Database Issues
- Passwords must be strong (letters, numbers, symbols)
- Avoid special characters that conflict with URLs
- Don't use spaces in passwords

## Ready to Deploy?

**You have everything needed when:**
- ✅ Microsoft Graph credentials copied and ready
- ✅ Stripe credentials copied and ready  
- ✅ Strong database passwords chosen
- ✅ AWS CLI configured and working
- ✅ 20-30 minutes available for deployment

**Start with:** `cd terraform && ./deploy.sh`
