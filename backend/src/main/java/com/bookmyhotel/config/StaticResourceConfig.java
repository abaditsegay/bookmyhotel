package com.bookmyhotel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration for serving static image files from local filesystem
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${image.upload.base-directory:/opt/bookmyhotel/uploads/images}")
    private String baseUploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded images from local filesystem
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:" + baseUploadDirectory + "/");
    }
}
