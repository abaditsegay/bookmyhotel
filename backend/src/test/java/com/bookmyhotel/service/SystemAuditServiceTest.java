package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
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

import com.bookmyhotel.dto.SystemAuditLogDto;
import com.bookmyhotel.entity.SystemAuditLog;
import com.bookmyhotel.repository.SystemAuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class SystemAuditServiceTest {

    @Mock
    private SystemAuditLogRepository repository;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private SystemAuditService systemAuditService;

    @Test
    void logShouldPersistAuditEntry() {
        systemAuditService.log(
                "USER",
                42L,
                "CREATE",
                "Created user",
                7L,
                "Admin User",
                "admin@example.com",
                "ADMIN",
                "127.0.0.1",
                "Mozilla",
                "/api/admin/users",
                "POST",
                true,
                null);

        ArgumentCaptor<SystemAuditLog> entryCaptor = ArgumentCaptor.forClass(SystemAuditLog.class);
        verify(repository).save(entryCaptor.capture());
        SystemAuditLog entry = entryCaptor.getValue();

        assertEquals("USER", entry.getEntityType());
        assertEquals(42L, entry.getEntityId());
        assertEquals("CREATE", entry.getAction());
        assertEquals("Created user", entry.getDescription());
        assertEquals(7L, entry.getPerformedByUserId());
        assertEquals("admin@example.com", entry.getPerformedByUserEmail());
        assertEquals("127.0.0.1", entry.getIpAddress());
        assertTrue(entry.isSuccess());
    }

    @Test
    void logShouldSwallowRepositoryFailures() {
        doThrow(new RuntimeException("db unavailable")).when(repository).save(any(SystemAuditLog.class));

        systemAuditService.log(
                "USER",
                42L,
                "CREATE",
                "Created user",
                7L,
                "Admin User",
                "admin@example.com",
                "ADMIN",
                "127.0.0.1",
                "Mozilla",
                "/api/admin/users",
                "POST",
                false,
                "boom");

        verify(repository).save(any(SystemAuditLog.class));
    }

    @Test
    void getLogsShouldNormalizeBlankFiltersAndMapDtos() {
        PageRequest pageable = PageRequest.of(0, 10);
        SystemAuditLog log = auditLog(55L, "USER", "DELETE", "user@example.com", false);
        Page<SystemAuditLog> page = new PageImpl<>(List.of(log), pageable, 1);
        when(repository.findWithFilters(eq(null), eq(null), eq(null), eq(null), eq(null), eq(pageable))).thenReturn(page);

        Page<SystemAuditLogDto> result = systemAuditService.getLogs("   ", "", "   ", null, null, pageable);

        assertEquals(1, result.getTotalElements());
        SystemAuditLogDto dto = result.getContent().get(0);
        assertEquals(55L, dto.getId());
        assertEquals("USER", dto.getEntityType());
        assertEquals("DELETE", dto.getAction());
        assertEquals("user@example.com", dto.getPerformedByUserEmail());
        assertFalse(dto.isSuccess());
    }

    @Test
    void getByIdShouldReturnMappedDto() {
        SystemAuditLog log = auditLog(77L, "HOTEL", "UPDATE", "admin@example.com", true);
        when(repository.findById(77L)).thenReturn(Optional.of(log));

        SystemAuditLogDto dto = systemAuditService.getById(77L);

        assertEquals(77L, dto.getId());
        assertEquals("HOTEL", dto.getEntityType());
        assertEquals("UPDATE", dto.getAction());
        assertEquals("admin@example.com", dto.getPerformedByUserEmail());
        assertTrue(dto.isSuccess());
    }

    @Test
    void getByIdShouldRejectMissingAuditLog() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> systemAuditService.getById(999L));

        assertTrue(exception.getMessage().contains("Audit log not found: 999"));
    }

    @Test
    void countMethodsShouldDelegateFromStartOfToday() {
        when(repository.countSince(any(LocalDateTime.class))).thenReturn(15L);
        when(repository.countFailedSince(any(LocalDateTime.class))).thenReturn(3L);

        long total = systemAuditService.countToday();
        long failed = systemAuditService.countFailedToday();

        assertEquals(15L, total);
        assertEquals(3L, failed);

        ArgumentCaptor<LocalDateTime> sinceCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(repository).countSince(sinceCaptor.capture());
        assertEquals(0, sinceCaptor.getValue().getHour());
        assertEquals(0, sinceCaptor.getValue().getMinute());

        ArgumentCaptor<LocalDateTime> failedSinceCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(repository).countFailedSince(failedSinceCaptor.capture());
        assertEquals(0, failedSinceCaptor.getValue().getHour());
        assertEquals(0, failedSinceCaptor.getValue().getMinute());
    }

    @Test
    void resolveClientIpShouldPreferForwardedHeadersThenRemoteAddr() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.10, 10.0.0.1");
        assertEquals("203.0.113.10", systemAuditService.resolveClientIp(request));

        when(request.getHeader("X-Forwarded-For")).thenReturn("unknown");
        when(request.getHeader("X-Real-IP")).thenReturn("198.51.100.8");
        assertEquals("198.51.100.8", systemAuditService.resolveClientIp(request));

        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(" ");
        when(request.getRemoteAddr()).thenReturn("192.0.2.5");
        assertEquals("192.0.2.5", systemAuditService.resolveClientIp(request));
    }

    private SystemAuditLog auditLog(Long id, String entityType, String action, String email, boolean success) {
        SystemAuditLog log = new SystemAuditLog();
        log.setId(id);
        log.setEntityType(entityType);
        log.setEntityId(100L);
        log.setAction(action);
        log.setDescription(action + " description");
        log.setOldValues("old");
        log.setNewValues("new");
        log.setPerformedByUserId(7L);
        log.setPerformedByUserName("Admin User");
        log.setPerformedByUserEmail(email);
        log.setPerformedByUserRole("ADMIN");
        log.setIpAddress("127.0.0.1");
        log.setUserAgent("Mozilla");
        log.setRequestPath("/api/test");
        log.setRequestMethod("POST");
        log.setResponseStatus(200);
        log.setPerformedAt(LocalDateTime.now());
        log.setSuccess(success);
        log.setErrorMessage(success ? null : "boom");
        return log;
    }
}