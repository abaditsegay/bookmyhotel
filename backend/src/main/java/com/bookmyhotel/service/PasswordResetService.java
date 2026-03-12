package com.bookmyhotel.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.bookmyhotel.entity.PasswordResetToken;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.PasswordResetTokenRepository;
import com.bookmyhotel.repository.UserRepository;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MicrosoftGraphEmailService microsoftGraphEmailService;

    @Autowired
    @Qualifier("emailTemplateEngine")
    private TemplateEngine templateEngine;

    @Autowired
    private PasswordSecurityService passwordSecurityService;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Value("${app.email.from:noreply@shegersolutions.com}")
    private String fromEmail;

    @Value("${app.name:BookMyHotel}")
    private String appName;

    /**
     * Generate a cryptographically secure token
     */
    private String generateToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Request a password reset. Sends an email with a reset link.
     * Always returns successfully to avoid email enumeration attacks.
     */
    @Transactional
    public void requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Don't reveal that the user doesn't exist
            logger.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();

        if (!user.isEnabled()) {
            logger.info("Password reset requested for disabled account: {}", email);
            return;
        }

        // Invalidate any existing tokens for this user
        tokenRepository.invalidateAllTokensForUser(user);

        // Create new token
        String token = generateToken();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        // Send email
        sendPasswordResetEmail(user, token);

        logger.info("Password reset token created for user: {}", email);
    }

    /**
     * Validate a password reset token
     */
    public boolean validateToken(String token) {
        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByToken(token);

        if (resetTokenOpt.isEmpty()) {
            return false;
        }

        PasswordResetToken resetToken = resetTokenOpt.get();
        return !resetToken.isUsed() && !resetToken.isExpired();
    }

    /**
     * Reset the password using a valid token
     */
    @Transactional
    public ResetResult resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> resetTokenOpt = tokenRepository.findByToken(token);

        if (resetTokenOpt.isEmpty()) {
            logger.warn("Password reset attempted with invalid token");
            return ResetResult
                    .failure("Invalid, expired, or already-used reset token. Please request a new password reset.");
        }

        PasswordResetToken resetToken = resetTokenOpt.get();

        if (resetToken.isUsed()) {
            logger.warn("Password reset attempted with already-used token");
            return ResetResult
                    .failure("Invalid, expired, or already-used reset token. Please request a new password reset.");
        }

        if (resetToken.isExpired()) {
            logger.warn("Password reset attempted with expired token");
            return ResetResult.failure("This reset link has expired. Please request a new password reset.");
        }

        // Validate password strength
        PasswordSecurityService.PasswordValidationResult validation = passwordSecurityService
                .validatePassword(newPassword);
        if (!validation.isValid()) {
            logger.warn("Password reset with weak password for user: {}", resetToken.getUser().getEmail());
            return ResetResult
                    .failure("Password does not meet requirements: " + String.join(", ", validation.getErrors()));
        }

        // Update user password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        logger.info("Password successfully reset for user: {}", user.getEmail());
        return ResetResult.success();
    }

    public static class ResetResult {
        private final boolean successful;
        private final String message;

        private ResetResult(boolean successful, String message) {
            this.successful = successful;
            this.message = message;
        }

        public static ResetResult success() {
            return new ResetResult(true, null);
        }

        public static ResetResult failure(String message) {
            return new ResetResult(false, message);
        }

        public boolean isSuccessful() {
            return successful;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * Send password reset email via Microsoft Graph
     */
    private void sendPasswordResetEmail(User user, String token) {
        if (!microsoftGraphEmailService.isConfigured()) {
            logger.warn("Email service not configured. Cannot send password reset email to: {}", user.getEmail());
            throw new IllegalStateException("Email service is not configured.");
        }

        try {
            String resetLink = appUrl + "/reset-password?token=" + token;

            Map<String, Object> templateData = new HashMap<>();
            templateData.put("firstName", user.getFirstName());
            templateData.put("resetLink", resetLink);
            templateData.put("appName", appName);
            templateData.put("expiryMinutes", 60);

            Context context = new Context();
            context.setVariables(templateData);
            String htmlContent = templateEngine.process("password-reset", context);

            String subject = appName + " - Password Reset Request";
            microsoftGraphEmailService.sendEmail(user.getEmail(), subject, htmlContent);

            logger.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    /**
     * Clean up expired tokens daily
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        logger.info("Cleaned up expired password reset tokens");
    }
}
