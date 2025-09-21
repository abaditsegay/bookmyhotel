package com.bookmyhotel.controller;

import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.service.HotelImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Public REST Controller for hotel images
 * Provides public access to hotel images for display in hotel search and details
 */
@RestController
@RequestMapping("/api/public/hotels/{hotelId}/images")
@CrossOrigin(origins = "*")
@Tag(name = "Public Hotel Images", description = "Public access to hotel images")
public class PublicHotelImageController {
    
    private final HotelImageService hotelImageService;
    
    @Autowired
    public PublicHotelImageController(HotelImageService hotelImageService) {
        this.hotelImageService = hotelImageService;
    }
    
    @Operation(summary = "Get hotel images", description = "Retrieve all active images for a hotel (public access)")
    @ApiResponse(responseCode = "200", description = "Images retrieved successfully")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHotelImages(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId) {
        
        try {
            // Get images for all tenants - we need to find the tenant for this hotel
            // For now, we'll check all tenant images until we find this hotel
            List<HotelImage> images = hotelImageService.getHotelImagesPublic(hotelId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", images.stream().map(this::createImageResponse).toArray());
            response.put("total", images.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to get hotel images");
            return ResponseEntity.ok(response); // Return 200 with error message for public API
        }
    }
    
    @Operation(summary = "Get hotel hero image", description = "Retrieve the main hero image for a hotel (public access)")
    @ApiResponse(responseCode = "200", description = "Hero image retrieved or null if not found")
    @GetMapping("/hero")
    public ResponseEntity<Map<String, Object>> getHotelHeroImage(
            @Parameter(description = "Hotel ID") @PathVariable Long hotelId) {
        
        try {
            Optional<HotelImage> heroImage = hotelImageService.getHotelHeroImagePublic(hotelId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            
            if (heroImage.isPresent()) {
                response.put("data", createImageResponse(heroImage.get()));
            } else {
                response.put("data", null);
                response.put("message", "No hero image found for this hotel");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to get hotel hero image");
            return ResponseEntity.ok(response); // Return 200 with error message for public API
        }
    }
    
    // Helper method to create image response
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
}