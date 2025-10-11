package com.bookmyhotel.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.List;

/**
 * OpenAPI 3.0 configuration for BookMyHotel API documentation
 * Provides comprehensive API documentation with security schemes
 */
@Configuration
public class OpenApiConfig {

    @Value("${app.name:BookMyHotel}")
    private String appName;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(appName + " API")
                        .version("1.0.0")
                        .description("Comprehensive multi-tenant hotel booking and management platform API")
                        .contact(new Contact()
                                .name("BookMyHotel Support")
                                .email("support@shegeroom.com")
                                .url("https://shegeroom.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080/managemyhotel")
                                .description("Development Server"),
                        new Server()
                                .url(appUrl + "/managemyhotel")
                                .description("Production Server")))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Bearer token for authentication"))
                        .addSecuritySchemes("Hotel Context",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-Hotel-ID")
                                        .description("Hotel ID for multi-tenant operations"))
                        .addSecuritySchemes("Tenant Context",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER)
                                        .name("X-Tenant-ID")
                                        .description("Tenant ID for multi-tenant operations")))
                .addSecurityItem(new SecurityRequirement()
                        .addList("Bearer Authentication")
                        .addList("Hotel Context")
                        .addList("Tenant Context"));
    }

    /**
     * Production-specific OpenAPI configuration
     * Removes sensitive endpoints and adds security warnings
     */
    @Bean
    @Profile("production")
    public OpenAPI productionOpenAPI() {
        return customOpenAPI()
                .info(customOpenAPI().getInfo()
                        .description("BookMyHotel Production API - Comprehensive multi-tenant hotel booking platform\n\n" +
                                "⚠️ **PRODUCTION ENVIRONMENT** ⚠️\n" +
                                "This is the live production API. All operations will affect real data.\n\n" +
                                "**Security Requirements:**\n" +
                                "- Valid JWT Bearer token required for all authenticated endpoints\n" +
                                "- Hotel ID header (X-Hotel-ID) required for hotel-specific operations\n" +
                                "- Tenant ID header (X-Tenant-ID) required for multi-tenant operations\n\n" +
                                "**Rate Limiting:**\n" +
                                "- 100 requests per minute per IP address\n" +
                                "- Burst capacity: 150 requests\n\n" +
                                "**Features:**\n" +
                                "- Multi-tenant hotel management\n" +
                                "- Room booking and availability management\n" +
                                "- Payment processing (Stripe, M-birr, Telebirr)\n" +
                                "- Real-time notifications\n" +
                                "- Performance monitoring\n" +
                                "- Security audit logging"));
    }
}