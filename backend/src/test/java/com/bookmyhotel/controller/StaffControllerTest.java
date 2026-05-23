package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HousekeepingStaff;
import com.bookmyhotel.entity.MaintenanceTask;
import com.bookmyhotel.entity.TaskStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.MaintenanceTaskRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.security.HotelSecurity;

@ExtendWith(MockitoExtension.class)
class StaffControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @Mock
    private MaintenanceTaskRepository maintenanceTaskRepository;

    @Mock
    private HotelSecurity hotelSecurity;

    @InjectMocks
    private StaffController controller;

    @Test
    void getMyHousekeepingTasksShouldUseAuthenticatedUsersHotelScope() {
        User user = hotelBoundUser("staff@example.com", 13L, 22L, UserRole.HOUSEKEEPING);
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), "pw");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(13L);
        when(housekeepingTaskRepository.findByHotelIdAndAssignedUserId(13L, 22L, PageRequest.of(0, 20)))
                .thenReturn(Page.empty());

        ResponseEntity<?> response = controller.getMyHousekeepingTasks(authentication, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(housekeepingTaskRepository).findByHotelIdAndAssignedUserId(13L, 22L, PageRequest.of(0, 20));
        verify(housekeepingTaskRepository, never()).findByAssignedUserId(22L, PageRequest.of(0, 20));
    }

    @Test
    void getHousekeepingStatsShouldUseAuthenticatedUsersHotelScope() {
        User user = hotelBoundUser("staff@example.com", 13L, 22L, UserRole.HOUSEKEEPING);
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), "pw");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(13L);
        when(housekeepingTaskRepository.countByAssignedUserIdAndHotelId(22L, 13L)).thenReturn(4L);
        when(housekeepingTaskRepository.countByAssignedUserIdAndHotelIdAndStatus(22L, 13L,
                com.bookmyhotel.entity.HousekeepingTaskStatus.PENDING)).thenReturn(1L);
        when(housekeepingTaskRepository.countByAssignedUserIdAndHotelIdAndStatus(22L, 13L,
                com.bookmyhotel.entity.HousekeepingTaskStatus.IN_PROGRESS)).thenReturn(2L);
        when(housekeepingTaskRepository.countByAssignedUserIdAndHotelIdAndStatus(22L, 13L,
                com.bookmyhotel.entity.HousekeepingTaskStatus.COMPLETED)).thenReturn(1L);

        ResponseEntity<?> response = controller.getHousekeepingStats(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(housekeepingTaskRepository).countByAssignedUserIdAndHotelId(22L, 13L);
        verify(housekeepingTaskRepository, never()).countByAssignedUserId(22L);
    }

    @Test
    void startMaintenanceTaskShouldUseHotelScopedLookup() {
        User user = hotelBoundUser("maint@example.com", 13L, 33L, UserRole.MAINTENANCE);
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), "pw");

        HousekeepingStaff assignedStaff = new HousekeepingStaff();
        assignedStaff.setEmail(user.getEmail());

        MaintenanceTask task = new MaintenanceTask();
        task.setId(5L);
        task.setAssignedTo(assignedStaff);
        task.setStatus(TaskStatus.OPEN);

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(13L);
        when(maintenanceTaskRepository.findByIdAndHotelId(5L, 13L)).thenReturn(Optional.of(task));
        when(maintenanceTaskRepository.save(any(MaintenanceTask.class))).thenReturn(task);

        ResponseEntity<?> response = controller.startMaintenanceTask(5L, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(maintenanceTaskRepository).findByIdAndHotelId(5L, 13L);
        verify(maintenanceTaskRepository, never()).findById(5L);
    }

    private User hotelBoundUser(String email, Long hotelId, Long userId, UserRole role) {
        Hotel hotel = new Hotel();
        hotel.setId(hotelId);

        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setFirstName("Staff");
        user.setLastName("User");
        user.setHotel(hotel);
        user.setRoles(Set.of(role));
        return user;
    }
}