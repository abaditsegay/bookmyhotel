# Email Notification System

## Overview

The BookMyHotel application now includes a comprehensive email notification system that sends welcome emails to users upon registration. The system uses Microsoft Graph OAuth2 integration for secure email delivery.

## Features

### ✅ User Registration Welcome Emails
- **Automatic Trigger**: Welcome emails are sent automatically when new users register
- **Beautiful Template**: Professional HTML email template with responsive design
- **User Information**: Personalized content including user's name, email, and registration date
- **Feature Highlights**: Overview of platform capabilities and benefits
- **Call-to-Action**: Direct link to start exploring hotels
- **Graceful Fallback**: Registration succeeds even if email delivery fails

### ✅ Hotel Admin Welcome Emails (Existing)
- Welcome emails for newly assigned hotel administrators
- Temporary password and login instructions
- Hotel-specific branding and information

### ✅ Booking Confirmation Emails (Existing)
- Detailed booking confirmations with itinerary
- Secure booking management links
- Professional hotel booking receipts

## Technical Implementation

### Email Service Architecture
```
EmailService.java
├── sendUserWelcomeEmail()          // NEW: User registration welcome
├── sendHotelAdminWelcomeEmail()    // Existing: Hotel admin onboarding  
├── sendBookingConfirmationEmail()  // Existing: Booking confirmations
└── sendBookingUpdateEmail()        // Existing: Booking updates
```

### User Registration Flow
```
AuthController.register()
    ↓
AuthService.register()
    ├── Create user account
    ├── Save to database
    ├── Send welcome email ➡️ EmailService.sendUserWelcomeEmail()
    └── Return JWT token for immediate login
```

### Email Template
- **File**: `backend/src/main/resources/templates/user-welcome.html`
- **Engine**: Thymeleaf templating with Spring Boot integration
- **Styling**: Responsive HTML with inline CSS for maximum compatibility
- **Variables**: 
  - `firstName`, `lastName` - User's name
  - `email` - User's email address  
  - `appName` - Application name (BookMyHotel)
  - `appUrl` - Frontend URL for call-to-action links
  - `registrationDate` - Account creation date

### Error Handling
- **Non-blocking**: Email failures don't prevent successful user registration
- **Logging**: Comprehensive logging for troubleshooting email delivery issues
- **Graceful Degradation**: System continues functioning if email service is unavailable

## Configuration

### Microsoft Graph OAuth2 Setup
The email system requires Microsoft Graph OAuth2 credentials:

```properties
# Environment Variables Required
MICROSOFT_GRAPH_CLIENT_ID=your_client_id
MICROSOFT_GRAPH_TENANT_ID=your_tenant_id  
MICROSOFT_GRAPH_CLIENT_SECRET=your_client_secret
```

### Application Properties
```properties
# Email Configuration
app.name=BookMyHotel
app.url=http://localhost:3000
app.email.from=noreply@251solutions.com

# Microsoft Graph OAuth2
microsoft.graph.client-id=${MICROSOFT_GRAPH_CLIENT_ID:}
microsoft.graph.tenant-id=${MICROSOFT_GRAPH_TENANT_ID:}
microsoft.graph.client-secret=${MICROSOFT_GRAPH_CLIENT_SECRET:}
microsoft.graph.scopes=https://graph.microsoft.com/.default
```

## Testing

### Registration Flow Test
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Name: booking-demo" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Expected Behavior
1. **Success Response**: JWT token and user details returned
2. **Database**: New user record created with GUEST role
3. **Email**: Welcome email sent to registered email address
4. **Logging**: Email delivery attempt logged (success/failure)

## Email Content Features

### Professional Design
- **Header**: Gradient background with BookMyHotel branding
- **Welcome Message**: Personalized greeting with user's first name
- **Account Information**: Summary of registration details
- **Feature Overview**: List of platform capabilities with icons
- **Call-to-Action**: Prominent button linking to hotel search
- **Support Section**: Help information and contact details
- **Footer**: Professional footer with links and unsubscribe options

### Mobile Responsive
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Optimized Layout**: Clean, readable format across all devices
- **Fast Loading**: Inline CSS for consistent rendering

## Monitoring & Observability

### Logging
- **Registration Events**: User creation and email delivery attempts
- **Email Status**: Success/failure status for troubleshooting
- **Configuration Alerts**: Warnings when Microsoft Graph is not configured
- **Error Details**: Comprehensive error information for debugging

### Health Checks
- **Email Service Status**: Configuration validation on startup
- **OAuth2 Connectivity**: Microsoft Graph API availability checks
- **Template Loading**: Thymeleaf template validation

## Future Enhancements

### Planned Features
- [ ] Email preference management for users
- [ ] Booking reminder emails (24h before check-in)
- [ ] Promotional email campaigns for hotel deals
- [ ] Email analytics and delivery tracking
- [ ] Multi-language email templates
- [ ] User email verification workflow

### Integration Opportunities
- [ ] SMS notifications via Azure Communication Services
- [ ] Push notifications for mobile app
- [ ] Integration with marketing automation platforms
- [ ] Advanced email analytics and tracking

## Security Considerations

### Data Protection
- **OAuth2 Authentication**: Secure Microsoft Graph API access
- **No SMTP Credentials**: No plaintext email credentials stored
- **Template Validation**: XSS protection in email templates
- **User Data Handling**: Secure user information processing

### Compliance
- **GDPR Ready**: User consent and data protection considerations
- **Email Standards**: RFC-compliant email formatting
- **Anti-Spam**: Professional email design to avoid spam filters
- **Unsubscribe**: Clear unsubscribe mechanisms in email footer

## Troubleshooting

### Common Issues

1. **Email Not Sent**
   - Check Microsoft Graph OAuth2 configuration
   - Verify environment variables are set
   - Review application logs for error details

2. **Template Errors**
   - Validate Thymeleaf template syntax
   - Check template variable names
   - Ensure template file exists in resources/templates

3. **Registration Success but No Email**
   - Check email service configuration
   - Review logs for silent failures
   - Verify Microsoft Graph API permissions

### Debug Commands
```bash
# Check email configuration status
curl http://localhost:8080/actuator/health

# Review application logs
tail -f backend/logs/application.log

# Test template rendering
# (Internal service method - no direct endpoint)
```

## Development Notes

### Code Quality
- **Error Handling**: Comprehensive exception handling
- **Logging**: Structured logging for observability
- **Testing**: Unit tests for email service methods
- **Documentation**: Inline code documentation

### Best Practices
- **Separation of Concerns**: Email logic isolated in service layer
- **Configuration Management**: Externalized email settings
- **Template Management**: Centralized template storage
- **Async Processing**: Non-blocking email delivery (future enhancement)

---

**Status**: ✅ **Complete and Ready for Production**

This email notification system provides a professional user onboarding experience while maintaining system reliability and security best practices.
