package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SystemWideUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private SystemWideUserService systemWideUserService;

    private User systemAdmin;
    private User systemGuest;
    private User tenantUser;

    @BeforeEach
    void setUp() {
        // System-wide admin user (tenantId = null)
        systemAdmin = new User();
        systemAdmin.setId(1L);
        systemAdmin.setEmail("admin@system.com");
        systemAdmin.setFirstName("System");
        systemAdmin.setLastName("Admin");
        Set<UserRole> adminRoles = new HashSet<>();
        adminRoles.add(UserRole.ADMIN);
        systemAdmin.setRoles(adminRoles);
        systemAdmin.setTenantId(null);
        systemAdmin.setPassword("hashedPassword");

        // System-wide guest user (tenantId = null)
        systemGuest = new User();
        systemGuest.setId(2L);
        systemGuest.setEmail("guest@system.com");
        systemGuest.setFirstName("System");
        systemGuest.setLastName("Guest");
        Set<UserRole> guestRoles = new HashSet<>();
        guestRoles.add(UserRole.GUEST);
        systemGuest.setRoles(guestRoles);
        systemGuest.setTenantId(null);
        systemGuest.setPassword("hashedPassword");

        // Tenant-bound user (has tenantId)
        tenantUser = new User();
        tenantUser.setId(3L);
        tenantUser.setEmail("user@hotel.com");
        tenantUser.setFirstName("Hotel");
        tenantUser.setLastName("User");
        Set<UserRole> tenantGuestRoles = new HashSet<>();
        tenantGuestRoles.add(UserRole.GUEST);
        tenantUser.setRoles(tenantGuestRoles);
        tenantUser.setTenantId("hotel-tenant-1");
        tenantUser.setPassword("hashedPassword");
    }

    @Test
    void testCreateSystemAdmin() {
        // Arrange
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(systemAdmin);

        // Act
        User result = systemWideUserService.createSystemAdmin(
            "admin@system.com", "password", "System", "Admin"
        );

        // Assert
        assertNotNull(result);
        assertEquals("admin@system.com", result.getEmail());
        assertTrue(result.getRoles().contains(UserRole.ADMIN));
        assertNull(result.getTenantId(), "System admin should not have tenantId");
        
        verify(userRepository).save(argThat(user -> 
            user.getEmail().equals("admin@system.com") &&
            user.getRoles().contains(UserRole.ADMIN) &&
            user.getTenantId() == null
        ));
    }

    @Test
    void testGetAllSystemWideUsers() {
        // Arrange
        List<User> systemUsers = Arrays.asList(systemAdmin, systemGuest);
        Page<User> page = new PageImpl<>(systemUsers);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(userRepository.findByTenantIdIsNull(pageable)).thenReturn(page);

        // Act
        Page<User> result = systemWideUserService.getAllSystemWideUsers(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertTrue(result.getContent().stream().allMatch(user -> user.getTenantId() == null));
        
        verify(userRepository).findByTenantIdIsNull(pageable);
    }

    @Test
    void testGetSystemWideUsersByRole() {
        // Arrange
        List<User> adminUsers = Arrays.asList(systemAdmin);
        when(userRepository.findSystemWideUsersByRole(UserRole.ADMIN)).thenReturn(adminUsers);

        // Act
        List<User> result = systemWideUserService.getSystemWideUsersByRole(UserRole.ADMIN);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getRoles().contains(UserRole.ADMIN));
        assertNull(result.get(0).getTenantId());
        
        verify(userRepository).findSystemWideUsersByRole(UserRole.ADMIN);
    }

    @Test
    void testGetAllGuestUsers() {
        // Arrange
        List<User> guestUsers = Arrays.asList(systemGuest);
        when(userRepository.findSystemWideUsersByRole(UserRole.GUEST)).thenReturn(guestUsers);

        // Act
        List<User> result = systemWideUserService.getAllGuestUsers();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getRoles().contains(UserRole.GUEST));
        assertNull(result.get(0).getTenantId());
        
        verify(userRepository).findSystemWideUsersByRole(UserRole.GUEST);
    }

    @Test
    void testGetAllAdminUsers() {
        // Arrange
        List<User> adminUsers = Arrays.asList(systemAdmin);
        when(userRepository.findSystemWideUsersByRole(UserRole.ADMIN)).thenReturn(adminUsers);

        // Act
        List<User> result = systemWideUserService.getAllAdminUsers();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getRoles().contains(UserRole.ADMIN));
        assertNull(result.get(0).getTenantId());
        
        verify(userRepository).findSystemWideUsersByRole(UserRole.ADMIN);
    }

    @Test
    void testFindSystemWideUserByEmail() {
        // Arrange
        when(userRepository.findByEmail("admin@system.com"))
            .thenReturn(Optional.of(systemAdmin));

        // Act
        Optional<User> result = systemWideUserService.findSystemWideUserByEmail("admin@system.com");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("admin@system.com", result.get().getEmail());
        assertNull(result.get().getTenantId());
        
        verify(userRepository).findByEmail("admin@system.com");
    }

    @Test
    void testFindSystemWideUserByEmail_NotFound() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@system.com"))
            .thenReturn(Optional.empty());

        // Act
        Optional<User> result = systemWideUserService.findSystemWideUserByEmail("nonexistent@system.com");

        // Assert
        assertFalse(result.isPresent());
        
        verify(userRepository).findByEmail("nonexistent@system.com");
    }

    @Test
    void testIsSystemWideUser_True() {
        // Arrange
        when(userRepository.findByEmail("admin@system.com"))
            .thenReturn(Optional.of(systemAdmin));

        // Act
        boolean result = systemWideUserService.isSystemWideUser("admin@system.com");

        // Assert
        assertTrue(result);
        
        verify(userRepository).findByEmail("admin@system.com");
    }

    @Test
    void testIsSystemWideUser_False() {
        // Arrange
        when(userRepository.findByEmail("user@hotel.com"))
            .thenReturn(Optional.of(tenantUser));

        // Act
        boolean result = systemWideUserService.isSystemWideUser("user@hotel.com");

        // Assert
        assertFalse(result);
        
        verify(userRepository).findByEmail("user@hotel.com");
    }

    @Test
    void testPromoteToSystemAdmin() {
        // Arrange
        User guestToPromote = new User();
        guestToPromote.setId(2L);
        Set<UserRole> guestRoles = new HashSet<>();
        guestRoles.add(UserRole.GUEST);
        guestToPromote.setRoles(guestRoles);
        guestToPromote.setTenantId(null);
        
        User promotedAdmin = new User();
        promotedAdmin.setId(2L);
        Set<UserRole> adminRoles = new HashSet<>();
        adminRoles.add(UserRole.ADMIN);
        promotedAdmin.setRoles(adminRoles);
        promotedAdmin.setTenantId(null);
        
        when(userRepository.findById(2L)).thenReturn(Optional.of(guestToPromote));
        when(userRepository.save(any(User.class))).thenReturn(promotedAdmin);

        // Act
        User result = systemWideUserService.promoteToSystemAdmin(2L);

        // Assert
        assertNotNull(result);
        assertTrue(result.getRoles().contains(UserRole.ADMIN));
        assertNull(result.getTenantId());
        
        verify(userRepository).findById(2L);
        verify(userRepository).save(argThat(user -> 
            user.getRoles().contains(UserRole.ADMIN) && 
            user.getTenantId() == null
        ));
    }

    @Test
    void testPromoteToSystemAdmin_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            systemWideUserService.promoteToSystemAdmin(999L);
        });
        
        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testPromoteToSystemAdmin_TenantBoundUser() {
        // Arrange
        when(userRepository.findById(3L)).thenReturn(Optional.of(tenantUser));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            systemWideUserService.promoteToSystemAdmin(3L);
        });
        
        verify(userRepository).findById(3L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testDemoteFromSystemAdmin() {
        // Arrange
        User adminToDemote = new User();
        adminToDemote.setId(1L);
        Set<UserRole> adminRoles = new HashSet<>();
        adminRoles.add(UserRole.ADMIN);
        adminToDemote.setRoles(adminRoles);
        adminToDemote.setTenantId(null);
        
        User demotedUser = new User();
        demotedUser.setId(1L);
        Set<UserRole> guestRoles = new HashSet<>();
        guestRoles.add(UserRole.GUEST);
        demotedUser.setRoles(guestRoles);
        demotedUser.setTenantId("hotel-tenant-1");
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminToDemote));
        when(userRepository.save(any(User.class))).thenReturn(demotedUser);

        // Act
        User result = systemWideUserService.demoteFromSystemAdmin(1L, "hotel-tenant-1");

        // Assert
        assertNotNull(result);
        assertTrue(result.getRoles().contains(UserRole.GUEST));
        assertEquals("hotel-tenant-1", result.getTenantId());
        
        verify(userRepository).findById(1L);
        verify(userRepository).save(argThat(user -> 
            user.getRoles().contains(UserRole.GUEST) && 
            "hotel-tenant-1".equals(user.getTenantId())
        ));
    }

    @Test
    void testDemoteFromSystemAdmin_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            systemWideUserService.demoteFromSystemAdmin(999L, "hotel-tenant-1");
        });
        
        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testDemoteFromSystemAdmin_NotSystemAdmin() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(systemGuest));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            systemWideUserService.demoteFromSystemAdmin(2L, "hotel-tenant-1");
        });
        
        verify(userRepository).findById(2L);
        verify(userRepository, never()).save(any(User.class));
    }
}
