# Production Security Checklist

## ⚠️ CRITICAL: Environment Variables Required for Production

### Essential Security Configuration

**Before deploying to production, you MUST set these environment variables:**

#### Database Security
```bash
DATABASE_URL=jdbc:mysql://your-prod-db-host:3306/bookmyhotel?useSSL=true&requireSSL=true
DATABASE_USERNAME=your_secure_db_user
DATABASE_PASSWORD=your_secure_db_password
```

#### JWT Security (CRITICAL)
```bash
# Generate a cryptographically secure 512-bit key
JWT_SECRET_KEY=your_cryptographically_secure_jwt_secret_key_at_least_512_bits
JWT_EXPIRATION_TIME=86400000
JWT_REFRESH_EXPIRATION_TIME=604800000
JWT_ISSUER=your-app-domain
```

#### Payment Provider Secrets
```bash
# Stripe Configuration
STRIPE_API_KEY=sk_live_your_production_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# Ethiopian Mobile Payment APIs
MBIRR_API_KEY=your_production_mbirr_api_key
MBIRR_API_SECRET=your_production_mbirr_secret
MBIRR_MERCHANT_ID=your_mbirr_merchant_id
MBIRR_MERCHANT_CODE=your_mbirr_merchant_code
MBIRR_WEBHOOK_SECRET=your_mbirr_webhook_secret

TELEBIRR_API_KEY=your_production_telebirr_api_key
TELEBIRR_API_SECRET=your_production_telebirr_secret
TELEBIRR_MERCHANT_ID=your_telebirr_merchant_id
TELEBIRR_MERCHANT_CODE=your_telebirr_merchant_code
TELEBIRR_WEBHOOK_SECRET=your_telebirr_webhook_secret
```

#### Email Service Configuration
```bash
MICROSOFT_GRAPH_CLIENT_ID=your_azure_app_client_id
MICROSOFT_GRAPH_TENANT_ID=your_azure_tenant_id
MICROSOFT_GRAPH_CLIENT_SECRET=your_azure_app_secret
```

#### System Admin Configuration
```bash
SYSTEM_ADMIN_EMAIL=admin@yourdomain.com
SYSTEM_ADMIN_PASSWORD=your_secure_admin_password
DEFAULT_HOTEL_ADMIN_PASSWORD=your_secure_default_password
DEFAULT_FRONTDESK_PASSWORD=your_secure_frontdesk_password
```

### Spring Profile Configuration

Set the active Spring profile to prevent sample data creation:

```bash
SPRING_PROFILES_ACTIVE=production
```

## Security Recommendations

### 1. JWT Secret Key Generation
```bash
# Generate a secure 512-bit key using OpenSSL
openssl rand -hex 64
```

### 2. Database Security
- Use SSL/TLS connections (`useSSL=true&requireSSL=true`)
- Create dedicated database user with minimal permissions
- Use strong passwords (16+ characters, mixed case, numbers, symbols)

### 3. Password Requirements
- Minimum 8 characters
- Must contain uppercase, lowercase, digits, and special characters
- Change all default passwords

### 4. API Keys and Secrets
- Use production API keys (not test keys)
- Rotate secrets regularly
- Store in secure environment variable management system

### 5. Disable Development Features
- Set `spring.jpa.show-sql=false`
- Set `logging.level.com.bookmyhotel=WARN`
- Ensure `SPRING_PROFILES_ACTIVE=production`

## Deployment Verification

After setting environment variables, verify:

1. **No sample data created** - Check logs for "Production profile detected"
2. **Database connection secure** - Verify SSL connection
3. **JWT tokens working** - Test authentication
4. **Payment providers configured** - Test payment flows
5. **Email service working** - Test notification emails

## Security Monitoring

Monitor these in production:
- Failed authentication attempts
- JWT token validation failures
- Payment processing errors
- Database connection issues
- Email delivery failures

## Quick Security Check Commands

```bash
# Check if running in production mode
curl -s http://your-app/managemyhotel/actuator/health | grep status

# Verify JWT is properly configured (should not expose secrets)
curl -s http://your-app/managemyhotel/actuator/info

# Check database connection
curl -s http://your-app/managemyhotel/actuator/health/db
```

---

**⚠️ WARNING**: Never commit production secrets to version control. Always use environment variables or secure secret management systems.