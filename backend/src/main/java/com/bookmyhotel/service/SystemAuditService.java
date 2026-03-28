package com.bookmyhotel.service;

import com.bookmyhotel.dto.SystemAuditLogDto;
import com.bookmyhotel.entity.SystemAuditLog;
import com.bookmyhotel.repository.SystemAuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SystemAuditService {

    private static final Logger logger = LoggerFactory.getLogger(SystemAuditService.class);

    @Autowired
    private SystemAuditLogRepository repository;

    /**
     * Write an audit log entry asynchronously so it never blocks the main request.
     * Uses REQUIRES_NEW to ensure it commits even if the outer transaction rolls
     * back.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String entityType,
            Long entityId,
            String action,
            String description,
            Long userId,
            String userName,
            String userEmail,
            String userRole,
            String ipAddress,
            String userAgent,
            String requestPath,
            String requestMethod,
            boolean success,
            String errorMessage) {
        try {
            SystemAuditLog entry = new SystemAuditLog();
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setAction(action);
            entry.setDescription(description);
            entry.setPerformedByUserId(userId);
            entry.setPerformedByUserName(userName);
            entry.setPerformedByUserEmail(userEmail);
            entry.setPerformedByUserRole(userRole);
            entry.setIpAddress(ipAddress);
            entry.setUserAgent(userAgent);
            entry.setRequestPath(requestPath);
            entry.setRequestMethod(requestMethod);
            entry.setSuccess(success);
            entry.setErrorMessage(errorMessage);
            repository.save(entry);
        } catch (Exception e) {
            logger.error("Failed to write system audit log: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<SystemAuditLogDto> getLogs(String action,
            String entityType,
            String userEmail,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {
        Page<SystemAuditLog> page = repository.findWithFilters(
                emptyToNull(action), emptyToNull(entityType), emptyToNull(userEmail), from, to, pageable);
        List<SystemAuditLogDto> dtos = page.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public SystemAuditLogDto getById(Long id) {
        return repository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + id));
    }

    public long countToday() {
        return repository.countSince(LocalDateTime.now().toLocalDate().atStartOfDay());
    }

    public long countFailedToday() {
        return repository.countFailedSince(LocalDateTime.now().toLocalDate().atStartOfDay());
    }

    public String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank() && !"unknown".equalsIgnoreCase(xff)) {
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank() && !"unknown".equalsIgnoreCase(xri)) {
            return xri;
        }
        return request.getRemoteAddr();
    }

    private SystemAuditLogDto toDto(SystemAuditLog e) {
        SystemAuditLogDto dto = new SystemAuditLogDto();
        dto.setId(e.getId());
        dto.setEntityType(e.getEntityType());
        dto.setEntityId(e.getEntityId());
        dto.setAction(e.getAction());
        dto.setDescription(e.getDescription());
        dto.setOldValues(e.getOldValues());
        dto.setNewValues(e.getNewValues());
        dto.setPerformedByUserId(e.getPerformedByUserId());
        dto.setPerformedByUserName(e.getPerformedByUserName());
        dto.setPerformedByUserEmail(e.getPerformedByUserEmail());
        dto.setPerformedByUserRole(e.getPerformedByUserRole());
        dto.setIpAddress(e.getIpAddress());
        dto.setUserAgent(e.getUserAgent());
        dto.setRequestPath(e.getRequestPath());
        dto.setRequestMethod(e.getRequestMethod());
        dto.setResponseStatus(e.getResponseStatus());
        dto.setPerformedAt(e.getPerformedAt());
        dto.setSuccess(e.isSuccess());
        dto.setErrorMessage(e.getErrorMessage());
        return dto;
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
