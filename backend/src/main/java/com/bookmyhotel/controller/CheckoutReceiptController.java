package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.ConsolidatedReceiptResponse;
import com.bookmyhotel.service.CheckoutReceiptService;

@RestController
@RequestMapping("/api/checkout/receipt")
@PreAuthorize("hasAnyRole('HOTEL_ADMIN', 'FRONTDESK', 'SYSTEM_ADMIN')")
public class CheckoutReceiptController {

    @Autowired
    private CheckoutReceiptService checkoutReceiptService;

    @PostMapping("/{reservationId}/final")
    public ResponseEntity<ConsolidatedReceiptResponse> generateCheckoutReceipt(
            @PathVariable Long reservationId) {
        try {
            ConsolidatedReceiptResponse receipt = checkoutReceiptService.generateFinalReceipt(reservationId, "system");
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{tenantName}/{reservationId}/final")
    public ResponseEntity<ConsolidatedReceiptResponse> generateTenantCheckoutReceipt(
            @PathVariable String tenantName,
            @PathVariable Long reservationId) {
        try {
            ConsolidatedReceiptResponse receipt = checkoutReceiptService.generateFinalReceipt(reservationId, "system");
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{reservationId}/preview")
    public ResponseEntity<ConsolidatedReceiptResponse> generateReceiptPreview(
            @PathVariable Long reservationId) {
        try {
            ConsolidatedReceiptResponse receipt = checkoutReceiptService.generateFinalReceipt(reservationId, "system");
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{tenantName}/{reservationId}/preview")
    public ResponseEntity<ConsolidatedReceiptResponse> generateTenantReceiptPreview(
            @PathVariable String tenantName,
            @PathVariable Long reservationId) {
        try {
            ConsolidatedReceiptResponse receipt = checkoutReceiptService.generateFinalReceipt(reservationId, "system");
            return ResponseEntity.ok(receipt);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
