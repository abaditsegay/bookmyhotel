package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.bookmyhotel.dto.BookingResponse;

/**
 * Service for handling booking-related email notifications
 */
@Service
public class BookingNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(BookingNotificationService.class);

    @Autowired
    private MicrosoftGraphEmailService emailService;

    @Autowired
    @Qualifier("emailTemplateEngine")
    private TemplateEngine templateEngine;

    @Autowired
    private BookingTokenService bookingTokenService;

    @Value("${app.name:BookMyHotel}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    /**
     * Send booking modification confirmation email
     */
    public void sendModificationConfirmationEmail(BookingResponse booking, BigDecimal additionalCharges,
            BigDecimal refundAmount) {
        try {
            // Check if email service is configured
            if (!emailService.isConfigured()) {
                logger.warn(
                        "Microsoft Graph OAuth2 is not configured. Cannot send modification confirmation email to: {}",
                        booking.getGuestEmail());
                return;
            }

            String subject = "Booking Modification Confirmed - " + booking.getConfirmationNumber();

            // Prepare template data
            Map<String, Object> templateData = prepareModificationEmailData(booking, additionalCharges, refundAmount);

            // Generate email content using the template
            String htmlContent = templateEngine.process("booking-modification-confirmation",
                    createContext(templateData));

            emailService.sendEmail(booking.getGuestEmail(), subject, htmlContent);
            logger.info("Modification confirmation email sent to: {}", booking.getGuestEmail());

        } catch (Exception e) {
            logger.error("Failed to send modification confirmation email to: {}", booking.getGuestEmail(), e);
        }
    }

    /**
     * Send booking cancellation confirmation email
     */
    public void sendCancellationConfirmationEmail(BookingResponse booking, BigDecimal refundAmount) {
        try {
            // Check if email service is configured
            if (!emailService.isConfigured()) {
                logger.warn(
                        "Microsoft Graph OAuth2 is not configured. Cannot send cancellation confirmation email to: {}",
                        booking.getGuestEmail());
                return;
            }

            String subject = "Your Reservation with " + booking.getHotelName() + " has been cancelled";

            // Prepare template data
            Map<String, Object> templateData = prepareCancellationEmailData(booking, refundAmount);

            // Generate email content using the template
            String htmlContent = templateEngine.process("booking-cancellation-template1", createContext(templateData));

            emailService.sendEmail(booking.getGuestEmail(), subject, htmlContent);
            logger.info("Cancellation confirmation email sent to: {}", booking.getGuestEmail());

        } catch (Exception e) {
            logger.error("Failed to send cancellation confirmation email to: {}", booking.getGuestEmail(), e);
        }
    }

    /**
     * Send payment receipt email for additional charges
     */
    public void sendPaymentReceiptEmail(BookingResponse booking, BigDecimal amount, String paymentMethod) {
        try {
            // Check if email service is configured
            if (!emailService.isConfigured()) {
                logger.warn("Microsoft Graph OAuth2 is not configured. Cannot send payment receipt email to: {}",
                        booking.getGuestEmail());
                return;
            }

            String subject = "Payment Receipt - " + booking.getConfirmationNumber();
            String body = buildPaymentReceiptEmailBody(booking, amount, paymentMethod);

            emailService.sendEmail(booking.getGuestEmail(), subject, body);
            logger.info("Payment receipt email sent to: {}", booking.getGuestEmail());

        } catch (Exception e) {
            logger.error("Failed to send payment receipt email to: {}", booking.getGuestEmail(), e);
        }
    }

    /**
     * Send refund confirmation email
     */
    public void sendRefundConfirmationEmail(BookingResponse booking, BigDecimal refundAmount, String refundMethod) {
        try {
            // Check if email service is configured
            if (!emailService.isConfigured()) {
                logger.warn("Microsoft Graph OAuth2 is not configured. Cannot send refund confirmation email to: {}",
                        booking.getGuestEmail());
                return;
            }

            String subject = "Refund Processed - " + booking.getConfirmationNumber();
            String body = buildRefundEmailBody(booking, refundAmount, refundMethod);

            emailService.sendEmail(booking.getGuestEmail(), subject, body);
            logger.info("Refund confirmation email sent to: {}", booking.getGuestEmail());

        } catch (Exception e) {
            logger.error("Failed to send refund confirmation email to: {}", booking.getGuestEmail(), e);
        }
    }

    /**
     * Prepare modification email template data
     */
    private Map<String, Object> prepareModificationEmailData(BookingResponse booking, BigDecimal additionalCharges,
            BigDecimal refundAmount) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("booking", booking);
        templateData.put("additionalCharges", additionalCharges);
        templateData.put("refundAmount", refundAmount);
        templateData.put("appName", appName);
        templateData.put("appUrl", appUrl);

        // Generate authenticated booking URL for guest access
        String bookingUrl = bookingTokenService.generateManagementUrl(
                booking.getReservationId(),
                booking.getGuestEmail(),
                appUrl);
        templateData.put("bookingUrl", bookingUrl);

        // Format dates
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        String formattedCheckIn = booking.getCheckInDate().format(formatter);
        String formattedCheckOut = booking.getCheckOutDate().format(formatter);

        // Provide both variable names for template compatibility
        templateData.put("checkInFormatted", formattedCheckIn);
        templateData.put("checkOutFormatted", formattedCheckOut);
        templateData.put("formattedCheckInDate", formattedCheckIn);
        templateData.put("formattedCheckOutDate", formattedCheckOut);

        // Calculate stay duration
        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        templateData.put("nights", nights);

        return templateData;
    }

    /**
     * Prepare cancellation email template data
     */
    private Map<String, Object> prepareCancellationEmailData(BookingResponse booking, BigDecimal refundAmount) {
        Map<String, Object> templateData = new HashMap<>();
        templateData.put("booking", booking);
        templateData.put("refundAmount", refundAmount);
        templateData.put("appName", appName);
        templateData.put("appUrl", appUrl);

        // Generate authenticated booking URL for guest access (if needed for future
        // reference)
        String bookingUrl = bookingTokenService.generateManagementUrl(
                booking.getReservationId(),
                booking.getGuestEmail(),
                appUrl);
        templateData.put("bookingUrl", bookingUrl);

        // Format dates for display
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String formattedCheckIn = booking.getCheckInDate().format(formatter);
        String formattedCheckOut = booking.getCheckOutDate().format(formatter);

        // Provide both variable names for template compatibility
        templateData.put("checkInFormatted", formattedCheckIn);
        templateData.put("checkOutFormatted", formattedCheckOut);
        templateData.put("formattedCheckInDate", formattedCheckIn);
        templateData.put("formattedCheckOutDate", formattedCheckOut);

        // Calculate stay duration
        long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        templateData.put("nights", nights);

        // Add refund information (using Ethiopian Birr currency)
        templateData.put("hasRefund", refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) > 0);
        if (refundAmount != null) {
            templateData.put("refundAmountFormatted", String.format("ETB %.2f", refundAmount));
        }

        // Add cancellation date (current date/time)
        templateData.put("cancellationDate",
                DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a").format(LocalDateTime.now()));

        // Add cancellation reason (if available from booking special requests or other
        // source)
        String cancellationReason = extractCancellationReason(booking);
        templateData.put("cancellationReason", cancellationReason);

        // Add URLs for buttons
        templateData.put("bookingDetailUrl", appUrl + "/guest-booking-management?confirmationNumber="
                + booking.getConfirmationNumber() + "&email=" + booking.getGuestEmail());
        templateData.put("newBookingUrl", appUrl + "/hotels");

        return templateData;
    }

    /**
     * Extract cancellation reason from booking special requests or return null
     */
    private String extractCancellationReason(BookingResponse booking) {
        if (booking.getSpecialRequests() != null && booking.getSpecialRequests().contains("Cancellation reason:")) {
            String[] parts = booking.getSpecialRequests().split("Cancellation reason:");
            if (parts.length > 1) {
                return parts[parts.length - 1].trim();
            }
        }
        return null;
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
     * Build payment receipt email body
     */
    private String buildPaymentReceiptEmailBody(BookingResponse booking, BigDecimal amount, String paymentMethod) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html><head><meta charset='UTF-8'></head><body>");
        sb.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");

        // Header
        sb.append("<div style='background-color: #28a745; color: white; padding: 20px; text-align: center;'>");
        sb.append("<h1>Payment Receipt</h1>");
        sb.append("</div>");

        // Content
        sb.append("<div style='padding: 20px;'>");
        sb.append("<p>Dear ").append(booking.getGuestName()).append(",</p>");
        sb.append("<p>Thank you for your payment. This email serves as your receipt.</p>");

        // Payment Details
        sb.append("<div style='background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;'>");
        sb.append("<h3>Payment Details</h3>");
        sb.append("<p><strong>Amount Paid:</strong> $").append(amount).append("</p>");
        sb.append("<p><strong>Payment Method:</strong> ").append(paymentMethod).append("</p>");
        sb.append("<p><strong>Booking Reference:</strong> ").append(booking.getConfirmationNumber()).append("</p>");
        sb.append("<p><strong>Hotel:</strong> ").append(booking.getHotelName()).append("</p>");
        sb.append("</div>");

        // Footer
        sb.append("<p>Please keep this receipt for your records.</p>");
        sb.append("<p>Thank you for choosing BookMyHotel!</p>");
        sb.append("</div>");

        sb.append(
                "<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>");
        sb.append("<p>This is an automated message. Please do not reply to this email.</p>");
        sb.append("</div>");

        sb.append("</div></body></html>");

        return sb.toString();
    }

    /**
     * Build refund confirmation email body
     */
    private String buildRefundEmailBody(BookingResponse booking, BigDecimal refundAmount, String refundMethod) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html><head><meta charset='UTF-8'></head><body>");
        sb.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");

        // Header
        sb.append("<div style='background-color: #17a2b8; color: white; padding: 20px; text-align: center;'>");
        sb.append("<h1>Refund Processed</h1>");
        sb.append("</div>");

        // Content
        sb.append("<div style='padding: 20px;'>");
        sb.append("<p>Dear ").append(booking.getGuestName()).append(",</p>");
        sb.append("<p>Your refund has been successfully processed.</p>");

        // Refund Details
        sb.append("<div style='background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;'>");
        sb.append("<h3>Refund Details</h3>");
        sb.append("<p><strong>Refund Amount:</strong> $").append(refundAmount).append("</p>");
        sb.append("<p><strong>Refund Method:</strong> ").append(refundMethod).append("</p>");
        sb.append("<p><strong>Booking Reference:</strong> ").append(booking.getConfirmationNumber()).append("</p>");
        sb.append("<p><strong>Processing Time:</strong> 3-5 business days</p>");
        sb.append("</div>");

        // Footer
        sb.append("<p>The refund will appear on your statement within 3-5 business days.</p>");
        sb.append("<p>Thank you for choosing BookMyHotel!</p>");
        sb.append("</div>");

        sb.append(
                "<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>");
        sb.append("<p>This is an automated message. Please do not reply to this email.</p>");
        sb.append("</div>");

        sb.append("</div></body></html>");

        return sb.toString();
    }
}
