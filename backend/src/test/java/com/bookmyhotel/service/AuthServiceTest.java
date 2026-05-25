package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.Spy;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bookmyhotel.dto.auth.LoginRequest;
import com.bookmyhotel.dto.auth.LoginResponse;
import com.bookmyhotel.dto.auth.RegistrationResponse;
import com.bookmyhotel.dto.auth.RegisterRequest;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelRegistration;
import com.bookmyhotel.entity.RegistrationStatus;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.exception.ResourceAlreadyExistsException;
import com.bookmyhotel.repository.HotelRegistrationRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private EmailService emailService;

    @Mock
    private SessionManagementService sessionManagementService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordSecurityService passwordSecurityService;

    @Mock
    private HotelRegistrationRepository hotelRegistrationRepository;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Spy
    @InjectMocks
    private AuthService authService;

    @Test
    void registerShouldCreateUnverifiedCustomerAndSendVerificationEmail() {
        RegisterRequest request = new RegisterRequest("guest@example.com", "Secret123!", "Guest", "User", "+251900000001");
        PasswordSecurityService.PasswordValidationResult valid = new PasswordSecurityService.PasswordValidationResult(true, List.of());

        when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.empty());
        when(passwordSecurityService.validatePassword("Secret123!")).thenReturn(valid);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(15L);
            return saved;
        });

        RegistrationResponse response = authService.register(request);

        assertEquals("guest@example.com", response.getEmail());
        assertTrue(response.isVerificationRequired());
        verify(userRepository).save(any(User.class));
        verify(emailVerificationService).sendVerificationEmail(any(User.class));
        verify(sessionManagementService, never()).createSession(any(), any(), any(), any());
    }

    @Test
    void registerShouldPersistSystemWideActiveCustomerUser() {
        RegisterRequest request = new RegisterRequest("guest@example.com", "Secret123!", "Guest", "User", "+251900000001");
        PasswordSecurityService.PasswordValidationResult valid = new PasswordSecurityService.PasswordValidationResult(true, List.of());

        when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.empty());
        when(passwordSecurityService.validatePassword("Secret123!")).thenReturn(valid);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        authService.register(request);

        verify(userRepository).save(any(User.class));
        verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(savedUser ->
                "guest@example.com".equals(savedUser.getEmail())
                        && "encoded-password".equals(savedUser.getPassword())
                        && "Guest".equals(savedUser.getFirstName())
                        && "User".equals(savedUser.getLastName())
                        && "+251900000001".equals(savedUser.getPhone())
                        && Boolean.TRUE.equals(savedUser.getIsActive())
                        && Boolean.FALSE.equals(savedUser.getEmailVerified())
                        && Set.of(UserRole.CUSTOMER).equals(savedUser.getRoles())
                        && savedUser.getTenantId() == null));
    }

    @Test
    void loginShouldDelegateToSessionAwareOverload() {
        LoginRequest request = new LoginRequest("customer@example.com", "Secret123!");
        LoginResponse expected = new LoginResponse(
                "access-token",
                "refresh-token",
                30L,
                "customer@example.com",
                "Customer",
                "User",
                Set.of(UserRole.CUSTOMER),
                null,
                null,
                null);

        doReturn(expected).when(authService).login(request, null, null);

        LoginResponse response = authService.login(request);

        assertEquals(expected, response);
        verify(authService).login(request, null, null);
    }

    @Test
    void registerShouldRejectDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("guest@example.com", "Secret123!", "Guest", "User", null);
        when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.of(new User()));

        ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class,
            () -> authService.register(request));
        assertTrue(exception.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerShouldRejectPasswordPolicyViolations() {
        RegisterRequest request = new RegisterRequest("guest@example.com", "weak", "Guest", "User", null);
        PasswordSecurityService.PasswordValidationResult invalid = new PasswordSecurityService.PasswordValidationResult(
                false,
                List.of("Password must contain at least one digit"));

        when(userRepository.findByEmail("guest@example.com")).thenReturn(Optional.empty());
        when(passwordSecurityService.validatePassword("weak")).thenReturn(invalid);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertTrue(exception.getMessage().contains("Password must contain at least one digit"));
    }

    @Test
    void loginShouldReturnHotelInactiveStatusWhenHotelIsDisabled() {
        User user = hotelAdminUser();
        user.getHotel().setIsActive(false);

        when(userRepository.findByEmail("admin@grandplaza.test")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123!", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");
        when(refreshTokenService.generateRefreshToken(22L)).thenReturn("refresh-token");

        LoginResponse response = authService.login(new LoginRequest("admin@grandplaza.test", "Secret123!"), "UA", "127.0.0.1");

        assertEquals("HOTEL_INACTIVE", response.getAccountStatus());
        assertEquals(101L, response.getHotelId());
        assertEquals("Grand Plaza", response.getHotelName());
        verify(sessionManagementService).createSession(22L, "jwt-token", "UA", "127.0.0.1");
    }

    @Test
    void loginShouldReturnUserSuspendedStatusWhenUserInactive() {
        User user = customerUser();
        user.setIsActive(false);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123!", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");
        when(refreshTokenService.generateRefreshToken(30L)).thenReturn("refresh-token");

        LoginResponse response = authService.login(new LoginRequest("customer@example.com", "Secret123!"), "UA", "127.0.0.1");

        assertEquals("USER_SUSPENDED", response.getAccountStatus());
        assertFalse(response.isNeedsOnboarding());
    }

    @Test
    void loginShouldFlagOnboardingForHotelAdminWithoutHotelAndPendingRegistration() {
        User user = new User();
        user.setId(41L);
        user.setEmail("owner@example.com");
        user.setPassword("encoded-password");
        user.setFirstName("Owner");
        user.setLastName("Admin");
        user.setRoles(Set.of(UserRole.HOTEL_ADMIN));
        user.setIsActive(true);

        HotelRegistration registration = new HotelRegistration();
        registration.setContactEmail("owner@example.com");
        registration.setStatus(RegistrationStatus.UNDER_REVIEW);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123!", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");
        when(refreshTokenService.generateRefreshToken(41L)).thenReturn("refresh-token");
        when(hotelRegistrationRepository.findByContactEmail("owner@example.com")).thenReturn(Optional.of(registration));

        LoginResponse response = authService.login(new LoginRequest("owner@example.com", "Secret123!"), "UA", "127.0.0.1");

        assertTrue(response.isNeedsOnboarding());
        assertEquals("ACTIVE", response.getAccountStatus());
        assertNull(response.getHotelId());
    }

    @Test
    void loginShouldNotFlagOnboardingWhenRegistrationIsApproved() {
        User user = new User();
        user.setId(41L);
        user.setEmail("owner@example.com");
        user.setPassword("encoded-password");
        user.setFirstName("Owner");
        user.setLastName("Admin");
        user.setRoles(Set.of(UserRole.HOTEL_ADMIN));
        user.setIsActive(true);

        HotelRegistration registration = new HotelRegistration();
        registration.setContactEmail("owner@example.com");
        registration.setStatus(RegistrationStatus.APPROVED);

        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123!", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");
        when(refreshTokenService.generateRefreshToken(41L)).thenReturn("refresh-token");
        when(hotelRegistrationRepository.findByContactEmail("owner@example.com")).thenReturn(Optional.of(registration));

        LoginResponse response = authService.login(new LoginRequest("owner@example.com", "Secret123!"), "UA", "127.0.0.1");

        assertFalse(response.isNeedsOnboarding());
        assertEquals("ACTIVE", response.getAccountStatus());
    }

    @Test
    void loginShouldRejectMissingUserOrBadPassword() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        BadCredentialsException missingUserException = assertThrows(BadCredentialsException.class,
            () -> authService.login(new LoginRequest("missing@example.com", "Secret123!"), null, null));
        assertEquals("Invalid email or password", missingUserException.getMessage());

        User user = customerUser();
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-password")).thenReturn(false);

        BadCredentialsException badPasswordException = assertThrows(BadCredentialsException.class,
            () -> authService.login(new LoginRequest("customer@example.com", "wrong"), null, null));
        assertEquals("Invalid email or password", badPasswordException.getMessage());
    }

    @Test
    void loginShouldRejectUnverifiedCustomerAccounts() {
        User user = customerUser();
        user.setEmailVerified(false);

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123!", "encoded-password")).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
            () -> authService.login(new LoginRequest("customer@example.com", "Secret123!"), null, null));

        assertEquals("Please verify your email address before signing in.", exception.getMessage());
        verify(jwtUtil, never()).generateToken(any(User.class));
    }

    @Test
    void validateTokenShouldReturnOnlyActiveUsersForValidTokens() {
        User activeUser = customerUser();
        User inactiveUser = customerUser();
        inactiveUser.setIsActive(false);

        when(jwtUtil.extractEmail("valid-token")).thenReturn("customer@example.com");
        when(jwtUtil.isTokenValid("valid-token")).thenReturn(true);
        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeUser));

        assertEquals(activeUser, authService.validateToken("valid-token"));

        when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(inactiveUser));
        assertNull(authService.validateToken("valid-token"));

        when(jwtUtil.extractEmail("invalid-token")).thenReturn(null);
        assertNull(authService.validateToken("invalid-token"));
    }

    @Test
    void validateTokenShouldReturnNullWhenJwtIsInvalidEvenIfEmailExists() {
        User activeUser = customerUser();

        when(jwtUtil.extractEmail("expired-token")).thenReturn("customer@example.com");
        when(jwtUtil.isTokenValid("expired-token")).thenReturn(false);

        assertNull(authService.validateToken("expired-token"));
        verify(userRepository, never()).findByEmail("customer@example.com");
        assertNotNull(activeUser);
    }

    private User customerUser() {
        User user = new User();
        user.setId(30L);
        user.setEmail("customer@example.com");
        user.setPassword("encoded-password");
        user.setFirstName("Customer");
        user.setLastName("User");
        user.setRoles(Set.of(UserRole.CUSTOMER));
        user.setIsActive(true);
        user.setEmailVerified(true);
        return user;
    }

    private User hotelAdminUser() {
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant-grand-plaza");
        tenant.setName("Grand Plaza Tenant");

        Hotel hotel = new Hotel();
        hotel.setId(101L);
        hotel.setName("Grand Plaza");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);

        User user = new User();
        user.setId(22L);
        user.setEmail("admin@grandplaza.test");
        user.setPassword("encoded-password");
        user.setFirstName("Hotel");
        user.setLastName("Admin");
        user.setRoles(Set.of(UserRole.HOTEL_ADMIN));
        user.setHotel(hotel);
        user.setIsActive(true);
        return user;
    }
}