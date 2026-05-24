package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.TaskUpdateRequest;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.dto.HousekeepingTaskDTO;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.security.HotelSecurity;
import com.bookmyhotel.service.HousekeepingService;

@ExtendWith(MockitoExtension.class)
class HousekeepingControllerTest {

    @Mock
    private HousekeepingService housekeepingService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelSecurity hotelSecurity;

    @InjectMocks
    private HousekeepingController housekeepingController;

    @Test
    void getAllTasksShouldUseAuthenticatedUsersHotelScope() {
        Page<HousekeepingTask> tasks = new PageImpl<>(Collections.emptyList());
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(7L);
        when(housekeepingService.getAllTasks(
                argThat(hotelId -> hotelId != null && hotelId.equals(7L)),
                argThat(pageable -> pageable != null && pageable.getPageNumber() == 0 && pageable.getPageSize() == 10)))
                .thenReturn(tasks);

        ResponseEntity<Page<HousekeepingTaskDTO>> response = housekeepingController.getAllTasks(0, 10);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(housekeepingService).getAllTasks(
                argThat(hotelId -> hotelId != null && hotelId.equals(7L)),
                argThat(pageable -> pageable != null && pageable.getPageNumber() == 0 && pageable.getPageSize() == 10));
    }

    @Test
    void getAllStaffShouldUseAuthenticatedUsersHotelScope() {
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(9L);
        when(userRepository.findByHotelIdAndRole(9L, UserRole.HOUSEKEEPING)).thenReturn(List.<User>of());

        ResponseEntity<List<HousekeepingController.HousekeepingStaffDTO>> response = housekeepingController.getAllStaff();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository).findByHotelIdAndRole(9L, UserRole.HOUSEKEEPING);
    }

    @Test
    void updateTaskStatusShouldReturnTaskDtoForInProgressUpdate() {
        HousekeepingTask task = new HousekeepingTask();
        Hotel hotel = new Hotel();
        hotel.setId(7L);
        hotel.setName("Grand Plaza");
        task.setId(806L);
        task.setHotel(hotel);
        task.setTitle("Room turnaround");
        task.setRoomNumber("806");
        task.setTaskType(HousekeepingTaskType.ROOM_CLEANING);
        task.setPriority(TaskPriority.HIGH);
        task.setStatus(HousekeepingTaskStatus.IN_PROGRESS);

        User assignedUser = new User();
        assignedUser.setId(55L);
        assignedUser.setFirstName("Hana");
        assignedUser.setLastName("Tesfaye");
        assignedUser.setEmail("hana@example.com");
        task.setAssignedUser(assignedUser);

        TaskUpdateRequest request = new TaskUpdateRequest();
        request.setStatus("IN_PROGRESS");
        request.setNotes("Started cleaning");

        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(7L);
        when(housekeepingService.updateTaskStatus(7L, 806L, "IN_PROGRESS", "Started cleaning")).thenReturn(task);

        ResponseEntity<?> response = housekeepingController.updateTaskStatus(806L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        HousekeepingTaskDTO body = (HousekeepingTaskDTO) response.getBody();
        assertNotNull(body);
        assertEquals(806L, body.getId());
        assertEquals(HousekeepingTaskStatus.IN_PROGRESS, body.getStatus());
        assertEquals(55L, body.getAssignedUserId());
        assertEquals("Grand Plaza", body.getHotelName());
        verify(housekeepingService).updateTaskStatus(7L, 806L, "IN_PROGRESS", "Started cleaning");
    }
}