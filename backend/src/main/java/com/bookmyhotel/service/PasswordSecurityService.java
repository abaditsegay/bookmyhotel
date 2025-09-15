package com.bookmyhotel.service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service for password security validation and policy enforcement
 */
@Service
public class PasswordSecurityService {

    @Value("${security.password.min-length:8}")
    private int minLength;

    @Value("${security.password.require-uppercase:true}")
    private boolean requireUppercase;

    @Value("${security.password.require-lowercase:true}")
    private boolean requireLowercase;

    @Value("${security.password.require-digits:true}")
    private boolean requireDigits;

    @Value("${security.password.require-special-chars:true}")
    private boolean requireSpecialChars;

    @Value("${security.password.max-length:128}")
    private int maxLength;

    // Common patterns
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");

    // Common weak passwords to check against
    private static final List<String> COMMON_WEAK_PASSWORDS = List.of(
            "password", "123456", "password123", "admin", "qwerty", "letmein",
            "welcome", "monkey", "1234567890", "password1", "123456789", "12345678");

    /**
     * Validate password against security policy
     * 
     * @param password The password to validate
     * @return PasswordValidationResult containing validation result and messages
     */
    public PasswordValidationResult validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        boolean isValid = true;

        // Check if password is null or empty
        if (password == null || password.isEmpty()) {
            errors.add("Password cannot be empty");
            return new PasswordValidationResult(false, errors);
        }

        // Check minimum length
        if (password.length() < minLength) {
            errors.add("Password must be at least " + minLength + " characters long");
            isValid = false;
        }

        // Check maximum length
        if (password.length() > maxLength) {
            errors.add("Password cannot exceed " + maxLength + " characters");
            isValid = false;
        }

        // Check uppercase requirement
        if (requireUppercase && !UPPERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one uppercase letter");
            isValid = false;
        }

        // Check lowercase requirement
        if (requireLowercase && !LOWERCASE_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one lowercase letter");
            isValid = false;
        }

        // Check digits requirement
        if (requireDigits && !DIGIT_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one digit");
            isValid = false;
        }

        // Check special characters requirement
        if (requireSpecialChars && !SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            errors.add("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\"\\,.<>/?)");
            isValid = false;
        }

        // Check against common weak passwords
        String lowerPassword = password.toLowerCase();
        for (String weakPassword : COMMON_WEAK_PASSWORDS) {
            if (lowerPassword.contains(weakPassword)) {
                errors.add("Password contains common weak patterns and is not secure");
                isValid = false;
                break;
            }
        }

        // Check for repeating characters (more than 3 consecutive same characters)
        if (hasRepeatingCharacters(password, 4)) {
            errors.add("Password cannot have more than 3 consecutive identical characters");
            isValid = false;
        }

        // Check for sequential patterns
        if (hasSequentialPattern(password)) {
            errors.add("Password cannot contain sequential patterns (like 123, abc)");
            isValid = false;
        }

        return new PasswordValidationResult(isValid, errors);
    }

    /**
     * Calculate password strength score (0-100)
     * 
     * @param password The password to evaluate
     * @return Password strength score
     */
    public int calculatePasswordStrength(String password) {
        if (password == null || password.isEmpty()) {
            return 0;
        }

        int score = 0;

        // Length score (max 25 points)
        if (password.length() >= 12) {
            score += 25;
        } else if (password.length() >= 8) {
            score += 15;
        } else if (password.length() >= 6) {
            score += 10;
        }

        // Character variety (max 40 points, 10 each)
        if (UPPERCASE_PATTERN.matcher(password).find())
            score += 10;
        if (LOWERCASE_PATTERN.matcher(password).find())
            score += 10;
        if (DIGIT_PATTERN.matcher(password).find())
            score += 10;
        if (SPECIAL_CHAR_PATTERN.matcher(password).find())
            score += 10;

        // Complexity bonus (max 35 points)
        int uniqueChars = (int) password.chars().distinct().count();
        if (uniqueChars >= password.length() * 0.8) {
            score += 15; // High character diversity
        } else if (uniqueChars >= password.length() * 0.6) {
            score += 10; // Medium character diversity
        }

        // No repeating patterns
        if (!hasRepeatingCharacters(password, 3)) {
            score += 10;
        }

        // No sequential patterns
        if (!hasSequentialPattern(password)) {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * Get password strength description
     * 
     * @param score The password strength score
     * @return Strength description
     */
    public String getPasswordStrengthDescription(int score) {
        if (score >= 80)
            return "Very Strong";
        if (score >= 60)
            return "Strong";
        if (score >= 40)
            return "Moderate";
        if (score >= 20)
            return "Weak";
        return "Very Weak";
    }

    /**
     * Check for repeating characters
     */
    private boolean hasRepeatingCharacters(String password, int maxRepeats) {
        for (int i = 0; i <= password.length() - maxRepeats; i++) {
            char currentChar = password.charAt(i);
            int count = 1;

            for (int j = i + 1; j < password.length() && password.charAt(j) == currentChar; j++) {
                count++;
                if (count >= maxRepeats) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check for sequential patterns (like 123, abc, qwerty)
     */
    private boolean hasSequentialPattern(String password) {
        String lowerPassword = password.toLowerCase();

        // Check for ascending sequences
        for (int i = 0; i <= lowerPassword.length() - 3; i++) {
            boolean isSequential = true;
            for (int j = i + 1; j < i + 3 && j < lowerPassword.length(); j++) {
                if (lowerPassword.charAt(j) != lowerPassword.charAt(j - 1) + 1) {
                    isSequential = false;
                    break;
                }
            }
            if (isSequential)
                return true;
        }

        // Check for descending sequences
        for (int i = 0; i <= lowerPassword.length() - 3; i++) {
            boolean isSequential = true;
            for (int j = i + 1; j < i + 3 && j < lowerPassword.length(); j++) {
                if (lowerPassword.charAt(j) != lowerPassword.charAt(j - 1) - 1) {
                    isSequential = false;
                    break;
                }
            }
            if (isSequential)
                return true;
        }

        // Check for keyboard patterns
        String[] keyboardPatterns = { "qwerty", "asdf", "zxcv", "1234", "abcd" };
        for (String pattern : keyboardPatterns) {
            if (lowerPassword.contains(pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Password validation result holder
     */
    public static class PasswordValidationResult {
        private final boolean valid;
        private final List<String> errors;

        public PasswordValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }

        public boolean isValid() {
            return valid;
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}