package com.bookmyhotel.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.bookmyhotel.config.MicrosoftGraphConfig;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@Service
public class MicrosoftGraphEmailService {

    private static final Logger logger = LoggerFactory.getLogger(MicrosoftGraphEmailService.class);
    
    @Autowired
    private MicrosoftGraphConfig microsoftGraphConfig;
    
    @Value("${app.email.from:noreply@bookmyhotel.com}")
    private String fromEmail;

    private final WebClient webClient;
    private String accessToken;
    private long tokenExpiryTime;

    public MicrosoftGraphEmailService() {
        this.webClient = WebClient.builder().build();
    }

    /**
     * Check if Microsoft Graph is properly configured
     */
    public boolean isConfigured() {
        return microsoftGraphConfig.isConfigured();
    }

    private String getAccessToken() {
        if (!isConfigured()) {
            throw new IllegalStateException("Microsoft Graph OAuth2 is not configured. Please set environment variables: MICROSOFT_GRAPH_CLIENT_ID, MICROSOFT_GRAPH_TENANT_ID, MICROSOFT_GRAPH_CLIENT_SECRET");
        }

        if (accessToken == null || System.currentTimeMillis() >= tokenExpiryTime) {
            try {
                Map<String, String> tokenRequest = new HashMap<>();
                tokenRequest.put("client_id", microsoftGraphConfig.getClientId());
                tokenRequest.put("client_secret", microsoftGraphConfig.getClientSecret());
                tokenRequest.put("scope", microsoftGraphConfig.getScopes());
                tokenRequest.put("grant_type", "client_credentials");

                String tokenEndpoint = String.format("https://login.microsoftonline.com/%s/oauth2/v2.0/token", 
                                                   microsoftGraphConfig.getTenantId());

                Map<String, Object> tokenResponse = webClient.post()
                    .uri(tokenEndpoint)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .bodyValue(buildFormData(tokenRequest))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

                if (tokenResponse != null && tokenResponse.containsKey("access_token")) {
                    accessToken = (String) tokenResponse.get("access_token");
                    int expiresIn = (Integer) tokenResponse.get("expires_in");
                    tokenExpiryTime = System.currentTimeMillis() + (expiresIn * 1000L) - 60000; // Refresh 1 minute early
                    logger.info("Successfully obtained Microsoft Graph access token");
                } else {
                    throw new RuntimeException("Failed to obtain access token from Microsoft Graph");
                }
            } catch (Exception e) {
                logger.error("Failed to obtain Microsoft Graph access token", e);
                throw new RuntimeException("Failed to authenticate with Microsoft Graph", e);
            }
        }
        return accessToken;
    }

    public void sendEmail(String to, String subject, String htmlContent) {
        if (!isConfigured()) {
            logger.warn("Microsoft Graph OAuth2 is not configured. Cannot send email via Microsoft Graph API.");
            throw new IllegalStateException("Microsoft Graph OAuth2 is not configured. Email service unavailable.");
        }

        try {
            String token = getAccessToken();
            
            Map<String, Object> emailMessage = buildEmailMessage(to, subject, htmlContent);
            String endpoint = "https://graph.microsoft.com/v1.0/users/" + fromEmail + "/sendMail";
            
            logger.info("Sending email via Microsoft Graph - From: {}, To: {}, Subject: {}", fromEmail, to, subject);

            webClient.post()
                .uri(endpoint)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(emailMessage)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> logger.info("Microsoft Graph API response: {}", response))
                .doOnError(error -> logger.error("Microsoft Graph API error: {}", error.getMessage()))
                .block();

            logger.info("Email sent successfully to: {} via Microsoft Graph", to);
        } catch (Exception e) {
            logger.error("Failed to send email to: {} via Microsoft Graph. Error: {}", to, e.getMessage(), e);
            throw new RuntimeException("Failed to send email via Microsoft Graph: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> buildEmailMessage(String to, String subject, String htmlContent) {
        Map<String, Object> message = new HashMap<>();
        message.put("subject", subject);
        
        Map<String, Object> body = new HashMap<>();
        body.put("contentType", "HTML");
        body.put("content", htmlContent);
        message.put("body", body);
        
        Map<String, Object> emailAddress = new HashMap<>();
        emailAddress.put("address", to);
        emailAddress.put("name", to);
        
        Map<String, Object> recipient = new HashMap<>();
        recipient.put("emailAddress", emailAddress);
        message.put("toRecipients", List.of(recipient));
        
        Map<String, Object> emailRequest = new HashMap<>();
        emailRequest.put("message", message);
        emailRequest.put("saveToSentItems", true);
        
        return emailRequest;
    }

    private String buildFormData(Map<String, String> data) {
        StringBuilder formData = new StringBuilder();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            if (formData.length() > 0) {
                formData.append("&");
            }
            formData.append(entry.getKey()).append("=").append(entry.getValue());
        }
        return formData.toString();
    }
}
