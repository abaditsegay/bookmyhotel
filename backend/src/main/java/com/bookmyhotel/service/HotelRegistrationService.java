package com.bookmyhotel.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.admin.ApproveRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationResponse;
import com.bookmyhotel.dto.admin.HotelRegistrationSubmitResponse;
import com.bookmyhotel.dto.admin.RejectRegistrationRequest;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelRegistration;
import com.bookmyhotel.entity.RegistrationStatus;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRegistrationRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Service for hotel registration and approval management
 */
@Service
@Transactional
public class HotelRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(HotelRegistrationService.class);
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    private static final int PASSWORD_LENGTH = 12;
    private static final String DEFAULT_TENANT_ID = "all-hotels";
    private static final String DEFAULT_TENANT_NAME = "All Hotels";

    @Autowired
    private HotelRegistrationRepository registrationRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Submit a new hotel registration
     * Creates the registration record and a user account with temporary credentials
     */
    public HotelRegistrationSubmitResponse submitRegistration(HotelRegistrationRequest request) {
        // Check if email is already registered
        java.util.Optional<HotelRegistration> existing = registrationRepository
                .findByContactEmail(request.getContactEmail());
        if (existing.isPresent()) {
            throw new RuntimeException("Hotel registration with this email already exists");
        }

        // Check if user with this email already exists
        if (userRepository.findByEmail(request.getContactEmail()).isPresent()) {
            throw new RuntimeException("A user account with this email already exists");
        }

        HotelRegistration registration = new HotelRegistration();
        registration.setHotelName(request.getHotelName());
        registration.setDescription(request.getDescription());
        registration.setAddress(request.getAddress());
        registration.setCity(request.getCity());
        registration.setCountry(request.getCountry());
        registration.setPhone(request.getPhone());
        registration.setMobilePaymentPhone(request.getMobilePaymentPhone());
        registration.setMobilePaymentPhone2(request.getMobilePaymentPhone2());
        registration.setContactEmail(request.getContactEmail());
        registration.setContactPerson(request.getContactPerson());
        registration.setLicenseNumber(request.getLicenseNumber());
        registration.setTaxId(request.getTaxId());

        // Map the new fields
        registration.setWebsiteUrl(request.getWebsiteUrl());
        registration.setFacilityAmenities(request.getFacilityAmenities());
        registration.setNumberOfRooms(request.getNumberOfRooms());
        registration.setCheckInTime(request.getCheckInTime());
        registration.setCheckOutTime(request.getCheckOutTime());

        registration = registrationRepository.save(registration);

        // Generate 6-digit temporary password and create user account
        String temporaryPassword = generateSixDigitPassword();
        User registrationUser = createRegistrationUser(registration, temporaryPassword);

        logger.info("Hotel registration submitted with user account created: {} (user ID: {})",
                registration.getContactEmail(), registrationUser.getId());

        // Send welcome email with temporary credentials
        try {
            emailService.sendHotelAdminWelcomeEmail(
                    registration.getContactEmail(),
                    extractFirstName(registration.getContactPerson()),
                    registration.getHotelName(),
                    temporaryPassword);
            logger.info("Registration welcome email sent to: {}", registration.getContactEmail());
        } catch (Exception e) {
            logger.error("Failed to send registration welcome email to: {}", registration.getContactEmail(), e);
            // Don't fail registration if email fails
        }

        // Build submit response (no credentials exposed — sent via email)
        HotelRegistrationSubmitResponse response = new HotelRegistrationSubmitResponse();
        response.setRegistrationId(registration.getId());
        response.setHotelName(registration.getHotelName());
        response.setContactPerson(registration.getContactPerson());
        response.setLoginEmail(registration.getContactEmail());
        response.setStatus(registration.getStatus().name());
        response.setMessage(
                "Registration submitted successfully. A welcome email with your login credentials has been sent to your email address.");

        return response;
    }

    /**
     * Generate a 6-digit numeric temporary password
     */
    private String generateSixDigitPassword() {
        SecureRandom random = new SecureRandom();
        int password = 100000 + random.nextInt(900000);
        return String.valueOf(password);
    }

    /**
     * Create user account for hotel registration (no hotel assigned yet)
     */
    private User createRegistrationUser(HotelRegistration registration, String temporaryPassword) {
        User user = new User();
        user.setEmail(registration.getContactEmail());
        user.setFirstName(extractFirstName(registration.getContactPerson()));
        user.setLastName(extractLastName(registration.getContactPerson()));
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        user.setRoles(Set.of(UserRole.HOTEL_ADMIN));
        user.setIsActive(true);
        // No hotel assigned - will be assigned after admin approval
        return userRepository.save(user);
    }

    /**
     * Update registration with onboarding data (additional fields)
     */
    public HotelRegistrationResponse completeOnboarding(String email, HotelRegistrationRequest request) {
        HotelRegistration registration = registrationRepository.findByContactEmail(email)
                .orElseThrow(() -> new RuntimeException("No registration found for email: " + email));

        // Update with additional onboarding fields
        if (request.getDescription() != null)
            registration.setDescription(request.getDescription());
        if (request.getPhone() != null)
            registration.setPhone(request.getPhone());
        if (request.getMobilePaymentPhone() != null)
            registration.setMobilePaymentPhone(request.getMobilePaymentPhone());
        if (request.getMobilePaymentPhone2() != null)
            registration.setMobilePaymentPhone2(request.getMobilePaymentPhone2());
        if (request.getLicenseNumber() != null)
            registration.setLicenseNumber(request.getLicenseNumber());
        if (request.getTaxId() != null)
            registration.setTaxId(request.getTaxId());
        if (request.getWebsiteUrl() != null)
            registration.setWebsiteUrl(request.getWebsiteUrl());
        if (request.getFacilityAmenities() != null)
            registration.setFacilityAmenities(request.getFacilityAmenities());
        if (request.getNumberOfRooms() != null)
            registration.setNumberOfRooms(request.getNumberOfRooms());
        if (request.getCheckInTime() != null)
            registration.setCheckInTime(request.getCheckInTime());
        if (request.getCheckOutTime() != null)
            registration.setCheckOutTime(request.getCheckOutTime());

        registration = registrationRepository.save(registration);
        logger.info("Onboarding completed for registration: {}", email);

        return convertToResponse(registration);
    }

    /**
     * Get all registrations with pagination
     */
    public Page<HotelRegistrationResponse> getAllRegistrations(Pageable pageable) {
        Page<HotelRegistration> registrations = registrationRepository.findAllByOrderBySubmittedAtDesc(pageable);
        return registrations.map(this::convertToResponse);
    }

    /**
     * Get registrations by status
     */
    public Page<HotelRegistrationResponse> getRegistrationsByStatus(RegistrationStatus status, Pageable pageable) {
        Page<HotelRegistration> registrations = registrationRepository.findByStatusOrderBySubmittedAtDesc(status,
                pageable);
        return registrations.map(this::convertToResponse);
    }

    /**
     * Get pending registrations
     */
    public List<HotelRegistrationResponse> getPendingRegistrations() {
        List<HotelRegistration> registrations = registrationRepository
                .findByStatusOrderBySubmittedAtDesc(RegistrationStatus.PENDING);
        return registrations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search registrations
     */
    public Page<HotelRegistrationResponse> searchRegistrations(String searchTerm, Pageable pageable) {
        Page<HotelRegistration> registrations = registrationRepository.searchRegistrations(searchTerm, pageable);
        return registrations.map(this::convertToResponse);
    }

    /**
     * Get registration by ID
     */
    public HotelRegistrationResponse getRegistrationById(Long id) {
        HotelRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + id));
        return convertToResponse(registration);
    }

    /**
     * Get registrations by email address
     */
    @Transactional(readOnly = true)
    public List<HotelRegistrationResponse> getRegistrationByEmail(String email) {
        var registrations = registrationRepository.findByContactEmailOrderBySubmittedAtDesc(email);
        return registrations.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve hotel registration
     */
    public HotelRegistrationResponse approveRegistration(Long registrationId, ApproveRegistrationRequest request,
            Long reviewerId) {
        HotelRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + registrationId));

        if (registration.getStatus() != RegistrationStatus.PENDING &&
                registration.getStatus() != RegistrationStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only pending or under review registrations can be approved");
        }

        // Resolve tenant ID - use provided or fall back to default "All Hotels" tenant
        String resolvedTenantId = resolveDefaultTenant(request.getTenantId());

        // Create the hotel
        Hotel hotel = createHotelFromRegistration(registration, resolvedTenantId);

        // Assign existing user to the hotel (user was created during registration
        // submission)
        String contactEmail = registration.getContactEmail();
        User hotelAdmin = userRepository.findByEmail(contactEmail)
                .orElseThrow(() -> new RuntimeException("User account not found for: " + contactEmail));
        hotelAdmin.setHotel(hotel);
        userRepository.save(hotelAdmin);

        // Update registration status
        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setReviewedAt(LocalDateTime.now());
        registration.setReviewedBy(reviewerId);
        registration.setReviewComments(request.getComments());
        registration.setApprovedHotelId(hotel.getId());
        registration.setTenantId(resolvedTenantId);

        registration = registrationRepository.save(registration);

        // Send approval email
        try {
            sendHotelApprovalEmail(registration, hotel, hotelAdmin);
            logger.info("Hotel approval email sent successfully to: {}", registration.getContactEmail());
        } catch (Exception e) {
            logger.error("Failed to send hotel approval email to: {}", registration.getContactEmail(), e);
            // Don't fail the approval process if email fails
        }

        return convertToResponse(registration);
    }

    /**
     * Resolve the tenant ID to use for hotel approval.
     * If no tenant ID is provided, find or create the default "All Hotels" tenant.
     */
    private String resolveDefaultTenant(String tenantId) {
        if (tenantId != null && !tenantId.isBlank()) {
            return tenantId;
        }

        // Look for existing default tenant
        return tenantRepository.findById(DEFAULT_TENANT_ID)
                .map(Tenant::getId)
                .orElseGet(() -> {
                    // Create the default tenant if it doesn't exist
                    Tenant defaultTenant = new Tenant();
                    defaultTenant.setId(DEFAULT_TENANT_ID);
                    defaultTenant.setName(DEFAULT_TENANT_NAME);
                    defaultTenant.setSubdomain("all");
                    defaultTenant.setDescription("Default tenant for all hotels");
                    defaultTenant.setIsActive(true);
                    tenantRepository.save(defaultTenant);
                    logger.info("Created default tenant: {} ({})", DEFAULT_TENANT_NAME, DEFAULT_TENANT_ID);
                    return DEFAULT_TENANT_ID;
                });
    }

    /**
     * Reject hotel registration
     */
    public HotelRegistrationResponse rejectRegistration(Long registrationId, RejectRegistrationRequest request,
            Long reviewerId) {
        HotelRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + registrationId));

        if (registration.getStatus() != RegistrationStatus.PENDING &&
                registration.getStatus() != RegistrationStatus.UNDER_REVIEW) {
            throw new RuntimeException("Only pending or under review registrations can be rejected");
        }

        registration.setStatus(RegistrationStatus.REJECTED);
        registration.setReviewedAt(LocalDateTime.now());
        registration.setReviewedBy(reviewerId);
        registration.setReviewComments(request.getReason());

        registration = registrationRepository.save(registration);

        return convertToResponse(registration);
    }

    /**
     * Set registration status to under review
     */
    public HotelRegistrationResponse markUnderReview(Long registrationId, Long reviewerId) {
        HotelRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Hotel registration not found with id: " + registrationId));

        if (registration.getStatus() != RegistrationStatus.PENDING) {
            throw new RuntimeException("Only pending registrations can be marked as under review");
        }

        registration.setStatus(RegistrationStatus.UNDER_REVIEW);
        registration.setReviewedBy(reviewerId);

        registration = registrationRepository.save(registration);

        return convertToResponse(registration);
    }

    /**
     * Get registration statistics
     */
    public RegistrationStatistics getRegistrationStatistics() {
        RegistrationStatistics stats = new RegistrationStatistics();
        stats.setPending(registrationRepository.countByStatus(RegistrationStatus.PENDING));
        stats.setUnderReview(registrationRepository.countByStatus(RegistrationStatus.UNDER_REVIEW));
        stats.setApproved(registrationRepository.countByStatus(RegistrationStatus.APPROVED));
        stats.setRejected(registrationRepository.countByStatus(RegistrationStatus.REJECTED));
        stats.setTotal(stats.getPending() + stats.getUnderReview() + stats.getApproved() + stats.getRejected());
        return stats;
    }

    /**
     * Create hotel from approved registration
     */
    private Hotel createHotelFromRegistration(HotelRegistration registration, String tenantId) {
        // Set tenant context for hotel creation
        TenantContext.setTenantId(tenantId);

        try {
            // Get the tenant entity
            Tenant tenant = tenantRepository.findById(tenantId)
                    .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

            Hotel hotel = new Hotel();
            hotel.setName(registration.getHotelName());
            hotel.setDescription(registration.getDescription());
            hotel.setAddress(registration.getAddress());
            hotel.setCity(registration.getCity());
            hotel.setCountry(registration.getCountry());
            hotel.setPhone(registration.getPhone());
            hotel.setMobilePaymentPhone(registration.getMobilePaymentPhone());
            hotel.setMobilePaymentPhone2(registration.getMobilePaymentPhone2());
            hotel.setEmail(registration.getContactEmail());
            hotel.setContactPerson(registration.getContactPerson());
            hotel.setLicenseNumber(registration.getLicenseNumber());
            hotel.setTaxId(registration.getTaxId());
            hotel.setWebsiteUrl(registration.getWebsiteUrl());
            hotel.setFacilityAmenities(registration.getFacilityAmenities());
            hotel.setNumberOfRooms(registration.getNumberOfRooms());
            hotel.setCheckInTime(registration.getCheckInTime());
            hotel.setCheckOutTime(registration.getCheckOutTime());
            hotel.setTenant(tenant); // Set the tenant

            return hotelRepository.save(hotel);
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * Generate a secure temporary password for hotel admin
     */
    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);

        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            password.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }

        return password.toString();
    }

    /**
     * Extract first name from full name
     */
    private String extractFirstName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "Hotel";
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts[0];
    }

    /**
     * Extract last name from full name
     */
    private String extractLastName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "Admin";
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length > 1) {
            return String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length));
        }
        return "Admin";
    }

    /**
     * Send hotel approval email (no credentials - user was created at registration)
     */
    private void sendHotelApprovalEmail(HotelRegistration registration, Hotel hotel, User hotelAdmin) {
        try {
            emailService.sendHotelRegistrationApprovalEmail(
                    registration.getContactEmail(),
                    hotelAdmin.getFirstName(),
                    registration.getHotelName(),
                    null);
        } catch (IllegalStateException e) {
            logger.warn("Email service not configured - hotel approval email not sent: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to send hotel approval email", e);
            throw new RuntimeException("Failed to send hotel approval email", e);
        }
    }

    /**
     * Convert entity to response DTO
     */
    private HotelRegistrationResponse convertToResponse(HotelRegistration registration) {
        HotelRegistrationResponse response = new HotelRegistrationResponse();
        response.setId(registration.getId());
        response.setHotelName(registration.getHotelName());
        response.setDescription(registration.getDescription());
        response.setAddress(registration.getAddress());
        response.setCity(registration.getCity());
        response.setCountry(registration.getCountry());
        response.setPhone(registration.getPhone());
        response.setContactEmail(registration.getContactEmail());
        response.setContactPerson(registration.getContactPerson());
        response.setLicenseNumber(registration.getLicenseNumber());
        response.setTaxId(registration.getTaxId());
        response.setWebsiteUrl(registration.getWebsiteUrl());
        response.setFacilityAmenities(registration.getFacilityAmenities());
        response.setNumberOfRooms(registration.getNumberOfRooms());
        response.setCheckInTime(registration.getCheckInTime());
        response.setCheckOutTime(registration.getCheckOutTime());
        response.setStatus(registration.getStatus());
        response.setSubmittedAt(registration.getSubmittedAt());
        response.setReviewedAt(registration.getReviewedAt());
        response.setReviewedBy(registration.getReviewedBy());
        response.setReviewComments(registration.getReviewComments());
        response.setApprovedHotelId(registration.getApprovedHotelId());
        response.setTenantId(registration.getTenantId());
        return response;
    }

    /**
     * Inner class for registration statistics
     */
    public static class RegistrationStatistics {
        private long pending;
        private long underReview;
        private long approved;
        private long rejected;
        private long total;

        // Getters and Setters
        public long getPending() {
            return pending;
        }

        public void setPending(long pending) {
            this.pending = pending;
        }

        public long getUnderReview() {
            return underReview;
        }

        public void setUnderReview(long underReview) {
            this.underReview = underReview;
        }

        public long getApproved() {
            return approved;
        }

        public void setApproved(long approved) {
            this.approved = approved;
        }

        public long getRejected() {
            return rejected;
        }

        public void setRejected(long rejected) {
            this.rejected = rejected;
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }
    }
}
