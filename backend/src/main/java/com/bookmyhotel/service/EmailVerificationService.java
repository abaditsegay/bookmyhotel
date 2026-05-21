package com.bookmyhotel.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.entity.EmailVerificationToken;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.EmailVerificationTokenRepository;
import com.bookmyhotel.repository.UserRepository;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Transactional
    public void sendVerificationEmail(User user) {
        emailVerificationTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        emailVerificationTokenRepository.invalidateAllTokensForUser(user);

        EmailVerificationToken token = new EmailVerificationToken(UUID.randomUUID().toString(), user);
        emailVerificationTokenRepository.save(token);

        try {
            String verificationUrl = buildVerificationUrl(token.getToken());
            emailService.sendEmailVerificationEmail(user.getEmail(), user.getFirstName(), verificationUrl);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "We could not send your verification email right now. Please try registering again in a moment.",
                    e);
        }
    }

    private String buildVerificationUrl(String token) {
        String normalizedContextPath = contextPath == null ? "" : contextPath.trim();
        if (!normalizedContextPath.isEmpty() && !normalizedContextPath.startsWith("/")) {
            normalizedContextPath = "/" + normalizedContextPath;
        }
        if (normalizedContextPath.endsWith("/")) {
            normalizedContextPath = normalizedContextPath.substring(0, normalizedContextPath.length() - 1);
        }

        return appUrl + normalizedContextPath + "/api/auth/verify-email?token=" + token;
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = emailVerificationTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Verification link is invalid or has expired."));

        if (token.isUsed() || token.isExpired()) {
            throw new IllegalArgumentException("Verification link is invalid or has expired.");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        emailVerificationTokenRepository.save(token);

        emailService.sendUserWelcomeEmail(user.getEmail(), user.getFirstName(), user.getLastName());
    }
}