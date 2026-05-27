package com.bookmyhotel.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.service.EmailService;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProductionSuperAdminBootstrap dataInitializer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dataInitializer, "superAdminBootstrapEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "superAdminEmail", "samuelweld2018@gmail.com");
        ReflectionTestUtils.setField(dataInitializer, "superAdminFirstName", "Samuel");
        ReflectionTestUtils.setField(dataInitializer, "superAdminLastName", "Weld");
    }

    @Test
    void runShouldCreateSuperAdminAndSendCredentialsWhenMissing() throws Exception {
        when(userRepository.findByEmail("samuelweld2018@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(String.class))).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(99L);
            return user;
        });

        dataInitializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("samuelweld2018@gmail.com", savedUser.getEmail());
        assertEquals("Samuel", savedUser.getFirstName());
        assertEquals("Weld", savedUser.getLastName());
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals(Set.of(UserRole.SUPER_ADMIN), savedUser.getRoles());
        assertTrue(savedUser.getIsActive());
        assertNull(savedUser.getHotel());

        verify(emailService).sendSuperAdminBootstrapEmail(
                org.mockito.ArgumentMatchers.eq("samuelweld2018@gmail.com"),
                org.mockito.ArgumentMatchers.eq("Samuel"),
                any(String.class));
    }

    @Test
    void runShouldSkipCreationWhenSuperAdminAlreadyExists() throws Exception {
        User existingUser = new User();
        existingUser.setEmail("samuelweld2018@gmail.com");

        when(userRepository.findByEmail("samuelweld2018@gmail.com")).thenReturn(Optional.of(existingUser));

        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendSuperAdminBootstrapEmail(any(String.class), any(String.class),
                any(String.class));
    }

    @Test
    void runShouldKeepUserCreationSuccessfulWhenEmailDeliveryFails() throws Exception {
        when(userRepository.findByEmail("samuelweld2018@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any(String.class))).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doThrow(new IllegalStateException("Email service unavailable"))
                .when(emailService)
                .sendSuperAdminBootstrapEmail(org.mockito.ArgumentMatchers.eq("samuelweld2018@gmail.com"),
                        org.mockito.ArgumentMatchers.eq("Samuel"), any(String.class));

        dataInitializer.run();

        verify(userRepository).save(any(User.class));
    }
}