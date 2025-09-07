# Microsoft Graph Configuration Guide

## Overview
Your BookMyHotel application uses Microsoft Graph OAuth2 for sending emails. This guide explains how to configure it properly.

## Current Implementation Status
✅ **MicrosoftGraphConfig.java** - OAuth2 configuration management  
✅ **MicrosoftGraphEmailService.java** - Graph API email service  
✅ **EmailService.java** - Main email orchestration service  
✅ **Environment variable support** - Both local and AWS deployment  

## Azure App Registration Setup

### Step 1: Create Azure App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **"New registration"**
4. Configure:
   - **Name**: `BookMyHotel Email Service`
   - **Account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: Leave blank
5. Click **"Register"**

### Step 2: Collect Application Details
After registration, note these values:
- **Application (client) ID** → `MICROSOFT_GRAPH_CLIENT_ID`
- **Directory (tenant) ID** → `MICROSOFT_GRAPH_TENANT_ID`

### Step 3: Create Client Secret
1. Go to **"Certificates & secrets"**
2. Click **"New client secret"**
3. Add description: `BookMyHotel Email Service`
4. Choose expiration: **24 months** (recommended)
5. Copy the secret value → `MICROSOFT_GRAPH_CLIENT_SECRET`

### Step 4: Configure API Permissions
1. Go to **"API permissions"**
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"**
4. Choose **"Application permissions"**
5. Add these permissions:
   - `Mail.Send` - Send mail as any user
   - `User.Read.All` - Read user profiles (optional)
6. **Important**: Click **"Grant admin consent for [YourTenant]"**

## Environment Configuration

### Local Development (.env or application.properties)
```properties
# Microsoft Graph OAuth2 Configuration
microsoft.graph.client-id=${MICROSOFT_GRAPH_CLIENT_ID:}
microsoft.graph.tenant-id=${MICROSOFT_GRAPH_TENANT_ID:}
microsoft.graph.client-secret=${MICROSOFT_GRAPH_CLIENT_SECRET:}
microsoft.graph.scopes=https://graph.microsoft.com/.default

# Email Configuration
app.email.from=${APP_EMAIL_FROM:noreply@bookmyhotel.com}
```

### AWS Production Environment Variables
```bash
export MICROSOFT_GRAPH_CLIENT_ID="your-client-id-here"
export MICROSOFT_GRAPH_TENANT_ID="your-tenant-id-here"
export MICROSOFT_GRAPH_CLIENT_SECRET="your-client-secret-here"
export APP_EMAIL_FROM="noreply@yourdomain.com"
```

## Configuration Validation

Your app automatically validates Microsoft Graph configuration on startup:

```java
@PostConstruct
public void validateConfiguration() {
    if (isConfigured()) {
        logger.info("✅ Microsoft Graph OAuth2 is properly configured");
    } else {
        logger.warn("⚠️ Microsoft Graph OAuth2 is NOT configured");
        logger.warn("Please set environment variables: MICROSOFT_GRAPH_CLIENT_ID, MICROSOFT_GRAPH_TENANT_ID, MICROSOFT_GRAPH_CLIENT_SECRET");
    }
}
```

## Email Features Supported

Your Microsoft Graph integration supports:

### ✅ Booking Confirmation Emails
- Sent when bookings are created
- Includes booking details, hotel information, itinerary
- Professional HTML templates with Thymeleaf

### ✅ Booking Update Notifications  
- Sent when bookings are modified or cancelled
- Includes update reason and new booking details

### ✅ Hotel Admin Welcome Emails
- Sent to new hotel administrators
- Includes temporary password and login instructions

### ✅ Hotel Registration Approval
- Sent when hotel registration is approved
- Includes account activation details

### ✅ User Welcome Emails
- Sent to new registered users
- Welcome message with app information

## Testing Your Configuration

1. **Start your application** with the environment variables set
2. **Check the logs** for configuration validation:
   ```
   ✅ Microsoft Graph OAuth2 is properly configured
   Client ID: 12345678...
   Tenant ID: abcdef12...
   Scopes: https://graph.microsoft.com/.default
   ```

3. **Test email sending** by creating a booking or registering a user

## Troubleshooting

### Common Issues:

1. **"Microsoft Graph OAuth2 is not configured"**
   - Check environment variables are set correctly
   - Verify no extra spaces in variable values

2. **"Failed to authenticate with Microsoft Graph"**
   - Verify client secret is correct and not expired
   - Check tenant ID is correct

3. **"Insufficient privileges to complete the operation"**
   - Ensure admin consent was granted for Mail.Send permission
   - Verify API permissions are correctly configured

4. **"The specified object was not found in the directory"**
   - Check the APP_EMAIL_FROM email exists in your tenant
   - Verify the user has appropriate mailbox permissions

### Debug Mode
Enable debug logging to see detailed Graph API interactions:
```properties
logging.level.com.bookmyhotel.service.MicrosoftGraphEmailService=DEBUG
```

## Security Best Practices

1. **Client Secret Management**:
   - Store client secrets securely (AWS Secrets Manager, Azure Key Vault)
   - Rotate secrets before expiration
   - Never commit secrets to version control

2. **Permissions**:
   - Use least-privilege principle
   - Only grant necessary Graph API permissions
   - Regularly review and audit permissions

3. **Monitoring**:
   - Monitor email sending rates and quotas
   - Set up alerts for authentication failures
   - Track usage with Azure AD sign-in logs

## Graph API Limits

- **Mail sending**: 10,000 messages per day per user
- **Authentication**: Token valid for 1 hour (auto-refreshed)
- **Rate limiting**: 10,000 requests per 10 minutes per app

## Current Implementation Details

Your app uses the **Client Credentials OAuth2 flow** which:
- ✅ Requires no user interaction
- ✅ Works for application-only scenarios
- ✅ Suitable for server-to-server email sending
- ✅ Automatically handles token refresh

The email service automatically:
- Validates configuration on startup
- Handles OAuth2 token acquisition and refresh
- Provides detailed logging for debugging
- Gracefully handles errors and provides meaningful messages

## Next Steps

1. Complete Azure app registration
2. Set environment variables
3. Test email functionality
4. Monitor email delivery and performance
5. Set up production monitoring and alerting
