package com.bookmyhotel.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertIterableEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.bookmyhotel.dto.AuditTrailDto;
import com.bookmyhotel.service.FinancialAuditService;

@ExtendWith(MockitoExtension.class)
class ProcessMonitoringControllerTest {

    @Mock
    private FinancialAuditService financialAuditService;

    @InjectMocks
    private ProcessMonitoringController controller;

    @Test
    void getAuditTaxonomyShouldExposeSupportedValues() {
        ResponseEntity<Map<String, List<String>>> response = controller.getAuditTaxonomy(5L);
        Map<String, List<String>> taxonomy = response.getBody();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(taxonomy);
        assertIterableEquals(List.of(
                "AUTH",
                "HOTEL",
                "USER",
                "ROOM",
                "ROOM_BATCH",
                "RESERVATION",
                "PRODUCT",
                "SHOP_ORDER",
                "PAYMENT",
                "PRICING_CONFIG",
                "HOUSEKEEPING_TASK",
                "HOUSEKEEPING_STAFF"), taxonomy.get("entityTypes"));
        assertIterableEquals(List.of(
                "CREATE",
                "UPDATE",
                "DELETE",
                "LOGIN",
                "LOGIN_FAILED",
                "LOGOUT",
                "STATUS_CHANGE",
                "PAYMENT_STATUS_CHANGE",
                "PAYMENT_METHOD_CHANGE",
                "PAYMENT_CALLBACK",
                "PAYMENT_INITIATED",
                "PAYMENT_INITIATION_FAILED",
                "BOOKING_CANCELLED",
                "BOOKING_MODIFIED",
                "CHECK_IN",
                "CHECK_OUT",
                "CANCEL",
                "NO_SHOW",
                "ASSIGN",
                "AUTO_ASSIGN",
                "START",
                "COMPLETE",
                "COMPLETE_WITH_ISSUES",
                "ACTIVATE",
                "DEACTIVATE",
                "STOCK_UPDATE",
                "STOCK_DECREASE",
                "STOCK_RESTORE",
                "ACTIVE_STATUS_CHANGE",
                "AVAILABILITY_CHANGE",
                "MARK_PAID",
                "TOGGLE_STATUS",
                "ROOM_ASSIGNMENT_CHANGE"), taxonomy.get("actions"));
        assertIterableEquals(List.of("FINANCIAL", "ACCESS_CONTROL"),
                taxonomy.get("complianceCategories"));
    }

    @Test
    void createAuditLogShouldNormalizeTaxonomyInputs() {
        AuditTrailDto auditTrailDto = new AuditTrailDto();
        when(financialAuditService.createAuditLog(
                1L,
                "RESERVATION",
                10L,
                "STATUS_CHANGE",
                null,
                null,
                null,
                20L,
                "Admin",
                "admin@example.com",
                "HOTEL_ADMIN",
                null,
                "reason",
                true,
                "FINANCIAL")).thenReturn(auditTrailDto);

        ResponseEntity<AuditTrailDto> response = controller.createAuditLog(
                1L,
                " reservation ",
                10L,
                " status_change ",
                null,
                null,
                null,
                20L,
                "Admin",
                "admin@example.com",
                "HOTEL_ADMIN",
                "reason",
                true,
                " financial ",
                null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(financialAuditService).createAuditLog(
                1L,
                "RESERVATION",
                10L,
                "STATUS_CHANGE",
                null,
                null,
                null,
                20L,
                "Admin",
                "admin@example.com",
                "HOTEL_ADMIN",
                null,
                "reason",
                true,
                "FINANCIAL");
    }

    @Test
    void createAuditLogShouldRejectUnsupportedTaxonomyValues() {
        ResponseEntity<AuditTrailDto> response = controller.createAuditLog(
                1L,
                "anything",
                10L,
                "made_up",
                null,
                null,
                null,
                20L,
                "Admin",
                "admin@example.com",
                "HOTEL_ADMIN",
                "reason",
                false,
                "random",
                null);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verifyNoInteractions(financialAuditService);
    }

    @Test
    void complianceReportShouldNormalizeCategory() {
        when(financialAuditService.getComplianceReport(7L, "ACCESS_CONTROL", Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of()));

        ResponseEntity<?> response = controller.getComplianceReport(7L, " access_control ", Pageable.unpaged());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(financialAuditService).getComplianceReport(7L, "ACCESS_CONTROL", Pageable.unpaged());
    }
}