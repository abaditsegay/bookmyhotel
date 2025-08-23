# BookMyHotel Secure Configuration
# Generated on Sat Aug 23 16:38:56 EDT 2025
# KEEP THIS FILE SECURE - Contains sensitive credentials

# AWS Configuration
aws_region = "us-east-1"
environment = "test"

# EC2 Configuration  
instance_type = "t3.small"
root_volume_size = 30

# SSH Configuration
ssh_cidr_block = "YOUR_IP_ADDRESS/32"
public_key = "YOUR_SSH_PUBLIC_KEY_HERE"

# Domain Configuration
domain_name = "www.251solutions.com"

# SECURE CREDENTIALS - Auto-generated
mysql_root_password = "REPLACE_WITH_SECURE_PASSWORD"
jwt_secret_key = "REPLACE_WITH_SECURE_JWT_SECRET"

# Microsoft Graph OAuth2 (Your provided values)
microsoft_graph_client_id = "REPLACE_WITH_YOUR_CLIENT_ID"
microsoft_graph_tenant_id = "REPLACE_WITH_YOUR_TENANT_ID"
microsoft_graph_client_secret = "REPLACE_WITH_YOUR_CLIENT_SECRET"

# Stripe Configuration (update with your actual keys)
stripe_secret_key = "sk_test_your_stripe_secret_key_here"

# Email Configuration
app_email_from = "noreply@251solutions.com"
