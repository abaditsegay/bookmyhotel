package com.bookmyhotel.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;

/**
 * Configuration for Microsoft Graph OAuth2 integration
 */
@Configuration
@ConfigurationProperties(prefix = "microsoft.graph")
public class MicrosoftGraphConfig {

    private static final Logger logger = LoggerFactory.getLogger(MicrosoftGraphConfig.class);
    private static final String PLACEHOLDER_CLIENT_ID = "your-client-id";
    private static final String PLACEHOLDER_CLIENT_SECRET = "your-client-secret";
    private static final String PLACEHOLDER_TENANT_ID = "your-tenant-id";

    private String clientId;
    private String clientSecret;
    private String tenantId;
    private String scopes = "https://graph.microsoft.com/.default";

    @PostConstruct
    public void validateConfiguration() {
        logger.info("Validating Microsoft Graph OAuth2 configuration...");

        boolean isConfigured = isConfigured();
        
        if (isConfigured) {
            logger.info("✅ Microsoft Graph OAuth2 is properly configured");
            logger.info("Client ID: {}...", clientId.substring(0, Math.min(8, clientId.length())));
            logger.info("Tenant ID: {}...", tenantId.substring(0, Math.min(8, tenantId.length())));
            logger.info("Scopes: {}", scopes);
        } else {
            logger.warn("⚠️  Microsoft Graph OAuth2 is NOT configured");
            logger.warn("Please set the following environment variables:");
            logger.warn("- MICROSOFT_GRAPH_CLIENT_ID");
            logger.warn("- MICROSOFT_GRAPH_TENANT_ID");
            logger.warn("- MICROSOFT_GRAPH_CLIENT_SECRET");
            logger.warn("Email service will fall back to SMTP if available");
        }
    }

    public boolean isConfigured() {
        return isMeaningfulValue(clientId, PLACEHOLDER_CLIENT_ID)
                && isMeaningfulValue(clientSecret, PLACEHOLDER_CLIENT_SECRET)
                && isMeaningfulValue(tenantId, PLACEHOLDER_TENANT_ID);
    }

    private boolean isMeaningfulValue(String value, String placeholderValue) {
        return StringUtils.hasText(value) && !placeholderValue.equalsIgnoreCase(value.trim());
    }

    // Getters and Setters
    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }
}