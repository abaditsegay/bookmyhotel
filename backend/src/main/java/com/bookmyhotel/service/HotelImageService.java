package com.bookmyhotel.service;

import com.bookmyhotel.config.AwsS3Config;
import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.repository.HotelImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing hotel and room type images in AWS S3
 * Handles upload, deletion, and retrieval of images with multi-tenant support
 */
@Service
@Transactional
public class HotelImageService {

    private final S3Client s3Client;
    private final AwsS3Config awsS3Config;
    private final HotelImageRepository hotelImageRepository;

    // Supported image formats
    private static final String[] ALLOWED_EXTENSIONS = { "jpg", "jpeg", "png", "webp" };
    private static final String[] ALLOWED_CONTENT_TYPES = {
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    };

    // Image size limits
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_WIDTH = 2048;
    private static final int MAX_HEIGHT = 2048;

    @Autowired
    public HotelImageService(S3Client s3Client, AwsS3Config awsS3Config,
            HotelImageRepository hotelImageRepository) {
        this.s3Client = s3Client;
        this.awsS3Config = awsS3Config;
        this.hotelImageRepository = hotelImageRepository;
    }

    /**
     * Upload a hotel image (not associated with a room type)
     */
    public HotelImage uploadHotelImage(String tenantId, Long hotelId,
            ImageCategory imageCategory, MultipartFile file,
            String altText, Integer displayOrder) throws IOException {

        validateImageCategory(imageCategory, true);
        validateFile(file);

        // Check if hotel already has a hero image (only one allowed)
        if (imageCategory.isHeroImage()) {
            if (hotelImageRepository.existsByTenantIdAndHotelIdAndRoomTypeIdIsNullAndImageCategoryAndIsActiveTrue(
                    tenantId, hotelId, imageCategory)) {
                throw new IllegalStateException("Hotel already has a hero image");
            }
        }

        String key = generateS3Key(tenantId, hotelId, null, imageCategory, file.getOriginalFilename());
        String s3Url = uploadToS3(key, file);

        // Get image dimensions
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
        Integer width = bufferedImage != null ? bufferedImage.getWidth() : null;
        Integer height = bufferedImage != null ? bufferedImage.getHeight() : null;

        // Set display order if not provided
        if (displayOrder == null) {
            displayOrder = hotelImageRepository.getNextDisplayOrder(tenantId, hotelId, null, imageCategory);
        }

        HotelImage hotelImage = new HotelImage();
        hotelImage.setTenantId(tenantId);
        hotelImage.setHotelId(hotelId);
        hotelImage.setImageCategory(imageCategory);
        hotelImage.setFileName(file.getOriginalFilename());
        hotelImage.setFilePath(s3Url);
        hotelImage.setDisplayOrder(displayOrder);
        hotelImage.setAltText(altText);
        hotelImage.setFileSize(file.getSize());
        hotelImage.setMimeType(file.getContentType());
        hotelImage.setWidth(width);
        hotelImage.setHeight(height);
        hotelImage.setIsActive(true);

        return hotelImageRepository.save(hotelImage);
    }

    /**
     * Upload a room type image
     */
    public HotelImage uploadRoomTypeImage(String tenantId, Long hotelId, Long roomTypeId,
            ImageCategory imageCategory, MultipartFile file,
            String altText, Integer displayOrder) throws IOException {

        validateImageCategory(imageCategory, false);
        validateFile(file);

        // Check if room type already has a hero image (only one allowed)
        if (imageCategory.isHeroImage()) {
            if (hotelImageRepository.existsByTenantIdAndHotelIdAndRoomTypeIdAndImageCategoryAndIsActiveTrue(
                    tenantId, hotelId, roomTypeId, imageCategory)) {
                throw new IllegalStateException("Room type already has a hero image");
            }
        }

        String key = generateS3Key(tenantId, hotelId, roomTypeId, imageCategory, file.getOriginalFilename());
        String s3Url = uploadToS3(key, file);

        // Get image dimensions
        BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
        Integer width = bufferedImage != null ? bufferedImage.getWidth() : null;
        Integer height = bufferedImage != null ? bufferedImage.getHeight() : null;

        // Set display order if not provided
        if (displayOrder == null) {
            displayOrder = hotelImageRepository.getNextDisplayOrder(tenantId, hotelId, roomTypeId, imageCategory);
        }

        HotelImage hotelImage = new HotelImage();
        hotelImage.setTenantId(tenantId);
        hotelImage.setHotelId(hotelId);
        hotelImage.setRoomTypeId(roomTypeId);
        hotelImage.setImageCategory(imageCategory);
        hotelImage.setFileName(file.getOriginalFilename());
        hotelImage.setFilePath(s3Url);
        hotelImage.setDisplayOrder(displayOrder);
        hotelImage.setAltText(altText);
        hotelImage.setFileSize(file.getSize());
        hotelImage.setMimeType(file.getContentType());
        hotelImage.setWidth(width);
        hotelImage.setHeight(height);
        hotelImage.setIsActive(true);

        return hotelImageRepository.save(hotelImage);
    }

    /**
     * Get all active images for a hotel
     */
    @Transactional(readOnly = true)
    public List<HotelImage> getHotelImages(String tenantId, Long hotelId) {
        return hotelImageRepository.findByTenantIdAndHotelIdAndRoomTypeIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc(
                tenantId, hotelId);
    }

    /**
     * Get all active images for a room type
     */
    @Transactional(readOnly = true)
    public List<HotelImage> getRoomTypeImages(String tenantId, Long hotelId, Long roomTypeId) {
        return hotelImageRepository.findByTenantIdAndHotelIdAndRoomTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(
                tenantId, hotelId, roomTypeId);
    }

