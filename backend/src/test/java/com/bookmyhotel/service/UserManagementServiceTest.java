package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bookmyhotel.dto.admin.CreateUserRequest;
import com.bookmyhotel.dto.admin.UpdateUserRequest;
import com.bookmyhotel.dto.admin.UserManagementResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Tenant;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserManagementService userManagementService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createUserShouldRejectGlobalRoleAssignedToHotel() {
        setCaller(userWithRoles(900L, Set.of(UserRole.SUPER_ADMIN), true));
        CreateUserRequest request = createRequest(Set.of(UserRole.ADMIN));
        request.setHotelId(101L);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userManagementService.createUser(request));

        assertTrue(exception.getMessage().contains("Global roles"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUserShouldRequireHotelForHotelScopedRoles() {
        setCaller(userWithRoles(901L, Set.of(UserRole.ADMIN), true));
        CreateUserRequest request = createRequest(Set.of(UserRole.HOTEL_ADMIN));
        request.setHotelId(null);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userManagementService.createUser(request));

        assertTrue(exception.getMessage().contains("Hotel assignment is required"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createUserShouldAssignHotelScopedUserToHotelAndDeriveTenantId() {
        setCaller(userWithRoles(902L, Set.of(UserRole.ADMIN), true));
        Hotel hotel = hotel(101L, "tenant-1");
        CreateUserRequest request = createRequest(Set.of(UserRole.HOTEL_ADMIN));
        request.setHotelId(101L);
        request.setTenantId(null);

        when(userRepository.findByEmail("new.user@example.com")).thenReturn(Optional.empty());
        when(hotelRepository.findById(101L)).thenReturn(Optional.of(hotel));
        when(passwordEncoder.encode("Secret123!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(77L);
            return saved;
        });

        UserManagementResponse response = userManagementService.createUser(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals(hotel, savedUser.getHotel());
        assertEquals(Set.of(UserRole.HOTEL_ADMIN), savedUser.getRoles());
        assertTrue(savedUser.getIsActive());
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals("tenant-1", request.getTenantId());
        assertEquals(77L, response.getId());
        assertEquals("tenant-1", response.getTenantId());
    }

    @Test
    void getUsersByRoleShouldHideSuperAdminsFromAdminCallers() {
        setCaller(userWithRoles(903L, Set.of(UserRole.ADMIN), true));

        List<UserManagementResponse> result = userManagementService.getUsersByRole(UserRole.SUPER_ADMIN);

        assertTrue(result.isEmpty());
        verify(userRepository, never()).findByRolesContaining(UserRole.SUPER_ADMIN);
    }

    @Test
    void getUserByIdShouldDenyAdminAccessToSuperAdminTarget() {
        setCaller(userWithRoles(904L, Set.of(UserRole.ADMIN), true));
        User superAdmin = userWithRoles(1L, Set.of(UserRole.SUPER_ADMIN), true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(superAdmin));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> userManagementService.getUserById(1L));

        assertTrue(exception.getMessage().contains("ADMIN cannot access or manage a SUPER_ADMIN user"));
    }

    @Test
    void updateUserShouldRejectEditingSuperAdmin() {
        setCaller(userWithRoles(905L, Set.of(UserRole.SUPER_ADMIN), true));
        User superAdmin = userWithRoles(1L, Set.of(UserRole.SUPER_ADMIN), true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(superAdmin));

        UpdateUserRequest request = new UpdateUserRequest();
        request.setEmail("updated@example.com");
        request.setFirstName("Updated");
        request.setLastName("Admin");
        request.setPhone("+251900000001");
        request.setIsActive(true);
        request.setRoles(Set.of(UserRole.SUPER_ADMIN));

        AccessDeniedException exception = assertThrows(AccessDeniedException.class,
                () -> userManagementService.updateUser(1L, request));

        assertTrue(exception.getMessage().contains("SUPER_ADMIN users cannot be edited"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void toggleUserStatusShouldFlipActiveFlagForManageableUser() {
        setCaller(userWithRoles(906L, Set.of(UserRole.SUPER_ADMIN), true));
        User hotelAdmin = userWithRoles(5L, Set.of(UserRole.HOTEL_ADMIN), true);
        when(userRepository.findById(5L)).thenReturn(Optional.of(hotelAdmin));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserManagementResponse response = userManagementService.toggleUserStatus(5L, "policy violation");

        assertFalse(hotelAdmin.getIsActive());
        assertFalse(response.getIsActive());
        verify(userRepository).save(hotelAdmin);
    }

    private CreateUserRequest createRequest(Set<UserRole> roles) {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("new.user@example.com");
        request.setFirstName("New");
        request.setLastName("User");
        request.setPhone("+251900000000");
        request.setPassword("Secret123!");
        request.setRoles(roles);
        return request;
    }

    private void setCaller(User caller) {
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                caller,
                caller.getPassword(),
                caller.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private User userWithRoles(Long id, Set<UserRole> roles, boolean isActive) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@example.com");
        user.setPassword("encoded-password");
        user.setFirstName("User");
        user.setLastName(String.valueOf(id));
        user.setPhone("+251900000000");
        user.setRoles(roles);
        user.setIsActive(isActive);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }

    private Hotel hotel(Long id, String tenantId) {
        Tenant tenant = new Tenant(tenantId, "Tenant " + tenantId);
        tenant.setCreatedAt(LocalDateTime.now());
        tenant.setUpdatedAt(LocalDateTime.now());

        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Grand Plaza");
        hotel.setAddress("Downtown avenue");
        hotel.setCity("Addis Ababa");
        hotel.setCountry("Ethiopia");
        hotel.setTenant(tenant);
        hotel.setIsActive(true);
        hotel.setCreatedAt(LocalDateTime.now());
        hotel.setUpdatedAt(LocalDateTime.now());
        return hotel;
    }
}