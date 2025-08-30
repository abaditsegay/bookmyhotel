package com.bookmyhotel;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password";
        String storedHash = "$2a$10$XOiKOKRKSGx1f5p9PXDexOYZx.KGj4nS/pYrCsz8r0eAZ4R6y2fKu";

        boolean matches = encoder.matches(password, storedHash);
        System.out.println("Password 'password' matches stored hash: " + matches);

        // Generate a new hash for comparison
        String newHash = encoder.encode(password);
        System.out.println("New hash for 'password': " + newHash);

        // Test if new hash matches
        boolean newMatches = encoder.matches(password, newHash);
        System.out.println("Password matches new hash: " + newMatches);
    }
}
