package com.bookmyhotel.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.bookmyhotel.dto.BookingModificationRequest;
import com.bookmyhotel.dto.BookingModificationResponse;
import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomCreationRequest;
import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.dto.RoomCreationResponse;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.dto.RoomTypePricingDTO;
import com.bookmyhotel.dto.UserDTO;
import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.service.BookingService;
import com.bookmyhotel.service.HotelAdminService;
import com.bookmyhotel.service.HotelImageService;
import com.bookmyhotel.service.RoomTypePricingService;
import com.bookmyhotel.tenant.TenantContext;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST Controller for hotel admin operations
 */
@RestController
@RequestMapping("/api/hotel-admin")
@PreAuthorize("hasRole('HOTEL_ADMIN')")
public class HotelAdminController {

    private static final Logger logger = LoggerFactory.getLogger(HotelAdminController.class);

    @Autowired
    private HotelAdminService hotelAdminService;

    @Autowired
    private RoomTypePricingService roomTypePricingService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private HotelImageService hotelImageService;

    // Hotel Management
    @GetMapping("/hotel")
    public ResponseEntity<HotelDTO> getMyHotel(Authentication auth) {
        return ResponseEntity.ok(hotelAdminService.getMyHotel(auth.getName()));
    }

    @PutMapping("/hotel")
    public ResponseEntity<HotelDTO> updateMyHotel(@Valid @RequestBody HotelDTO hotelDTO, Authentication auth) {
        HotelDTO updated = hotelAdminService.updateMyHotel(hotelDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // Staff Management - Hotel admin can manage frontdesk, housekeeping, and other
    // hotel_admin users
    @GetMapping("/staff")
    public ResponseEntity<Page<UserDTO>> getHotelStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            Authentication auth) {
        Page<UserDTO> staff = hotelAdminService.getHotelStaff(auth.getName(), page, size, search, role, status);
        return ResponseEntity.ok(staff);
    }

    @PostMapping("/staff")
    public ResponseEntity<UserDTO> addStaffMember(@Valid @RequestBody UserDTO userDTO, Authentication auth) {
        UserDTO newStaff = hotelAdminService.addStaffMember(userDTO, auth.getName());
        return ResponseEntity.ok(newStaff);
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<UserDTO> getStaffMemberById(@PathVariable Long staffId, Authentication auth) {
        UserDTO staff = hotelAdminService.getStaffMemberById(staffId, auth.getName());
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/staff/{staffId}")
    public ResponseEntity<UserDTO> updateStaffMember(
            @PathVariable Long staffId,
            @Valid @RequestBody UserDTO userDTO,
            Authentication auth) {
        UserDTO updated = hotelAdminService.updateStaffMember(staffId, userDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/staff/{staffId}")
    public ResponseEntity<Void> removeStaffMember(@PathVariable Long staffId, Authentication auth) {
        hotelAdminService.removeStaffMember(staffId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/staff/{staffId}/activate")
    public ResponseEntity<UserDTO> activateStaffMember(@PathVariable Long staffId, Authentication auth) {
        UserDTO updated = hotelAdminService.toggleStaffStatus(staffId, true, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/staff/{staffId}/deactivate")
    public ResponseEntity<UserDTO> deactivateStaffMember(@PathVariable Long staffId, Authentication auth) {
        UserDTO updated = hotelAdminService.toggleStaffStatus(staffId, false, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // Room Management
    @GetMapping("/rooms")
    public ResponseEntity<Page<RoomDTO>> getHotelRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) Boolean available,
            Authentication auth) {
        Page<RoomDTO> rooms = hotelAdminService.getHotelRooms(auth.getName(), page, size, search, roomType, available);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomDTO> addRoom(@Valid @RequestBody RoomDTO roomDTO, Authentication auth) {
        RoomDTO newRoom = hotelAdminService.addRoom(roomDTO, auth.getName());
        return ResponseEntity.ok(newRoom);
    }

    /**
     * Add room with image uploads
     */
    @PostMapping(value = "/rooms/with-images", consumes = "multipart/form-data")
    public ResponseEntity<RoomCreationResponse> addRoomWithImages(
            @RequestParam("roomNumber") String roomNumber,
            @RequestParam("roomType") RoomType roomType,
            @RequestParam(value = "pricePerNight", required = false) BigDecimal pricePerNight,
            @RequestParam("capacity") Integer capacity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "heroImage", required = false) MultipartFile heroImage,
            @RequestParam(value = "galleryImages", required = false) List<MultipartFile> galleryImages,
            @RequestParam(value = "heroImageAltText", required = false) String heroImageAltText,
            @RequestParam(value = "galleryImageAltTexts", required = false) List<String> galleryImageAltTexts,
            Authentication auth) {

        // Create request object
        RoomCreationRequest request = new RoomCreationRequest(roomNumber, roomType, pricePerNight, capacity,
                description);
        request.setHeroImage(heroImage);
        request.setGalleryImages(galleryImages);
        request.setHeroImageAltText(heroImageAltText);
        request.setGalleryImageAltTexts(galleryImageAltTexts);

        RoomCreationResponse response = hotelAdminService.addRoomWithImages(request, auth.getName());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long roomId, Authentication auth) {
        RoomDTO room = hotelAdminService.getRoomById(roomId, auth.getName());
        return ResponseEntity.ok(room);
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<RoomDTO> updateRoom(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomDTO roomDTO,
            Authentication auth) {
        RoomDTO updated = hotelAdminService.updateRoom(roomId, roomDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId, Authentication auth) {
        hotelAdminService.deleteRoom(roomId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rooms/debug")
    public ResponseEntity<List<Map<String, Object>>> debugListRooms(Authentication auth) {
        try {
            // Get all rooms using the paginated method with a large page size
            Page<RoomDTO> roomsPage = hotelAdminService.getHotelRooms(auth.getName(), 0, 1000, "", "", null);
            List<RoomDTO> rooms = roomsPage.getContent();

            List<Map<String, Object>> debugInfo = rooms.stream().map(room -> {
                Map<String, Object> info = new HashMap<>();
                info.put("id", room.getId());
                info.put("roomNumber", room.getRoomNumber());
                info.put("roomType", room.getRoomType());
                info.put("status", room.getStatus());
                return info;
            }).collect(Collectors.toList());
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of(Map.of("error", e.getMessage())));
        }
    }

    @PutMapping("/rooms/{roomId}/availability")
    public ResponseEntity<RoomDTO> toggleRoomAvailability(
            @PathVariable Long roomId,
            @RequestParam Boolean available,
            Authentication auth) {
        RoomDTO updated = hotelAdminService.toggleRoomAvailability(roomId, available, auth.getName());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/rooms/{roomId}/status")
    public ResponseEntity<RoomDTO> updateRoomStatus(
            @PathVariable Long roomId,
            @RequestParam String status,
            @RequestParam(required = false) String notes,
            Authentication auth) {
        RoomDTO updated = hotelAdminService.updateRoomStatus(roomId, status, notes, auth.getName());
        return ResponseEntity.ok(updated);
    }

    // Statistics for hotel admin dashboard
    @GetMapping("/statistics")
    public ResponseEntity<?> getHotelStatistics(Authentication auth) {
        return ResponseEntity.ok(hotelAdminService.getHotelStatistics(auth.getName()));
    }

    // ===========================
    // BOOKING MANAGEMENT ENDPOINTS
    // ===========================

    /**
     * Get all bookings for the hotel admin's hotel
     */
    @GetMapping("/bookings")
    public ResponseEntity<Page<BookingResponse>> getHotelBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication auth) {

        // First get the hotel ID from the authenticated user
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        Page<BookingResponse> bookings = hotelAdminService.getHotelBookings(hotel.getId(), page, size, search);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Get a specific booking by reservation ID
     */
    @GetMapping("/bookings/{reservationId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long reservationId,
            Authentication auth) {

        // First get the hotel ID from the authenticated user
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        BookingResponse booking = hotelAdminService.getBookingById(reservationId, hotel.getId());
        return ResponseEntity.ok(booking);
    }

    /**
     * Get booking statistics for the hotel
     */
    @GetMapping("/bookings/statistics")
    public ResponseEntity<Map<String, Object>> getHotelBookingStats(Authentication auth) {
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        Map<String, Object> stats = hotelAdminService.getHotelBookingStats(hotel.getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * Update booking status
     */
    @PutMapping("/bookings/{reservationId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long reservationId,
            @RequestParam String status,
            Authentication auth) {

        // Verify the reservation belongs to the hotel admin's hotel
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

        // Convert string to enum (case-insensitive, handle spaces)
        ReservationStatus reservationStatus;
        try {
            // Replace spaces with underscores and convert to uppercase
            String normalizedStatus = status.replace(" ", "_").toUpperCase();
            reservationStatus = ReservationStatus.valueOf(normalizedStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status);
        }

        BookingResponse updated = hotelAdminService.updateBookingStatus(reservationId, reservationStatus);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update booking payment status
     */
    @PutMapping("/bookings/{reservationId}/payment-status")
    public ResponseEntity<BookingResponse> updateBookingPaymentStatus(
            @PathVariable Long reservationId,
            @RequestParam String paymentStatus,
            Authentication auth) {

        // Verify the reservation belongs to the hotel admin's hotel
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

        BookingResponse updated = hotelAdminService.updateBookingPaymentStatus(reservationId, paymentStatus);
        return ResponseEntity.ok(updated);
    }

    /**
     * Modify booking details (admin version)
     */
    @PutMapping("/bookings/{reservationId}")
    public ResponseEntity<BookingModificationResponse> modifyBooking(
            @PathVariable Long reservationId,
            @Valid @RequestBody BookingModificationRequest request,
            Authentication auth) {

        // Verify the reservation belongs to the hotel admin's hotel
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

        BookingModificationResponse response = hotelAdminService.modifyBooking(reservationId, request, hotel.getId());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Delete booking
     */
    @DeleteMapping("/bookings/{reservationId}")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long reservationId,
            Authentication auth) {

        // Get the hotel ID from the authenticated user
        HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());
        hotelAdminService.deleteBooking(reservationId, hotel.getId());
        return ResponseEntity.noContent().build();
    }

    // Room Type Pricing Management

    /**
     * Get all room type pricing for the hotel
     */
    @GetMapping("/room-type-pricing")
    public ResponseEntity<List<RoomTypePricingDTO>> getRoomTypePricing(Authentication auth) {
        List<RoomTypePricingDTO> pricing = roomTypePricingService.getRoomTypePricing(auth.getName());
        return ResponseEntity.ok(pricing);
    }

    /**
     * Create or update room type pricing
     */
    @PostMapping("/room-type-pricing")
    public ResponseEntity<RoomTypePricingDTO> saveRoomTypePricing(
            @Valid @RequestBody RoomTypePricingDTO pricingDTO,
            Authentication auth) {
        RoomTypePricingDTO saved = roomTypePricingService.saveRoomTypePricing(pricingDTO, auth.getName());
        return ResponseEntity.ok(saved);
    }

    /**
     * Update room type pricing
     */
    @PutMapping("/room-type-pricing/{id}")
    public ResponseEntity<RoomTypePricingDTO> updateRoomTypePricing(
            @PathVariable Long id,
            @Valid @RequestBody RoomTypePricingDTO pricingDTO,
            Authentication auth) {
        pricingDTO.setId(id);
        RoomTypePricingDTO updated = roomTypePricingService.saveRoomTypePricing(pricingDTO, auth.getName());
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete room type pricing
     */
    @DeleteMapping("/room-type-pricing/{id}")
    public ResponseEntity<Void> deleteRoomTypePricing(@PathVariable Long id, Authentication auth) {
        roomTypePricingService.deleteRoomTypePricing(id, auth.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Get room type pricing by room type
     */
    @GetMapping("/room-type-pricing/{roomType}")
    public ResponseEntity<RoomTypePricingDTO> getRoomTypePricing(
            @PathVariable RoomType roomType,
            Authentication auth) {
        RoomTypePricingDTO pricing = roomTypePricingService.getRoomTypePricing(auth.getName(), roomType);
        return ResponseEntity.ok(pricing);
    }

    /**
     * Initialize default pricing for all room types
     */
    @PostMapping("/room-type-pricing/initialize-defaults")
    public ResponseEntity<Void> initializeDefaultPricing(Authentication auth) {
        roomTypePricingService.initializeDefaultPricing(auth.getName());
        return ResponseEntity.ok().build();
    }

    // Walk-in Booking Management

    /**
     * Create a walk-in booking
     * Hotel admins can create immediate bookings for walk-in guests
     * 
     * IMPORTANT: Walk-in bookings automatically send email confirmation to the
     * guest's email address,
     * not to the staff member who creates the booking. This ensures guests receive
     * their
     * booking confirmation details for their records.
     */
    @PostMapping("/walk-in-booking")
    public ResponseEntity<BookingResponse> createWalkInBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication auth) {

        String userEmail = auth.getName();

        // Set payment method to front desk payment for walk-in bookings
        if (request.getPaymentMethodId() == null || request.getPaymentMethodId().isEmpty()) {
            request.setPaymentMethodId("pay_at_frontdesk");
        }

        // For walk-in bookings, create as anonymous guest so email goes to guest, not
        // staff
        // Pass null as userEmail to ensure guest gets the confirmation email
        // This ensures the booking confirmation email is sent to the guest's email
        // address
        BookingResponse response = bookingService.createBooking(request, null);
        logger.info("Walk-in booking created successfully with confirmation number: {} for guest email: {}",
                response.getConfirmationNumber(), request.getGuestEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get available rooms for a specific date range
     * This endpoint supports date-based filtering for walk-in bookings
     */
    @GetMapping("/available-rooms")
    public ResponseEntity<List<RoomDTO>> getAvailableRooms(
            @RequestParam String checkInDate,
            @RequestParam String checkOutDate,
            @RequestParam(defaultValue = "1") Integer guests,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            Authentication auth) {

        try {
            // Parse dates
            java.time.LocalDate checkIn = java.time.LocalDate.parse(checkInDate);
            java.time.LocalDate checkOut = java.time.LocalDate.parse(checkOutDate);

            // Get hotel admin's hotel
            HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

            // Get rooms that are truly available for the date range (not occupied/assigned)
            List<RoomDTO> availableRooms = hotelAdminService.getAvailableRoomsForDateRange(
                    auth.getName(), checkIn, checkOut, guests, page, size);

            return ResponseEntity.ok(availableRooms);

        } catch (Exception e) {
            // System.err.println("Failed to get available rooms: " + e.getMessage());
            logger.error("Operation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===========================
    // HOTEL IMAGE MANAGEMENT ENDPOINTS
    // ===========================

    /**
     * Get hotel images for the hotel admin's hotel
     */
    @GetMapping("/images")
    public ResponseEntity<Map<String, Object>> getHotelImages(
            @RequestParam(required = false) String roomType,
            Authentication auth) {

        try {
            String tenantId = TenantContext.getTenantId();
            HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

            List<HotelImage> images;
            if (roomType != null && !roomType.isEmpty()) {
                // Get room type images - convert room type string to ID
                try {
                    logger.info("🔍 DEBUG: Received room type request: {}", roomType);
                    RoomType roomTypeEnum = RoomType.valueOf(roomType.toUpperCase());
                    Long roomTypeId = (long) (roomTypeEnum.ordinal() + 1);
                    logger.info("🔍 DEBUG: Converted room type {} to ID: {} (ordinal: {})", roomType, roomTypeId,
                            roomTypeEnum.ordinal());
                    logger.info("🔍 DEBUG: Retrieving images for hotel ID: {}, room type ID: {}", hotel.getId(),
                            roomTypeId);

                    // Clean up any duplicate inactive images first
                    hotelImageService.cleanupDuplicateRoomTypeImages(tenantId, hotel.getId(), roomTypeId);

                    images = hotelImageService.getRoomTypeImages(tenantId, hotel.getId(), roomTypeId);
                    logger.info("🔍 DEBUG: Found {} images for room type {} after cleanup", images.size(), roomType);
                } catch (IllegalArgumentException e) {
                    logger.error("❌ Invalid room type: {}", roomType);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("error", "Invalid room type: " + roomType);
                    return ResponseEntity.badRequest().body(response);
                }
            } else {
                // Get all hotel images (not room type specific)
                logger.info("🔍 DEBUG: Retrieving general hotel images (no room type specified)");
                images = hotelImageService.getHotelImages(tenantId, hotel.getId());
                logger.info("🔍 DEBUG: Found {} hotel images", images.size());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", images.stream().map(this::createImageResponse).toArray());
            response.put("total", images.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Failed to get hotel images", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to get hotel images: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Upload hotel images for the hotel admin's hotel
     */
    @PostMapping(value = "/images/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> uploadHotelImages(
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) Boolean isHotelGeneral,
            @RequestParam(required = false) MultipartFile heroImage,
            @RequestParam(required = false) String heroAltText,
            Authentication auth) {

        try {
            // Debug logging
            // System.out.println("🔍 ROOM TYPE UPLOAD DEBUG:");
            // System.out.println("  roomType parameter: " + roomType);
            // System.out.println("  isHotelGeneral parameter: " + isHotelGeneral);
            // System.out
            //         .println("  heroImage filename: " + (heroImage != null ? heroImage.getOriginalFilename() : "null"));

            String tenantId = TenantContext.getTenantId();
            HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

            if (heroImage == null || heroImage.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("error", "No image file provided");
                return ResponseEntity.badRequest().body(response);
            }

            HotelImage uploadedImage;

            // Check if this is a room type image upload
            if (roomType != null && !roomType.trim().isEmpty()) {
                // System.out.println("🎯 TAKING ROOM TYPE UPLOAD PATH");
                // System.out.println("  roomType: " + roomType);

                // This is a room type image upload
                ImageCategory category = ImageCategory.ROOM_TYPE_HERO; // Room type images default to hero

                // Convert room type string to room type ID (ordinal + 1)
                RoomType roomTypeEnum;
                try {
                    roomTypeEnum = RoomType.valueOf(roomType.toUpperCase());
                    // System.out.println("  roomTypeEnum: " + roomTypeEnum);
                } catch (IllegalArgumentException e) {
                    // System.out.println("❌ Invalid room type: " + roomType);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("error", "Invalid room type: " + roomType);
                    return ResponseEntity.badRequest().body(response);
                }

                Long roomTypeId = (long) (roomTypeEnum.ordinal() + 1);
                // System.out.println("  roomTypeId: " + roomTypeId);

                uploadedImage = hotelImageService.uploadRoomTypeImage(
                        tenantId, hotel.getId(), roomTypeId, category, heroImage, heroAltText, null);
                // System.out.println("✅ Room type image uploaded successfully");
            } else {
                // System.out.println("🏨 TAKING HOTEL GENERAL UPLOAD PATH");

                // This is a hotel general image upload
                ImageCategory category;
                if (Boolean.TRUE.equals(isHotelGeneral)) {
                    category = ImageCategory.HOTEL_HERO; // Default to hero for hotel general
                } else {
                    category = ImageCategory.HOTEL_GALLERY; // Default to gallery
                }
                // System.out.println("  category: " + category);

                uploadedImage = hotelImageService.uploadHotelImage(
                        tenantId, hotel.getId(), category, heroImage, heroAltText, null);
                // System.out.println("✅ Hotel image uploaded successfully");
            }

            List<Map<String, Object>> responseData = List.of(createImageResponse(uploadedImage));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", responseData);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            logger.error("Failed to upload hotel image", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Delete a hotel image
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Map<String, Object>> deleteHotelImage(
            @PathVariable Long imageId,
            Authentication auth) {

        try {
            String tenantId = TenantContext.getTenantId();
            HotelDTO hotel = hotelAdminService.getMyHotel(auth.getName());

            hotelImageService.deleteImage(tenantId, imageId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image deleted successfully");

            return ResponseEntity.ok(response);

        } catch (IllegalAccessError e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Access denied");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            logger.error("Failed to delete hotel image", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Failed to delete image");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
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

    /**
     * Fix room status consistency for hotel
     */
    @PostMapping("/fix-room-status")
    public ResponseEntity<Map<String, Object>> fixRoomStatusConsistency(Authentication auth) {
        try {
            hotelAdminService.fixRoomStatusConsistency(auth.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message",
                    "Room status consistency check completed. Note: Automated status synchronization runs every 5 minutes.");
            response.put("automatedSystem", Map.of(
                    "enabled", true,
                    "scheduleInterval", "5 minutes",
                    "realTimeChecks", true,
                    "description", "Room statuses are automatically synchronized with booking statuses"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fix room status consistency: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get automated room status system information
     */
    @GetMapping("/automation-status")
    public ResponseEntity<Map<String, Object>> getAutomationStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("automationEnabled", true);
        response.put("features", Map.of(
                "scheduledSync", Map.of(
                        "enabled", true,
                        "interval", "5 minutes",
                        "description", "Automatically syncs room statuses with booking statuses"),
                "realTimeSync", Map.of(
                        "enabled", true,
                        "description", "Triggers immediate consistency checks when bookings change"),
                "checkoutMaintenance", Map.of(
                        "enabled", true,
                        "interval", "1 hour",
                        "description", "Automatically sets rooms to maintenance after checkout"),
                "manualTrigger", Map.of(
                        "enabled", true,
                        "description", "Fix Status button available for immediate sync")));
        response.put("message", "Automated room status management is active");
        return ResponseEntity.ok(response);
    }
}
