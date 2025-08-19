package com.bookmyhotel.service;

import com.bookmyhotel.dto.BookingResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

/**
 * Email service using OAuth2 Microsoft Graph API
 * Pure OAuth2 implementation without SMTP fallback
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final MicrosoftGraphEmailService microsoftGraphEmailService;
    private final TemplateEngine templateEngine;
    private final BookingTokenService bookingTokenService;

    @Value("${app.email.from}")
    private String fromEmail;
    
    @Value("${app.name:BookMyHotel}")
    private String appName;
    
    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    // OAuth2 configuration values
    @Value("${microsoft.graph.client-id}")
    private String oauthClientId;
    
    @Value("${microsoft.graph.tenant-id}")
    private String oauthTenantId;
    
    @Value("${microsoft.graph.client-secret}")
    private String oauthClientSecret;

    @Autowired
    public EmailService(MicrosoftGraphEmailService microsoftGraphEmailService, 
                       @Qualifier("emailTemplateEngine") TemplateEngine templateEngine,
                       BookingTokenService bookingTokenService) {
        this.microsoftGraphEmailService = microsoftGraphEmailService;
        this.templateEngine = templateEngine;
        this.bookingTokenService = bookingTokenService;
    }

    /**
     * Send booking confirmation email via Microsoft Graph OAuth2
     */
    public void sendBookingConfirmationEmail(BookingResponse booking, String emailAddress, boolean includeItinerary) {
        // Check if Microsoft Graph is configured
        if (!microsoftGraphEmailService.isConfigured()) {
            logger.warn("Microsoft Graph OAuth2 is not configured. Cannot send booking confirmation email to: {}", emailAddress);
            throw new IllegalStateException("Email service is not configured. Microsoft Graph OAuth2 credentials are required.");
        }
        
        try {
            logger.info("Sending booking confirmation email to: {} via Microsoft Graph OAuth2", emailAddress);
            
            // Prepare email data
            Map<String, Object> templateData = prepareBookingEmailData(booking, includeItinerary);
            
            // Generate email content
            String htmlContent = templateEngine.process("booking-confirmation", createContext(templateData));
            String subject = String.format("Booking Confirmation - %s (%s)", 
                booking.getHotelName(), booking.getConfirmationNumber());
            
            // Send email via Microsoft Graph
            microsoftGraphEmailService.sendEmail(emailAddress, subject, htmlContent);
            
        } catch (IllegalStateException e) {
            // Re-throw IllegalStateException to be handled by controller
            throw e;
        } catch (Exception e) {
            logger.error("Failed to send booking confirmation email via Microsoft Graph", e);
            throw new RuntimeException("Failed to send booking confirmation email", e);
        }
    }

    /**
     * Send booking update notification email
     */
    public void sendBookingUpdateEmail(BookingResponse booking, String updateType, String reason) {
        // Check if Microsoft Graph is configured
        if (!microsoftGraphEmailService.isConfigured()) {
            logger.warn("Microsoft Graph OAuth2 is not configured. Cannot send booking update email to: {}", booking.getGuestEmail());
            throw new IllegalStateException("Email service is not configured. Microsoft Graph OAuth2 credentials are required.");
        }
        
        try {
            Map<String, Object> templateData = prepareBookingEmailData(booking, false);
            templateData.put("updateType", updateType);
            templateData.put("updateReason", reason);
            
            String htmlContent = templateEngine.process("booking-update", createContext(templateData));
            String subject = String.format("Booking %s - %s (%s)", 
                updateType, booking.getHotelName(), booking.getConfirmationNumber());
            
            microsoftGraphEmailService.sendEmail(booking.getGuestEmail(), subject, htmlContent);
            
        } catch (Exception e) {
            logger.error("Failed to send booking update email via Microsoft Graph", e);
            throw new RuntimeException("Failed to send booking update email", e);
        }
    }

    /**
     * Send welcome email to new hotel admin user
     */
    public void sendHotelAdminWelcomeEmail(String email, String firstName, String hotelName, String tempPassword) {
        // Check if Microsoft Graph is configured
        if (!microsoftGraphEmailService.isConfigured()) {
            logger.warn("Microsoft Graph OAuth2 is not configured. Cannot send welcome email to: {}", email);
            throw new IllegalStateException("Email service is not configured. Microsoft Graph OAuth2 credentials are required.");
        }
        
        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("firstName", firstName);
            templateData.put("hotelName", hotelName);
            templateData.put("tempPassword", tempPassword);
            templateData.put("loginUrl", appUrl + "/login");
            
            String htmlContent = templateEngine.process("hotel-admin-welcome", createContext(templateData));
            String subject = String.format("Welcome to %s - Hotel Admin Access for %s", appName, hotelName);
            
            microsoftGraphEmailService.sendEmail(email, subject, htmlContent);
            
        } catch (Exception e) {
            logger.error("Failed to send hotel admin welcome email via Microsoft Graph", e);
            throw new RuntimeException("Failed to send hotel admin welcome email", e);
        }
    }

    /**
     * Prepare booking email template data
     */
    private Map<String, Object> prepareBookingEmailData(BookingResponse booking, boolean includeItinerary) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("booking", booking);
        templateData.put("includeItinerary", includeItinerary);
        templateData.put("appName", appName);
        templateData.put("appUrl", appUrl);
        
        // Generate authenticated booking URL for guest access
        String bookingUrl = bookingTokenService.generateManagementUrl(
            booking.getReservationId(), 
            booking.getGuestEmail(), 
            appUrl
        );
        templateData.put("bookingUrl", bookingUrl);
        
        // Format dates
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        templateData.put("checkInFormatted", booking.getCheckInDate().format(formatter));
        templateData.put("checkOutFormatted", booking.getCheckOutDate().format(formatter));
        
        // Calculate stay duration
        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        templateData.put("nights", nights);
        
        return templateData;
    }

    /**
     * Create Thymeleaf context
     */
    private Context createContext(Map<String, Object> templateData) {
        Context context = new Context();
        context.setVariables(templateData);
        return context;
    }
    
    /**
     * Get OAuth2 configuration status for monitoring
     */
    public boolean isOAuth2Configured() {
        return !oauthClientId.isEmpty() && !oauthTenantId.isEmpty() && !oauthClientSecret.isEmpty();
    }
}
