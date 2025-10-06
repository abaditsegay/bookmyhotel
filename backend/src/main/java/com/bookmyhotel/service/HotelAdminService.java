package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.bookmyhotel.config.CacheConfig;
import com.bookmyhotel.dto.BookingModificationRequest;
import com.bookmyhotel.dto.BookingModificationResponse;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.HotelImageDTO;
import com.bookmyhotel.dto.RoomCreationRequest;
import com.bookmyhotel.dto.RoomCreationResponse;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.dto.UserDTO;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.HotelImage;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.enums.ImageCategory;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.tenant.TenantContext;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

/**
 * Service for hotel admin operations
 */
@Service
@Transactional
public class HotelAdminService {

    private static final Logger logger = LoggerFactory.getLogger(HotelAdminService.class);

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RoomTypePricingService roomTypePricingService;

    @Autowired
    private BookingChangeNotificationService bookingChangeNotificationService;

    @Autowired
    private BookingStatusUpdateService bookingStatusUpdateService;

    @Autowired
    private HotelImageService hotelImageService;

    /**
     * Get the hotel for the logged-in hotel admin
     */
    public HotelDTO getMyHotel(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        return convertToHotelDTO(hotel);
    }

    /**
     * Update hotel details
     */
    public HotelDTO updateMyHotel(HotelDTO hotelDTO, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        // Update hotel details
        hotel.setName(hotelDTO.getName());
        hotel.setDescription(hotelDTO.getDescription());
        hotel.setAddress(hotelDTO.getAddress());
        hotel.setCity(hotelDTO.getCity());
        hotel.setCountry(hotelDTO.getCountry());
        hotel.setPhone(hotelDTO.getPhone());
        hotel.setMobilePaymentPhone(hotelDTO.getMobilePaymentPhone());
        hotel.setMobilePaymentPhone2(hotelDTO.getMobilePaymentPhone2());
        hotel.setEmail(hotelDTO.getEmail());
        hotel.setUpdatedAt(LocalDateTime.now());

        Hotel saved = hotelRepository.save(hotel);
        return convertToHotelDTO(saved);
    }

    /**
     * Get hotel staff with filtering
     */
    public Page<UserDTO> getHotelStaff(String adminEmail, int page, int size, String search, String role,
            String status) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        Pageable pageable = PageRequest.of(page, size);

        // Get all staff for this hotel
        List<User> allStaff = userRepository.findByHotelAndRolesContaining(hotel,
                Arrays.asList(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN,
                        UserRole.OPERATIONS_SUPERVISOR, UserRole.MAINTENANCE));

