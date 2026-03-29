package com.bookmyhotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class HotelActivityAuditServiceTest {

    @Mock
    private FinancialAuditService financialAuditService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRedactSensitiveValuesAndIncludeActorContext() throws Exception {
        Hotel hotel = new Hotel();
        hotel.setId(11L);

        User actor = new User();
        actor.setId(99L);
        actor.setEmail("admin@hotel.test");
        actor.setFirstName("Ada");
        actor.setLastName("Lovelace");
        actor.setRoles(Set.of(UserRole.HOTEL_ADMIN));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(actor, "ignored", actor.getAuthorities()));

        HotelActivityAuditService service = new HotelActivityAuditService(financialAuditService, objectMapper);

        service.logActivity(
                hotel,
                "PRODUCT",
                5L,
                "UPDATE",
                Map.of("password", "secret", "name", "Coffee"),
                Map.of("accessToken", "abc123", "nested", Map.of("refreshToken", "xyz"), "name", "Tea"),
                List.of("password", "name"),
                "Updated product",
                true,
                "FINANCIAL");

        ArgumentCaptor<String> oldValuesCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> newValuesCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> changedFieldsCaptor = ArgumentCaptor.forClass(String.class);

        verify(financialAuditService).createAuditLog(
                eq(hotel),
                eq("PRODUCT"),
                eq(5L),
                eq("UPDATE"),
                oldValuesCaptor.capture(),
                newValuesCaptor.capture(),
                changedFieldsCaptor.capture(),
                eq(99L),
                eq("Ada Lovelace"),
                eq("admin@hotel.test"),
                eq("HOTEL_ADMIN"),
                isNull(),
                eq("Updated product"),
                eq(true),
                eq("FINANCIAL"));

        JsonNode oldValues = objectMapper.readTree(oldValuesCaptor.getValue());
        JsonNode newValues = objectMapper.readTree(newValuesCaptor.getValue());
        JsonNode changedFields = objectMapper.readTree(changedFieldsCaptor.getValue());

        assertEquals("[REDACTED]", oldValues.get("password").asText());
        assertEquals("Coffee", oldValues.get("name").asText());
        assertEquals("[REDACTED]", newValues.get("accessToken").asText());
        assertEquals("[REDACTED]", newValues.get("nested").get("refreshToken").asText());
        assertEquals("Tea", newValues.get("name").asText());
        assertTrue(changedFields.isArray());
        assertEquals(2, changedFields.size());
    }

    @Test
    void shouldSkipWhenHotelContextIsMissing() {
        HotelActivityAuditService service = new HotelActivityAuditService(financialAuditService, objectMapper);

        service.logActivity(null, "ROOM", 7L, "UPDATE", null, null, List.of("status"), "Missing hotel", false, null);

        verifyNoInteractions(financialAuditService);
    }

    @Test
    void createSnapshotShouldIgnoreTrailingOddEntry() {
        HotelActivityAuditService service = new HotelActivityAuditService(financialAuditService, objectMapper);

        Map<String, Object> snapshot = service.createSnapshot("one", 1, "two", 2, "dangling");

        assertEquals(2, snapshot.size());
        assertEquals(1, snapshot.get("one"));
        assertEquals(2, snapshot.get("two"));
        assertFalse(snapshot.containsKey("dangling"));
    }
}