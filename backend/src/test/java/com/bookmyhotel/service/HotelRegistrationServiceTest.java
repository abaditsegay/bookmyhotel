package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

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

@ExtendWith(MockitoExtension.class)
class HotelRegistrationServiceTest {

    @Mock
    private HotelRegistrationRepository registrationRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @InjectMocks
    private HotelRegistrationService hotelRegistrationService;

    @Test
    void submitRegistrationShouldCreatePendingDraftOnly() {
        HotelRegistrationRequest request = request();

        when(registrationRepository.findByContactEmail("owner@demo.test")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.empty());
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> {
            HotelRegistration registration = invocation.getArgument(0);
            if (registration.getId() == null) {
                registration.setId(10L);
            }
            return registration;
        });

        HotelRegistrationSubmitResponse response = hotelRegistrationService.submitRegistration(request);

        assertEquals(10L, response.getRegistrationId());
        assertEquals("Demo Hotel", response.getHotelName());
        assertEquals("owner@demo.test", response.getLoginEmail());
        assertEquals("PENDING", response.getStatus());
        assertTrue(response.getMessage().contains("Registration submitted successfully"));
        verify(hotelRepository, never()).save(any(Hotel.class));
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendHotelAdminWelcomeEmail(any(String.class), any(String.class), any(String.class), any(String.class));
    }

    @Test
    void submitRegistrationShouldRejectDuplicateRegistrationEmail() {
        when(registrationRepository.findByContactEmail("owner@demo.test"))
                .thenReturn(Optional.of(new HotelRegistration()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hotelRegistrationService.submitRegistration(request()));

        assertEquals("Hotel registration with this email already exists", exception.getMessage());
        verify(hotelRepository, never()).save(any(Hotel.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void submitRegistrationShouldRejectExistingUserEmail() {
        when(registrationRepository.findByContactEmail("owner@demo.test")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.of(new User()));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hotelRegistrationService.submitRegistration(request()));

        assertEquals("A user account with this email already exists", exception.getMessage());
        verify(hotelRepository, never()).save(any(Hotel.class));
    }

    @Test
    void completeOnboardingShouldUpdateRegistrationAndLinkedHotel() {
        HotelRegistration registration = new HotelRegistration();
        registration.setId(10L);
        registration.setHotelName("Old Hotel");
        registration.setAddress("Old Address");
        registration.setCity("Old City");
        registration.setCountry("Old Country");
        registration.setContactPerson("Old Owner");
        registration.setContactEmail("owner@demo.test");
        registration.setApprovedHotelId(20L);

        Hotel hotel = new Hotel();
        hotel.setId(20L);
        hotel.setName("Old Hotel");
        hotel.setAddress("Old Address");

        HotelRegistrationRequest request = request();
        request.setHotelName("New Hotel Name");
        request.setAddress("New Address");
        request.setCity("New City");

        when(registrationRepository.findByContactEmail("owner@demo.test")).thenReturn(Optional.of(registration));
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(hotelRepository.findById(20L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelRegistrationResponse response = hotelRegistrationService.completeOnboarding("owner@demo.test", request);

        assertEquals("New Hotel Name", response.getHotelName());
        assertEquals("New Address", response.getAddress());
        assertEquals("New City", response.getCity());
        assertEquals("New Hotel Name", hotel.getName());
        assertEquals("New Address", hotel.getAddress());
        assertEquals("New City", hotel.getCity());
        verify(hotelRepository).save(hotel);
    }

    @Test
    void submitRegistrationShouldNotCreateOperationalRecordsBeforeApproval() {
        HotelRegistrationRequest request = request();

        when(registrationRepository.findByContactEmail("owner@demo.test")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.empty());
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> {
            HotelRegistration registration = invocation.getArgument(0);
            if (registration.getId() == null) {
                registration.setId(10L);
            }
            return registration;
        });

        HotelRegistrationSubmitResponse response = hotelRegistrationService.submitRegistration(request);

        assertEquals(10L, response.getRegistrationId());
        assertEquals("PENDING", response.getStatus());
        verify(hotelRepository, never()).save(any(Hotel.class));
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendHotelAdminWelcomeEmail(any(String.class), any(String.class), any(String.class), any(String.class));
    }

    @Test
    void approveRegistrationShouldActivateHotelAndKeepExistingAdminLinked() {
        HotelRegistration registration = approvedRegistrationDraft();
        Hotel hotel = registrationHotel(20L, false);
        User hotelAdmin = existingHotelAdmin(null);
        ApproveRegistrationRequest request = new ApproveRegistrationRequest();
        request.setComments("Looks good");

        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));
        when(hotelRepository.findById(20L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.of(hotelAdmin));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelRegistrationResponse response = hotelRegistrationService.approveRegistration(10L, request, 99L);

        assertEquals(RegistrationStatus.APPROVED, response.getStatus());
        assertEquals(99L, response.getReviewedBy());
        assertEquals("Looks good", response.getReviewComments());
        assertTrue(hotel.getIsActive());
        assertEquals(hotel, hotelAdmin.getHotel());
        verify(userRepository).save(hotelAdmin);
        verify(emailService).sendHotelRegistrationApprovalEmail("owner@demo.test", "Jane", "Demo Hotel", null);
    }

    @Test
    void approveRegistrationShouldCreateHotelAdminWhenMissing() {
        HotelRegistration registration = approvedRegistrationDraft();
        Hotel hotel = registrationHotel(20L, false);
        ApproveRegistrationRequest request = new ApproveRegistrationRequest();

        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));
        when(hotelRepository.findById(20L)).thenReturn(Optional.of(hotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(String.class))).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(31L);
            return user;
        });
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        hotelRegistrationService.approveRegistration(10L, request, 77L);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals("owner@demo.test", savedUser.getEmail());
        assertEquals("Jane", savedUser.getFirstName());
        assertEquals("Owner", savedUser.getLastName());
        assertEquals(Set.of(UserRole.HOTEL_ADMIN), savedUser.getRoles());
        assertEquals(hotel, savedUser.getHotel());
        verify(emailService).sendHotelRegistrationApprovalEmail("owner@demo.test", "Jane", "Demo Hotel", null);
    }

    @Test
    void approveRegistrationShouldCreateAndLinkHotelWhenLegacyRegistrationHasNoApprovedHotel() {
        HotelRegistration registration = approvedRegistrationDraft();
        registration.setApprovedHotelId(null);
        registration.setTenantId(null);

        Hotel createdHotel = registrationHotel(20L, false);
        User hotelAdmin = existingHotelAdmin(null);
        ApproveRegistrationRequest request = new ApproveRegistrationRequest();
        request.setComments("Approved legacy registration");
        request.setTenantId("tenant-1");

        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(activeTenant("tenant-1")));
        when(hotelRepository.findFirstByEmailIgnoreCase("owner@demo.test")).thenReturn(Optional.empty());
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> {
            Hotel hotel = invocation.getArgument(0);
            if (hotel.getId() == null) {
                hotel.setId(20L);
            }
            return hotel;
        });
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.of(hotelAdmin));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelRegistrationResponse response = hotelRegistrationService.approveRegistration(10L, request, 88L);

        assertEquals(RegistrationStatus.APPROVED, response.getStatus());
        assertEquals(20L, response.getApprovedHotelId());
    assertEquals("tenant-1", response.getTenantId());
        assertEquals(88L, response.getReviewedBy());
        assertNotNull(hotelAdmin.getHotel());
        assertEquals(20L, hotelAdmin.getHotel().getId());
        assertTrue(hotelAdmin.getHotel().getIsActive());
        verify(hotelRepository, times(2)).save(any(Hotel.class));
        verify(userRepository).save(hotelAdmin);
        verify(emailService).sendHotelRegistrationApprovalEmail("owner@demo.test", "Jane", "Demo Hotel", null);
    }

    @Test
    void approveRegistrationShouldReuseExistingHotelWhenLegacyRegistrationLostLink() {
        HotelRegistration registration = approvedRegistrationDraft();
        registration.setApprovedHotelId(null);
        registration.setTenantId(null);

        Hotel existingHotel = registrationHotel(25L, false);
        User hotelAdmin = existingHotelAdmin(null);
        ApproveRegistrationRequest request = new ApproveRegistrationRequest();
        request.setComments("Approved against existing hotel");
        request.setTenantId("tenant-1");
        existingHotel.setTenant(activeTenant("tenant-1"));

        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));
        when(tenantRepository.findById("tenant-1")).thenReturn(Optional.of(activeTenant("tenant-1")));
        when(hotelRepository.findFirstByEmailIgnoreCase("owner@demo.test")).thenReturn(Optional.of(existingHotel));
        when(hotelRepository.save(any(Hotel.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.findByEmail("owner@demo.test")).thenReturn(Optional.of(hotelAdmin));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelRegistrationResponse response = hotelRegistrationService.approveRegistration(10L, request, 89L);

        assertEquals(RegistrationStatus.APPROVED, response.getStatus());
        assertEquals(25L, response.getApprovedHotelId());
    assertEquals("tenant-1", response.getTenantId());
        assertEquals(25L, hotelAdmin.getHotel().getId());
        assertTrue(existingHotel.getIsActive());
        verify(hotelRepository, times(1)).save(existingHotel);
        verify(userRepository).save(hotelAdmin);
        verify(emailService).sendHotelRegistrationApprovalEmail("owner@demo.test", "Jane", "Demo Hotel", null);
    }

    @Test
    void rejectRegistrationShouldStoreReviewerAndReason() {
        HotelRegistration registration = approvedRegistrationDraft();
        RejectRegistrationRequest request = new RejectRegistrationRequest();
        request.setReason("Missing operating license");

        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));
        when(registrationRepository.save(any(HotelRegistration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HotelRegistrationResponse response = hotelRegistrationService.rejectRegistration(10L, request, 55L);

        assertEquals(RegistrationStatus.REJECTED, response.getStatus());
        assertEquals(55L, response.getReviewedBy());
        assertEquals("Missing operating license", response.getReviewComments());
        assertNotNull(response.getReviewedAt());
    }

    @Test
    void markUnderReviewShouldRejectNonPendingRegistration() {
        HotelRegistration registration = approvedRegistrationDraft();
        registration.setStatus(RegistrationStatus.APPROVED);
        when(registrationRepository.findById(10L)).thenReturn(Optional.of(registration));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> hotelRegistrationService.markUnderReview(10L, 12L));

        assertEquals("Only pending registrations can be marked as under review", exception.getMessage());
    }

    private HotelRegistrationRequest request() {
        HotelRegistrationRequest request = new HotelRegistrationRequest();
        request.setHotelName("Demo Hotel");
        request.setDescription("Description");
        request.setAddress("123 Main St");
        request.setCity("Addis Ababa");
        request.setCountry("Ethiopia");
        request.setPhone("123456789");
        request.setContactEmail("owner@demo.test");
        request.setContactPerson("Jane Owner");
        request.setLicenseNumber("LIC-1");
        request.setTaxId("TAX-1");
        request.setWebsiteUrl("https://demo.test");
        request.setFacilityAmenities("Spa, WiFi");
        request.setNumberOfRooms(12);
        request.setCheckInTime("14:00");
        request.setCheckOutTime("12:00");
        return request;
    }

    private Tenant defaultTenant() {
        Tenant tenant = new Tenant();
        tenant.setId("all-hotels");
        tenant.setName("All Hotels");
        tenant.setSubdomain("all");
        tenant.setIsActive(true);
        return tenant;
    }

    private Tenant activeTenant(String tenantId) {
        Tenant tenant = new Tenant();
        tenant.setId(tenantId);
        tenant.setName("Tenant " + tenantId);
        tenant.setSubdomain(tenantId);
        tenant.setIsActive(true);
        return tenant;
    }

    private HotelRegistration approvedRegistrationDraft() {
        HotelRegistration registration = new HotelRegistration();
        registration.setId(10L);
        registration.setHotelName("Demo Hotel");
        registration.setDescription("Description");
        registration.setAddress("123 Main St");
        registration.setCity("Addis Ababa");
        registration.setCountry("Ethiopia");
        registration.setPhone("123456789");
        registration.setContactEmail("owner@demo.test");
        registration.setContactPerson("Jane Owner");
        registration.setLicenseNumber("LIC-1");
        registration.setTaxId("TAX-1");
        registration.setWebsiteUrl("https://demo.test");
        registration.setFacilityAmenities("Spa, WiFi");
        registration.setNumberOfRooms(12);
        registration.setCheckInTime("14:00");
        registration.setCheckOutTime("12:00");
        registration.setStatus(RegistrationStatus.PENDING);
        registration.setApprovedHotelId(20L);
        registration.setTenantId("all-hotels");
        return registration;
    }

    private Hotel registrationHotel(Long id, boolean active) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Draft Hotel");
        hotel.setAddress("Old Address");
        hotel.setIsActive(active);
        return hotel;
    }

    private User existingHotelAdmin(Hotel hotel) {
        User user = new User();
        user.setId(30L);
        user.setEmail("owner@demo.test");
        user.setFirstName("Jane");
        user.setLastName("Owner");
        user.setRoles(Set.of(UserRole.HOTEL_ADMIN));
        user.setHotel(hotel);
        return user;
    }
}