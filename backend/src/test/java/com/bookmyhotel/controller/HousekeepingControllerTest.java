package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
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

import com.bookmyhotel.dto.HousekeepingTaskDTO;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.security.HotelSecurity;
import com.bookmyhotel.service.HousekeepingService;
import com.bookmyhotel.service.HotelService;

@ExtendWith(MockitoExtension.class)
class HousekeepingControllerTest {

    @Mock
    private HousekeepingService housekeepingService;

    @Mock
    private HotelService hotelService;

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
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }

    @Test
    void getAllStaffShouldUseAuthenticatedUsersHotelScope() {
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(9L);
        when(userRepository.findByHotelIdAndRole(9L, UserRole.HOUSEKEEPING)).thenReturn(List.<User>of());

        ResponseEntity<List<HousekeepingController.HousekeepingStaffDTO>> response = housekeepingController.getAllStaff();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userRepository).findByHotelIdAndRole(9L, UserRole.HOUSEKEEPING);
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }
}