        // Apply filters
        List<User> filteredStaff = allStaff.stream()
                .filter(user -> {
                    boolean matches = true;

                    // Search filter
                    if (search != null && !search.trim().isEmpty()) {
                        String searchLower = search.toLowerCase();
                        matches = user.getFirstName().toLowerCase().contains(searchLower) ||
                                user.getLastName().toLowerCase().contains(searchLower) ||
                                user.getEmail().toLowerCase().contains(searchLower);
                    }

                    // Role filter
                    if (role != null && !role.trim().isEmpty()) {
                        UserRole targetRole = UserRole.valueOf(role);
                        matches = matches && user.getRoles().contains(targetRole);
                    }

                    // Status filter
                    if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                        boolean isActive = status.equalsIgnoreCase("ACTIVE");
                        matches = matches && user.getIsActive().equals(isActive);
                    }

                    return matches;
                })
                .collect(Collectors.toList());

        // Manual pagination with bounds checking
        int start = page * size;
        int end = Math.min(start + size, filteredStaff.size());

        List<User> pageContent;
        if (start >= filteredStaff.size()) {
            // If start index is beyond available data, return empty list
            pageContent = new ArrayList<>();
        } else {
            pageContent = filteredStaff.subList(start, end);
        }

        List<UserDTO> userDTOs = pageContent.stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(userDTOs, pageable, filteredStaff.size());
    }

    /**
     * Get a specific staff member by ID
     */
    public UserDTO getStaffMemberById(Long staffId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify the staff member belongs to the same hotel
        if (!staff.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Staff member not found in your hotel");
        }

        return convertToUserDTO(staff);
    }

    /**
     * Add a new staff member
     */
    public UserDTO addStaffMember(UserDTO userDTO, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        // Validate that the email doesn't already exist
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("User with this email already exists");
        }

        // Validate allowed roles for hotel admin
        Set<UserRole> allowedRoles = Set.of(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN);
        if (userDTO.getRoles() == null || !allowedRoles.containsAll(userDTO.getRoles())) {
            throw new RuntimeException("Hotel admin can only create FRONTDESK, HOUSEKEEPING, or HOTEL_ADMIN users");
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(userDTO.getEmail());
        newUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        newUser.setPhone(userDTO.getPhone());
        newUser.setIsActive(true);
        newUser.setRoles(userDTO.getRoles());
        newUser.setHotel(hotel);
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(newUser);
        return convertToUserDTO(saved);
    }

    /**
     * Update staff member
     */
    public UserDTO updateStaffMember(Long staffId, UserDTO userDTO, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify the staff belongs to the same hotel
        if (!staff.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Staff member does not belong to your hotel");
        }

        // Update user details
        staff.setFirstName(userDTO.getFirstName());
        staff.setLastName(userDTO.getLastName());
        staff.setPhone(userDTO.getPhone());
        staff.setUpdatedAt(LocalDateTime.now());

        // Update password if provided
        if (userDTO.getPassword() != null && !userDTO.getPassword().trim().isEmpty()) {
            staff.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        // Update roles if provided and valid
        if (userDTO.getRoles() != null) {
            Set<UserRole> allowedRoles = Set.of(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN);
            if (allowedRoles.containsAll(userDTO.getRoles())) {
                staff.setRoles(userDTO.getRoles());
            }
        }

        User saved = userRepository.save(staff);
        return convertToUserDTO(saved);
    }

    /**
     * Remove staff member
     */
    public void removeStaffMember(Long staffId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify the staff belongs to the same hotel
        if (!staff.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Staff member does not belong to your hotel");
        }

        userRepository.delete(staff);
    }

    /**
     * Toggle staff status (activate/deactivate)
     */
    public UserDTO toggleStaffStatus(Long staffId, Boolean active, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff member not found"));

        // Verify the staff belongs to the same hotel
        if (!staff.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Staff member does not belong to your hotel");
        }

        staff.setIsActive(active);
        staff.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(staff);
        return convertToUserDTO(saved);
    }

    /**
     * Get hotel rooms with filtering
     */
    @Cacheable(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'admin:' + #adminEmail + ':page:' + #page + ':size:' + #size + ':search:' + (#search != null ? #search : 'null') + ':type:' + (#roomType != null ? #roomType : 'null') + ':available:' + (#available != null ? #available : 'null')")
    public Page<RoomDTO> getHotelRooms(String adminEmail, int page, int size, String search, String roomType,
            Boolean available) {
        System.err.println("🔍 HotelAdminService.getHotelRooms called with adminEmail: " + adminEmail);
        User admin = getUserByEmail(adminEmail);
        System.err.println("🔍 Retrieved admin user: " + admin.getId() + ", email: " + admin.getEmail());
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        System.err.println("🔍 Admin associated with hotel: " + hotel.getId() + ", name: " + hotel.getName());

        Pageable pageable = PageRequest.of(page, size);

        // Get all rooms for this hotel using hotel ID instead of hotel entity
        List<Room> allRooms = roomRepository.findByHotelId(hotel.getId());
        System.err.println("🔍 Found " + allRooms.size() + " total rooms for hotel ID: " + hotel.getId());

        if (allRooms.isEmpty()) {
            System.err.println("🔍 No rooms found in database for hotel ID: " + hotel.getId());
        } else {
            System.err.println("🔍 Room IDs: "
                    + allRooms.stream().map(r -> r.getId()).collect(java.util.stream.Collectors.toList()));
        }

        // Apply filters
        List<Room> filteredRooms = allRooms.stream()
                .filter(room -> {
                    boolean matches = true;

                    // Search filter
                    if (search != null && !search.trim().isEmpty()) {
                        String searchLower = search.toLowerCase();
                        matches = room.getRoomNumber().toLowerCase().contains(searchLower) ||
                                (room.getDescription() != null
                                        && room.getDescription().toLowerCase().contains(searchLower));
                        System.err.println(
                                "🔍 Search filter '" + search + "' on room " + room.getRoomNumber() + ": " + matches);
                    }

                    // Room type filter
                    if (roomType != null && !roomType.trim().isEmpty()) {
                        RoomType targetType = RoomType.valueOf(roomType);
                        matches = matches && room.getRoomType().equals(targetType);
                    }

                    // Availability filter
                    if (available != null) {
                        matches = matches && room.getIsAvailable().equals(available);
                    }

                    return matches;
                })
                .collect(Collectors.toList());

        System.err.println("🔍 After filtering: " + filteredRooms.size() + " rooms remain");
        System.err.println(
                "🔍 Filters applied - search: '" + search + "', roomType: '" + roomType + "', available: " + available);

        // Manual pagination with bounds checking
        int start = page * size;
        int end = Math.min(start + size, filteredRooms.size());

        System.err.println("🔍 Pagination - page: " + page + ", size: " + size + ", start: " + start + ", end: " + end);

        List<Room> pageContent;
        if (start >= filteredRooms.size()) {
            // If start index is beyond available data, return empty list
            pageContent = new ArrayList<>();
        } else {
            pageContent = filteredRooms.subList(start, end);
        }

        List<RoomDTO> roomDTOs = pageContent.stream()
                .map(this::convertToRoomDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(roomDTOs, pageable, filteredRooms.size());
    }

    /**
     * Add a new room
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true)
    })
    public RoomDTO addRoom(RoomDTO roomDTO, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        // Check if room number already exists for this hotel
        if (roomRepository.existsByHotelAndRoomNumber(hotel, roomDTO.getRoomNumber())) {
            throw new RuntimeException("Room number already exists in this hotel");
        }

        // Create new room
        Room newRoom = new Room();
        newRoom.setRoomNumber(roomDTO.getRoomNumber());
        newRoom.setRoomType(roomDTO.getRoomType());

        // Use room type pricing if price not specified or use room type default
        BigDecimal pricePerNight = roomDTO.getPricePerNight();
        if (pricePerNight == null || pricePerNight.compareTo(BigDecimal.ZERO) <= 0) {
            pricePerNight = roomTypePricingService.getBasePriceForRoomType(hotel.getId(), roomDTO.getRoomType());
        }
        newRoom.setPricePerNight(pricePerNight);

        newRoom.setCapacity(roomDTO.getCapacity());
        newRoom.setDescription(roomDTO.getDescription());
        newRoom.setIsAvailable(true);
        newRoom.setHotel(hotel);
        newRoom.setCreatedAt(LocalDateTime.now());
        newRoom.setUpdatedAt(LocalDateTime.now());

        Room saved = roomRepository.save(newRoom);
        return convertToRoomDTO(saved);
    }

    /**
     * Add a new room with image uploads
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true)
    })
    public RoomCreationResponse addRoomWithImages(RoomCreationRequest request, String adminEmail) {
        try {
            // First create the room
            RoomDTO roomDTO = addRoom(request.toRoomDTO(), adminEmail);

            List<HotelImageDTO> uploadedImages = new ArrayList<>();

            // Upload hero image if provided
            if (request.hasHeroImage()) {
                try {
                    HotelImage heroImageEntity = hotelImageService.uploadRoomTypeImage(
                            TenantContext.getTenantId(),
                            roomDTO.getHotelId(),
                            getRoomTypeId(request.getRoomType()),
                            ImageCategory.ROOM_TYPE_HERO,
                            request.getHeroImage(),
                            request.getHeroImageAltText(),
                            0 // Hero image always has display order 0
                    );
                    uploadedImages.add(convertToImageDTO(heroImageEntity));
                } catch (Exception e) {
                    // Log error but continue with room creation
                    System.err.println("Failed to upload hero image: " + e.getMessage());
                }
            }

            // Upload gallery images if provided
            if (request.hasGalleryImages()) {
                List<MultipartFile> galleryImages = request.getGalleryImages();
                List<String> altTexts = request.getGalleryImageAltTexts();

                for (int i = 0; i < galleryImages.size(); i++) {
                    MultipartFile galleryImage = galleryImages.get(i);
                    if (galleryImage != null && !galleryImage.isEmpty()) {
                        try {
                            String altText = (altTexts != null && i < altTexts.size())
                                    ? altTexts.get(i)
                                    : null;

                            HotelImage galleryImageEntity = hotelImageService.uploadRoomTypeImage(
                                    TenantContext.getTenantId(),
                                    roomDTO.getHotelId(),
                                    getRoomTypeId(request.getRoomType()),
                                    ImageCategory.ROOM_TYPE_GALLERY,
                                    galleryImage,
                                    altText,
                                    i + 1 // Gallery images start from display order 1
                            );
                            uploadedImages.add(convertToImageDTO(galleryImageEntity));
                        } catch (Exception e) {
                            // Log error but continue with other images
                            System.err.println("Failed to upload gallery image " + (i + 1) + ": " + e.getMessage());
                        }
                    }
                }
            }

            // Return success response
            String message = uploadedImages.isEmpty()
                    ? "Room created successfully (no images uploaded)"
                    : String.format("Room created successfully with %d image(s) uploaded", uploadedImages.size());

            return RoomCreationResponse.success(roomDTO, uploadedImages, message);

        } catch (Exception e) {
            return RoomCreationResponse.error("Failed to create room: " + e.getMessage());
        }
    }

    /**
     * Get room by ID
     */
    @Cacheable(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, key = "'room:' + #roomId + ':admin:' + #adminEmail")
    public RoomDTO getRoomById(Long roomId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Verify the room belongs to the same hotel
        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room does not belong to your hotel");
        }

        return convertToRoomDTO(room);
    }

    /**
     * Update room
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true)
    })
    public RoomDTO updateRoom(Long roomId, RoomDTO roomDTO, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Verify the room belongs to the same hotel
        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room does not belong to your hotel");
        }

        // Update room details
        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setRoomType(roomDTO.getRoomType());
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setCapacity(roomDTO.getCapacity());
        room.setDescription(roomDTO.getDescription());
        room.setUpdatedAt(LocalDateTime.now());

        Room saved = roomRepository.save(room);
        return convertToRoomDTO(saved);
    }

    /**
     * Delete room
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_TYPES_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true)
    })
    public void deleteRoom(Long roomId, String adminEmail) {
        System.out.println("🔥 DELETE ROOM REQUEST");
        System.out.println("🔥 Room ID (database primary key): " + roomId);
        System.out.println("🔥 Admin email: " + adminEmail);

        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        System.out.println("🔥 Admin found: " + admin.getEmail());
        System.out.println(
                "🔥 Hotel: " + (hotel != null ? hotel.getName() + " (Hotel ID: " + hotel.getId() + ")" : "null"));

        Room room = roomRepository.findById(roomId).orElse(null);
        System.out.println("🔥 Room found: "
                + (room != null ? "Yes - Room Number: " + room.getRoomNumber() + " (ID: " + room.getId() + ")" : "No"));

        if (room == null) {
            System.out.println("🔥 ERROR: Room with database ID " + roomId + " not found in database");
            throw new RuntimeException("Room not found");
        }

        // Verify the room belongs to the same hotel
        System.out.println("🔥 Room's hotel ID: " + room.getHotel().getId());
        System.out.println("🔥 Admin's hotel ID: " + hotel.getId());

        if (!room.getHotel().getId().equals(hotel.getId())) {
            System.out.println("🔥 ERROR: Room does not belong to admin's hotel");
            throw new RuntimeException("Room does not belong to your hotel");
        }

        System.out.println("🔥 Checking for active reservations for Room " + room.getRoomNumber() + " (ID: "
                + room.getId() + ")...");
        // Check if room has active reservations
        List<Reservation> activeReservations = reservationRepository.findByAssignedRoomAndStatusIn(
                room,
                Arrays.asList(ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN));

        System.out.println("🔥 Active reservations found: " + activeReservations.size());
        if (!activeReservations.isEmpty()) {
            System.out.println("🔥 ERROR: Cannot delete room with active reservations");
            throw new RuntimeException(
                    "Cannot delete room with active reservations. Please complete or cancel existing reservations first.");
        }

        System.out.println("🔥 Checking for all reservations for Room " + room.getRoomNumber() + "...");
        // Check if room has any reservations (past or future) and nullify the
        // assignedRoom reference
        List<Reservation> allReservations = reservationRepository.findByAssignedRoom(room);
        System.out.println("🔥 Total reservations found: " + allReservations.size());

        for (Reservation reservation : allReservations) {
            System.out.println("🔥 Nullifying reservation " + reservation.getId() + " (Confirmation: "
                    + reservation.getConfirmationNumber() + ")");
            reservation.setAssignedRoom(null);
            reservationRepository.save(reservation);
        }

        System.out.println("🔥 Deleting Room " + room.getRoomNumber() + " (ID: " + room.getId() + ")...");
        // Now safe to delete the room
        roomRepository.delete(room);
        System.out.println("🔥 SUCCESS: Room " + room.getRoomNumber() + " deleted successfully");
    }

    /**
     * Toggle room availability
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true)
    })
    public RoomDTO toggleRoomAvailability(Long roomId, Boolean available, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Verify the room belongs to the same hotel
        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room does not belong to your hotel");
        }

        // Business rule: Cannot make a room available if it's in certain statuses
        if (available && (room.getStatus() == RoomStatus.OUT_OF_ORDER ||
                room.getStatus() == RoomStatus.MAINTENANCE)) {
            throw new RuntimeException("Cannot make room available while it's " +
                    room.getStatus().toString().toLowerCase().replace("_", " "));
        }

        // Business rule: Cannot make a room unavailable if it has active bookings
        if (!available) {
            LocalDate today = LocalDate.now();
            boolean hasActiveBookings = room.getReservations().stream()
                    .anyMatch(reservation -> (reservation.getStatus() == ReservationStatus.CONFIRMED ||
                            reservation.getStatus() == ReservationStatus.CHECKED_IN) &&
                            !reservation.getCheckInDate().isAfter(today) &&
                            !reservation.getCheckOutDate().isBefore(today));

            if (hasActiveBookings) {
                throw new RuntimeException("Cannot make room unavailable - it has active bookings");
            }
        }

        room.setIsAvailable(available);
        room.setUpdatedAt(LocalDateTime.now());

        Room saved = roomRepository.save(room);
        return convertToRoomDTO(saved);
    }

    /**
     * Update room status
     */
    @Caching(evict = {
            @CacheEvict(value = CacheConfig.ROOMS_BY_HOTEL_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.AVAILABLE_ROOMS_CACHE, allEntries = true),
            @CacheEvict(value = CacheConfig.ROOM_AVAILABILITY_CACHE, allEntries = true)
    })
    public RoomDTO updateRoomStatus(Long roomId, String status, String notes, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // Verify the room belongs to the same hotel
        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room does not belong to your hotel");
        }

        // Convert status string to RoomStatus enum
        RoomStatus roomStatus;
        try {
            String normalizedStatus = status.replace(" ", "_").toUpperCase();
            roomStatus = RoomStatus.valueOf(normalizedStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status);
        }

        // Business rule: Cannot change status if room has active bookings and new
        // status would conflict
        LocalDate today = LocalDate.now();
        boolean hasActiveBookings = room.getReservations().stream()
                .anyMatch(reservation -> (reservation.getStatus() == ReservationStatus.CONFIRMED ||
                        reservation.getStatus() == ReservationStatus.CHECKED_IN) &&
                        !reservation.getCheckInDate().isAfter(today) &&
                        !reservation.getCheckOutDate().isBefore(today));

        if (hasActiveBookings && (roomStatus == RoomStatus.OUT_OF_ORDER ||
                roomStatus == RoomStatus.MAINTENANCE)) {
            throw new RuntimeException("Cannot set room to " + status + " - it has active bookings");
        }

        room.setStatus(roomStatus);
        room.setUpdatedAt(LocalDateTime.now());

        // Auto-adjust availability based on status
        if (roomStatus == RoomStatus.OUT_OF_ORDER || roomStatus == RoomStatus.MAINTENANCE) {
            room.setIsAvailable(false);
        } else if (roomStatus == RoomStatus.AVAILABLE) {
            room.setIsAvailable(true);
        }

        Room saved = roomRepository.save(room);
        return convertToRoomDTO(saved);
    }

    /**
     * Get hotel statistics
     */
    public Map<String, Object> getHotelStatistics(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        Map<String, Object> stats = new HashMap<>();

        // Room statistics
        List<Room> rooms = roomRepository.findByHotelId(hotel.getId());
        stats.put("totalRooms", rooms.size());

        // Get all reservations for the hotel to calculate proper statistics
        List<Reservation> allReservations = reservationRepository.findByHotelId(hotel.getId());
        LocalDate today = LocalDate.now();

        // Debug logging
        System.out.println("🔍 Hotel Statistics Debug - Hotel ID: " + hotel.getId());
        System.out.println("🔍 Total reservations found: " + allReservations.size());
        System.out.println("🔍 Today's date: " + today);
        
        for (Reservation r : allReservations) {
            System.out.println("🔍 Reservation " + r.getId() + " - Status: " + r.getStatus() + 
                ", Check-in: " + r.getCheckInDate() + ", Check-out: " + r.getCheckOutDate());
        }

        // Count confirmed bookings (CONFIRMED status or CHECKED_IN status)
        // We want to count all CONFIRMED bookings that haven't checked out yet,
        // and all CHECKED_IN bookings regardless of dates
        long confirmedBookings = allReservations.stream()
                .filter(r -> {
                    System.out.println("🔍 Processing reservation " + r.getId() + " - Status: " + r.getStatus() + 
                        ", Check-in: " + r.getCheckInDate() + ", Check-out: " + r.getCheckOutDate());
                    
                    // Count CHECKED_IN bookings regardless of dates (current guests)
                    if (r.getStatus() == ReservationStatus.CHECKED_IN) {
                        System.out.println("🔍 Reservation " + r.getId() + " included - CHECKED_IN guest");
                        return true;
                    }
                    
                    // Count CONFIRMED bookings that haven't passed their checkout date
                    if (r.getStatus() == ReservationStatus.CONFIRMED) {
                        // Use isAfter instead of !isBefore to be more explicit
                        // A booking is still valid if checkout date is today or in the future
                        boolean isValidBooking = r.getCheckOutDate().isAfter(today) || r.getCheckOutDate().isEqual(today);
                        System.out.println("🔍 Reservation " + r.getId() + " - CONFIRMED booking, checkout date check: " + 
                            r.getCheckOutDate() + " >= " + today + " = " + isValidBooking);
                        return isValidBooking;
                    }
                    
                    System.out.println("🔍 Reservation " + r.getId() + " excluded - status: " + r.getStatus());
                    return false;
                })
                .count();
        
        System.out.println("🔍 Confirmed bookings calculated: " + confirmedBookings);
        stats.put("confirmedBookings", confirmedBookings);

        // Booked rooms: rooms with active reservations that have assigned rooms
        Set<Long> bookedRoomIds = allReservations.stream()
                .filter(r -> {
                    // Count CHECKED_IN bookings regardless of dates (current guests)
                    if (r.getStatus() == ReservationStatus.CHECKED_IN) {
                        return true;
                    }
                    
                    // Count CONFIRMED bookings that haven't passed their checkout date
                    if (r.getStatus() == ReservationStatus.CONFIRMED) {
                        return r.getCheckOutDate().isAfter(today) || r.getCheckOutDate().isEqual(today);
                    }
                    
                    return false;
                })
                .filter(r -> r.getRoom() != null) // Filter out reservations without assigned rooms
                .map(r -> r.getRoom().getId())
                .collect(Collectors.toSet());

        long bookedRooms = bookedRoomIds.size();
        System.out.println("🔍 Booked rooms calculated: " + bookedRooms);
        stats.put("bookedRooms", bookedRooms);

        // Available rooms: total rooms minus booked rooms, and must be available for
        // booking
        long availableRooms = rooms.stream()
                .filter(r -> r.getIsAvailable() &&
                        r.getStatus() == RoomStatus.AVAILABLE &&
                        !bookedRoomIds.contains(r.getId()))
                .count();
        stats.put("availableRooms", availableRooms);

        // Staff statistics - include all staff roles (excluding customers and guests)
        List<User> staff = userRepository.findByHotelAndRolesContaining(hotel,
                Arrays.asList(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN,
                        UserRole.HOTEL_MANAGER, UserRole.ADMIN, UserRole.OPERATIONS_SUPERVISOR,
                        UserRole.MAINTENANCE));
        stats.put("totalStaff", staff.size());
        stats.put("activeStaff", staff.stream().mapToInt(s -> s.getIsActive() ? 1 : 0).sum());

        // Role breakdown
        Map<String, Long> roleBreakdown = staff.stream()
                .flatMap(user -> user.getRoles().stream())
                .collect(Collectors.groupingBy(
                        role -> role.name(),
                        Collectors.counting()));
        stats.put("staffByRole", roleBreakdown);

        // Room type breakdown
        Map<String, Long> roomTypeBreakdown = rooms.stream()
                .collect(Collectors.groupingBy(
                        room -> room.getRoomType().name(),
                        Collectors.counting()));
        stats.put("roomsByType", roomTypeBreakdown);

        return stats;
    }

    // Helper methods
    private User getUserByEmail(String email) {
        System.err.println("🔍 HotelAdminService.getUserByEmail called with email: " + email);
        Optional<User> userOpt = userRepository.findByEmailWithHotel(email);
        System.err.println("🔍 userRepository.findByEmailWithHotel returned: " + userOpt.isPresent());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.err.println("🔍 Found user with ID: " + user.getId() + ", email: " + user.getEmail());
            System.err.println("🔍 User hotel: " + (user.getHotel() != null ? user.getHotel().getId() : "null"));
            return user;
        } else {
            System.err.println("🔍 User not found, throwing exception");
            throw new RuntimeException("User not found");
        }
    }

    private HotelDTO convertToHotelDTO(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setName(hotel.getName());
        dto.setDescription(hotel.getDescription());
        dto.setAddress(hotel.getAddress());
        dto.setCity(hotel.getCity());
        dto.setCountry(hotel.getCountry());
        dto.setPhone(hotel.getPhone());
        dto.setMobilePaymentPhone(hotel.getMobilePaymentPhone());
        dto.setMobilePaymentPhone2(hotel.getMobilePaymentPhone2());
        dto.setEmail(hotel.getEmail());
        dto.setIsActive(hotel.getIsActive());
        dto.setCreatedAt(hotel.getCreatedAt());
        dto.setUpdatedAt(hotel.getUpdatedAt());

        // Calculate room statistics
        if (hotel.getRooms() != null) {
            dto.setTotalRooms(hotel.getRooms().size());
            dto.setAvailableRooms((int) hotel.getRooms().stream().mapToInt(r -> r.getIsAvailable() ? 1 : 0).sum());
            dto.setBookedRooms(
                    (int) hotel.getRooms().stream().filter(r -> r.getStatus() == RoomStatus.OCCUPIED).count());
        }

        // Calculate staff statistics
        List<User> staff = userRepository.findByHotelAndRolesContaining(hotel,
                Arrays.asList(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN,
                        UserRole.HOTEL_MANAGER, UserRole.ADMIN));
        dto.setTotalStaff(staff.size());
        dto.setActiveStaff((int) staff.stream().mapToInt(s -> s.getIsActive() ? 1 : 0).sum());

        return dto;
    }

    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setRoles(user.getRoles());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getHotel() != null) {
            dto.setHotelId(user.getHotel().getId());
            dto.setHotelName(user.getHotel().getName());
        }

        return dto;
    }

    private RoomDTO convertToRoomDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setPricePerNight(room.getPricePerNight());
        dto.setCapacity(room.getCapacity());
        dto.setDescription(room.getDescription());

        // Check if room is currently booked (use room's hotel ID)
        boolean isCurrentlyBooked = roomRepository.isRoomCurrentlyBooked(room.getId(), room.getHotelId());

        // Update room status to OCCUPIED if currently booked and status is AVAILABLE
        if (isCurrentlyBooked && room.getStatus() == RoomStatus.AVAILABLE) {
            dto.setStatus(RoomStatus.OCCUPIED);
        } else {
            dto.setStatus(room.getStatus());
        }

        // Availability toggle shows the admin's manual setting (independent of booking
        // status)
        // This allows hotel admin to control booking availability separately from
        // operational status
        dto.setIsAvailable(room.getIsAvailable());

        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());

        if (room.getHotel() != null) {
            dto.setHotelId(room.getHotel().getId());
            dto.setHotelName(room.getHotel().getName());
        }

        // Check if room has current guest (checked-in reservation) - same as Front Desk
        if (room.getReservations() != null) {
            room.getReservations().stream()
                    .filter(reservation -> reservation.getStatus() == ReservationStatus.CHECKED_IN)
                    .findFirst()
                    .ifPresent(reservation -> {
                        String guestName = "Unknown Guest";

                        if (reservation.getGuest() != null) {
                            // Registered user booking
                            guestName = reservation.getGuest().getFirstName() + " " +
                                    reservation.getGuest().getLastName();
                        } else if (reservation.getGuestInfo() != null && reservation.getGuestInfo().getName() != null
                                && !reservation.getGuestInfo().getName().trim().isEmpty()) {
                            // Anonymous guest booking - use guestInfo embedded object
                            guestName = reservation.getGuestInfo().getName();
                        }

                        dto.setCurrentGuest(guestName);
                    });
        }

        return dto;
    }

    // ===========================
    // BOOKING MANAGEMENT METHODS
    // ===========================

    /**
     * Get all bookings for a hotel with pagination
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> getHotelBookings(Long hotelId, int page, int size, String search) {
        // Verify hotel exists and user has access
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + hotelId));

        Pageable pageable = PageRequest.of(page, size);
        List<Reservation> allReservations = reservationRepository.findByHotelId(hotelId);

        // logger.debug("🔍 HotelAdminService: Found {} total reservations for hotel
        // {}", allReservations.size(), hotelId);

        // Apply search filter if provided
        List<Reservation> filteredReservations = allReservations;
        if (search != null && !search.trim().isEmpty()) {
            // logger.debug("🔍 HotelAdminService: Applying search filter with term: '{}'",
            // search.trim());
            String searchLower = search.toLowerCase();
            filteredReservations = allReservations.stream()
                    .filter(reservation -> {
                        // Handle both registered users and guest bookings
                        String firstName = "", lastName = "", email = "";

                        if (reservation.getGuest() != null) {
                            // Registered user booking
                            firstName = reservation.getGuest().getFirstName();
                            lastName = reservation.getGuest().getLastName();
                            email = reservation.getGuest().getEmail();
                        } else {
                            // Anonymous guest booking - use guestInfo embedded object
                            firstName = reservation.getGuestInfo() != null
                                    && reservation.getGuestInfo().getName() != null
                                            ? reservation.getGuestInfo().getName()
                                            : "";
                            lastName = ""; // No separate last name for guest bookings
                            email = reservation.getGuestInfo() != null && reservation.getGuestInfo().getEmail() != null
                                    ? reservation.getGuestInfo().getEmail()
                                    : "";
                        }

                        // For room number search, handle null room (walk-in bookings)
                        String roomNumber = (reservation.getRoom() != null)
                                ? reservation.getRoom().getRoomNumber()
                                : "To be assigned";

                        // Get payment reference for search
                        String paymentReference = reservation.getPaymentReference() != null
                                ? reservation.getPaymentReference()
                                : "";

                        // Get confirmation number for search
                        String confirmationNumber = reservation.getConfirmationNumber() != null
                                ? reservation.getConfirmationNumber()
                                : "";

                        // Get payment status for search
                        String paymentStatus = reservation.getPaymentStatusString();

                        return firstName.toLowerCase().contains(searchLower) ||
                                lastName.toLowerCase().contains(searchLower) ||
                                email.toLowerCase().contains(searchLower) ||
                                roomNumber.toLowerCase().contains(searchLower) ||
                                paymentReference.toLowerCase().contains(searchLower) ||
                                confirmationNumber.toLowerCase().contains(searchLower) ||
                                paymentStatus.toLowerCase().contains(searchLower) ||
                                reservation.getStatus().name().toLowerCase().contains(searchLower);
                    })
                    .collect(Collectors.toList());

            // logger.debug("🔍 HotelAdminService: Search filter applied, {} results found",
            // filteredReservations.size());
        }

        // Sort by check-in date descending
        filteredReservations.sort((r1, r2) -> r2.getCheckInDate().compareTo(r1.getCheckInDate()));

        // Apply pagination with bounds checking
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredReservations.size());

        List<Reservation> pageContent;
        if (start >= filteredReservations.size()) {
            // If start index is beyond available data, return empty list
            pageContent = new ArrayList<>();
        } else {
            pageContent = filteredReservations.subList(start, end);
        }

        List<BookingResponse> bookingResponses = pageContent.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());

        return new PageImpl<>(bookingResponses, pageable, filteredReservations.size());
    }

    /**
     * Get a specific booking by reservation ID for a hotel
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long reservationId, Long hotelId) {
        // Find the reservation
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + reservationId));

        // Verify the reservation belongs to the specified hotel
        // Handle both assigned and unassigned reservations
        Long reservationHotelId;
        if (reservation.getRoom() != null) {
            reservationHotelId = reservation.getRoom().getHotel().getId();
        } else {
            // For reservations without assigned rooms, use the hotel_id field directly
            reservationHotelId = reservation.getHotelId();
        }

        if (!reservationHotelId.equals(hotelId)) {
            throw new RuntimeException("Booking does not belong to your hotel");
        }

        return convertToBookingResponse(reservation);
    }

    /**
     * Get booking statistics for a hotel
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getHotelBookingStats(Long hotelId) {
        List<Reservation> allReservations = reservationRepository.findByHotelId(hotelId);

        Map<String, Object> stats = new HashMap<>();

        // Overall stats
        stats.put("totalBookings", allReservations.size());

        // Status breakdown
        Map<String, Long> statusBreakdown = allReservations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus().name(),
                        Collectors.counting()));
        stats.put("statusBreakdown", statusBreakdown);

        // Monthly revenue (current year)
        LocalDate startOfYear = LocalDate.now().withDayOfYear(1);
        BigDecimal currentYearRevenue = allReservations.stream()
                .filter(r -> r.getCheckInDate().isAfter(startOfYear.minusDays(1)))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED
                        || r.getStatus() == ReservationStatus.CHECKED_IN
                        || r.getStatus() == ReservationStatus.CHECKED_OUT)
                .map(Reservation::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("currentYearRevenue", currentYearRevenue);

        // This month's bookings
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        long thisMonthBookings = allReservations.stream()
                .filter(r -> r.getCheckInDate().isAfter(startOfMonth.minusDays(1)))
                .count();
        stats.put("thisMonthBookings", thisMonthBookings);

        // Upcoming check-ins (next 7 days)
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        long upcomingCheckIns = allReservations.stream()
                .filter(r -> r.getCheckInDate().isAfter(today.minusDays(1))
                        && r.getCheckInDate().isBefore(nextWeek.plusDays(1)))
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .count();
        stats.put("upcomingCheckIns", upcomingCheckIns);

        // Upcoming check-outs (next 7 days)
        long upcomingCheckOuts = allReservations.stream()
                .filter(r -> r.getCheckOutDate().isAfter(today.minusDays(1))
                        && r.getCheckOutDate().isBefore(nextWeek.plusDays(1)))
                .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN)
                .count();
        stats.put("upcomingCheckOuts", upcomingCheckOuts);

        return stats;
    }

    /**
     * Update booking status
     */
    @Transactional
    public BookingResponse updateBookingStatus(Long reservationId, ReservationStatus newStatus) {
        return bookingStatusUpdateService.updateBookingStatus(reservationId, newStatus, "hotel admin");
    }

    /**
     * Update booking payment status
     */
    @Transactional
    public BookingResponse updateBookingPaymentStatus(Long reservationId, String paymentStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        // Update payment status using the setter method that handles validation
        reservation.setPaymentStatusFromString(paymentStatus);

        // Save the updated reservation
        reservation = reservationRepository.save(reservation);

        return convertToBookingResponse(reservation);
    }

    /**
     * Modify booking (admin version)
     */
    @Transactional
    public BookingModificationResponse modifyBooking(Long reservationId, BookingModificationRequest request,
            Long hotelId) {
        try {
            // Find the reservation
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Booking not found with id: " + reservationId));

            // Verify the reservation belongs to the specified hotel
            if (!reservation.getRoom().getHotel().getId().equals(hotelId)) {
                return new BookingModificationResponse(false, "Booking does not belong to your hotel");
            }

            // Set the confirmation number and guest email from the existing reservation
            request.setConfirmationNumber(reservation.getConfirmationNumber());
            if (reservation.getGuest() != null) {
                request.setGuestEmail(reservation.getGuest().getEmail());
            } else if (reservation.getGuestInfo() != null) {
                request.setGuestEmail(reservation.getGuestInfo().getEmail());
            }

            // Use the existing booking service modification logic
            return bookingService.modifyBooking(request);

        } catch (Exception e) {
            return new BookingModificationResponse(false, "Failed to modify booking: " + e.getMessage());
        }
    }

    /**
     * Delete booking (reservation)
     */
    public void deleteBooking(Long reservationId, Long hotelId) {
        // Find the reservation
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + reservationId));

        // Verify the reservation belongs to the specified hotel
        if (!reservation.getRoom().getHotel().getId().equals(hotelId)) {
            throw new RuntimeException("Booking does not belong to your hotel");
        }

        // Check if booking can be deleted (e.g., not checked in or active)
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new RuntimeException("Cannot delete a booking with checked-in status");
        }

        reservationRepository.delete(reservation);
    }

    /**
     * Convert Reservation to BookingResponse DTO
     */
    /**
     * Fetch guest user without tenant filtering (guests have tenant_id = NULL)
     */
    private User fetchGuestUserById(Long guestId) {
        if (guestId == null) {
            return null;
        }

        try {
            // Use native query to bypass tenant filtering for guest users
            // Guest users are those without hotel_id (not staff members)
            Query query = entityManager.createNativeQuery(
                    "SELECT id, email, first_name, last_name, phone FROM users WHERE id = ? AND hotel_id IS NULL");
            query.setParameter(1, guestId);
            Object[] result = (Object[]) query.getSingleResult();

            // Manually create User object to avoid validation issues
            User guestUser = new User();
            guestUser.setId(((Number) result[0]).longValue());
            guestUser.setEmail((String) result[1]);
            guestUser.setFirstName((String) result[2]);
            guestUser.setLastName((String) result[3]);
            guestUser.setPhone((String) result[4]);

            return guestUser;
        } catch (Exception e) {
            // Silently handle guest fetch errors
            return null;
        }
    }

    private BookingResponse convertToBookingResponse(Reservation reservation) {
        BookingResponse response = new BookingResponse();
        response.setReservationId(reservation.getId());
        response.setStatus(reservation.getStatus().name());
        response.setConfirmationNumber(generateConfirmationNumber(reservation.getId()));
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setPaymentIntentId(reservation.getPaymentIntentId());
        response.setPaymentReference(reservation.getPaymentReference());
        response.setCreatedAt(reservation.getCreatedAt());

        // Room details
        Room room = reservation.getRoom();
        if (room != null) {
            response.setRoomNumber(room.getRoomNumber());
            response.setRoomType(room.getRoomType().name());
            response.setPricePerNight(room.getPricePerNight());
            response.setHotelName(room.getHotel().getName());
            response.setHotelAddress(room.getHotel().getAddress());
        } else {
            // For bookings without assigned rooms yet
            response.setRoomNumber("To be assigned");
            response.setRoomType(reservation.getRoomType() != null ? reservation.getRoomType().name() : "Unknown");
            response.setPricePerNight(reservation.getPricePerNight());
            // Get hotel details from reservation's hotel field
            if (reservation.getHotel() != null) {
                response.setHotelName(reservation.getHotel().getName());
                response.setHotelAddress(reservation.getHotel().getAddress());
            } else {
                response.setHotelName("Unknown Hotel");
                response.setHotelAddress("Unknown Address");
            }
        }

        // Guest details - handle both registered users and guest bookings
        if (reservation.getGuest() != null) {
            // Registered user booking - fetch guest safely without tenant filtering
            User guest = fetchGuestUserById(reservation.getGuest().getId());
            if (guest != null) {
                response.setGuestName(guest.getFirstName() + " " + guest.getLastName());
                response.setGuestEmail(guest.getEmail());
            } else {
                // If guest user is not found, use guestInfo from reservation
                if (reservation.getGuestInfo() != null) {
                    response.setGuestName(
                            reservation.getGuestInfo().getName() != null ? reservation.getGuestInfo().getName()
                                    : "Name Not Available");
                    response.setGuestEmail(
                            reservation.getGuestInfo().getEmail() != null ? reservation.getGuestInfo().getEmail()
                                    : "N/A");
                } else {
                    response.setGuestName("Name Not Available");
                    response.setGuestEmail("N/A");
                }
            }
        } else if (reservation.getGuestInfo() != null) {
            // Anonymous guest booking (no User record)
            response.setGuestName(reservation.getGuestInfo().getName() != null ? reservation.getGuestInfo().getName()
                    : "Name Not Available");
            response.setGuestEmail(
                    reservation.getGuestInfo().getEmail() != null ? reservation.getGuestInfo().getEmail() : "N/A");
        } else {
            // Fallback for incomplete data
            response.setGuestName("Name Not Available");
            response.setGuestEmail("N/A");
        }

        // Payment status - use the actual payment status from the entity
        response.setPaymentStatus(reservation.getPaymentStatusString());

        return response;
    }

    /**
     * Generate confirmation number
     */
    private String generateConfirmationNumber(Long reservationId) {
        return String.format("BK%08d", reservationId);
    }

    /**
     * Get available rooms for a specific date range (excludes occupied/assigned
     * rooms)
     */
    @Cacheable(value = CacheConfig.AVAILABLE_ROOMS_CACHE, key = "'admin:' + #adminEmail + ':checkin:' + #checkInDate + ':checkout:' + #checkOutDate + ':guests:' + #guests + ':page:' + #page + ':size:' + #size")
    public List<RoomDTO> getAvailableRoomsForDateRange(String adminEmail, LocalDate checkInDate, LocalDate checkOutDate,
            Integer guests, int page, int size) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        // Get all rooms for the hotel that are available (not disabled)
        List<Room> allRooms = roomRepository.findByHotelIdAndIsAvailableTrueAndStatus(
                hotel.getId(), RoomStatus.AVAILABLE);

        // Filter out rooms that are occupied or assigned for the given date range
        List<RoomDTO> availableRooms = allRooms.stream()
                .filter(room -> {
                    // Check if room has capacity for guests
                    if (room.getCapacity() < guests) {
                        return false;
                    }

                    // Check if room has any conflicting reservations for the date range
                    boolean hasConflicts = room.getReservations().stream()
                            .anyMatch(reservation -> {
                                // Only consider active reservations (confirmed or checked-in)
                                if (reservation.getStatus() != ReservationStatus.CONFIRMED &&
                                        reservation.getStatus() != ReservationStatus.CHECKED_IN) {
                                    return false;
                                }

                                // Check for date overlap
                                LocalDate resCheckIn = reservation.getCheckInDate();
                                LocalDate resCheckOut = reservation.getCheckOutDate();

                                // Dates conflict if they overlap
                                return !(checkOutDate.isBefore(resCheckIn) || checkInDate.isAfter(resCheckOut));
                            });

                    return !hasConflicts;
                })
                .map(this::convertToRoomDTO)
                .collect(Collectors.toList());

        return availableRooms;
    }

    /**
     * Convert RoomType enum to a consistent Long ID for image storage
     * Uses enum ordinal + 1 to avoid 0 and ensure consistency
     */
    private Long getRoomTypeId(RoomType roomType) {
        if (roomType == null) {
            return null;
        }
        return (long) (roomType.ordinal() + 1);
    }

    /**
     * Convert HotelImage entity to HotelImageDTO
     */
    private HotelImageDTO convertToImageDTO(HotelImage image) {
        if (image == null) {
            return null;
        }

        HotelImageDTO dto = new HotelImageDTO();
        dto.setId(image.getId());
        dto.setTenantId(image.getTenantId());
        dto.setHotelId(image.getHotelId());
        dto.setRoomTypeId(image.getRoomTypeId());
        dto.setImageCategory(image.getImageCategory());
        dto.setFileName(image.getFileName());
        dto.setFilePath(image.getFilePath());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setAltText(image.getAltText());
        dto.setFileSize(image.getFileSize());
        dto.setMimeType(image.getMimeType());
        dto.setWidth(image.getWidth());
        dto.setHeight(image.getHeight());
        dto.setIsActive(image.getIsActive());
        dto.setCreatedAt(image.getCreatedAt());
        dto.setUpdatedAt(image.getUpdatedAt());

        return dto;
    }

    /**
     * Fix room status consistency - ensure occupied rooms have checked-in guests
     * and available rooms don't have checked-in guests
     */
    public void fixRoomStatusConsistency(String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();

        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }

        List<Room> hotelRooms = roomRepository.findByHotelId(hotel.getId());
        
        for (Room room : hotelRooms) {
            // Check if room has checked-in guest
            boolean hasCheckedInGuest = room.getReservations() != null && 
                room.getReservations().stream()
                    .anyMatch(reservation -> 
                        reservation.getStatus() == ReservationStatus.CHECKED_IN &&
                        reservation.getCheckOutDate().isAfter(LocalDate.now())
                    );

            // Update room status based on actual occupancy
            if (hasCheckedInGuest && room.getStatus() != RoomStatus.OCCUPIED) {
                room.setStatus(RoomStatus.OCCUPIED);
                roomRepository.save(room);
                logger.info("Updated room {} status to OCCUPIED (has checked-in guest)", room.getRoomNumber());
            } else if (!hasCheckedInGuest && room.getStatus() == RoomStatus.OCCUPIED && room.getIsAvailable()) {
                room.setStatus(RoomStatus.AVAILABLE);
                roomRepository.save(room);
                logger.info("Updated room {} status to AVAILABLE (no checked-in guest)", room.getRoomNumber());
            }
        }
    }
}
