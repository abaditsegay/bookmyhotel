package com.bookmyhotel.config;

import java.security.SecureRandom;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.EmailService;

@Component
@Order(0)
public class ProductionSuperAdminBootstrap implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ProductionSuperAdminBootstrap.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.super-admin.enabled:true}")
    private boolean superAdminBootstrapEnabled;

    @Value("${app.bootstrap.super-admin.email:samuelweld2018@gmail.com}")
    private String superAdminEmail;

    @Value("${app.bootstrap.super-admin.first-name:Samuel}")
    private String superAdminFirstName;

    @Value("${app.bootstrap.super-admin.last-name:Weld}")
    private String superAdminLastName;

    @Override
    public void run(String... args) {
        if (!superAdminBootstrapEnabled) {
            logger.info("Super-admin bootstrap is disabled; skipping startup check");
            return;
        }

        createSystemAdminUserIfMissing();
    }

    private void createSystemAdminUserIfMissing() {
        logger.info("Super-admin bootstrap check started for email: {}", superAdminEmail);

        Optional<User> existingAdmin = userRepository.findByEmail(superAdminEmail);
        if (existingAdmin.isPresent()) {
            logger.info("Super-admin bootstrap result: exists already for email {}", superAdminEmail);
            return;
        }

        String generatedPassword = generateRandomPassword(16);
        logger.info("Super-admin bootstrap result: creating new super admin for email {}", superAdminEmail);

        User systemAdmin = new User();
        systemAdmin.setEmail(superAdminEmail);
        systemAdmin.setPassword(passwordEncoder.encode(generatedPassword));
        systemAdmin.setFirstName(superAdminFirstName);
        systemAdmin.setLastName(superAdminLastName);
        systemAdmin.setIsActive(true);
        systemAdmin.setRoles(Set.of(UserRole.SUPER_ADMIN));

        try {
            User savedAdmin = userRepository.save(systemAdmin);
            logger.info("Super-admin bootstrap result: created user with ID {} for email {}",
                    savedAdmin.getId(), savedAdmin.getEmail());
            sendSuperAdminBootstrapEmail(savedAdmin, generatedPassword);
        } catch (Exception e) {
            logger.error("Failed to create startup super admin user: {}", e.getMessage(), e);
        }
    }

    private void sendSuperAdminBootstrapEmail(User savedAdmin, String generatedPassword) {
        try {
            emailService.sendSuperAdminBootstrapEmail(savedAdmin.getEmail(), savedAdmin.getFirstName(),
                    generatedPassword);
            logger.info("Super-admin bootstrap email sent to {}", savedAdmin.getEmail());
        } catch (IllegalStateException e) {
            logger.warn("Super-admin bootstrap created the user, but email delivery is not configured for {}",
                    savedAdmin.getEmail());
        } catch (RuntimeException e) {
            logger.error("Super-admin bootstrap created the user, but failed to send credentials to {}",
                    savedAdmin.getEmail(), e);
        }
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(PASSWORD_CHARS.charAt(SECURE_RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}