package com.bookmyhotel.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.bookmyhotel.dto.SystemAdminRequest;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.service.SystemWideUserService;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Unit tests for SystemUserController
 * Tests controller endpoints without Spring context
 */
public class SystemUserControllerUnitTest {

    private MockMvc mockMvc;
    private SystemWideUserService systemWideUserService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        systemWideUserService = mock(SystemWideUserService.class);
        SystemUserController controller = new SystemUserController();
        // Use reflection to set the private field since we're not using Spring context
        try {
            var field = SystemUserController.class.getDeclaredField("systemWideUserService");
            field.setAccessible(true);
            field.set(controller, systemWideUserService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    private User createMockUser(Long id, String email, String firstName, String lastName, Set<UserRole> roles) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRoles(roles);
        user.setTenantId(null); // System-wide user
        return user;
    }

    @Test
    void testCreateSystemAdmin_Success() throws Exception {
        // Arrange
        User mockUser = createMockUser(1L, "admin@test.com", "Admin", "User", Set.of(UserRole.ADMIN));
        when(systemWideUserService.createSystemAdmin(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(mockUser);

        SystemAdminRequest request = new SystemAdminRequest(
                "admin@test.com",
                "Admin", 
                "User",
                "password123"
        );

        // Act & Assert
        mockMvc.perform(post("/api/system-users/admins")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk()) // Controller returns 200, not 201
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("admin@test.com"))
                .andExpect(jsonPath("$.firstName").value("Admin"))
                .andExpect(jsonPath("$.lastName").value("User"));

        verify(systemWideUserService).createSystemAdmin("admin@test.com", "Admin", "User", "password123");
    }

    @Test
    void testCreateSystemAdmin_ServiceException() throws Exception {
        // Arrange - service throws IllegalArgumentException
        when(systemWideUserService.createSystemAdmin(anyString(), anyString(), anyString(), anyString()))
                .thenThrow(new IllegalArgumentException("Invalid data"));

        SystemAdminRequest request = new SystemAdminRequest(
                "invalid@test.com",
                "Test", 
                "User",
                "password123"
        );

        // Act & Assert
        mockMvc.perform(post("/api/system-users/admins")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest()); // Controller catches exception and returns 400

        verify(systemWideUserService).createSystemAdmin("invalid@test.com", "Test", "User", "password123");
    }

    @Test
    void testGetAllSystemWideUsers() throws Exception {
        // Arrange
        List<User> mockUsers = Arrays.asList(
                createMockUser(1L, "admin@test.com", "Admin", "User", Set.of(UserRole.ADMIN)),
                createMockUser(2L, "guest@test.com", "Guest", "User", Set.of(UserRole.GUEST))
        );
        Page<User> mockPage = new PageImpl<>(mockUsers, PageRequest.of(0, 20), 2);
        when(systemWideUserService.getAllSystemWideUsers(any(Pageable.class))).thenReturn(mockPage);

        // Act & Assert  
        mockMvc.perform(get("/api/system-users")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].email").value("admin@test.com"))
                .andExpect(jsonPath("$.content[1].email").value("guest@test.com"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(systemWideUserService).getAllSystemWideUsers(any(Pageable.class));
    }

    @Test
    void testGetAllSystemAdmins_Success() throws Exception {
        // Arrange
        List<User> mockAdmins = Arrays.asList(
                createMockUser(1L, "admin1@test.com", "Admin", "One", Set.of(UserRole.ADMIN))
        );
        when(systemWideUserService.getAllAdminUsers()).thenReturn(mockAdmins);

        // Act & Assert
        mockMvc.perform(get("/api/system-users/admins"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("admin1@test.com"));

        verify(systemWideUserService).getAllAdminUsers();
    }

    @Test
    void testGetAllGuestUsers() throws Exception {
        // Arrange
        List<User> mockGuests = Arrays.asList(
                createMockUser(2L, "guest1@test.com", "Guest", "One", Set.of(UserRole.GUEST))
        );
        when(systemWideUserService.getAllGuestUsers()).thenReturn(mockGuests);

        // Act & Assert
        mockMvc.perform(get("/api/system-users/guests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("guest1@test.com"));

        verify(systemWideUserService).getAllGuestUsers();
    }

    @Test
    void testPromoteToSystemAdmin_Success() throws Exception {
        // Arrange
        User promotedUser = createMockUser(1L, "user@test.com", "Test", "User", Set.of(UserRole.ADMIN));
        when(systemWideUserService.promoteToSystemAdmin(eq(1L))).thenReturn(promotedUser);

        // Act & Assert
        mockMvc.perform(post("/api/system-users/promote")
                .param("userId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("user@test.com"));

        verify(systemWideUserService).promoteToSystemAdmin(1L);
    }

    @Test
    void testDemoteFromSystemAdmin() throws Exception {
        // Arrange
        User demotedUser = createMockUser(1L, "admin@test.com", "Test", "Admin", Set.of(UserRole.GUEST));
        when(systemWideUserService.demoteFromSystemAdmin(eq(1L), anyString())).thenReturn(demotedUser);

        // Act & Assert
        mockMvc.perform(post("/api/system-users/demote")
                .param("userId", "1")
                .param("tenantId", "test-tenant-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("admin@test.com"));

        verify(systemWideUserService).demoteFromSystemAdmin(1L, "test-tenant-id");
    }
}
