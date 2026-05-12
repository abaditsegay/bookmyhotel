package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;

import com.bookmyhotel.entity.PasswordResetToken;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.PasswordResetTokenRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.PasswordResetService.ResetResult;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MicrosoftGraphEmailService microsoftGraphEmailService;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private PasswordSecurityService passwordSecurityService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(passwordResetService, "appUrl", "https://bookmyhotel.test");
        ReflectionTestUtils.setField(passwordResetService, "appName", "BookMyHotel");
        ReflectionTestUtils.setField(passwordResetService, "fromEmail", "noreply@test.example");
    }

    @Test
    void requestPasswordResetShouldIgnoreUnknownEmail() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        passwordResetService.requestPasswordReset("missing@example.com");

        verify(tokenRepository, never()).invalidateAllTokensForUser(any(User.class));
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
        verify(microsoftGraphEmailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void requestPasswordResetShouldIgnoreDisabledUser() {
        User user = user("disabled@example.com", false);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        passwordResetService.requestPasswordReset(user.getEmail());

        verify(tokenRepository, never()).invalidateAllTokensForUser(any(User.class));
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
        verify(microsoftGraphEmailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void requestPasswordResetShouldCreateTokenAndSendEmail() {
        User user = user("guest@example.com", true);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(microsoftGraphEmailService.isConfigured()).thenReturn(true);
        when(templateEngine.process(eq("password-reset"), any())).thenReturn("<html>reset</html>");

        passwordResetService.requestPasswordReset(user.getEmail());

        verify(tokenRepository).invalidateAllTokensForUser(user);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertEquals(user, savedToken.getUser());
        assertNotNull(savedToken.getToken());
        assertFalse(savedToken.isUsed());
        verify(microsoftGraphEmailService).sendEmail(eq(user.getEmail()), eq("BookMyHotel - Password Reset Request"), eq("<html>reset</html>"));
    }

    @Test
    void requestPasswordResetShouldFailWhenEmailServiceNotConfigured() {
        User user = user("guest@example.com", true);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(microsoftGraphEmailService.isConfigured()).thenReturn(false);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> passwordResetService.requestPasswordReset(user.getEmail()));

        assertEquals("Email service is not configured.", exception.getMessage());
        verify(tokenRepository).invalidateAllTokensForUser(user);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(microsoftGraphEmailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void validateTokenShouldRejectMissingUsedAndExpiredTokens() {
        when(tokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        PasswordResetToken usedToken = token("used-token", user("used@example.com", true));
        usedToken.setUsed(true);
        when(tokenRepository.findByToken("used")).thenReturn(Optional.of(usedToken));

        PasswordResetToken expiredToken = token("expired-token", user("expired@example.com", true));
        expiredToken.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        when(tokenRepository.findByToken("expired")).thenReturn(Optional.of(expiredToken));

        PasswordResetToken validToken = token("valid-token", user("valid@example.com", true));
        validToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        when(tokenRepository.findByToken("valid")).thenReturn(Optional.of(validToken));

        assertFalse(passwordResetService.validateToken("missing"));
        assertFalse(passwordResetService.validateToken("used"));
        assertFalse(passwordResetService.validateToken("expired"));
        assertTrue(passwordResetService.validateToken("valid"));
    }

    @Test
    void resetPasswordShouldRejectMissingUsedAndExpiredTokens() {
        when(tokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        PasswordResetToken usedToken = token("used-token", user("used@example.com", true));
        usedToken.setUsed(true);
        when(tokenRepository.findByToken("used")).thenReturn(Optional.of(usedToken));

        PasswordResetToken expiredToken = token("expired-token", user("expired@example.com", true));
        expiredToken.setExpiryDate(LocalDateTime.now().minusMinutes(1));
        when(tokenRepository.findByToken("expired")).thenReturn(Optional.of(expiredToken));

        ResetResult missingResult = passwordResetService.resetPassword("missing", "NewPassword123!");
        ResetResult usedResult = passwordResetService.resetPassword("used", "NewPassword123!");
        ResetResult expiredResult = passwordResetService.resetPassword("expired", "NewPassword123!");

        assertFalse(missingResult.isSuccessful());
        assertTrue(missingResult.getMessage().contains("Invalid, expired, or already-used"));
        assertFalse(usedResult.isSuccessful());
        assertTrue(usedResult.getMessage().contains("Invalid, expired, or already-used"));
        assertFalse(expiredResult.isSuccessful());
        assertTrue(expiredResult.getMessage().contains("expired"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPasswordShouldRejectWeakPassword() {
        PasswordResetToken resetToken = token("valid-token", user("guest@example.com", true));
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        when(tokenRepository.findByToken("valid")).thenReturn(Optional.of(resetToken));
        when(passwordSecurityService.validatePassword("weak"))
                .thenReturn(new PasswordSecurityService.PasswordValidationResult(false, List.of("too weak", "too short")));

        ResetResult result = passwordResetService.resetPassword("valid", "weak");

        assertFalse(result.isSuccessful());
        assertEquals("Password does not meet requirements: too weak, too short", result.getMessage());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any(User.class));
        verify(tokenRepository, never()).save(any(PasswordResetToken.class));
    }

    @Test
    void resetPasswordShouldPersistEncodedPasswordAndMarkTokenUsed() {
        User user = user("guest@example.com", true);
        PasswordResetToken resetToken = token("valid-token", user);
        resetToken.setExpiryDate(LocalDateTime.now().plusMinutes(10));
        when(tokenRepository.findByToken("valid")).thenReturn(Optional.of(resetToken));
        when(passwordSecurityService.validatePassword("StrongPassword123!"))
                .thenReturn(new PasswordSecurityService.PasswordValidationResult(true, List.of()));
        when(passwordEncoder.encode("StrongPassword123!")).thenReturn("encoded-password");

        ResetResult result = passwordResetService.resetPassword("valid", "StrongPassword123!");

        assertTrue(result.isSuccessful());
        assertNull(result.getMessage());
        assertEquals("encoded-password", user.getPassword());
        assertTrue(resetToken.isUsed());
        verify(userRepository).save(user);
        verify(tokenRepository).save(resetToken);
    }

    @Test
    void cleanupExpiredTokensShouldDelegateUsingCurrentTime() {
        passwordResetService.cleanupExpiredTokens();

        ArgumentCaptor<LocalDateTime> nowCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(tokenRepository).deleteExpiredTokens(nowCaptor.capture());
        assertNotNull(nowCaptor.getValue());
    }

    private User user(String email, boolean active) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setIsActive(active);
        user.setPassword("old-password");
        return user;
    }

    private PasswordResetToken token(String tokenValue, User user) {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(tokenValue);
        token.setUser(user);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiryDate(LocalDateTime.now().plusMinutes(60));
        token.setUsed(false);
        return token;
    }
}