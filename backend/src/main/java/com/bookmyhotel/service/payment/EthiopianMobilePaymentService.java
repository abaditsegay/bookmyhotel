package com.bookmyhotel.service.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.bookmyhotel.dto.payment.MobirrPaymentRequest;
import com.bookmyhotel.dto.payment.MobirrPaymentResponse;
import com.bookmyhotel.dto.payment.PaymentInitiationRequest;
import com.bookmyhotel.dto.payment.PaymentInitiationResponse;
import com.bookmyhotel.dto.payment.TelebirrPaymentRequest;
import com.bookmyhotel.dto.payment.TelebirrPaymentResponse;
import com.bookmyhotel.exception.PaymentException;

/**
 * Service for integrating with Ethiopian Mobile Payment providers
 * Supports M-birr and Telebirr payment gateways
 */
@Service
public class EthiopianMobilePaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(EthiopianMobilePaymentService.class);
    
    @Value("${mbirr.api.url:https://api.mbirr.com}")
    private String mbirrApiUrl;
    
    @Value("${mbirr.api.key:}")
    private String mbirrApiKey;
    
    @Value("${mbirr.api.secret:}")
    private String mbirrApiSecret;
    
    @Value("${telebirr.api.url:https://api.telebirr.et}")
    private String telebirrApiUrl;
    
    @Value("${telebirr.api.key:}")
    private String telebirrApiKey;
    
    @Value("${telebirr.api.secret:}")
    private String telebirrApiSecret;
    
    @Value("${payment.callback.url:http://localhost:8080/api/payments/callback}")
    private String callbackUrl;
    
    private final RestTemplate restTemplate;
    
    public EthiopianMobilePaymentService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Initiate M-birr payment
     */
    public PaymentInitiationResponse initiateMbirrPayment(PaymentInitiationRequest request) {
        try {
            logger.info("🏦 Initiating M-birr payment for amount: {} ETB", request.getAmount());
            
            // Validate M-birr configuration
            if (mbirrApiKey == null || mbirrApiKey.isEmpty()) {
                throw new PaymentException("M-birr payment gateway is not configured");
            }
            
            // Create M-birr payment request
            MobirrPaymentRequest mbirrRequest = MobirrPaymentRequest.builder()
                .amount(request.getAmount())
                .currency("ETB")
                .phoneNumber(request.getPhoneNumber())
                .description("Hotel Booking Payment - " + request.getBookingReference())
                .merchantReference(request.getBookingReference())
                .callbackUrl(callbackUrl + "/mbirr")
                .build();
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(generateMbirrToken());
            
            HttpEntity<MobirrPaymentRequest> entity = new HttpEntity<>(mbirrRequest, headers);
            
            // Make API call to M-birr
            ResponseEntity<MobirrPaymentResponse> response = restTemplate.exchange(
                mbirrApiUrl + "/api/v1/payments/initiate",
                HttpMethod.POST,
                entity,
                MobirrPaymentResponse.class
            );
            
            MobirrPaymentResponse mbirrResponse = response.getBody();
            if (mbirrResponse != null && mbirrResponse.isSuccess()) {
                logger.info("✅ M-birr payment initiated successfully. Transaction ID: {}", mbirrResponse.getTransactionId());
                
                return PaymentInitiationResponse.builder()
                    .success(true)
                    .transactionId(mbirrResponse.getTransactionId())
                    .paymentUrl(mbirrResponse.getPaymentUrl())
                    .qrCode(mbirrResponse.getQrCode())
                    .expiresAt(LocalDateTime.now().plusMinutes(15)) // M-birr payments typically expire in 15 minutes
                    .instructions("Please complete the payment using your M-birr app or dial *847#")
                    .build();
            } else {
                throw new PaymentException("M-birr payment initiation failed: " + 
                    (mbirrResponse != null ? mbirrResponse.getErrorMessage() : "Unknown error"));
            }
            
        } catch (Exception e) {
            logger.error("❌ M-birr payment initiation failed", e);
            throw new PaymentException("Failed to initiate M-birr payment: " + e.getMessage());
        }
    }
    
    /**
     * Initiate Telebirr payment
     */
    public PaymentInitiationResponse initiateTelebirrPayment(PaymentInitiationRequest request) {
        try {
            logger.info("📱 Initiating Telebirr payment for amount: {} ETB", request.getAmount());
            
            // Validate Telebirr configuration
            if (telebirrApiKey == null || telebirrApiKey.isEmpty()) {
                throw new PaymentException("Telebirr payment gateway is not configured");
            }
            
            // Create Telebirr payment request
            TelebirrPaymentRequest telebirrRequest = TelebirrPaymentRequest.builder()
                .amount(request.getAmount())
                .currency("ETB")
                .phoneNumber(request.getPhoneNumber())
                .description("Hotel Booking Payment - " + request.getBookingReference())
                .merchantReference(request.getBookingReference())
                .notifyUrl(callbackUrl + "/telebirr")
                .returnUrl(request.getReturnUrl())
                .build();
            
            // Set up headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + generateTelebirrToken());
            headers.set("X-App-Key", telebirrApiKey);
            
            HttpEntity<TelebirrPaymentRequest> entity = new HttpEntity<>(telebirrRequest, headers);
            
            // Make API call to Telebirr
            ResponseEntity<TelebirrPaymentResponse> response = restTemplate.exchange(
                telebirrApiUrl + "/payment/v2/initiate",
                HttpMethod.POST,
                entity,
                TelebirrPaymentResponse.class
            );
            
            TelebirrPaymentResponse telebirrResponse = response.getBody();
            if (telebirrResponse != null && "SUCCESS".equals(telebirrResponse.getStatus())) {
                logger.info("✅ Telebirr payment initiated successfully. Transaction ID: {}", telebirrResponse.getTransactionId());
                
                return PaymentInitiationResponse.builder()
                    .success(true)
                    .transactionId(telebirrResponse.getTransactionId())
                    .paymentUrl(telebirrResponse.getPaymentUrl())
                    .qrCode(telebirrResponse.getQrCode())
                    .expiresAt(LocalDateTime.now().plusMinutes(10)) // Telebirr payments typically expire in 10 minutes
                    .instructions("Please complete the payment using your Telebirr app")
                    .build();
            } else {
                throw new PaymentException("Telebirr payment initiation failed: " + 
                    (telebirrResponse != null ? telebirrResponse.getMessage() : "Unknown error"));
            }
            
        } catch (Exception e) {
            logger.error("❌ Telebirr payment initiation failed", e);
            throw new PaymentException("Failed to initiate Telebirr payment: " + e.getMessage());
        }
    }
    
    /**
     * Generate M-birr authentication token
     */
    private String generateMbirrToken() {
        // Implementation depends on M-birr's authentication mechanism
        // This is a placeholder - actual implementation will vary
        try {
            Map<String, String> authRequest = new HashMap<>();
            authRequest.put("apiKey", mbirrApiKey);
            authRequest.put("apiSecret", mbirrApiSecret);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(authRequest, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                mbirrApiUrl + "/api/v1/auth/token",
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            return responseBody != null ? (String) responseBody.get("access_token") : "";
            
        } catch (Exception e) {
            logger.error("Failed to generate M-birr token", e);
            throw new PaymentException("Authentication failed for M-birr");
        }
    }
    
    /**
     * Generate Telebirr authentication token
     */
    private String generateTelebirrToken() {
        // Implementation depends on Telebirr's authentication mechanism
        // This is a placeholder - actual implementation will vary
        try {
            Map<String, String> authRequest = new HashMap<>();
            authRequest.put("appKey", telebirrApiKey);
            authRequest.put("appSecret", telebirrApiSecret);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(authRequest, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                telebirrApiUrl + "/auth/token",
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            return responseBody != null ? (String) responseBody.get("token") : "";
            
        } catch (Exception e) {
            logger.error("Failed to generate Telebirr token", e);
            throw new PaymentException("Authentication failed for Telebirr");
        }
    }
    
    /**
     * Verify payment status for M-birr
     */
    public boolean verifyMbirrPayment(String transactionId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(generateMbirrToken());
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<MobirrPaymentResponse> response = restTemplate.exchange(
                mbirrApiUrl + "/api/v1/payments/" + transactionId + "/status",
                HttpMethod.GET,
                entity,
                MobirrPaymentResponse.class
            );
            
            MobirrPaymentResponse result = response.getBody();
            return result != null && "COMPLETED".equals(result.getStatus());
            
        } catch (Exception e) {
            logger.error("Failed to verify M-birr payment: {}", transactionId, e);
            return false;
        }
    }
    
    /**
     * Verify payment status for Telebirr
     */
    public boolean verifyTelebirrPayment(String transactionId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + generateTelebirrToken());
            headers.set("X-App-Key", telebirrApiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<TelebirrPaymentResponse> response = restTemplate.exchange(
                telebirrApiUrl + "/payment/v2/status/" + transactionId,
                HttpMethod.GET,
                entity,
                TelebirrPaymentResponse.class
            );
            
            TelebirrPaymentResponse result = response.getBody();
            return result != null && "PAID".equals(result.getStatus());
            
        } catch (Exception e) {
            logger.error("Failed to verify Telebirr payment: {}", transactionId, e);
            return false;
        }
    }
}
