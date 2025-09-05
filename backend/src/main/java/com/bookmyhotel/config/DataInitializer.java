package com.bookmyhotel.config;

import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;

/**
 * Data initialization component that creates initial system data
 * This runs after the application starts and the database schema is created
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting data initialization...");

        createSystemAdminUser();

        logger.info("Data initialization completed successfully.");
    }

    /**
     * Create the system admin user if it doesn't exist
     */
    private void createSystemAdminUser() {
        String adminEmail = "admin@bookmyhotel.com";
        String adminPassword = "admin123";

        logger.info("Checking for system admin user with email: {}", adminEmail);

        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);

        if (existingAdmin.isPresent()) {
            logger.info("System admin user already exists: {}", adminEmail);
            return;
        }

        logger.info("Creating system admin user...");

        User systemAdmin = new User();
        systemAdmin.setEmail(adminEmail);
        systemAdmin.setPassword(passwordEncoder.encode(adminPassword));
        systemAdmin.setFirstName("System");
        systemAdmin.setLastName("Administrator");
        systemAdmin.setIsActive(true);
        systemAdmin.setRoles(Set.of(UserRole.SYSTEM_ADMIN));
        // Leave hotel as null for system-wide admin

        try {
            User savedAdmin = userRepository.save(systemAdmin);
            logger.info("System admin user created successfully with ID: {} and email: {}",
                    savedAdmin.getId(), savedAdmin.getEmail());
            logger.info("System admin credentials - Email: {} | Password: {}", adminEmail, adminPassword);
        } catch (Exception e) {
            logger.error("Failed to create system admin user: {}", e.getMessage(), e);
        }
    }
}
