package com.bookmyhotel.service;

import com.bookmyhotel.dto.AuditTrailDto;
import com.bookmyhotel.dto.DailyFinancialReconciliationDto;
import com.bookmyhotel.dto.PaymentDiscrepancyDto;
import com.bookmyhotel.entity.AuditLog;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.repository.AuditLogRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomChargeRepository;
import com.bookmyhotel.tenant.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for financial audit and compliance tracking
 */
@Service
@Transactional
public class FinancialAuditService {

    private static final Logger logger = LoggerFactory.getLogger(FinancialAuditService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomChargeRepository roomChargeRepository;

    @Autowired
    private HotelPricingConfigService hotelPricingConfigService;

    /**
     * Create an audit log entry
     */
    public AuditTrailDto createAuditLog(String entityType, Long entityId, String action,
            String oldValues, String newValues, String changedFields,
            Long userId, String userName, String userEmail, String userRole,
            HttpServletRequest request, String reason, boolean isSensitive,
            String complianceCategory) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setAction(action);
            auditLog.setOldValues(oldValues);
            auditLog.setNewValues(newValues);
            auditLog.setChangedFields(changedFields);
            auditLog.setUserId(userId);
            auditLog.setUserName(userName);
            auditLog.setUserEmail(userEmail);
            auditLog.setUserRole(userRole);
            auditLog.setReason(reason);
            auditLog.setSensitive(isSensitive);
            auditLog.setComplianceCategory(complianceCategory);

            // Set tenant context
            // Tenant is handled through hotel relationship - no need to set directly

            // Set request details
            if (request != null) {
                auditLog.setIpAddress(getClientIpAddress(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
                auditLog.setSessionId(request.getSession().getId());
            }

            auditLog = auditLogRepository.save(auditLog);
            return convertAuditLogToDto(auditLog);

        } catch (Exception e) {
            logger.error("Failed to create audit log: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create audit log", e);
        }
    }

    /**
     * Generate daily financial reconciliation
     */
    @Transactional(readOnly = true)
    public DailyFinancialReconciliationDto generateDailyReconciliation(Long hotelId, LocalDate date) {
        try {
            DailyFinancialReconciliationDto reconciliation = new DailyFinancialReconciliationDto(date, hotelId);

            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

            // Get all reservations for the day
            List<Reservation> reservations = reservationRepository.findByHotelIdAndDateRange(hotelId, startOfDay,
                    endOfDay);

            // Calculate payment summary
            calculatePaymentSummary(reconciliation, reservations);

            // Calculate outstanding balances
            calculateOutstandingBalances(reconciliation, hotelId);

            // Calculate tax information
            calculateTaxInformation(reconciliation, reservations, hotelId);

            // Find discrepancies
            List<PaymentDiscrepancyDto> discrepancies = findPaymentDiscrepancies(reservations, hotelId);
            reconciliation.setDiscrepancies(discrepancies);
            reconciliation.setHasDiscrepancies(!discrepancies.isEmpty());

            // Set reconciliation status
            reconciliation.setReconciliationStatus(reconciliation.isHasDiscrepancies() ? "PENDING" : "COMPLETED");

            return reconciliation;

        } catch (Exception e) {
            logger.error("Failed to generate daily reconciliation for hotel {} on {}: {}", hotelId, date,
                    e.getMessage(), e);
            throw new RuntimeException("Failed to generate daily reconciliation", e);
        }
    }

    /**
     * Get audit trail for an entity
     */
    @Transactional(readOnly = true)
    public List<AuditTrailDto> getAuditTrail(Long hotelId, String entityType, Long entityId) {
        List<AuditLog> auditLogs = auditLogRepository.findByHotelIdAndEntityTypeAndEntityId(hotelId, entityType,
                entityId);
        return auditLogs.stream().map(this::convertAuditLogToDto).collect(Collectors.toList());
    }

    /**
     * Get audit logs with pagination
     */
    @Transactional(readOnly = true)
    public Page<AuditTrailDto> getAuditLogs(Long hotelId, Pageable pageable) {
        Page<AuditLog> auditLogs = auditLogRepository.findByHotelIdOrderByTimestampDesc(hotelId, pageable);
        List<AuditTrailDto> dtos = auditLogs.getContent().stream().map(this::convertAuditLogToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, auditLogs.getTotalElements());
    }

    /**
     * Get sensitive audit logs
     */
    @Transactional(readOnly = true)
    public Page<AuditTrailDto> getSensitiveAuditLogs(Long hotelId, Pageable pageable) {
        Page<AuditLog> auditLogs = auditLogRepository.findSensitiveLogsByHotelId(hotelId, pageable);
        List<AuditTrailDto> dtos = auditLogs.getContent().stream().map(this::convertAuditLogToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, auditLogs.getTotalElements());
    }

    /**
     * Get compliance report
     */
    @Transactional(readOnly = true)
    public Page<AuditTrailDto> getComplianceReport(Long hotelId, String complianceCategory, Pageable pageable) {
        Page<AuditLog> auditLogs = auditLogRepository.findByHotelIdAndComplianceCategory(hotelId, complianceCategory,
                pageable);
        List<AuditTrailDto> dtos = auditLogs.getContent().stream().map(this::convertAuditLogToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, auditLogs.getTotalElements());
    }

    /**
     * Calculate payment summary for reconciliation
     */
    private void calculatePaymentSummary(DailyFinancialReconciliationDto reconciliation,
            List<Reservation> reservations) {
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCash = BigDecimal.ZERO;
        BigDecimal totalCard = BigDecimal.ZERO;
        BigDecimal totalOnline = BigDecimal.ZERO;
        BigDecimal totalMobile = BigDecimal.ZERO;
        BigDecimal totalRefunds = BigDecimal.ZERO;

        int totalTransactions = 0;
        int successfulTransactions = 0;
        int failedTransactions = 0;
        int refundTransactions = 0;

        for (Reservation reservation : reservations) {
            if (reservation.getTotalAmount() != null) {
                String paymentMethod = reservation.getPaymentMethod();
                BigDecimal amount = reservation.getTotalAmount();

                totalRevenue = totalRevenue.add(amount);
                totalTransactions++;

                if (paymentMethod != null) {
                    switch (paymentMethod.toLowerCase()) {
                        case "cash":
                            totalCash = totalCash.add(amount);
                            break;
                        case "card":
                        case "stripe":
                            totalCard = totalCard.add(amount);
                            break;
                        case "online":
                            totalOnline = totalOnline.add(amount);
                            break;
                        case "mbirr":
                        case "telebirr":
                            totalMobile = totalMobile.add(amount);
                            break;
                    }
                }

                // Check payment status (you might need to add payment status to Reservation
                // entity)
                successfulTransactions++;
            }
        }

        reconciliation.setTotalRevenue(totalRevenue);
        reconciliation.setTotalCashPayments(totalCash);
        reconciliation.setTotalCardPayments(totalCard);
        reconciliation.setTotalOnlinePayments(totalOnline);
        reconciliation.setTotalMobilePayments(totalMobile);
        reconciliation.setTotalRefunds(totalRefunds);
        reconciliation.setNetRevenue(totalRevenue.subtract(totalRefunds));

        reconciliation.setTotalTransactions(totalTransactions);
        reconciliation.setSuccessfulTransactions(successfulTransactions);
        reconciliation.setFailedTransactions(failedTransactions);
        reconciliation.setRefundTransactions(refundTransactions);
    }

    /**
     * Calculate outstanding balances
     */
    private void calculateOutstandingBalances(DailyFinancialReconciliationDto reconciliation, Long hotelId) {
        // Get total unpaid room charges
        BigDecimal totalOutstanding = roomChargeRepository.getTotalUnpaidChargesByHotel(hotelId);
        long reservationsWithOutstanding = roomChargeRepository.countReservationsWithUnpaidCharges(hotelId);

        reconciliation.setTotalOutstandingBalance(totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO);
        reconciliation.setReservationsWithOutstandingBalance((int) reservationsWithOutstanding);
    }

    /**
     * Calculate tax information
     */
    private void calculateTaxInformation(DailyFinancialReconciliationDto reconciliation,
            List<Reservation> reservations, Long hotelId) {
        try {
            BigDecimal totalTaxRate = hotelPricingConfigService.getTotalTaxRate(hotelId);
            BigDecimal totalTaxCollected = BigDecimal.ZERO;
            BigDecimal expectedTax = BigDecimal.ZERO;

            for (Reservation reservation : reservations) {
                if (reservation.getTotalAmount() != null) {
                    // Calculate expected tax (this is simplified - you might have more complex tax
                    // logic)
                    BigDecimal reservationTax = reservation.getTotalAmount().multiply(totalTaxRate)
                            .setScale(2, RoundingMode.HALF_UP);
                    expectedTax = expectedTax.add(reservationTax).setScale(2, RoundingMode.HALF_UP);

                    // For now, assume tax was collected (you might have actual tax collection data)
                    totalTaxCollected = totalTaxCollected.add(reservationTax)
                            .setScale(2, RoundingMode.HALF_UP);
                }
            }

            reconciliation.setTotalTaxCollected(totalTaxCollected);
            reconciliation.setExpectedTax(expectedTax);
            reconciliation.setTaxDiscrepancy(expectedTax.subtract(totalTaxCollected)
                    .setScale(2, RoundingMode.HALF_UP));

        } catch (Exception e) {
            logger.warn("Failed to calculate tax information for hotel {}: {}", hotelId, e.getMessage());
            reconciliation.setTotalTaxCollected(BigDecimal.ZERO);
            reconciliation.setExpectedTax(BigDecimal.ZERO);
            reconciliation.setTaxDiscrepancy(BigDecimal.ZERO);
        }
    }

    /**
     * Find payment discrepancies
     */
    private List<PaymentDiscrepancyDto> findPaymentDiscrepancies(List<Reservation> reservations, Long hotelId) {
        List<PaymentDiscrepancyDto> discrepancies = new ArrayList<>();

        for (Reservation reservation : reservations) {
            // Check for various discrepancy types

            // Example: Check if payment amount matches calculated amount
            if (reservation.getTotalAmount() != null && reservation.getPricePerNight() != null) {
                long nights = java.time.temporal.ChronoUnit.DAYS.between(
                        reservation.getCheckInDate(), reservation.getCheckOutDate());
                BigDecimal expectedAmount = reservation.getPricePerNight().multiply(BigDecimal.valueOf(nights))
                        .setScale(2, RoundingMode.HALF_UP);

                if (reservation.getTotalAmount().compareTo(expectedAmount) != 0) {
                    PaymentDiscrepancyDto discrepancy = new PaymentDiscrepancyDto(
                            reservation.getId(),
                            "AMOUNT_MISMATCH",
                            "Payment amount does not match calculated room charges",
                            expectedAmount,
                            reservation.getTotalAmount());
                    discrepancy.setConfirmationNumber(reservation.getConfirmationNumber());
                    discrepancy.setGuestName(reservation.getGuest() != null
                            ? reservation.getGuest().getFirstName() + " " + reservation.getGuest().getLastName()
                            : "Unknown");
                    discrepancy.setPaymentMethod(reservation.getPaymentMethod());
                    discrepancy.setSeverity(
                            discrepancy.getDiscrepancyAmount().abs().compareTo(BigDecimal.valueOf(100)) > 0 ? "HIGH"
                                    : "MEDIUM");
                    discrepancies.add(discrepancy);
                }
            }
        }

        return discrepancies;
    }

    /**
     * Convert AuditLog entity to DTO
     */
    private AuditTrailDto convertAuditLogToDto(AuditLog auditLog) {
        AuditTrailDto dto = new AuditTrailDto();
        dto.setId(auditLog.getId());
        dto.setHotelId(auditLog.getHotel() != null ? auditLog.getHotel().getId() : null);
        dto.setTenantId(auditLog.getTenantId());
        dto.setEntityType(auditLog.getEntityType());
        dto.setEntityId(auditLog.getEntityId());
        dto.setAction(auditLog.getAction());
        dto.setOldValues(auditLog.getOldValues());
        dto.setNewValues(auditLog.getNewValues());
        dto.setChangedFields(auditLog.getChangedFields());
        dto.setUserId(auditLog.getUserId());
        dto.setUserName(auditLog.getUserName());
        dto.setUserEmail(auditLog.getUserEmail());
        dto.setUserRole(auditLog.getUserRole());
        dto.setIpAddress(auditLog.getIpAddress());
        dto.setUserAgent(auditLog.getUserAgent());
        dto.setSessionId(auditLog.getSessionId());
        dto.setTimestamp(auditLog.getTimestamp());
        dto.setReason(auditLog.getReason());
        dto.setDetails(auditLog.getDetails());
        dto.setSensitive(auditLog.isSensitive());
        dto.setComplianceCategory(auditLog.getComplianceCategory());
        return dto;
    }

    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}