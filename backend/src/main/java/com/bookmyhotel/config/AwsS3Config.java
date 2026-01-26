package com.bookmyhotel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
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

    @Value("${aws.s3.access-key-id:}")
    private String accessKeyId;

    @Value("${aws.s3.secret-access-key:}")
    private String secretAccessKey;

    /**
     * Creates and configures S3Client bean
     * Uses static credentials from application properties if available,
     * otherwise falls back to DefaultCredentialsProvider
     */
    @Bean
    public S3Client s3Client() {
        // Use static credentials if provided, otherwise use default credential chain
        if (accessKeyId != null && !accessKeyId.isBlank() &&
                secretAccessKey != null && !secretAccessKey.isBlank()) {
            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

            return S3Client.builder()
                    .region(Region.of(awsRegion))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();
        } else {
            // Fall back to default credential provider chain
            return S3Client.builder()
                    .region(Region.of(awsRegion))
                    .credentialsProvider(software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create())
                    .build();
        }
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
        return String.format("tenants/%s/hotels/%d/", tenantId, hotelId);
    }

    /**
     * Generate S3 key prefix for room type images
     * Room type images are stored within the hotel directory in room-types
     * subfolder
     */
    public String getRoomTypeImagePrefix(String tenantId, Long hotelId, Long roomTypeId) {
        return String.format("tenants/%s/hotels/%d/room-types/", tenantId, hotelId);
    }
}