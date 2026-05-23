package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.bookmyhotel.dto.ScheduleStatusUpdateRequest;
import com.bookmyhotel.dto.StaffScheduleRequest;
import com.bookmyhotel.dto.StaffScheduleResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.StaffSchedule;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.StaffScheduleRepository;
import com.bookmyhotel.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class StaffScheduleServiceTest {

    @Mock
    private StaffScheduleRepository staffScheduleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HotelRepository hotelRepository;

    @InjectMocks
    private StaffScheduleService staffScheduleService;

    @Test
    void createScheduleShouldSaveScheduleAndReturnMappedResponse() {
        Hotel hotel = hotel(1L, "Grand Plaza");
        User admin = user(10L, "Admin", "User", "admin@example.com", hotel);
        User staff = user(11L, "Staff", "Member", "staff@example.com", hotel);
        StaffScheduleRequest request = request(11L, 1L, LocalDate.now().plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(userRepository.findById(11L)).thenReturn(Optional.of(staff));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(staffScheduleRepository.findConflictingSchedules(11L, request.getScheduleDate(), request.getStartTime(), request.getEndTime(), -1L))
                .thenReturn(List.of());
        when(staffScheduleRepository.save(any(StaffSchedule.class))).thenAnswer(invocation -> {
            StaffSchedule schedule = invocation.getArgument(0);
            schedule.setId(100L);
            return schedule;
        });

        StaffScheduleResponse response = staffScheduleService.createSchedule(request, "admin@example.com");

        assertEquals(100L, response.getId());
        assertEquals(11L, response.getStaffId());
        assertEquals("Staff Member", response.getStaffName());
        assertEquals("Grand Plaza", response.getHotelName());
        assertEquals(StaffSchedule.ScheduleStatus.SCHEDULED, response.getStatus());
        assertEquals("Admin User", response.getCreatedByName());
        assertNotNull(response.getCreatedAt());
        assertNotNull(response.getUpdatedAt());
    }

    @Test
    void createScheduleShouldRejectPastDate() {
        StaffScheduleRequest request = request(11L, 1L, LocalDate.now().minusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> staffScheduleService.createSchedule(request, "admin@example.com"));

        assertEquals("Cannot schedule in the past", exception.getMessage());
    }

    @Test
    void createScheduleShouldRejectConflictingSchedule() {
        Hotel hotel = hotel(1L, "Grand Plaza");
        User admin = user(10L, "Admin", "User", "admin@example.com", hotel);
        User staff = user(11L, "Staff", "Member", "staff@example.com", hotel);
        StaffScheduleRequest request = request(11L, 1L, LocalDate.now().plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(userRepository.findById(11L)).thenReturn(Optional.of(staff));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(staffScheduleRepository.findConflictingSchedules(11L, request.getScheduleDate(), request.getStartTime(), request.getEndTime(), -1L))
                .thenReturn(List.of(schedule(50L, staff, hotel, request.getScheduleDate(), request.getStartTime(), request.getEndTime())));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> staffScheduleService.createSchedule(request, "admin@example.com"));

        assertEquals("Schedule conflicts with existing schedule", exception.getMessage());
    }

    @Test
    void updateScheduleStatusShouldUpdateStatusAndIgnoreBlankNotes() {
        Hotel hotel = hotel(1L, "Grand Plaza");
        User admin = user(10L, "Admin", "User", "admin@example.com", hotel);
        User staff = user(11L, "Staff", "Member", "staff@example.com", hotel);
        StaffSchedule schedule = schedule(60L, staff, hotel, LocalDate.now().plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));
        schedule.setCreatedBy(admin);
        schedule.setNotes("Original notes");
        when(staffScheduleRepository.findById(60L)).thenReturn(Optional.of(schedule));
        when(staffScheduleRepository.save(schedule)).thenReturn(schedule);

        StaffScheduleResponse response = staffScheduleService.updateScheduleStatus(
                60L,
                new ScheduleStatusUpdateRequest(StaffSchedule.ScheduleStatus.CONFIRMED, "   "));

        assertEquals(StaffSchedule.ScheduleStatus.CONFIRMED, response.getStatus());
        assertEquals("Original notes", response.getNotes());
        verify(staffScheduleRepository).save(schedule);
    }

    @Test
    void updateScheduleShouldAllowEditingHistoricalScheduleWhenDateIsUnchanged() {
        Hotel hotel = hotel(1L, "Grand Plaza");
        User admin = user(10L, "Admin", "User", "admin@example.com", hotel);
        User staff = user(11L, "Staff", "Member", "staff@example.com", hotel);
        LocalDate pastDate = LocalDate.now().minusDays(2);

        StaffSchedule existing = schedule(476L, staff, hotel, pastDate, LocalTime.of(8, 0), LocalTime.of(16, 0));
        StaffScheduleRequest request = request(11L, 1L, pastDate, LocalTime.of(9, 0), LocalTime.of(17, 0));
        request.setNotes("Adjusted after shift swap");

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(staffScheduleRepository.findById(476L)).thenReturn(Optional.of(existing));
        when(userRepository.findById(11L)).thenReturn(Optional.of(staff));
        when(hotelRepository.findById(1L)).thenReturn(Optional.of(hotel));
        when(staffScheduleRepository.findConflictingSchedules(11L, pastDate, LocalTime.of(9, 0), LocalTime.of(17, 0), 476L))
                .thenReturn(List.of());
        when(staffScheduleRepository.save(existing)).thenReturn(existing);

        StaffScheduleResponse response = staffScheduleService.updateSchedule(476L, request, "admin@example.com");

        assertEquals(476L, response.getId());
        assertEquals(LocalTime.of(9, 0), response.getStartTime());
        assertEquals(LocalTime.of(17, 0), response.getEndTime());
        assertEquals("Adjusted after shift swap", response.getNotes());
        verify(staffScheduleRepository).findConflictingSchedules(11L, pastDate, LocalTime.of(9, 0), LocalTime.of(17, 0), 476L);
        verify(staffScheduleRepository).save(existing);
    }

    @Test
    void updateScheduleShouldRejectMovingScheduleToDifferentPastDate() {
        Hotel hotel = hotel(1L, "Grand Plaza");
        User admin = user(10L, "Admin", "User", "admin@example.com", hotel);
        User staff = user(11L, "Staff", "Member", "staff@example.com", hotel);
        StaffSchedule existing = schedule(477L, staff, hotel, LocalDate.now().plusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));
        StaffScheduleRequest request = request(11L, 1L, LocalDate.now().minusDays(1), LocalTime.of(8, 0), LocalTime.of(16, 0));

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(staffScheduleRepository.findById(477L)).thenReturn(Optional.of(existing));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> staffScheduleService.updateSchedule(477L, request, "admin@example.com"));

        assertEquals("Cannot schedule in the past", exception.getMessage());
    }

    @Test
    void getSchedulesWithFiltersShouldDefaultToAdminHotelAndApplyFilters() {
        Hotel hotel = hotel(1L, "Grand Plaza");
        User admin = user(10L, "Admin", "User", "admin@example.com", hotel);
        User firstStaff = user(11L, "Front", "Desk", "frontdesk@example.com", hotel);
        User secondStaff = user(12L, "House", "Keeper", "hk@example.com", hotel);
        LocalDate targetDate = LocalDate.now().plusDays(2);

        StaffSchedule matching = schedule(70L, firstStaff, hotel, targetDate, LocalTime.of(7, 0), LocalTime.of(15, 0));
        matching.setDepartment(StaffSchedule.Department.FRONTDESK);
        matching.setStatus(StaffSchedule.ScheduleStatus.CONFIRMED);

        StaffSchedule differentDepartment = schedule(71L, secondStaff, hotel, targetDate, LocalTime.of(8, 0), LocalTime.of(16, 0));
        differentDepartment.setDepartment(StaffSchedule.Department.HOUSEKEEPING);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(admin));
        when(staffScheduleRepository.findByHotelIdOrderByScheduleDateDescStartTimeAsc(1L))
                .thenReturn(List.of(matching, differentDepartment));

        List<StaffScheduleResponse> responses = staffScheduleService.getSchedulesWithFilters(
                null,
                StaffSchedule.Department.FRONTDESK,
                targetDate,
                StaffSchedule.ScheduleStatus.CONFIRMED.name(),
                "admin@example.com");

        assertEquals(1, responses.size());
        assertEquals(70L, responses.getFirst().getId());
        assertEquals("Front Desk", responses.getFirst().getStaffName());
        assertEquals(1L, responses.getFirst().getHotelId());
    }

    @Test
    void getScheduleByIdShouldThrowWhenMissing() {
        when(staffScheduleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> staffScheduleService.getScheduleById(999L));
    }

    private StaffScheduleRequest request(Long staffId, Long hotelId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        StaffScheduleRequest request = new StaffScheduleRequest();
        request.setStaffId(staffId);
        request.setHotelId(hotelId);
        request.setScheduleDate(date);
        request.setStartTime(startTime);
        request.setEndTime(endTime);
        request.setShiftType(StaffSchedule.ShiftType.MORNING);
        request.setDepartment(StaffSchedule.Department.FRONTDESK);
        request.setNotes("Regular shift");
        return request;
    }

    private StaffSchedule schedule(Long id, User staff, Hotel hotel, LocalDate date, LocalTime startTime, LocalTime endTime) {
        StaffSchedule schedule = new StaffSchedule();
        schedule.setId(id);
        schedule.setStaff(staff);
        schedule.setHotel(hotel);
        schedule.setScheduleDate(date);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setShiftType(StaffSchedule.ShiftType.MORNING);
        schedule.setDepartment(StaffSchedule.Department.FRONTDESK);
        schedule.setStatus(StaffSchedule.ScheduleStatus.SCHEDULED);
        schedule.setCreatedAt(LocalDateTime.now().minusHours(2));
        schedule.setUpdatedAt(LocalDateTime.now().minusHours(1));
        schedule.setCreatedBy(staff);
        return schedule;
    }

    private User user(Long id, String firstName, String lastName, String email, Hotel hotel) {
        User user = new User();
        user.setId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setHotel(hotel);
        return user;
    }

    private Hotel hotel(Long id, String name) {
        Hotel hotel = new Hotel();
        hotel.setId(id);
        hotel.setName(name);
        return hotel;
    }
}