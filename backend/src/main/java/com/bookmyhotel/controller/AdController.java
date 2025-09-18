package com.bookmyhotel.controller;

import com.bookmyhotel.dto.AdRequest;
import com.bookmyhotel.dto.AdResponse;
import com.bookmyhotel.service.AdService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing advertisements
 */
@RestController
@RequestMapping("/api/ads")
@Tag(name = "Advertisements", description = "Advertisement management operations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdController {

        @Autowired
        private AdService adService;

        /**
         * Get random active ads for home page (public endpoint)
         */
        @GetMapping("/random")
        @Operation(summary = "Get random active ads", description = "Get random active advertisements for the home page")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved random ads"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<List<AdResponse>> getRandomActiveAds(
                        @Parameter(description = "Number of ads to return", example = "5") @RequestParam(defaultValue = "5") int limit) {
                List<AdResponse> ads = adService.getRandomActiveAds(limit);
                return ResponseEntity.ok(ads);
        }

        /**
         * Get all ads for current tenant
         */
        @GetMapping
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Get all ads for current tenant")
        public ResponseEntity<List<AdResponse>> getAllAds() {
                List<AdResponse> ads = adService.getAllAds();
                return ResponseEntity.ok(ads);
        }

        /**
         * Get ads by hotel ID
         */
        @GetMapping("/hotel/{hotelId}")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Get ads by hotel", description = "Get advertisements for a specific hotel")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved hotel ads"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "403", description = "Forbidden"),
                        @ApiResponse(responseCode = "404", description = "Hotel not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<List<AdResponse>> getAdsByHotel(
                        @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId) {

                List<AdResponse> ads = adService.getAdsByHotel(hotelId);
                return ResponseEntity.ok(ads);
        }

        /**
         * Get ad by ID
         */
        @GetMapping("/{id}")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Get ad by ID", description = "Get advertisement by its ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved ad"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "403", description = "Forbidden"),
                        @ApiResponse(responseCode = "404", description = "Ad not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<AdResponse> getAdById(
                        @Parameter(description = "Ad ID", required = true) @PathVariable Long id) {
                AdResponse ad = adService.getAdById(id);
                return ResponseEntity.ok(ad);
        }

        /**
         * Create a new ad
         */
        @PostMapping
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Create new ad", description = "Create a new advertisement")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Ad created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "403", description = "Forbidden"),
                        @ApiResponse(responseCode = "404", description = "Hotel not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<AdResponse> createAd(
                        @Parameter(description = "Ad creation request", required = true) @Valid @RequestBody AdRequest request) {
                AdResponse createdAd = adService.createAd(request);
                return ResponseEntity.status(HttpStatus.CREATED).body(createdAd);
        }

        /**
         * Update an existing ad
         */
        @PutMapping("/{id}")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Update ad", description = "Update an existing advertisement")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Ad updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "403", description = "Forbidden"),
                        @ApiResponse(responseCode = "404", description = "Ad not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<AdResponse> updateAd(
                        @Parameter(description = "Ad ID", required = true) @PathVariable Long id,
                        @Parameter(description = "Ad update request", required = true) @Valid @RequestBody AdRequest request) {
                AdResponse updatedAd = adService.updateAd(id, request);
                return ResponseEntity.ok(updatedAd);
        }

        /**
         * Delete an ad
         */
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Delete ad", description = "Delete an advertisement")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Ad deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "403", description = "Forbidden"),
                        @ApiResponse(responseCode = "404", description = "Ad not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<Void> deleteAd(
                        @Parameter(description = "Ad ID", required = true) @PathVariable Long id) {
                adService.deleteAd(id);
                return ResponseEntity.noContent().build();
        }

        /**
         * Track ad click (public endpoint)
         */
        @PostMapping("/{id}/click")
        @Operation(summary = "Track ad click", description = "Track a click on an advertisement")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Click tracked successfully"),
                        @ApiResponse(responseCode = "404", description = "Ad not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<Void> trackAdClick(
                        @Parameter(description = "Ad ID", required = true) @PathVariable Long id) {
                adService.trackClick(id);
                return ResponseEntity.ok().build();
        }

        /**
         * Toggle ad active status
         */
        @PatchMapping("/{id}/toggle")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Toggle ad status", description = "Toggle advertisement active/inactive status")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Ad status toggled successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "403", description = "Forbidden"),
                        @ApiResponse(responseCode = "404", description = "Ad not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<AdResponse> toggleAdStatus(
                        @Parameter(description = "Ad ID", required = true) @PathVariable Long id) {
                AdResponse updatedAd = adService.toggleAdStatus(id);
                return ResponseEntity.ok(updatedAd);
        }

        /**
         * Get active ads for current tenant
         */
        @GetMapping("/active")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HOTEL_ADMIN')")
        @Operation(summary = "Get active ads", description = "Get active advertisements for current tenant")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved active ads"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<List<AdResponse>> getActiveAds() {
                List<AdResponse> ads = adService.getActiveAds();
                return ResponseEntity.ok(ads);
        }
}
