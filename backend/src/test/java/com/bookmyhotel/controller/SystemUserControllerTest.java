package com.bookmyhotel.controller;

import com.bookmyhotel.config.TestMockConfiguration;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.service.SystemWideUserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SystemUserController.class)
@Import(TestMockConfiguration.class)
public class SystemUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SystemWideUserService systemWideUserService;

    @Test
    public void testCreateSystemAdmin_Success() throws Exception {
        // Given
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("admin@system.com");
        when(systemWideUserService.createSystemAdmin(anyString(), anyString(), anyString(), anyString())).thenReturn(mockUser);

        // When & Then
        mockMvc.perform(post("/api/system/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"admin@system.com\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("admin@system.com"));
    }

    @Test
    public void testCreateSystemAdmin_BadRequest() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/system/users/admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGetAllSystemAdmins_Success() throws Exception {
        // Given
        User admin1 = new User();
        admin1.setId(1L);
        admin1.setEmail("admin1@system.com");
        
        User admin2 = new User();
        admin2.setId(2L);
        admin2.setEmail("admin2@system.com");
        
        List<User> admins = Arrays.asList(admin1, admin2);
        when(systemWideUserService.getAllAdminUsers()).thenReturn(admins);

        // When & Then
        mockMvc.perform(get("/api/system/users/admins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].email").value("admin1@system.com"))
                .andExpect(jsonPath("$[1].email").value("admin2@system.com"));
    }

    @Test
    public void testGetAllGuestUsers() throws Exception {
        // Given
        User guest1 = new User();
        guest1.setId(1L);
        guest1.setEmail("guest1@example.com");
        
        User guest2 = new User();
        guest2.setId(2L);
        guest2.setEmail("guest2@example.com");
        
        List<User> guests = Arrays.asList(guest1, guest2);
        when(systemWideUserService.getAllGuestUsers()).thenReturn(guests);

        // When & Then
        mockMvc.perform(get("/api/system/users/guests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].email").value("guest1@example.com"));
    }

    @Test
    public void testPromoteToSystemAdmin_Success() throws Exception {
        // Given
        User promotedUser = new User();
        promotedUser.setId(1L);
        promotedUser.setEmail("user@example.com");
        when(systemWideUserService.promoteToSystemAdmin(anyLong())).thenReturn(promotedUser);

        // When & Then
        mockMvc.perform(put("/api/system/users/1/promote"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    public void testPromoteToSystemAdmin_BadRequest() throws Exception {
        // Given
        when(systemWideUserService.promoteToSystemAdmin(anyLong()))
                .thenThrow(new IllegalArgumentException("User cannot be promoted"));

        // When & Then
        mockMvc.perform(put("/api/system/users/1/promote"))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testDemoteFromSystemAdmin() throws Exception {
        // Given
        User demotedUser = new User();
        demotedUser.setId(1L);
        demotedUser.setEmail("admin@example.com");
        when(systemWideUserService.demoteFromSystemAdmin(anyLong(), nullable(String.class))).thenReturn(demotedUser);

        // When & Then
        mockMvc.perform(put("/api/system/users/1/demote"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@example.com"));
    }

    @Test
    public void testGetAllSystemWideUsers() throws Exception {
        // Given
        User user1 = new User();
        user1.setId(1L);
        user1.setEmail("user1@system.com");
        
        User user2 = new User();
        user2.setId(2L);
        user2.setEmail("user2@system.com");
        
        List<User> users = Arrays.asList(user1, user2);
        Page<User> userPage = new PageImpl<>(users);
        when(systemWideUserService.getAllSystemWideUsers(any(Pageable.class))).thenReturn(userPage);

        // When & Then
        mockMvc.perform(get("/api/system/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2));
    }
}
