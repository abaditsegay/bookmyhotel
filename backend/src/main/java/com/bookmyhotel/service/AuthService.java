package com.bookmyhotel.service;

import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookmyhotel.dto.auth.LoginRequest;
import com.bookmyhotel.dto.auth.LoginResponse;
import com.bookmyhotel.dto.auth.RegisterRequest;
import com.bookmyhotel.entity.HotelRegistration;
import com.bookmyhotel.entity.RegistrationStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.exception.ResourceAlreadyExistsException;
import com.bookmyhotel.repository.HotelRegistrationRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.util.JwtUtil;

/**
 * Authentication service for user login and token management
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SessionManagementService sessionManagementService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordSecurityService passwordSecurityService;

    @Autowired
    private HotelRegistrationRepository hotelRegistrationRepository;

    /**
     * Register a new customer user (system-wide registered users)
     */
    public LoginResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new ResourceAlreadyExistsException(
                    "User with email " + registerRequest.getEmail() + " already exists");
        }

        // Validate password security
        PasswordSecurityService.PasswordValidationResult passwordValidation = passwordSecurityService
                .validatePassword(registerRequest.getPassword());

        if (!passwordValidation.isValid()) {
            throw new IllegalArgumentException(
                    "Password does not meet security requirements: "
                            + String.join(", ", passwordValidation.getErrors()));
        }

        // Create new user with CUSTOMER role (system-wide registered users)
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhone(registerRequest.getPhone());
        user.setIsActive(true);
        user.setRoles(Set.of(UserRole.CUSTOMER));
        // Do NOT set tenant_id - CUSTOMER users are system-wide (tenant_id = null)

        // Save the user
        user = userRepository.save(user);

        // Send welcome email to the new user
        try {
            emailService.sendUserWelcomeEmail(
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName());
        } catch (Exception e) {
            // Log the error but don't fail registration
            // Email is nice-to-have, registration success is critical
            // System.err.println("Failed to send welcome email to " + user.getEmail() + ":
            // " + e.getMessage());
        }

        // Generate token for immediate login
        String token = jwtUtil.generateToken(user);

        // Generate refresh token
        String refreshToken = refreshTokenService.generateRefreshToken(user.getId());

        // Create session for the newly registered user (no user agent/IP for now)
        sessionManagementService.createSession(user.getId(), token, null, null);

        return new LoginResponse(
                token,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles(),
                null, // No hotel for guest users
                null, // No hotel name for guest users
                null); // No tenantId for guest users
    }

    /**
     * Authenticate user and generate JWT token
     */
    public LoginResponse login(LoginRequest loginRequest) {
        return login(loginRequest, null, null);
    }

    /**
     * Authenticate user and generate JWT token with session management.
     *
     * Inactive users (suspended account or deactivated hotel) are still allowed
     * to authenticate so the frontend can show them an informational page. The
     * response carries an {@code accountStatus} field:
     * <ul>
     *   <li>{@code ACTIVE} – normal access</li>
     *   <li>{@code HOTEL_INACTIVE} – user's hotel has been deactivated</li>
     *   <li>{@code USER_SUSPENDED} – user account was manually suspended</li>
     * </ul>
     */
    public LoginResponse login(LoginRequest loginRequest, String userAgent, String ipAddress) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());

        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();

        // Validate password before any status checks
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Determine account status (login is still allowed so the frontend can show
        // the correct informational page instead of a generic error)
        String accountStatus = "ACTIVE";
        if (user.getHotel() != null && !Boolean.TRUE.equals(user.getHotel().getIsActive())) {
            accountStatus = "HOTEL_INACTIVE";
        } else if (!Boolean.TRUE.equals(user.getIsActive())) {
            accountStatus = "USER_SUSPENDED";
        }

        String token = jwtUtil.generateToken(user);

        // Generate refresh token
        String refreshToken = refreshTokenService.generateRefreshToken(user.getId());

        // Create session for the user
        sessionManagementService.createSession(user.getId(), token, userAgent, ipAddress);

        // Include hotel information if user is associated with a hotel
        Long hotelId = null;
        String hotelName = null;
        if (user.getHotel() != null) {
            hotelId = user.getHotel().getId();
            hotelName = user.getHotel().getName();
        }

        // Check if HOTEL_ADMIN user needs onboarding (no hotel assigned, has pending registration)
        boolean needsOnboarding = false;
        if (user.getHotel() == null && user.getRoles().contains(UserRole.HOTEL_ADMIN)) {
            java.util.Optional<HotelRegistration> pendingRegistration = hotelRegistrationRepository
                    .findByContactEmail(user.getEmail());
            if (pendingRegistration.isPresent()) {
                RegistrationStatus status = pendingRegistration.get().getStatus();
                needsOnboarding = (status == RegistrationStatus.PENDING || status == RegistrationStatus.UNDER_REVIEW);
            }
        }

        LoginResponse loginResponse = new LoginResponse(
                token,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRoles(),
                hotelId,
                hotelName,
                user.getTenantId());
        loginResponse.setNeedsOnboarding(needsOnboarding);
        loginResponse.setAccountStatus(accountStatus);

        return loginResponse;
    }

    /**
     * Validate JWT token and return user details
     */
    public User validateToken(String token) {
        String email = jwtUtil.extractEmail(token);

        if (email != null && jwtUtil.isTokenValid(token)) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent() && userOpt.get().getIsActive()) {
                return userOpt.get();
            }
        }

        return null;
    }
}
