package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bookmyhotel.dto.BookingResponse;

/**
 * Service for handling booking-related email notifications
 */
@Service
public class BookingNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(BookingNotificationService.class);
    
    @Autowired
    private MicrosoftGraphEmailService emailService;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    
    /**
     * Send booking modification confirmation email
     */
    public void sendModificationConfirmationEmail(BookingResponse booking, BigDecimal additionalCharges, BigDecimal refundAmount) {
        try {
            String subject = "Booking Modification Confirmed - " + booking.getConfirmationNumber();
            String body = buildModificationEmailBody(booking, additionalCharges, refundAmount);
            
            emailService.sendEmail(booking.getGuestEmail(), subject, body);
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
            String subject = "Booking Cancellation Confirmed - " + booking.getConfirmationNumber();
            String body = buildCancellationEmailBody(booking, refundAmount);
            
            emailService.sendEmail(booking.getGuestEmail(), subject, body);
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
            String subject = "Refund Processed - " + booking.getConfirmationNumber();
            String body = buildRefundEmailBody(booking, refundAmount, refundMethod);
            
            emailService.sendEmail(booking.getGuestEmail(), subject, body);
            logger.info("Refund confirmation email sent to: {}", booking.getGuestEmail());
            
        } catch (Exception e) {
            logger.error("Failed to send refund confirmation email to: {}", booking.getGuestEmail(), e);
        }
    }
    
    /**
     * Build modification confirmation email body
     */
    private String buildModificationEmailBody(BookingResponse booking, BigDecimal additionalCharges, BigDecimal refundAmount) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html><head><meta charset='UTF-8'></head><body>");
        sb.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        
        // Header
        sb.append("<div style='background-color: #2196F3; color: white; padding: 20px; text-align: center;'>");
        sb.append("<h1>Booking Modification Confirmed</h1>");
        sb.append("</div>");
        
        // Content
        sb.append("<div style='padding: 20px;'>");
        sb.append("<p>Dear ").append(booking.getGuestName()).append(",</p>");
        sb.append("<p>Your booking modification has been successfully processed.</p>");
        
        // Booking Details
        sb.append("<div style='background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;'>");
        sb.append("<h3>Updated Booking Details</h3>");
        sb.append("<p><strong>Confirmation Number:</strong> ").append(booking.getConfirmationNumber()).append("</p>");
        sb.append("<p><strong>Hotel:</strong> ").append(booking.getHotelName()).append("</p>");
        sb.append("<p><strong>Check-in Date:</strong> ").append(booking.getCheckInDate().format(DATE_FORMATTER)).append("</p>");
        sb.append("<p><strong>Check-out Date:</strong> ").append(booking.getCheckOutDate().format(DATE_FORMATTER)).append("</p>");
        sb.append("<p><strong>Room:</strong> ").append(booking.getRoomNumber()).append(" (").append(booking.getRoomType()).append(")</p>");
        sb.append("<p><strong>Total Amount:</strong> $").append(booking.getTotalAmount()).append("</p>");
        sb.append("</div>");
        
        // Financial Impact
        if (additionalCharges != null && additionalCharges.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("<div style='background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;'>");
            sb.append("<h4>Additional Payment Required</h4>");
            sb.append("<p>Amount: $").append(additionalCharges).append("</p>");
            sb.append("<p>This amount will be charged to your original payment method.</p>");
            sb.append("</div>");
        }
        
        if (refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("<div style='background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;'>");
            sb.append("<h4>Refund Processing</h4>");
            sb.append("<p>Amount: $").append(refundAmount).append("</p>");
            sb.append("<p>The refund will be processed to your original payment method within 3-5 business days.</p>");
            sb.append("</div>");
        }
        
        // Footer
        sb.append("<p>If you have any questions, please contact our customer service.</p>");
        sb.append("<p>Thank you for choosing BookMyHotel!</p>");
        sb.append("</div>");
        
        sb.append("<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>");
        sb.append("<p>This is an automated message. Please do not reply to this email.</p>");
        sb.append("</div>");
        
        sb.append("</div></body></html>");
        
        return sb.toString();
    }
    
    /**
     * Build cancellation confirmation email body
     */
    private String buildCancellationEmailBody(BookingResponse booking, BigDecimal refundAmount) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html>");
        sb.append("<html><head><meta charset='UTF-8'></head><body>");
        sb.append("<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>");
        
        // Header
        sb.append("<div style='background-color: #dc3545; color: white; padding: 20px; text-align: center;'>");
        sb.append("<h1>Booking Cancellation Confirmed</h1>");
        sb.append("</div>");
        
        // Content
        sb.append("<div style='padding: 20px;'>");
        sb.append("<p>Dear ").append(booking.getGuestName()).append(",</p>");
        sb.append("<p>Your booking has been successfully cancelled.</p>");
        
        // Booking Details
        sb.append("<div style='background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;'>");
        sb.append("<h3>Cancelled Booking Details</h3>");
        sb.append("<p><strong>Confirmation Number:</strong> ").append(booking.getConfirmationNumber()).append("</p>");
        sb.append("<p><strong>Hotel:</strong> ").append(booking.getHotelName()).append("</p>");
        sb.append("<p><strong>Original Check-in Date:</strong> ").append(booking.getCheckInDate().format(DATE_FORMATTER)).append("</p>");
        sb.append("<p><strong>Original Check-out Date:</strong> ").append(booking.getCheckOutDate().format(DATE_FORMATTER)).append("</p>");
        sb.append("</div>");
        
        // Refund Information
        if (refundAmount != null && refundAmount.compareTo(BigDecimal.ZERO) > 0) {
            sb.append("<div style='background-color: #d4edda; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745;'>");
            sb.append("<h4>Refund Information</h4>");
            sb.append("<p>Refund Amount: $").append(refundAmount).append("</p>");
            sb.append("<p>The refund will be processed to your original payment method within 3-5 business days.</p>");
            sb.append("</div>");
        } else {
            sb.append("<div style='background-color: #f8d7da; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc3545;'>");
            sb.append("<h4>No Refund Available</h4>");
            sb.append("<p>Based on the cancellation policy and timing, no refund is applicable for this booking.</p>");
            sb.append("</div>");
        }
        
        // Footer
        sb.append("<p>We're sorry to see you cancel your reservation. We hope to serve you again in the future.</p>");
        sb.append("<p>Thank you for choosing BookMyHotel!</p>");
        sb.append("</div>");
        
        sb.append("<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>");
        sb.append("<p>This is an automated message. Please do not reply to this email.</p>");
        sb.append("</div>");
        
        sb.append("</div></body></html>");
        
        return sb.toString();
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
        
        sb.append("<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>");
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
        
        sb.append("<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d;'>");
        sb.append("<p>This is an automated message. Please do not reply to this email.</p>");
        sb.append("</div>");
        
        sb.append("</div></body></html>");
        
        return sb.toString();
    }
}
