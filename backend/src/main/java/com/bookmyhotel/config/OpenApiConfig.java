package com.bookmyhotel.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3.0 configuration for BookMyHotel API documentation
 */
@Configuration
public class OpenApiConfig {

        @Value("${app.email.support:support@bakaroo.com}")
        private String supportEmail;

        @Bean
        public OpenAPI customOpenAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("BookMyHotel API")
                                                .version("1.0.0")
                                                .description("Hotel booking and management API")
                                                .contact(new Contact()
                                                                .name("BookMyHotel Support")
                                                                .email(supportEmail))
                                                .license(new License()
                                                                .name("MIT License")
                                                                .url("https://opensource.org/licenses/MIT")));
        }
}