package com.bookmyhotel.support;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;

public abstract class MySqlIntegrationTestSupport {

    private static final String EXTERNAL_URL = readSetting("integration.mysql.url", "INTEGRATION_MYSQL_URL");

    private static final String EXTERNAL_USERNAME = readSetting("integration.mysql.username",
            "INTEGRATION_MYSQL_USERNAME");

    private static final String EXTERNAL_PASSWORD = readSetting("integration.mysql.password",
            "INTEGRATION_MYSQL_PASSWORD");

    protected static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("bookmyhotel_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        if (EXTERNAL_URL != null && !EXTERNAL_URL.isBlank()) {
            registry.add("spring.datasource.url", () -> EXTERNAL_URL);
            registry.add("spring.datasource.username", () -> defaultIfBlank(EXTERNAL_USERNAME, "root"));
            registry.add("spring.datasource.password", () -> defaultIfBlank(EXTERNAL_PASSWORD, "password"));
            registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
            return;
        }

        if (!MYSQL.isRunning()) {
            MYSQL.start();
        }
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driver-class-name", MYSQL::getDriverClassName);
    }

    private static String readSetting(String propertyName, String environmentName) {
        String propertyValue = System.getProperty(propertyName);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue;
        }

        String environmentValue = System.getenv(environmentName);
        if (environmentValue != null && !environmentValue.isBlank()) {
            return environmentValue;
        }

        return null;
    }

    private static String defaultIfBlank(String value, String fallbackValue) {
        return value == null || value.isBlank() ? fallbackValue : value;
    }
}