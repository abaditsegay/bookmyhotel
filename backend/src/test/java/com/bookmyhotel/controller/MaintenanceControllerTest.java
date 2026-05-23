package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import com.bookmyhotel.entity.MaintenanceTask;
import com.bookmyhotel.security.HotelSecurity;
import com.bookmyhotel.service.HotelService;
import com.bookmyhotel.service.MaintenanceService;

@ExtendWith(MockitoExtension.class)
class MaintenanceControllerTest {

    @Mock
    private MaintenanceService maintenanceService;

    @Mock
    private HotelService hotelService;

    @Mock
    private HotelSecurity hotelSecurity;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private MaintenanceController maintenanceController;

    @Test
    void getAllTasksShouldUseAuthenticatedUsersHotelScope() {
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(7L);
        when(maintenanceService.getAllTasks(7L)).thenReturn(Collections.emptyList());

        ResponseEntity<List<MaintenanceTask>> response = maintenanceController.getAllTasks();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(maintenanceService).getAllTasks(7L);
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }

    @Test
    void getMyTasksShouldUseAuthenticatedUsersHotelScope() {
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(11L);
        when(authentication.getName()).thenReturn("tech@example.com");
        when(maintenanceService.getTasksAssignedToUser(11L, "tech@example.com")).thenReturn(Collections.emptyList());

        ResponseEntity<List<MaintenanceTask>> response = maintenanceController.getMyTasks(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(maintenanceService).getTasksAssignedToUser(11L, "tech@example.com");
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }

    @Test
    void updateTaskShouldUseHotelScopedServiceOverload() {
        MaintenanceTask updatedTask = new MaintenanceTask();
        when(hotelSecurity.getCurrentUserHotelId()).thenReturn(13L);
        doReturn(updatedTask).when(maintenanceService).updateTask(13L, 5L, updatedTask);

        ResponseEntity<MaintenanceTask> response = maintenanceController.updateTask(5L, updatedTask);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(maintenanceService).updateTask(13L, 5L, updatedTask);
        verify(hotelService, never()).getHotelIdByTenantId(anyString());
    }
}