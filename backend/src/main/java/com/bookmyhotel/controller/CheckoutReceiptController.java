package com.bookmyhotel.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.ConsolidatedReceiptResponse;
import com.bookmyhotel.service.CheckoutReceiptService;

/**
 * REST controller for checkout receipt management
 */
@RestController
@RequestMapping("/api/checkout")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
@CrossOrigin(origins = "*")
public class CheckoutReceiptController {

    @Autowired
    private CheckoutReceiptService checkoutReceiptService;

    /**
     * Generate a preview receipt for a reservation (before checkout)
     */
    @GetMapping("/receipt/{reservationId}/preview")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ConsolidatedReceiptResponse> generateReceiptPreview(
            @PathVariable Long reservationId,
            Authentication auth) {

        ConsolidatedReceiptResponse receipt = checkoutReceiptService
                .generateCheckoutReceipt(reservationId, auth.getName());

        return ResponseEntity.ok(receipt);
    }

    /**
     * Generate final receipt after checkout completion
     */
    @PostMapping("/receipt/{reservationId}/final")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ConsolidatedReceiptResponse> generateFinalReceipt(
            @PathVariable Long reservationId,
            Authentication auth) {

        ConsolidatedReceiptResponse receipt = checkoutReceiptService
                .generateFinalReceipt(reservationId, auth.getName());

        return ResponseEntity.ok(receipt);
    }
}
