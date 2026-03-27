package com.bookmyhotel.controller;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.payment.PaymentCallbackRequest;
import com.bookmyhotel.dto.payment.PaymentInitiationRequest;
import com.bookmyhotel.dto.payment.PaymentInitiationResponse;
import com.bookmyhotel.service.payment.EthiopianMobilePaymentService;

import jakarta.validation.Valid;

/**
 * Controller for Ethiopian Mobile Payment processing
 */
@RestController
@RequestMapping("/api/payments/ethiopian")
public class EthiopianPaymentController {

    private static final Logger logger = LoggerFactory.getLogger(EthiopianPaymentController.class);

    @Autowired
    private EthiopianMobilePaymentService paymentService;

    /**
     * Initiate M-birr payment
     */
    @PostMapping("/mbirr/initiate")
    public ResponseEntity<?> initiateMbirrPayment(@Valid @RequestBody PaymentInitiationRequest request) {
        try {
            logger.info("🏦 Received M-birr payment initiation request for amount: {} ETB", request.getAmount());

            // Validate amount is in ETB (Ethiopian Birr)
            if (request.getAmount().compareTo(BigDecimal.valueOf(10)) < 0) {
                return ResponseEntity.badRequest()
                        .body("Minimum payment amount is 10 ETB");
            }

            if (request.getAmount().compareTo(BigDecimal.valueOf(100000)) > 0) {
                return ResponseEntity.badRequest()
                        .body("Maximum payment amount is 100,000 ETB");
            }

            PaymentInitiationResponse response = paymentService.initiateMbirrPayment(request);

            if (response.isSuccess()) {
                logger.info("✅ M-birr payment initiated successfully for booking: {}", request.getBookingReference());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("❌ M-birr payment initiation failed for booking: {}", request.getBookingReference());
                return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                        .body(response);
            }

        } catch (Exception e) {
            logger.error("❌ Error initiating M-birr payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initiate M-birr payment: " + e.getMessage());
        }
    }

    /**
     * Initiate Telebirr payment
     */
    @PostMapping("/telebirr/initiate")
    public ResponseEntity<?> initiateTelebirrPayment(@Valid @RequestBody PaymentInitiationRequest request) {
        try {
            logger.info("📱 Received Telebirr payment initiation request for amount: {} ETB", request.getAmount());

            // Validate amount is in ETB (Ethiopian Birr)
            if (request.getAmount().compareTo(BigDecimal.valueOf(5)) < 0) {
                return ResponseEntity.badRequest()
                        .body("Minimum payment amount is 5 ETB");
            }

            if (request.getAmount().compareTo(BigDecimal.valueOf(50000)) > 0) {
                return ResponseEntity.badRequest()
                        .body("Maximum payment amount is 50,000 ETB");
            }

            PaymentInitiationResponse response = paymentService.initiateTelebirrPayment(request);

            if (response.isSuccess()) {
                logger.info("✅ Telebirr payment initiated successfully for booking: {}", request.getBookingReference());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("❌ Telebirr payment initiation failed for booking: {}", request.getBookingReference());
                return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                        .body(response);
            }

        } catch (Exception e) {
            logger.error("❌ Error initiating Telebirr payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initiate Telebirr payment: " + e.getMessage());
        }
    }

    /**
     * Handle payment callback from M-birr
     */
    @PostMapping("/callback/mbirr")
    public ResponseEntity<?> handleMbirrCallback(
            @Valid @RequestBody PaymentCallbackRequest callbackRequest,
            @RequestHeader(value = "X-Signature", required = false) String signature) {
        try {
            logger.info("🔔 Received M-birr payment callback for transaction: {}", callbackRequest.getTransactionId());

            if (!paymentService.verifyCallbackSignature("MBIRR", callbackRequest, signature)) {
                logger.warn("Rejected M-birr callback due to invalid signature for transaction: {}",
                        callbackRequest.getTransactionId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid callback signature");
            }

            paymentService.processPaymentCallback("MBIRR", callbackRequest);
            return ResponseEntity.ok("Callback processed successfully");

        } catch (Exception e) {
            logger.error("❌ Error processing M-birr callback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process callback");
        }
    }

    /**
     * Handle payment callback from Telebirr
     */
    @PostMapping("/callback/telebirr")
    public ResponseEntity<?> handleTelebirrCallback(
            @Valid @RequestBody PaymentCallbackRequest callbackRequest,
            @RequestHeader(value = "X-Signature", required = false) String signature) {
        try {
            logger.info("🔔 Received Telebirr payment callback for transaction: {}",
                    callbackRequest.getTransactionId());

            if (!paymentService.verifyCallbackSignature("TELEBIRR", callbackRequest, signature)) {
                logger.warn("Rejected Telebirr callback due to invalid signature for transaction: {}",
                        callbackRequest.getTransactionId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid callback signature");
            }

            paymentService.processPaymentCallback("TELEBIRR", callbackRequest);
            return ResponseEntity.ok("Callback processed successfully");

        } catch (Exception e) {
            logger.error("❌ Error processing Telebirr callback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process callback");
        }
    }

    /**
     * Check payment status
     */
    @GetMapping("/status/{provider}/{transactionId}")
    @PostMapping("/status/{provider}/{transactionId}")
    public ResponseEntity<?> checkPaymentStatus(
            @PathVariable String provider,
            @PathVariable String transactionId) {
        try {
            boolean isPaid = false;

            if ("mbirr".equalsIgnoreCase(provider)) {
                isPaid = paymentService.verifyMbirrPayment(transactionId);
            } else if ("telebirr".equalsIgnoreCase(provider)) {
                isPaid = paymentService.verifyTelebirrPayment(transactionId);
            } else {
                return ResponseEntity.badRequest()
                        .body("Unsupported payment provider: " + provider);
            }

            return ResponseEntity.ok(new PaymentStatusResponse(transactionId, isPaid));

        } catch (Exception e) {
            logger.error("❌ Error checking payment status for transaction: {}", transactionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to check payment status");
        }
    }

    /**
     * Payment status response DTO
     */
    public static class PaymentStatusResponse {
        private String transactionId;
        private boolean isPaid;
        private String status;

        public PaymentStatusResponse(String transactionId, boolean isPaid) {
            this.transactionId = transactionId;
            this.isPaid = isPaid;
            this.status = isPaid ? "PAID" : "PENDING";
        }

        // Getters
        public String getTransactionId() {
            return transactionId;
        }

        public boolean isPaid() {
            return isPaid;
        }

        public String getStatus() {
            return status;
        }
    }
}
