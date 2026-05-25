package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.bookmyhotel.dto.ProcessMonitoringEventDto;
import com.bookmyhotel.entity.ProcessMonitoringEvent;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.enums.EventType;
import com.bookmyhotel.repository.ProcessMonitoringEventRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class RealTimeProcessMonitoringServiceTest {

    @Mock
    private ProcessMonitoringEventRepository processMonitoringEventRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private RealTimeProcessMonitoringService realTimeProcessMonitoringService;

    @Test
    void logEventShouldEnrichAndPersistEvent() {
        Reservation reservation = new Reservation();
        reservation.setId(11L);
        reservation.setConfirmationNumber("CONF-123");
        User guest = user(21L, "Guest", "User", "guest@example.com");
        reservation.setGuest(guest);
        Room room = new Room();
        room.setRoomNumber("402");
        reservation.setAssignedRoom(room);

        User staff = user(22L, "Staff", "Member", "staff@example.com");

        when(reservationRepository.findById(11L)).thenReturn(Optional.of(reservation));
        when(userRepository.findByEmail("staff@example.com")).thenReturn(Optional.of(staff));
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.5, 10.0.0.1");
        when(request.getHeader("User-Agent")).thenReturn("JUnit");
        when(processMonitoringEventRepository.save(any(ProcessMonitoringEvent.class))).thenAnswer(invocation -> {
            ProcessMonitoringEvent event = invocation.getArgument(0);
            event.setId(99L);
            return event;
        });

        ProcessMonitoringEventDto dto = realTimeProcessMonitoringService.logEvent(
                EventType.CHECK_IN,
                1L,
                11L,
                "staff@example.com",
                request,
                "Checked in successfully");

        assertEquals(99L, dto.getId());
        assertEquals(EventType.CHECK_IN, dto.getEventType());
        assertEquals(11L, dto.getReservationId());
        assertEquals("CONF-123", dto.getConfirmationNumber());
        assertEquals("Guest User", dto.getGuestName());
        assertEquals("guest@example.com", dto.getGuestEmail());
        assertEquals("402", dto.getRoomNumber());
        assertEquals(22L, dto.getStaffId());
        assertEquals("Staff Member", dto.getStaffName());
        assertEquals("203.0.113.5", dto.getIpAddress());
        assertEquals("JUnit", dto.getUserAgent());
        assertFalse(dto.isException());

        ArgumentCaptor<ProcessMonitoringEvent> captor = ArgumentCaptor.forClass(ProcessMonitoringEvent.class);
        verify(processMonitoringEventRepository).save(captor.capture());
        assertEquals("Checked in successfully", captor.getValue().getEventDetails());
    }

    @Test
    void logEventShouldMarkExceptionEvents() {
        when(processMonitoringEventRepository.save(any(ProcessMonitoringEvent.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProcessMonitoringEventDto dto = realTimeProcessMonitoringService.logEvent(
                EventType.SYSTEM_ERROR,
                1L,
                null,
                null,
                null,
                "boom");

        assertTrue(dto.isException());
        assertEquals("SYSTEM_ERROR: boom", dto.getExceptionMessage());
    }

    @Test
    void logEventShouldWrapPersistenceFailures() {
        when(processMonitoringEventRepository.save(any(ProcessMonitoringEvent.class)))
                .thenThrow(new RuntimeException("db error"));

        RuntimeException exception = org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class,
                () -> realTimeProcessMonitoringService.logEvent(EventType.CHECK_IN, 1L, null, null, null, "x"));

        assertEquals("Failed to log process monitoring event", exception.getMessage());
    }

    @Test
    void getLiveMonitoringDataShouldReturnCountsAndTimestamp() {
        when(processMonitoringEventRepository.countByHotelIdAndTimestampBetween(eq(5L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(17L);

        Map<String, Object> result = realTimeProcessMonitoringService.getLiveMonitoringData(5L);

        assertEquals(17L, result.get("totalEventsToday"));
        assertNotNull(result.get("lastUpdated"));
    }

    @Test
    void getLiveMonitoringDataShouldReturnErrorMapOnFailure() {
        when(processMonitoringEventRepository.countByHotelIdAndTimestampBetween(eq(5L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenThrow(new RuntimeException("db error"));

        Map<String, Object> result = realTimeProcessMonitoringService.getLiveMonitoringData(5L);

        assertEquals("Failed to get live monitoring data", result.get("error"));
    }

    @Test
    void getCurrentStaffActivityShouldGroupRecentEventsByStaff() {
        ProcessMonitoringEvent first = event(1L, EventType.STAFF_ACTION, false);
        first.setStaffUserId(10L);
        first.setStaffName("Alice");
        first.setEventTime(LocalDateTime.now().minusMinutes(5));

        ProcessMonitoringEvent second = event(2L, EventType.BOOKING_CREATED, false);
        second.setStaffUserId(10L);
        second.setStaffName("Alice");
        second.setEventTime(LocalDateTime.now().minusMinutes(1));

        ProcessMonitoringEvent third = event(3L, EventType.STAFF_LOGIN, false);
        third.setStaffUserId(20L);
        third.setStaffName("Bob");
        third.setEventTime(LocalDateTime.now().minusMinutes(2));

        when(processMonitoringEventRepository.findByHotelIdAndTimestampAfterOrderByTimestampDesc(eq(8L), any(LocalDateTime.class)))
                .thenReturn(List.of(first, second, third));

        List<Map<String, Object>> result = realTimeProcessMonitoringService.getCurrentStaffActivity(8L);

        assertEquals(2, result.size());
        Map<String, Object> alice = result.stream().filter(entry -> entry.get("staffId").equals(10L)).findFirst().orElseThrow();
        assertEquals(2, alice.get("eventCount"));
        assertEquals("Alice", alice.get("staffName"));
    }

    @Test
    void getExceptionAlertsShouldMapDtos() {
        ProcessMonitoringEvent exception = event(15L, EventType.SYSTEM_ERROR, true);
        exception.setReservationId(51L);
        exception.setExceptionReason("SYSTEM_ERROR: broken");
        when(processMonitoringEventRepository.findByHotelIdAndIsExceptionTrueAndTimestampAfterOrderByTimestampDesc(eq(3L), any(LocalDateTime.class)))
                .thenReturn(List.of(exception));

        List<ProcessMonitoringEventDto> result = realTimeProcessMonitoringService.getExceptionAlerts(3L);

        assertEquals(1, result.size());
        assertTrue(result.get(0).isException());
        assertEquals("SYSTEM_ERROR: broken", result.get(0).getExceptionMessage());
    }

    @Test
    void detectPatternsShouldReportExceptionCountAndThreshold() {
        when(processMonitoringEventRepository.countByHotelIdAndIsExceptionTrueAndTimestampAfter(eq(6L), any(LocalDateTime.class)))
                .thenReturn(7L);

        Map<String, Object> result = realTimeProcessMonitoringService.detectPatterns(6L, 12);

        assertEquals(7L, result.get("exceptionCount"));
        assertEquals(true, result.get("hasPatterns"));
        assertEquals("12 hours", result.get("period"));
    }

    @Test
    void getMonitoringEventsShouldRouteByExceptionsEventTypeOrAll() {
        Pageable pageable = PageRequest.of(0, 10);
        ProcessMonitoringEvent exception = event(1L, EventType.SYSTEM_ERROR, true);
        ProcessMonitoringEvent booking = event(2L, EventType.BOOKING_CREATED, false);
        when(processMonitoringEventRepository.findByHotelIdAndIsExceptionTrueOrderByTimestampDesc(1L, pageable))
                .thenReturn(new PageImpl<>(List.of(exception), pageable, 1));
        when(processMonitoringEventRepository.findByHotelIdAndEventTypeOrderByTimestampDesc(1L, EventType.BOOKING_CREATED, pageable))
                .thenReturn(new PageImpl<>(List.of(booking), pageable, 1));
        when(processMonitoringEventRepository.findByHotelIdOrderByTimestampDesc(1L, pageable))
                .thenReturn(new PageImpl<>(List.of(booking, exception), pageable, 2));

        Page<ProcessMonitoringEventDto> exceptionsOnly = realTimeProcessMonitoringService.getMonitoringEvents(1L, null, true, null, null, pageable);
        Page<ProcessMonitoringEventDto> eventTypeOnly = realTimeProcessMonitoringService.getMonitoringEvents(1L, "BOOKING_CREATED", false, null, null, pageable);
        Page<ProcessMonitoringEventDto> all = realTimeProcessMonitoringService.getMonitoringEvents(1L, null, false, null, null, pageable);

        assertEquals(1, exceptionsOnly.getTotalElements());
        assertTrue(exceptionsOnly.getContent().get(0).isException());
        assertEquals(EventType.BOOKING_CREATED, eventTypeOnly.getContent().get(0).getEventType());
        assertEquals(2, all.getTotalElements());
    }

    @Test
    void getMonitoringEventsShouldReturnEmptyPageOnInvalidEventType() {
        Page<ProcessMonitoringEventDto> result = realTimeProcessMonitoringService.getMonitoringEvents(
                1L,
                "NOT_A_REAL_EVENT",
                false,
                null,
                null,
                PageRequest.of(0, 10));

        assertTrue(result.isEmpty());
    }

    @Test
    void getStaffPerformanceSummaryShouldComputeExceptionRate() {
        when(processMonitoringEventRepository.countByHotelIdAndStaffIdAndTimestampAfter(eq(9L), eq(33L), any(LocalDateTime.class)))
                .thenReturn(8L);
        when(processMonitoringEventRepository.countByHotelIdAndStaffIdAndIsExceptionTrueAndTimestampAfter(eq(9L), eq(33L), any(LocalDateTime.class)))
                .thenReturn(2L);

        Map<String, Object> result = realTimeProcessMonitoringService.getStaffPerformanceSummary(9L, 33L, 7);

        assertEquals(8L, result.get("totalEvents"));
        assertEquals(2L, result.get("exceptions"));
        assertEquals(0.25d, result.get("exceptionRate"));
        assertEquals("7 days", result.get("period"));
    }

    @Test
    void getSystemHealthStatusShouldReturnHealthBuckets() {
        when(processMonitoringEventRepository.countByHotelIdAndTimestampBetween(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(100L);
        when(processMonitoringEventRepository.countByHotelIdAndIsExceptionTrueAndTimestampBetween(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(3L);

        Map<String, Object> healthy = realTimeProcessMonitoringService.getSystemHealthStatus(2L);

        assertEquals("HEALTHY", healthy.get("status"));
        assertEquals(0.03d, healthy.get("exceptionRate"));
    }

    @Test
    void getSystemHealthStatusShouldReturnErrorMapOnFailure() {
        when(processMonitoringEventRepository.countByHotelIdAndTimestampBetween(eq(2L), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenThrow(new RuntimeException("db error"));

        Map<String, Object> result = realTimeProcessMonitoringService.getSystemHealthStatus(2L);

        assertEquals("ERROR", result.get("status"));
        assertEquals("Failed to get system health status", result.get("error"));
    }

    private User user(Long id, String firstName, String lastName, String email) {
        User user = new User();
        user.setId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        return user;
    }

    private ProcessMonitoringEvent event(Long id, EventType type, boolean exception) {
        ProcessMonitoringEvent event = new ProcessMonitoringEvent();
        event.setId(id);
        event.setEventType(type);
        event.setEventTime(LocalDateTime.now().minusMinutes(1));
        event.setEventDetails(type.name());
        event.setException(exception);
        return event;
    }
}