    /**
     * Get hero image for hotel
     */
    @Transactional(readOnly = true)
    public Optional<HotelImage> getHotelHeroImage(String tenantId, Long hotelId) {
        return hotelImageRepository.findByTenantIdAndHotelIdAndImageCategoryAndIsActiveTrue(
                tenantId, hotelId, ImageCategory.HOTEL_HERO);
    }

    /**
     * Get hero image for room type
     */
    @Transactional(readOnly = true)
    public Optional<HotelImage> getRoomTypeHeroImage(String tenantId, Long hotelId, Long roomTypeId) {
        return hotelImageRepository.findByTenantIdAndHotelIdAndRoomTypeIdAndImageCategoryAndIsActiveTrue(
                tenantId, hotelId, roomTypeId, ImageCategory.ROOM_TYPE_HERO);
    }

    /**
     * Delete an image (soft delete)
     */
    public void deleteImage(String tenantId, Long imageId) {
        Optional<HotelImage> imageOpt = hotelImageRepository.findById(imageId);
        if (imageOpt.isPresent()) {
            HotelImage image = imageOpt.get();

            // Verify tenant access
            if (!image.getTenantId().equals(tenantId)) {
                throw new IllegalAccessError("Access denied to image");
            }

            // Soft delete
            image.setIsActive(false);
            hotelImageRepository.save(image);

            // Optionally delete from S3 (uncomment if you want hard delete)
            // deleteFromS3(extractS3KeyFromUrl(image.getFilePath()));
        }
    }

    /**
     * Update image display order
     */
    public void updateDisplayOrder(String tenantId, Long imageId, Integer newDisplayOrder) {
        Optional<HotelImage> imageOpt = hotelImageRepository.findById(imageId);
        if (imageOpt.isPresent()) {
            HotelImage image = imageOpt.get();

            // Verify tenant access
            if (!image.getTenantId().equals(tenantId)) {
                throw new IllegalAccessError("Access denied to image");
            }

            image.setDisplayOrder(newDisplayOrder);
            hotelImageRepository.save(image);
        }
    }

    /**
     * Update image alt text
     */
    public void updateAltText(String tenantId, Long imageId, String newAltText) {
        Optional<HotelImage> imageOpt = hotelImageRepository.findById(imageId);
        if (imageOpt.isPresent()) {
            HotelImage image = imageOpt.get();

            // Verify tenant access
            if (!image.getTenantId().equals(tenantId)) {
                throw new IllegalAccessError("Access denied to image");
            }

            image.setAltText(newAltText);
            hotelImageRepository.save(image);
        }
    }

    // Private helper methods

    private void validateImageCategory(ImageCategory category, boolean isHotelImage) {
        if (isHotelImage && !category.isHotelImage()) {
            throw new IllegalArgumentException("Invalid image category for hotel image");
        }
        if (!isHotelImage && !category.isRoomTypeImage()) {
            throw new IllegalArgumentException("Invalid image category for room type image");
        }
    }

    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size exceeds maximum limit of " + (MAX_FILE_SIZE / 1024 / 1024) + "MB");
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("File must have a valid name");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        boolean validExtension = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                validExtension = true;
                break;
            }
        }

        if (!validExtension) {
            throw new IllegalArgumentException("File extension not allowed. Allowed extensions: " +
                    String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Check MIME type
        String contentType = file.getContentType();
        boolean validContentType = false;
        if (contentType != null) {
            for (String allowedType : ALLOWED_CONTENT_TYPES) {
                if (allowedType.equals(contentType)) {
                    validContentType = true;
                    break;
                }
            }
        }

        if (!validContentType) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " +
                    String.join(", ", ALLOWED_CONTENT_TYPES));
        }

        // Validate image dimensions
        try {
            BufferedImage bufferedImage = ImageIO.read(file.getInputStream());
            if (bufferedImage != null) {
                if (bufferedImage.getWidth() > MAX_WIDTH || bufferedImage.getHeight() > MAX_HEIGHT) {
                    throw new IllegalArgumentException(
                            String.format("Image dimensions exceed maximum allowed size of %dx%d pixels",
                                    MAX_WIDTH, MAX_HEIGHT));
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Unable to read image file", e);
        }
    }

    private String generateS3Key(String tenantId, Long hotelId, Long roomTypeId,
            ImageCategory category, String originalFilename) {
        String prefix;
        if (roomTypeId == null) {
            prefix = awsS3Config.getHotelImagePrefix(tenantId, hotelId);
        } else {
            prefix = awsS3Config.getRoomTypeImagePrefix(tenantId, hotelId, roomTypeId);
        }

        String extension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + "." + extension;

        return prefix + category.getCode() + "/" + filename;
    }

    private String uploadToS3(String key, MultipartFile file) throws IOException {
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(awsS3Config.getBucketName())
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return awsS3Config.getS3Url(key);
        } catch (Exception e) {
            throw new IOException("Failed to upload file to S3", e);
        }
    }

    private void deleteFromS3(String key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(awsS3Config.getBucketName())
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    private String extractS3KeyFromUrl(String s3Url) {
        // Extract S3 key from full URL
        String bucketUrl = String.format("https://%s.s3.%s.amazonaws.com/",
                awsS3Config.getBucketName(), awsS3Config.getAwsRegion());
        if (s3Url.startsWith(bucketUrl)) {
            return s3Url.substring(bucketUrl.length());
        }
        return s3Url; // Return as-is if format is unexpected
    }
}