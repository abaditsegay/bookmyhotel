package com.bookmyhotel.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookmyhotel.service.RoomBulkUploadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/hotel-admin/hotels/{hotelId}/rooms/bulk")
@Tag(name = "Room Bulk Upload", description = "APIs for bulk uploading hotel rooms")
public class RoomBulkUploadController {

    private static final Logger logger = LoggerFactory.getLogger(RoomBulkUploadController.class);

    @Autowired
    private RoomBulkUploadService roomBulkUploadService;

    @Operation(summary = "Upload rooms in bulk from CSV file")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bulk upload completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file format or validation errors"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN') or @hotelSecurity.canAccessHotel(#hotelId)")
    public ResponseEntity<Map<String, Object>> uploadRoomsCsv(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId,

            @Parameter(description = "CSV file containing room data", required = true) @RequestParam("file") MultipartFile file,

            @Parameter(description = "Whether to skip validation errors and import valid rows only") @RequestParam(value = "skipErrors", defaultValue = "false") boolean skipErrors) {

        try {
            Map<String, Object> result = roomBulkUploadService.uploadRoomsFromCsv(hotelId, file, skipErrors);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            // System.err.println("🔥 ERROR in upload: " + e.getMessage());
            logger.error("Operation failed", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        }
    }

    @Operation(summary = "Validate CSV file without importing")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Validation completed"),
            @ApiResponse(responseCode = "400", description = "Invalid file format"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping(value = "/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN') or @hotelSecurity.canAccessHotel(#hotelId)")
    public ResponseEntity<Map<String, Object>> validateCsv(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId,

            @Parameter(description = "CSV file to validate", required = true) @RequestParam("file") MultipartFile file) {

        try {
            Map<String, Object> result = roomBulkUploadService.validateCsv(hotelId, file);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
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
                        "Room Number", "Room Type", "Price Per Night", "Capacity"),
                "optionalColumns", List.of(
                        "Description", "Status", "Is Available"),
                "maxRows", 1000));
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