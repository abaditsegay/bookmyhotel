package com.bookmyhotel.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class SystemAdminPasswordGenerator {
    // Utility method to generate password hashes (renamed from main to avoid Spring
    // Boot conflicts)
    public static void generatePasswordHash(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Generate hash for "password"
        String passwordHash = encoder.encode("password");

        // System.out.println("password hash: " + passwordHash);

        // Test verification
        boolean matches = encoder.matches("password", passwordHash);
        // System.out.println("Verification test: " + matches);
    }
}
