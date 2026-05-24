package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.audit.AuditTaxonomy;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HousekeepingTask;
import com.bookmyhotel.entity.HousekeepingTaskStatus;
import com.bookmyhotel.entity.HousekeepingTaskType;
import com.bookmyhotel.entity.TaskPriority;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.HousekeepingStaffRepository;
import com.bookmyhotel.repository.HousekeepingTaskRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class HousekeepingServiceTest {

    @Mock
    private HousekeepingTaskRepository housekeepingTaskRepository;

    @Mock
    private HousekeepingStaffRepository housekeepingStaffRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelRepository hotelRepository;

    @Mock
    private HotelActivityAuditService hotelActivityAuditService;

    @InjectMocks
    private HousekeepingService housekeepingService;

    @Test
    void createTaskEnhancedShouldAssignQualifiedStaffAndOverrideEstimatedDuration() {
        Hotel hotel = hotel(1L);
        User staff = housekeepingUser(10L, hotel);
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(userRepository.findById(10L)).thenReturn(Optional.of(staff));
        when(housekeepingTaskRepository.save(any(HousekeepingTask.class))).thenAnswer(invocation -> {
            HousekeepingTask task = invocation.getArgument(0);
            task.setId(100L);
            return task;
        });

        HousekeepingTask saved = housekeepingService.createTaskEnhanced(
                1L,
                " 201 ",
                "VIP turnaround",
                HousekeepingTaskType.CHECKOUT_CLEANING,
                TaskPriority.HIGH,
                "Deep clean before arrival",
                "Use hypoallergenic supplies",
                75,
                10L);

        assertEquals("201", saved.getRoomNumber());
        assertEquals(HousekeepingTaskStatus.ASSIGNED, saved.getStatus());
        assertEquals(staff, saved.getAssignedUser());
        assertNotNull(saved.getAssignedAt());
        assertEquals(75, saved.getEstimatedDurationMinutes());
        verify(hotelActivityAuditService).logActivity(
            eq(hotel),
            eq(AuditTaxonomy.EntityType.HOUSEKEEPING_TASK),
            eq(100L),
            eq(AuditTaxonomy.Action.CREATE),
            eq(null),
                any(Map.class),
            any(),
                any(String.class),
                any(Boolean.class),
                any());
    }

    @Test
    void createTaskEnhancedShouldLeaveTaskPendingWhenAssignedUserIsIneligible() {
        Hotel hotel = hotel(1L);
        Hotel otherHotel = hotel(2L);
        User otherHotelStaff = housekeepingUser(11L, otherHotel);
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(userRepository.findById(11L)).thenReturn(Optional.of(otherHotelStaff));
        when(housekeepingTaskRepository.save(any(HousekeepingTask.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HousekeepingTask saved = housekeepingService.createTaskEnhanced(
                1L,
                null,
                "Lobby refresh",
                HousekeepingTaskType.PUBLIC_AREA_CLEANING,
                TaskPriority.NORMAL,
                "Refresh lobby seating area",
                null,
                null,
                11L);

        assertEquals(HousekeepingTaskStatus.PENDING, saved.getStatus());
        assertNull(saved.getAssignedUser());
        assertNull(saved.getAssignedAt());
    }

    @Test
    void assignTaskShouldRejectNonHousekeepingUser() {
        Hotel hotel = hotel(1L);
        HousekeepingTask task = task(20L, hotel, HousekeepingTaskStatus.PENDING);
        User frontDeskUser = user(30L, hotel, Set.of(UserRole.FRONTDESK));
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(20L, 1L)).thenReturn(Optional.of(task));
        when(userRepository.findById(30L)).thenReturn(Optional.of(frontDeskUser));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> housekeepingService.assignTask(1L, 20L, 30L));

        assertEquals("User is not a housekeeping staff member", exception.getMessage());
    }

    @Test
    void assignTaskShouldRejectTaskFromDifferentHotel() {
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(21L, 1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> housekeepingService.assignTask(1L, 21L, 31L));

        assertEquals("Task not found for this hotel", exception.getMessage());
    }

    @Test
    void startTaskShouldRequireAssignedUser() {
        Hotel hotel = hotel(1L);
        HousekeepingTask task = task(22L, hotel, HousekeepingTaskStatus.ASSIGNED);
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(22L, 1L)).thenReturn(Optional.of(task));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> housekeepingService.startTask(1L, 22L));

        assertEquals("Task must be assigned to a user before starting", exception.getMessage());
    }

    @Test
    void startTaskShouldMoveAssignedTaskToInProgress() {
        Hotel hotel = hotel(1L);
        User staff = housekeepingUser(32L, hotel);
        HousekeepingTask task = task(23L, hotel, HousekeepingTaskStatus.ASSIGNED);
        task.setAssignedUser(staff);
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(23L, 1L)).thenReturn(Optional.of(task));
        when(housekeepingTaskRepository.save(task)).thenReturn(task);

        HousekeepingTask saved = housekeepingService.startTask(1L, 23L);

        assertEquals(HousekeepingTaskStatus.IN_PROGRESS, saved.getStatus());
        assertNotNull(saved.getStartedAt());
        verify(hotelActivityAuditService).logActivity(
            eq(hotel),
            eq(AuditTaxonomy.EntityType.HOUSEKEEPING_TASK),
            eq(23L),
            eq(AuditTaxonomy.Action.START),
                any(Map.class),
                any(Map.class),
            any(),
                any(String.class),
                any(Boolean.class),
                any());
        verify(housekeepingTaskRepository, never()).findById(23L);
    }

    @Test
    void completeTaskShouldSetCompletionFieldsAndDuration() {
        Hotel hotel = hotel(1L);
        HousekeepingTask task = task(24L, hotel, HousekeepingTaskStatus.IN_PROGRESS);
        task.setStartedAt(LocalDateTime.now().minusMinutes(47));
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(24L, 1L)).thenReturn(Optional.of(task));
        when(housekeepingTaskRepository.save(task)).thenReturn(task);

        HousekeepingTask saved = housekeepingService.completeTask(1L, 24L, "Looks good", 5);

        assertEquals(HousekeepingTaskStatus.COMPLETED, saved.getStatus());
        assertEquals("Looks good", saved.getInspectorNotes());
        assertEquals(5, saved.getQualityScore());
        assertNotNull(saved.getCompletedAt());
        assertNotNull(saved.getActualDurationMinutes());
        assertEquals(47, saved.getActualDurationMinutes());
    }

    @Test
    void completeTaskShouldRejectNonInProgressTask() {
        Hotel hotel = hotel(1L);
        HousekeepingTask task = task(25L, hotel, HousekeepingTaskStatus.ASSIGNED);
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(25L, 1L)).thenReturn(Optional.of(task));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> housekeepingService.completeTask(1L, 25L, "done", 4));

        assertEquals("Task can only be completed from IN_PROGRESS status", exception.getMessage());
    }

    @Test
    void updateTaskStatusShouldUseHotelScopedLookupAndMoveTaskToInProgress() {
        Hotel hotel = hotel(1L);
        User staff = housekeepingUser(33L, hotel);
        HousekeepingTask task = task(26L, hotel, HousekeepingTaskStatus.ASSIGNED);
        task.setAssignedUser(staff);
        when(housekeepingTaskRepository.findByIdAndHotelIdWithUserAndHotel(26L, 1L)).thenReturn(Optional.of(task));
        when(housekeepingTaskRepository.save(task)).thenReturn(task);

        HousekeepingTask saved = housekeepingService.updateTaskStatus(1L, 26L, "IN_PROGRESS", "Starting now");

        assertEquals(HousekeepingTaskStatus.IN_PROGRESS, saved.getStatus());
        assertNotNull(saved.getStartedAt());
        assertEquals("Starting now", saved.getInspectorNotes());
        verify(housekeepingTaskRepository).findByIdAndHotelIdWithUserAndHotel(26L, 1L);
        verify(housekeepingTaskRepository, never()).findById(26L);
    }

    private HousekeepingTask task(Long id, Hotel hotel, HousekeepingTaskStatus status) {
        HousekeepingTask task = new HousekeepingTask();
        task.setId(id);
        task.setHotel(hotel);
        task.setTitle("Task " + id);
        task.setRoomNumber("101");
        task.setTaskType(HousekeepingTaskType.ROOM_CLEANING);
        task.setPriority(TaskPriority.NORMAL);
        task.setStatus(status);
        task.setCreatedAt(LocalDateTime.now().minusHours(1));
        return task;
    }

    private User housekeepingUser(Long id, Hotel hotel) {
        return user(id, hotel, Set.of(UserRole.HOUSEKEEPING));
    }

    private User user(Long id, Hotel hotel, Set<UserRole> roles) {
        User user = new User();
        user.setId(id);
        user.setHotel(hotel);
        user.setRoles(roles);
        user.setEmail("user" + id + "@example.com");
        user.setFirstName("User");
        user.setLastName(String.valueOf(id));
        return user;
    }

    private Hotel hotel(Long id) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName("Hotel " + id);
        return hotel;
    }
}