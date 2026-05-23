package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.security.HotelSecurity;
import com.bookmyhotel.service.HousekeepingService;
import com.bookmyhotel.service.HotelService;

@ExtendWith(MockitoExtension.class)
class SupervisorControllerTest {

    @Mock
    private HousekeepingService housekeepingService;

    @Mock
    private HotelService hotelService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelSecurity hotelSecurity;

    @InjectMocks
    private SupervisorController supervisorController;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getRecentActivityShouldUseAuthenticatedUsersHotelScope() {
                User user = hotelBoundUser("ops@example.com", "tenant-a");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ops@example.com", null, Collections.emptyList()));
        when(userRepository.findByEmail("ops@example.com")).thenReturn(Optional.of(user));
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(7L);
        when(housekeepingService.getTasksByStatus(7L, com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED))
                .thenReturn(Collections.emptyList());
        when(housekeepingService.getTasksByStatus(7L, com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS))
                .thenReturn(Collections.emptyList());

        ResponseEntity<?> response = supervisorController.getRecentActivity();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(housekeepingService).getTasksByStatus(7L, com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED);
        verify(housekeepingService).getTasksByStatus(7L, com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS);
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }

    @Test
    void getTasksShouldUseAuthenticatedUsersHotelScope() {
                User user = hotelBoundUser("ops@example.com", "tenant-a");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ops@example.com", null, Collections.emptyList()));
        when(userRepository.findByEmail("ops@example.com")).thenReturn(Optional.of(user));
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(9L);
        when(housekeepingService.getTasksByStatus(9L, com.bookmyhotel.entity.HousekeepingTaskStatus.PENDING))
                .thenReturn(Collections.emptyList());
        when(housekeepingService.getTasksByStatus(9L, com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS))
                .thenReturn(Collections.emptyList());
        when(housekeepingService.getTasksByStatus(9L, com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED))
                .thenReturn(Collections.emptyList());

        ResponseEntity<?> response = supervisorController.getTasks(0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(housekeepingService).getTasksByStatus(9L, com.bookmyhotel.entity.HousekeepingTaskStatus.PENDING);
        verify(housekeepingService).getTasksByStatus(9L, com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS);
        verify(housekeepingService).getTasksByStatus(9L, com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED);
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }

    @Test
    void createHousekeepingTaskShouldUseAuthenticatedUsersHotelScope() {
                User user = hotelBoundUser("ops@example.com", "tenant-a");

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("ops@example.com", null, Collections.emptyList()));
        when(userRepository.findByEmail("ops@example.com")).thenReturn(Optional.of(user));
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(11L);

        SupervisorController.CreateTaskRequest request = new SupervisorController.CreateTaskRequest();
        request.setTaskType("PUBLIC_AREA_CLEANING");
        request.setPriority("HIGH");
        request.setDescription("Clean lobby");
        request.setSpecialInstructions("Use eco supplies");

        HousekeepingTask task = new HousekeepingTask();
        task.setId(33L);
        task.setTaskType(com.bookmyhotel.entity.HousekeepingTaskType.PUBLIC_AREA_CLEANING);
        task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.PENDING);
        task.setPriority(com.bookmyhotel.entity.TaskPriority.HIGH);
        task.setDescription("Clean lobby");
        task.setSpecialInstructions("Use eco supplies");
        task.setEstimatedDurationMinutes(20);
        task.setRoomNumber("General Area");
        task.setCreatedAt(LocalDateTime.now());
        when(housekeepingService.createTaskWithoutRoom(11L,
                com.bookmyhotel.entity.HousekeepingTaskType.PUBLIC_AREA_CLEANING,
                com.bookmyhotel.entity.TaskPriority.HIGH,
                "Clean lobby",
                "Use eco supplies")).thenReturn(task);

        ResponseEntity<?> response = supervisorController.createHousekeepingTask(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(housekeepingService).createTaskWithoutRoom(11L,
                                com.bookmyhotel.entity.HousekeepingTaskType.PUBLIC_AREA_CLEANING,
                com.bookmyhotel.entity.TaskPriority.HIGH,
                "Clean lobby",
                "Use eco supplies");
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }

        @Test
        void getStaffTasksShouldUseAuthenticatedUsersHotelScope() {
                User user = hotelBoundUser("ops@example.com", "tenant-a");

                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("ops@example.com", null, Collections.emptyList()));
                when(userRepository.findByEmail("ops@example.com")).thenReturn(Optional.of(user));
                when(hotelSecurity.getCurrentUserHotelId()).thenReturn(15L);
                Page<HousekeepingTask> emptyPage = new PageImpl<>(Collections.emptyList());
                when(housekeepingService.getTasksForStaff(15L, 22L, Pageable.ofSize(20).withPage(0))).thenReturn(emptyPage);

                ResponseEntity<?> response = supervisorController.getStaffTasks(22L, "ALL", 0, 20);

                assertEquals(HttpStatus.OK, response.getStatusCode());
                verify(housekeepingService).getTasksForStaff(15L, 22L, Pageable.ofSize(20).withPage(0));
                verify(hotelService, never()).getHotelIdByTenantId(anyString());
        }

        @Test
        void assignHousekeepingTaskShouldUseAuthenticatedUsersHotelScope() {
                User user = hotelBoundUser("ops@example.com", "tenant-a");

                SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken("ops@example.com", null, Collections.emptyList()));
                when(userRepository.findByEmail("ops@example.com")).thenReturn(Optional.of(user));
                when(hotelSecurity.getCurrentUserHotelId()).thenReturn(17L);

                HousekeepingTask task = new HousekeepingTask();
                task.setId(44L);
                task.setTaskType(com.bookmyhotel.entity.HousekeepingTaskType.ROOM_CLEANING);
                task.setStatus(com.bookmyhotel.entity.HousekeepingTaskStatus.ASSIGNED);
                task.setPriority(com.bookmyhotel.entity.TaskPriority.NORMAL);
                task.setDescription("Assign room cleaning");
                task.setRoomNumber("204");
                task.setAssignedAt(LocalDateTime.now());
                when(housekeepingService.assignTask(17L, 44L, 8L)).thenReturn(task);

                ResponseEntity<?> response = supervisorController.assignHousekeepingTask(44L, 8L);

                assertEquals(HttpStatus.OK, response.getStatusCode());
                verify(housekeepingService).assignTask(17L, 44L, 8L);
                verify(hotelService, never()).getHotelIdByTenantId(anyString());
        }

        private User hotelBoundUser(String email, String tenantId) {
                Tenant tenant = new Tenant();
                tenant.setTenantId(tenantId);

                Hotel hotel = new Hotel();
                hotel.setId(101L);
                hotel.setTenant(tenant);

                User user = new User();
                user.setEmail(email);
                user.setHotel(hotel);
                return user;
        }
}