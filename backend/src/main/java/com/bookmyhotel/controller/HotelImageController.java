package com.bookmyhotel.controller;

import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.service.HotelImageService;
import com.bookmyhotel.tenant.TenantContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for managing hotel and room type images
 * Handles image upload, retrieval, and management operations
 */
@RestController
@RequestMapping("/api/hotels/{hotelId}/images")
@Tag(name = "Hotel Images", description = "Hotel and Room Type Image Management")
public class HotelImageController {
    
    private final HotelImageService hotelImageService;
    
    @Autowired
    public HotelImageController(HotelImageService hotelImageService) {
        this.hotelImageService = hotelImageService;
    }
    
    @Operation(summary = "Upload hotel image", description = "Upload an image for a hotel (hero or gallery)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "413", description = "File too large"),
        @ApiResponse(responseCode = "415", description = "Unsupported media type")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadHotelImage(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Image file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Image category") @RequestParam("category") String categoryStr,
            @Parameter(description = "Alt text for accessibility") @RequestParam(value = "altText", required = false) String altText,
            @Parameter(description = "Display order") @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        
        try {
            String tenantId = TenantContext.getTenantId();
            ImageCategory category = ImageCategory.fromCode(categoryStr);
            
            // Validate that this is a hotel image category
            if (!category.isHotelImage()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid category for hotel images"));
            }
            
            HotelImage uploadedImage = hotelImageService.uploadHotelImage(
                tenantId, hotelId, category, file, altText, displayOrder);
            
            Map<String, Object> response = createImageResponse(uploadedImage);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Unexpected error occurred"));
        }
    }
    
    @Operation(summary = "Upload room type image", description = "Upload an image for a specific room type")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "413", description = "File too large"),
        @ApiResponse(responseCode = "415", description = "Unsupported media type")
    })
    @PostMapping(value = "/room-types/{roomTypeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadRoomTypeImage(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Room Type ID") @PathVariable Long roomTypeId,
            @Parameter(description = "Image file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Image category") @RequestParam("category") String categoryStr,
            @Parameter(description = "Alt text for accessibility") @RequestParam(value = "altText", required = false) String altText,
            @Parameter(description = "Display order") @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        
        try {
            String tenantId = TenantContext.getTenantId();
            ImageCategory category = ImageCategory.fromCode(categoryStr);
            
            // Validate that this is a room type image category
            if (!category.isRoomTypeImage()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Invalid category for room type images"));
            }
            
            HotelImage uploadedImage = hotelImageService.uploadRoomTypeImage(
                tenantId, hotelId, roomTypeId, category, file, altText, displayOrder);
            
            Map<String, Object> response = createImageResponse(uploadedImage);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload image: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Unexpected error occurred"));
        }
    }
    
    @Operation(summary = "Get hotel images", description = "Retrieve all active images for a hotel")
    @ApiResponse(responseCode = "200", description = "Images retrieved successfully")
    @GetMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN') or hasRole('STAFF') or hasRole('GUEST')")
    public ResponseEntity<Map<String, Object>> getHotelImages(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId) {
        
        String tenantId = TenantContext.getTenantId();
        List<HotelImage> images = hotelImageService.getHotelImages(tenantId, hotelId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", images.stream().map(this::createImageResponse).toArray());
        response.put("total", images.size());
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Get room type images", description = "Retrieve all active images for a room type")
    @ApiResponse(responseCode = "200", description = "Images retrieved successfully")
    @GetMapping("/room-types/{roomTypeId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN') or hasRole('STAFF') or hasRole('GUEST')")
    public ResponseEntity<Map<String, Object>> getRoomTypeImages(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Room Type ID") @PathVariable Long roomTypeId) {
        
        String tenantId = TenantContext.getTenantId();
        List<HotelImage> images = hotelImageService.getRoomTypeImages(tenantId, hotelId, roomTypeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", images.stream().map(this::createImageResponse).toArray());
        response.put("total", images.size());
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Get hotel hero image", description = "Retrieve the main hero image for a hotel")
    @ApiResponse(responseCode = "200", description = "Hero image retrieved or null if not found")
    @GetMapping("/hero")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN') or hasRole('STAFF') or hasRole('GUEST')")
    public ResponseEntity<Map<String, Object>> getHotelHeroImage(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId) {
        
        String tenantId = TenantContext.getTenantId();
        Optional<HotelImage> heroImage = hotelImageService.getHotelHeroImage(tenantId, hotelId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        
        if (heroImage.isPresent()) {
            response.put("data", createImageResponse(heroImage.get()));
        } else {
            response.put("data", null);
            response.put("message", "No hero image found for this hotel");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Get room type hero image", description = "Retrieve the main hero image for a room type")
    @ApiResponse(responseCode = "200", description = "Hero image retrieved or null if not found")
    @GetMapping("/room-types/{roomTypeId}/hero")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN') or hasRole('STAFF') or hasRole('GUEST')")
    public ResponseEntity<Map<String, Object>> getRoomTypeHeroImage(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Room Type ID") @PathVariable Long roomTypeId) {
        
        String tenantId = TenantContext.getTenantId();
        Optional<HotelImage> heroImage = hotelImageService.getRoomTypeHeroImage(tenantId, hotelId, roomTypeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        
        if (heroImage.isPresent()) {
            response.put("data", createImageResponse(heroImage.get()));
        } else {
            response.put("data", null);
            response.put("message", "No hero image found for this room type");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "Delete image", description = "Soft delete an image")
    @ApiResponse(responseCode = "200", description = "Image deleted successfully")
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteImage(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Image ID") @PathVariable Long imageId) {
        
        try {
            String tenantId = TenantContext.getTenantId();
            hotelImageService.deleteImage(tenantId, imageId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalAccessError e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("Access denied"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete image"));
        }
    }
    
    @Operation(summary = "Update image display order", description = "Update the display order of an image")
    @ApiResponse(responseCode = "200", description = "Display order updated successfully")
    @PatchMapping("/{imageId}/display-order")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateDisplayOrder(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Image ID") @PathVariable Long imageId,
            @Parameter(description = "New display order") @RequestParam Integer displayOrder) {
        
        try {
            String tenantId = TenantContext.getTenantId();
            hotelImageService.updateDisplayOrder(tenantId, imageId, displayOrder);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Display order updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalAccessError e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("Access denied"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update display order"));
        }
    }
    
    @Operation(summary = "Update image alt text", description = "Update the alt text of an image")
    @ApiResponse(responseCode = "200", description = "Alt text updated successfully")
    @PatchMapping("/{imageId}/alt-text")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateAltText(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId,
            @Parameter(description = "Image ID") @PathVariable Long imageId,
            @Parameter(description = "New alt text") @RequestParam String altText) {
        
        try {
            String tenantId = TenantContext.getTenantId();
            hotelImageService.updateAltText(tenantId, imageId, altText);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Alt text updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalAccessError e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("Access denied"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update alt text"));
        }
    }
    
    // Helper methods
    
    private Map<String, Object> createImageResponse(HotelImage image) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", image.getId());
        response.put("fileName", image.getFileName());
        response.put("filePath", image.getFilePath());
        response.put("category", image.getImageCategory().getCode());
        response.put("categoryDisplayName", image.getImageCategory().getDisplayName());
        response.put("displayOrder", image.getDisplayOrder());
        response.put("altText", image.getEffectiveAltText());
        response.put("fileSize", image.getFileSize());
        response.put("mimeType", image.getMimeType());
        response.put("width", image.getWidth());
        response.put("height", image.getHeight());
        response.put("hotelId", image.getHotelId());
        response.put("roomTypeId", image.getRoomTypeId());
        response.put("isHotelImage", image.isHotelImage());
        response.put("isRoomTypeImage", image.isRoomTypeImage());
        response.put("isHeroImage", image.isHeroImage());
        response.put("isGalleryImage", image.isGalleryImage());
        response.put("createdAt", image.getCreatedAt());
        response.put("updatedAt", image.getUpdatedAt());
        return response;
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}