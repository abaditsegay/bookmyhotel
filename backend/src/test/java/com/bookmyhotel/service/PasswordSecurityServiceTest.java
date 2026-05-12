package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class PasswordSecurityServiceTest {

    private PasswordSecurityService passwordSecurityService;

    @BeforeEach
    void setUp() {
        passwordSecurityService = new PasswordSecurityService();
        ReflectionTestUtils.setField(passwordSecurityService, "minLength", 6);
        ReflectionTestUtils.setField(passwordSecurityService, "maxLength", 128);
        ReflectionTestUtils.setField(passwordSecurityService, "requireUppercase", false);
        ReflectionTestUtils.setField(passwordSecurityService, "requireLowercase", false);
        ReflectionTestUtils.setField(passwordSecurityService, "requireDigits", false);
        ReflectionTestUtils.setField(passwordSecurityService, "requireSpecialChars", false);
    }

    @Test
    void validatePasswordShouldRejectNullOrEmptyInput() {
        PasswordSecurityService.PasswordValidationResult nullResult = passwordSecurityService.validatePassword(null);
        PasswordSecurityService.PasswordValidationResult emptyResult = passwordSecurityService.validatePassword("");

        assertFalse(nullResult.isValid());
        assertIterableEquals(List.of("Password cannot be empty"), nullResult.getErrors());
        assertFalse(emptyResult.isValid());
        assertIterableEquals(List.of("Password cannot be empty"), emptyResult.getErrors());
    }

    @Test
    void validatePasswordShouldAccumulateConfiguredPolicyErrors() {
        ReflectionTestUtils.setField(passwordSecurityService, "minLength", 10);
        ReflectionTestUtils.setField(passwordSecurityService, "maxLength", 12);
        ReflectionTestUtils.setField(passwordSecurityService, "requireUppercase", true);
        ReflectionTestUtils.setField(passwordSecurityService, "requireLowercase", true);
        ReflectionTestUtils.setField(passwordSecurityService, "requireDigits", true);
        ReflectionTestUtils.setField(passwordSecurityService, "requireSpecialChars", true);

        PasswordSecurityService.PasswordValidationResult result = passwordSecurityService.validatePassword("abc");

        assertFalse(result.isValid());
        assertIterableEquals(List.of(
                "Password must be at least 10 characters long",
                "Password must contain at least one uppercase letter",
                "Password must contain at least one digit",
                "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\"\\,.<>/?)"),
                result.getErrors());
    }

    @Test
    void validatePasswordShouldRejectPasswordsAboveConfiguredMaximumLength() {
        ReflectionTestUtils.setField(passwordSecurityService, "maxLength", 8);

        PasswordSecurityService.PasswordValidationResult result = passwordSecurityService.validatePassword("Abc123!xyz");

        assertFalse(result.isValid());
        assertIterableEquals(List.of("Password cannot exceed 8 characters"), result.getErrors());
    }

    @Test
    void validatePasswordShouldAcceptPasswordMeetingConfiguredRequirements() {
        ReflectionTestUtils.setField(passwordSecurityService, "minLength", 8);
        ReflectionTestUtils.setField(passwordSecurityService, "requireUppercase", true);
        ReflectionTestUtils.setField(passwordSecurityService, "requireLowercase", true);
        ReflectionTestUtils.setField(passwordSecurityService, "requireDigits", true);
        ReflectionTestUtils.setField(passwordSecurityService, "requireSpecialChars", true);

        PasswordSecurityService.PasswordValidationResult result = passwordSecurityService.validatePassword("Abcd123!");

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }

    @Test
    void calculatePasswordStrengthShouldRewardComplexPasswordsWithHighScore() {
        int score = passwordSecurityService.calculatePasswordStrength("Ab9$kLm2#Qr7!");

        assertEquals(90, score);
    }

    @Test
    void calculatePasswordStrengthShouldPenalizeRepeatingAndSequentialPatterns() {
        int repeatedScore = passwordSecurityService.calculatePasswordStrength("AAAaaa111!!!");
        int sequentialScore = passwordSecurityService.calculatePasswordStrength("Abc123!xyz");
        int strongScore = passwordSecurityService.calculatePasswordStrength("Ax7!mQ2@rT9#");

        assertTrue(strongScore > repeatedScore);
        assertTrue(strongScore > sequentialScore);
        assertTrue(repeatedScore < 100);
        assertTrue(sequentialScore < 100);
    }

    @Test
    void calculatePasswordStrengthShouldReturnZeroForNullOrEmptyPassword() {
        assertEquals(0, passwordSecurityService.calculatePasswordStrength(null));
        assertEquals(0, passwordSecurityService.calculatePasswordStrength(""));
    }

    @Test
    void getPasswordStrengthDescriptionShouldMapThresholds() {
        assertEquals("Very Weak", passwordSecurityService.getPasswordStrengthDescription(0));
        assertEquals("Weak", passwordSecurityService.getPasswordStrengthDescription(20));
        assertEquals("Moderate", passwordSecurityService.getPasswordStrengthDescription(40));
        assertEquals("Strong", passwordSecurityService.getPasswordStrengthDescription(60));
        assertEquals("Very Strong", passwordSecurityService.getPasswordStrengthDescription(80));
    }
}