package com.bookmyhotel.controller;

import com.bookmyhotel.service.RoomBulkUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hotels/{hotelId}/rooms/bulk")
@RequiredArgsConstructor
@Tag(name = "Room Bulk Upload", description = "APIs for bulk uploading hotel rooms")
public class RoomBulkUploadController {

    private final RoomBulkUploadService roomBulkUploadService;

    @Operation(summary = "Upload rooms in bulk from CSV file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bulk upload completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file format or validation errors"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadRoomsCsv(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            
            @Parameter(description = "CSV file containing room data", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Whether to skip validation errors and import valid rows only")
            @RequestParam(value = "skipErrors", defaultValue = "false") boolean skipErrors) {
        
        try {
            String result = roomBulkUploadService.uploadRoomsFromCsv(hotelId, file, skipErrors);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", result,
                "totalRows", 0,
                "successfulRows", 0,
                "errorCount", 0
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Validate CSV file without importing")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation completed"),
        @ApiResponse(responseCode = "400", description = "Invalid file format"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping(value = "/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> validateCsv(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            
            @Parameter(description = "CSV file to validate", required = true)
            @RequestParam("file") MultipartFile file) {
        
        try {
            String result = roomBulkUploadService.validateCsv(hotelId, file);
            boolean success = result.contains("passed");
            
            return ResponseEntity.ok(Map.of(
                "success", success,
                "message", result,
                "validationErrors", List.of()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Get upload template information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Template info retrieved successfully")
    })
    @GetMapping("/template-info")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getTemplateInfo() {
        return ResponseEntity.ok(Map.of(
            "templateUrl", "/templates/hotel-rooms-template.csv",
            "guideUrl", "/templates/room-upload-guide.md",
            "maxFileSize", "5MB",
            "supportedFormats", List.of("CSV"),
            "requiredColumns", List.of(
                "Room Number", "Room Type", "Floor", "Capacity", "Base Price"
            ),
            "optionalColumns", List.of(
                "Description", "Amenities", "Status", "Size (sqft)", 
                "Bed Type", "View Type", "Has Balcony", "Has Kitchenette", 
                "Accessibility Features"
            ),
            "maxRows", 1000
        ));
    }

    @Operation(summary = "Download template CSV file")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Template downloaded successfully"),
        @ApiResponse(responseCode = "404", description = "Template file not found")
    })
    @GetMapping("/template")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] templateData = roomBulkUploadService.getTemplateFile();
            
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=hotel-rooms-template.csv")
                .header("Content-Type", "text/csv")
                .body(templateData);
                
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}