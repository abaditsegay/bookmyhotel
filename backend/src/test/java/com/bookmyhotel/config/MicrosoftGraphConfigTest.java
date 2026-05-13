package com.bookmyhotel.config;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class MicrosoftGraphConfigTest {

    @Test
    void isConfiguredShouldReturnFalseForPlaceholderDefaults() {
        MicrosoftGraphConfig config = new MicrosoftGraphConfig();
        config.setClientId("your-client-id");
        config.setTenantId("your-tenant-id");
        config.setClientSecret("your-client-secret");

        assertFalse(config.isConfigured());
    }

    @Test
    void isConfiguredShouldReturnTrueForRealLookingCredentials() {
        MicrosoftGraphConfig config = new MicrosoftGraphConfig();
        config.setClientId("12345678-1234-1234-1234-123456789abc");
        config.setTenantId("87654321-4321-4321-4321-cba987654321");
        config.setClientSecret("not-a-placeholder-secret");

        assertTrue(config.isConfigured());
    }
}