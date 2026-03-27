package com.bookmyhotel.service.payment;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.bookmyhotel.dto.payment.PaymentCallbackRequest;
import com.bookmyhotel.dto.payment.MobirrPaymentRequest;
import com.bookmyhotel.dto.payment.MobirrPaymentResponse;
import com.bookmyhotel.dto.payment.PaymentInitiationRequest;
import com.bookmyhotel.dto.payment.PaymentInitiationResponse;
import com.bookmyhotel.dto.payment.TelebirrPaymentRequest;
import com.bookmyhotel.dto.payment.TelebirrPaymentResponse;
import com.bookmyhotel.entity.PaymentCallbackEvent;
import com.bookmyhotel.entity.PaymentStatus;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.exception.PaymentException;
import com.bookmyhotel.repository.PaymentCallbackEventRepository;
import com.bookmyhotel.repository.ReservationRepository;

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

    @Value("${mbirr.webhook.secret:}")
    private String mbirrWebhookSecret;

    @Value("${telebirr.webhook.secret:}")
    private String telebirrWebhookSecret;

    @Value("${payment.callback.max-skew-seconds:300}")
    private long callbackMaxSkewSeconds;

    private final RestTemplate restTemplate;
    private final ReservationRepository reservationRepository;
    private final PaymentCallbackEventRepository paymentCallbackEventRepository;

    public EthiopianMobilePaymentService(ReservationRepository reservationRepository,
            PaymentCallbackEventRepository paymentCallbackEventRepository) {
        this.restTemplate = new RestTemplate();
        this.reservationRepository = reservationRepository;
        this.paymentCallbackEventRepository = paymentCallbackEventRepository;
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
                    MobirrPaymentResponse.class);

            MobirrPaymentResponse mbirrResponse = response.getBody();
            if (mbirrResponse != null && mbirrResponse.isSuccess()) {
                logger.info("✅ M-birr payment initiated successfully. Transaction ID: {}",
                        mbirrResponse.getTransactionId());

                return PaymentInitiationResponse.builder()
                        .success(true)
                        .transactionId(mbirrResponse.getTransactionId())
                        .paymentUrl(mbirrResponse.getPaymentUrl())
                        .qrCode(mbirrResponse.getQrCode())
                        .expiresAt(LocalDateTime.now().plusMinutes(15)) // M-birr payments typically expire in 15
                                                                        // minutes
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
                    TelebirrPaymentResponse.class);

            TelebirrPaymentResponse telebirrResponse = response.getBody();
            if (telebirrResponse != null && "SUCCESS".equals(telebirrResponse.getStatus())) {
                logger.info("✅ Telebirr payment initiated successfully. Transaction ID: {}",
                        telebirrResponse.getTransactionId());

                return PaymentInitiationResponse.builder()
                        .success(true)
                        .transactionId(telebirrResponse.getTransactionId())
                        .paymentUrl(telebirrResponse.getPaymentUrl())
                        .qrCode(telebirrResponse.getQrCode())
                        .expiresAt(LocalDateTime.now().plusMinutes(10)) // Telebirr payments typically expire in 10
                                                                        // minutes
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
                    Map.class);

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
                    Map.class);

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
                    MobirrPaymentResponse.class);

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
                    TelebirrPaymentResponse.class);

            TelebirrPaymentResponse result = response.getBody();
            return result != null && "PAID".equals(result.getStatus());

        } catch (Exception e) {
            logger.error("Failed to verify Telebirr payment: {}", transactionId, e);
            return false;
        }
    }

    /**
     * Verify callback signature from Ethiopian payment providers.
     */
    public boolean verifyCallbackSignature(String provider, PaymentCallbackRequest callbackRequest, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }

        if (!isWithinReplayWindow(callbackRequest)) {
            logger.warn("Rejected stale or invalid callback timestamp for transaction {}",
                    callbackRequest.getTransactionId());
            return false;
        }

        String secret = resolveWebhookSecret(provider);
        if (secret == null || secret.isBlank()) {
            logger.warn("Webhook secret is not configured for provider {}", provider);
            return false;
        }

        String payload = buildSignaturePayload(callbackRequest);
        String expected = hmacSha256Hex(payload, secret);
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Process callback from Ethiopian payment providers and update reservation
     * state.
     */
    @Transactional
    public boolean processPaymentCallback(String provider, PaymentCallbackRequest callbackRequest) {
        String idempotencyKey = buildIdempotencyKey(provider, callbackRequest);

        if (paymentCallbackEventRepository.existsByIdempotencyKey(idempotencyKey)) {
            logger.info("Ignoring duplicate payment callback event for transaction {}",
                    callbackRequest.getTransactionId());
            return true;
        }

        PaymentCallbackEvent callbackEvent = new PaymentCallbackEvent();
        callbackEvent.setProvider(provider);
        callbackEvent.setTransactionId(callbackRequest.getTransactionId());
        callbackEvent.setProviderTransactionId(callbackRequest.getProviderTransactionId());
        callbackEvent.setEventId(callbackRequest.getEventId());
        callbackEvent.setCallbackStatus(callbackRequest.getStatus());
        callbackEvent.setIdempotencyKey(idempotencyKey);

        try {
            paymentCallbackEventRepository.save(callbackEvent);
        } catch (DataIntegrityViolationException e) {
            // Another concurrent callback already persisted this key.
            logger.info("Ignoring duplicate payment callback race for transaction {}",
                    callbackRequest.getTransactionId());
            return true;
        }

        Reservation reservation = reservationRepository
                .findByPaymentIntentIdForUpdate(callbackRequest.getTransactionId())
                .orElseThrow(() -> new PaymentException(
                        "Reservation not found for transaction ID: " + callbackRequest.getTransactionId()));

        PaymentStatus newPaymentStatus = mapProviderStatus(callbackRequest.getStatus());

        // Idempotency-safe no-op when callback repeats terminal state.
        if (reservation.getPaymentStatus() == newPaymentStatus) {
            logger.info("Ignoring duplicate payment callback for transaction {} with status {}",
                    callbackRequest.getTransactionId(), callbackRequest.getStatus());
            return true;
        }

        reservation.setPaymentStatus(newPaymentStatus);

        if (callbackRequest.getProviderTransactionId() != null
                && !callbackRequest.getProviderTransactionId().isBlank()
                && (reservation.getPaymentReference() == null || reservation.getPaymentReference().isBlank())) {
            reservation.setPaymentReference(callbackRequest.getProviderTransactionId());
        }

        if (newPaymentStatus == PaymentStatus.COMPLETED) {
            if (reservation.getStatus() == ReservationStatus.PENDING) {
                reservation.setStatus(ReservationStatus.BOOKED);
            }
        } else if (newPaymentStatus == PaymentStatus.FAILED || newPaymentStatus == PaymentStatus.CANCELLED) {
            if (reservation.getStatus() == ReservationStatus.PENDING) {
                reservation.setStatus(ReservationStatus.CANCELLED);
            }
        }

        reservationRepository.save(reservation);
        logger.info("Processed {} payment callback for transaction {} -> paymentStatus={}, reservationStatus={}",
                provider,
                callbackRequest.getTransactionId(),
                reservation.getPaymentStatus(),
                reservation.getStatus());

        return true;
    }

    private PaymentStatus mapProviderStatus(String providerStatus) {
        if (providerStatus == null) {
            return PaymentStatus.PENDING;
        }

        String normalized = providerStatus.trim().toUpperCase();
        return switch (normalized) {
            case "SUCCESS", "SUCCEEDED", "PAID", "COMPLETED", "COMPLETE" -> PaymentStatus.COMPLETED;
            case "FAILED", "ERROR", "DECLINED" -> PaymentStatus.FAILED;
            case "CANCELLED", "CANCELED" -> PaymentStatus.CANCELLED;
            case "PROCESSING", "IN_PROGRESS" -> PaymentStatus.PROCESSING;
            default -> PaymentStatus.PENDING;
        };
    }

    private String buildIdempotencyKey(String provider, PaymentCallbackRequest callbackRequest) {
        String source = String.join("|",
                provider != null ? provider : "",
                callbackRequest.getTransactionId() != null ? callbackRequest.getTransactionId() : "",
                callbackRequest.getStatus() != null ? callbackRequest.getStatus() : "",
                callbackRequest.getProviderTransactionId() != null ? callbackRequest.getProviderTransactionId() : "",
                callbackRequest.getEventId() != null ? callbackRequest.getEventId() : "");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(source.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new PaymentException("Unable to build idempotency key for callback processing");
        }
    }

    private String buildSignaturePayload(PaymentCallbackRequest callbackRequest) {
        if (callbackRequest.getRawPayload() != null && !callbackRequest.getRawPayload().isBlank()) {
            return callbackRequest.getRawPayload();
        }

        return String.join("|",
                callbackRequest.getTransactionId() != null ? callbackRequest.getTransactionId() : "",
                callbackRequest.getStatus() != null ? callbackRequest.getStatus() : "",
                callbackRequest.getProviderTransactionId() != null ? callbackRequest.getProviderTransactionId() : "",
                callbackRequest.getEventId() != null ? callbackRequest.getEventId() : "",
                callbackRequest.getNonce() != null ? callbackRequest.getNonce() : "",
                callbackRequest.getCallbackTimestamp() != null ? callbackRequest.getCallbackTimestamp().toString()
                        : "");
    }

    private String resolveWebhookSecret(String provider) {
        if (provider == null) {
            return null;
        }

        if ("MBIRR".equalsIgnoreCase(provider)) {
            return mbirrWebhookSecret;
        }

        if ("TELEBIRR".equalsIgnoreCase(provider)) {
            return telebirrWebhookSecret;
        }

        return null;
    }

    private String hmacSha256Hex(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new PaymentException("Unable to verify callback signature");
        }
    }

    private boolean isWithinReplayWindow(PaymentCallbackRequest callbackRequest) {
        if (callbackRequest.getCallbackTimestamp() == null) {
            return false;
        }

        long provided = callbackRequest.getCallbackTimestamp();
        long providedSeconds = provided > 100_000_000_000L ? provided / 1000 : provided;
        long nowSeconds = Instant.now().getEpochSecond();
        return Math.abs(nowSeconds - providedSeconds) <= callbackMaxSkewSeconds;
    }
}
