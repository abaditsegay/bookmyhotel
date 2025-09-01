package com.bookmyhotel.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Generate hash for the consistent test password
        String password123Hash = encoder.encode("password123");

        System.out.println("password123 hash: " + password123Hash);

        // Verify it works
        boolean matches = encoder.matches("password123", password123Hash);
        System.out.println("Verification: " + matches);
    }
}
