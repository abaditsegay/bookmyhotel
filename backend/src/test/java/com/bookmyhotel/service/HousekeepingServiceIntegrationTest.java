package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.TenantRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.support.MySqlIntegrationTestSupport;

@Testcontainers
@SpringBootTest(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.sql.init.mode=always",
        "spring.sql.init.schema-locations=classpath:schema-ops-workflow-test.sql"
})
class HousekeepingServiceIntegrationTest extends MySqlIntegrationTestSupport {

    @Container
    static final org.testcontainers.containers.MySQLContainer<?> MYSQL = MySqlIntegrationTestSupport.MYSQL;

    @Autowired
    private HousekeepingService housekeepingService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @MockitoBean
    private HotelActivityAuditService hotelActivityAuditService;

    @Test
    void shouldPersistHousekeepingTaskLifecycleWithIssues() {
        Hotel hotel = createHotel("housekeeping");
        User staff = createHousekeepingUser(hotel, "hk@example.com");

        HousekeepingTask createdTask = housekeepingService.createTaskEnhanced(
                hotel.getId(),
                "301",
                "VIP Turnover",
                HousekeepingTaskType.CHECKOUT_CLEANING,
                TaskPriority.HIGH,
                "Prepare room for next arrival",
                "Use allergy-safe products",
                55,
                null);

        assertNotNull(createdTask.getId());
        assertEquals(HousekeepingTaskStatus.PENDING, createdTask.getStatus());

        HousekeepingTask assignedTask = housekeepingService.assignTask(hotel.getId(), createdTask.getId(), staff.getId());
        assertEquals(HousekeepingTaskStatus.ASSIGNED, assignedTask.getStatus());
        assertEquals(staff.getId(), assignedTask.getAssignedUser().getId());
        assertNotNull(assignedTask.getAssignedAt());

        HousekeepingTask startedTask = housekeepingService.startTask(hotel.getId(), createdTask.getId());
        assertEquals(HousekeepingTaskStatus.IN_PROGRESS, startedTask.getStatus());
        assertNotNull(startedTask.getStartedAt());

        HousekeepingTask completedTask = housekeepingService.completeTaskWithIssues(
                hotel.getId(),
                createdTask.getId(),
                "Bathroom vent needs repair follow-up",
                "Vent cover was loose during cleaning");

        assertEquals(HousekeepingTaskStatus.COMPLETED_WITH_ISSUES, completedTask.getStatus());
        assertEquals("Bathroom vent needs repair follow-up", completedTask.getInspectorNotes());
        assertEquals("Vent cover was loose during cleaning", completedTask.getSpecialInstructions());
        assertNotNull(completedTask.getCompletedAt());

        HousekeepingTask persistedTask = housekeepingTaskRepository.findById(createdTask.getId()).orElseThrow();
        assertEquals(HousekeepingTaskStatus.COMPLETED_WITH_ISSUES, persistedTask.getStatus());
        assertEquals(staff.getId(), persistedTask.getAssignedUser().getId());
        assertEquals("Vent cover was loose during cleaning", persistedTask.getSpecialInstructions());
    }

    private Hotel createHotel(String suffix) {
        Tenant tenant = new Tenant();
        tenant.setId("tenant-hk-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setName("Tenant " + suffix);
        tenant.setSubdomain("tenant-hk-" + UUID.randomUUID().toString().substring(0, 8));
        tenant.setIsActive(true);
        tenant = tenantRepository.save(tenant);

        Hotel hotel = new Hotel();
        hotel.setName("Housekeeping Hotel " + suffix);
        hotel.setAddress("Addis Ababa");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setPhone("+251911000000");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);
        hotel.setIsPubliclyListed(true);
        return hotelRepository.save(hotel);
    }

    private User createHousekeepingUser(Hotel hotel, String email) {
        User user = new User();
        user.setEmail(email);
        user.setPassword("encoded-password");
        user.setFirstName("House");
        user.setLastName("Keeper");
        user.setPhone("+251900000200");
        user.setIsActive(true);
        user.setRoles(Set.of(UserRole.HOUSEKEEPING));
        user.setHotel(hotel);
        return userRepository.save(user);
    }
}