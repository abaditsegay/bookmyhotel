package com.bookmyhotel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS S3 Configuration for hotel image storage
 * Configures S3 client and provides bucket configuration
 */
@Configuration
public class AwsS3Config {

    @Value("${aws.s3.region:us-east-1}")
    private String awsRegion;

    @Value("${aws.s3.bucket.name:bookmyhotel-images}")
    private String bucketName;

    /**
     * Creates and configures S3Client bean
     * Uses DefaultCredentialsProvider which looks for credentials in:
     * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
     * 2. System properties
     * 3. Credential profiles file (~/.aws/credentials)
     * 4. EC2 instance profile
     */
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    /**
     * Get the configured S3 bucket name
     */
    public String getBucketName() {
        return bucketName;
    }

    /**
     * Get the configured AWS region
     */
    public String getAwsRegion() {
        return awsRegion;
    }

    /**
     * Generate S3 URL for a given key
     */
    public String getS3Url(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName, awsRegion, key);
    }

    /**
     * Generate S3 key prefix for hotel images
     */
    public String getHotelImagePrefix(String tenantId, Long hotelId) {
        return String.format("hotels/%s/%d/", tenantId, hotelId);
    }

    /**
     * Generate S3 key prefix for room type images
     * Room type images are stored within the hotel directory but not in room-type-id subdirectories
     */
    public String getRoomTypeImagePrefix(String tenantId, Long hotelId, Long roomTypeId) {
        return String.format("hotels/%s/%d/room-types/", tenantId, hotelId);
    }
}