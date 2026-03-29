package com.bookmyhotel.service;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class HotelActivityAuditService {

    private static final Logger logger = LoggerFactory.getLogger(HotelActivityAuditService.class);

    private static final Set<String> REDACTED_FIELDS = Set.of(
            "password",
            "token",
            "refreshToken",
            "accessToken",
            "secret",
            "signature",
            "authorization",
            "rawPayload",
            "qrCode");

    private final FinancialAuditService financialAuditService;
    private final ObjectMapper objectMapper;

    public HotelActivityAuditService(FinancialAuditService financialAuditService, ObjectMapper objectMapper) {
        this.financialAuditService = financialAuditService;
        this.objectMapper = objectMapper;
    }

    public void logActivity(Hotel hotel,
            String entityType,
            Long entityId,
            String action,
            Object oldValues,
            Object newValues,
            Collection<String> changedFields,
            String reason,
            boolean sensitive,
            String complianceCategory) {
        if (hotel == null) {
            logger.warn("Skipping hotel activity audit for {} {} because hotel context is missing", entityType, action);
            return;
        }

        try {
            ActorContext actor = resolveActor();
            financialAuditService.createAuditLog(
                    hotel,
                    entityType,
                    entityId,
                    action,
                    toSanitizedJson(oldValues),
                    toSanitizedJson(newValues),
                    toChangedFieldsJson(changedFields),
                    actor.userId(),
                    actor.userName(),
                    actor.userEmail(),
                    actor.userRole(),
                    currentRequest(),
                    reason,
                    sensitive,
                    complianceCategory);
        } catch (Exception exception) {
            logger.error("Failed to write hotel activity audit for {} {}: {}",
                    entityType,
                    action,
                    exception.getMessage(),
                    exception);
        }
    }

    private String toChangedFieldsJson(Collection<String> changedFields) throws JsonProcessingException {
        if (changedFields == null || changedFields.isEmpty()) {
            return null;
        }
        return objectMapper.writeValueAsString(changedFields);
    }

    private String toSanitizedJson(Object value) throws JsonProcessingException {
        if (value == null) {
            return null;
        }

        JsonNode sanitizedNode = sanitizeNode(objectMapper.valueToTree(value), null);
        return objectMapper.writeValueAsString(sanitizedNode);
    }

    private JsonNode sanitizeNode(JsonNode node, String fieldName) {
        if (node == null || node.isNull()) {
            return node;
        }

        if (fieldName != null && shouldRedact(fieldName)) {
            return TextNode.valueOf("[REDACTED]");
        }

        if (node.isObject()) {
            ObjectNode sanitized = objectMapper.createObjectNode();
            node.fields().forEachRemaining(entry -> sanitized.set(entry.getKey(), sanitizeNode(entry.getValue(), entry.getKey())));
            return sanitized;
        }

        if (node.isArray()) {
            ArrayNode sanitized = objectMapper.createArrayNode();
            for (JsonNode child : node) {
                sanitized.add(sanitizeNode(child, fieldName));
            }
            return sanitized;
        }

        return node;
    }

    private boolean shouldRedact(String fieldName) {
        String normalized = fieldName.toLowerCase(Locale.ROOT);
        return REDACTED_FIELDS.stream().map(value -> value.toLowerCase(Locale.ROOT)).anyMatch(normalized::contains);
    }

    private HttpServletRequest currentRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception exception) {
            return null;
        }
    }

    private ActorContext resolveActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return new ActorContext(null, "system", null, null);
        }

        Long userId = null;
        String userName = authentication.getName() != null ? authentication.getName() : "system";
        String userEmail = authentication.getName();
        String userRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElse(null);

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            userId = user.getId();
            userEmail = user.getEmail();
            userName = user.getFirstName() != null && user.getLastName() != null
                    ? (user.getFirstName() + " " + user.getLastName()).trim()
                    : user.getEmail();
        } else if (principal instanceof UserDetails details) {
            userEmail = details.getUsername();
            userName = details.getUsername();
        }

        return new ActorContext(userId, userName, userEmail, userRole);
    }

    public Map<String, Object> createSnapshot(Object... keyValues) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        for (int index = 0; index + 1 < keyValues.length; index += 2) {
            snapshot.put(String.valueOf(keyValues[index]), keyValues[index + 1]);
        }
        return snapshot;
    }

    private record ActorContext(Long userId, String userName, String userEmail, String userRole) {
    }
}