package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.bookmyhotel.dto.admin.ApproveRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationRequest;
import com.bookmyhotel.dto.admin.HotelRegistrationResponse;
import com.bookmyhotel.dto.admin.HotelRegistrationSubmitResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelRegistration;
import com.bookmyhotel.entity.RegistrationStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRegistrationRepository;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.support.MySqlIntegrationTestSupport;

@Testcontainers
@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-hotel-registration-test.sql"
})
class HotelRegistrationServiceIntegrationTest extends MySqlIntegrationTestSupport {

    @Container
    static final org.testcontainers.containers.MySQLContainer<?> MYSQL = MySqlIntegrationTestSupport.MYSQL;

    @Autowired
    private HotelRegistrationService hotelRegistrationService;

    @Autowired
    private HotelRegistrationRepository registrationRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @MockitoBean
    private EmailService emailService;

    @Test
    void submitOnboardAndApproveShouldPersistRegistrationWorkflow() {
        doNothing().when(emailService).sendHotelAdminWelcomeEmail(anyString(), anyString(), anyString(), anyString());
        doNothing().when(emailService).sendHotelRegistrationApprovalEmail(anyString(), anyString(), anyString(), isNull());

        HotelRegistrationSubmitResponse submitResponse = hotelRegistrationService.submitRegistration(request());

        HotelRegistration submitted = registrationRepository.findById(submitResponse.getRegistrationId()).orElseThrow();
        assertEquals(RegistrationStatus.PENDING, submitted.getStatus());
        assertEquals("all-hotels", submitted.getTenantId());
        assertNotNull(submitted.getApprovedHotelId());

        Hotel createdHotel = hotelRepository.findById(submitted.getApprovedHotelId()).orElseThrow();
        assertFalse(createdHotel.getIsActive());
        assertEquals("Demo Hotel", createdHotel.getName());
        assertEquals("owner@demo.test", createdHotel.getEmail());

        User createdAdmin = userRepository.findByEmail("owner@demo.test").orElseThrow();
        assertEquals(createdHotel.getId(), createdAdmin.getHotel().getId());
        assertEquals(Set.of(UserRole.HOTEL_ADMIN), createdAdmin.getRoles());

        HotelRegistrationRequest onboarding = new HotelRegistrationRequest();
        onboarding.setHotelName("Demo Hotel Premium");
        onboarding.setAddress("456 Updated Ave");
        onboarding.setCity("Adama");

        HotelRegistrationResponse onboardingResponse = hotelRegistrationService.completeOnboarding("owner@demo.test", onboarding);
        assertEquals("Demo Hotel Premium", onboardingResponse.getHotelName());
        assertEquals("456 Updated Ave", onboardingResponse.getAddress());
        assertEquals("Adama", onboardingResponse.getCity());

        Hotel updatedHotel = hotelRepository.findById(submitted.getApprovedHotelId()).orElseThrow();
        assertEquals("Demo Hotel Premium", updatedHotel.getName());
        assertEquals("456 Updated Ave", updatedHotel.getAddress());
        assertEquals("Adama", updatedHotel.getCity());
        assertFalse(updatedHotel.getIsActive());

        ApproveRegistrationRequest approval = new ApproveRegistrationRequest();
        approval.setComments("Approved after verification");

        HotelRegistrationResponse approved = hotelRegistrationService.approveRegistration(submitResponse.getRegistrationId(), approval, 501L);

        assertEquals(RegistrationStatus.APPROVED, approved.getStatus());
        assertEquals(501L, approved.getReviewedBy());
        assertEquals("Approved after verification", approved.getReviewComments());

        Hotel approvedHotel = hotelRepository.findById(submitted.getApprovedHotelId()).orElseThrow();
        assertTrue(approvedHotel.getIsActive());
        assertEquals("Demo Hotel Premium", approvedHotel.getName());

        User approvedAdmin = userRepository.findByEmail("owner@demo.test").orElseThrow();
        assertEquals(approvedHotel.getId(), approvedAdmin.getHotel().getId());
        assertEquals(Set.of(UserRole.HOTEL_ADMIN), approvedAdmin.getRoles());

        verify(emailService).sendHotelAdminWelcomeEmail(anyString(), anyString(), anyString(), anyString());
        verify(emailService).sendHotelRegistrationApprovalEmail("owner@demo.test", "Jane", "Demo Hotel Premium", null);
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
}