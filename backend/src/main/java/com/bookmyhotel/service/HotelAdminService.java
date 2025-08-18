package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomDTO;
import com.bookmyhotel.dto.UserDTO;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for hotel admin operations
 */
@Service
@Transactional
public class HotelAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        hotel.setEmail(hotelDTO.getEmail());
        hotel.setUpdatedAt(LocalDateTime.now());
        
        Hotel saved = hotelRepository.save(hotel);
        return convertToHotelDTO(saved);
    }

    /**
     * Get hotel staff with filtering
     */
    public Page<UserDTO> getHotelStaff(String adminEmail, int page, int size, String search, String role) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();
        
        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        
        // Get all staff for this hotel
        List<User> allStaff = userRepository.findByHotelAndRolesContaining(hotel, 
            Arrays.asList(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN));
        
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
                
                return matches;
            })
            .collect(Collectors.toList());
        
        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, filteredStaff.size());
        List<User> pageContent = filteredStaff.subList(start, end);
        
        List<UserDTO> userDTOs = pageContent.stream()
            .map(this::convertToUserDTO)
            .collect(Collectors.toList());
        
        return new PageImpl<>(userDTOs, pageable, filteredStaff.size());
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
        newUser.setTenantId(admin.getTenantId());
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
    public Page<RoomDTO> getHotelRooms(String adminEmail, int page, int size, String search, String roomType, Boolean available) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();
        
        if (hotel == null) {
            throw new RuntimeException("Hotel admin is not associated with any hotel");
        }
        
        Pageable pageable = PageRequest.of(page, size);
        
        // Get all rooms for this hotel
        List<Room> allRooms = roomRepository.findByHotel(hotel);
        
        // Apply filters
        List<Room> filteredRooms = allRooms.stream()
            .filter(room -> {
                boolean matches = true;
                
                // Search filter
                if (search != null && !search.trim().isEmpty()) {
                    String searchLower = search.toLowerCase();
                    matches = room.getRoomNumber().toLowerCase().contains(searchLower) ||
                             (room.getDescription() != null && room.getDescription().toLowerCase().contains(searchLower));
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
        
        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, filteredRooms.size());
        List<Room> pageContent = filteredRooms.subList(start, end);
        
        List<RoomDTO> roomDTOs = pageContent.stream()
            .map(this::convertToRoomDTO)
            .collect(Collectors.toList());
        
        return new PageImpl<>(roomDTOs, pageable, filteredRooms.size());
    }

    /**
     * Add a new room
     */
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
        newRoom.setPricePerNight(roomDTO.getPricePerNight());
        newRoom.setCapacity(roomDTO.getCapacity());
        newRoom.setDescription(roomDTO.getDescription());
        newRoom.setIsAvailable(true);
        newRoom.setHotel(hotel);
        newRoom.setTenantId(admin.getTenantId());
        newRoom.setCreatedAt(LocalDateTime.now());
        newRoom.setUpdatedAt(LocalDateTime.now());
        
        Room saved = roomRepository.save(newRoom);
        return convertToRoomDTO(saved);
    }

    /**
     * Get room by ID
     */
    @Transactional(readOnly = true)
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
    public void deleteRoom(Long roomId, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();
        
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Verify the room belongs to the same hotel
        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room does not belong to your hotel");
        }
        
        roomRepository.delete(room);
    }

    /**
     * Toggle room availability
     */
    public RoomDTO toggleRoomAvailability(Long roomId, Boolean available, String adminEmail) {
        User admin = getUserByEmail(adminEmail);
        Hotel hotel = admin.getHotel();
        
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        
        // Verify the room belongs to the same hotel
        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new RuntimeException("Room does not belong to your hotel");
        }
        
        room.setIsAvailable(available);
        room.setUpdatedAt(LocalDateTime.now());
        
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
        List<Room> rooms = roomRepository.findByHotel(hotel);
        stats.put("totalRooms", rooms.size());
        stats.put("availableRooms", rooms.stream().mapToInt(r -> r.getIsAvailable() ? 1 : 0).sum());
        stats.put("occupiedRooms", rooms.stream().mapToInt(r -> r.getIsAvailable() ? 0 : 1).sum());
        
        // Staff statistics
        List<User> staff = userRepository.findByHotelAndRolesContaining(hotel, 
            Arrays.asList(UserRole.FRONTDESK, UserRole.HOUSEKEEPING, UserRole.HOTEL_ADMIN));
        stats.put("totalStaff", staff.size());
        stats.put("activeStaff", staff.stream().mapToInt(s -> s.getIsActive() ? 1 : 0).sum());
        
        // Role breakdown
        Map<String, Long> roleBreakdown = staff.stream()
            .flatMap(user -> user.getRoles().stream())
            .collect(Collectors.groupingBy(
                role -> role.name(),
                Collectors.counting()
            ));
        stats.put("staffByRole", roleBreakdown);
        
        // Room type breakdown
        Map<String, Long> roomTypeBreakdown = rooms.stream()
            .collect(Collectors.groupingBy(
                room -> room.getRoomType().name(),
                Collectors.counting()
            ));
        stats.put("roomsByType", roomTypeBreakdown);
        
        return stats;
    }

    // Helper methods
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
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
        dto.setEmail(hotel.getEmail());
        dto.setCreatedAt(hotel.getCreatedAt());
        dto.setUpdatedAt(hotel.getUpdatedAt());
        
        // Calculate statistics
        if (hotel.getRooms() != null) {
            dto.setTotalRooms(hotel.getRooms().size());
            dto.setAvailableRooms((int) hotel.getRooms().stream().mapToInt(r -> r.getIsAvailable() ? 1 : 0).sum());
        }
        
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
        dto.setIsAvailable(room.getIsAvailable());
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        
        if (room.getHotel() != null) {
            dto.setHotelId(room.getHotel().getId());
            dto.setHotelName(room.getHotel().getName());
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
        
        // Apply search filter if provided
        List<Reservation> filteredReservations = allReservations;
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            filteredReservations = allReservations.stream()
                .filter(reservation -> 
                    reservation.getGuest().getFirstName().toLowerCase().contains(searchLower) ||
                    reservation.getGuest().getLastName().toLowerCase().contains(searchLower) ||
                    reservation.getGuest().getEmail().toLowerCase().contains(searchLower) ||
                    reservation.getRoom().getRoomNumber().toLowerCase().contains(searchLower) ||
                    reservation.getStatus().name().toLowerCase().contains(searchLower)
                )
                .collect(Collectors.toList());
        }

        // Sort by check-in date descending
        filteredReservations.sort((r1, r2) -> r2.getCheckInDate().compareTo(r1.getCheckInDate()));

        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredReservations.size());
        List<Reservation> pageContent = filteredReservations.subList(start, end);

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
        if (!reservation.getRoom().getHotel().getId().equals(hotelId)) {
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
                Collectors.counting()
            ));
        stats.put("statusBreakdown", statusBreakdown);
        
        // Monthly revenue (current year)
        LocalDate startOfYear = LocalDate.now().withDayOfYear(1);
        BigDecimal currentYearRevenue = allReservations.stream()
            .filter(r -> r.getCheckInDate().isAfter(startOfYear.minusDays(1)))
            .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED || r.getStatus() == ReservationStatus.CHECKED_IN || r.getStatus() == ReservationStatus.CHECKED_OUT)
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
            .filter(r -> r.getCheckInDate().isAfter(today.minusDays(1)) && r.getCheckInDate().isBefore(nextWeek.plusDays(1)))
            .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
            .count();
        stats.put("upcomingCheckIns", upcomingCheckIns);
        
        // Upcoming check-outs (next 7 days)
        long upcomingCheckOuts = allReservations.stream()
            .filter(r -> r.getCheckOutDate().isAfter(today.minusDays(1)) && r.getCheckOutDate().isBefore(nextWeek.plusDays(1)))
            .filter(r -> r.getStatus() == ReservationStatus.CHECKED_IN)
            .count();
        stats.put("upcomingCheckOuts", upcomingCheckOuts);
        
        return stats;
    }

    /**
     * Update booking status
     */
    public BookingResponse updateBookingStatus(Long reservationId, ReservationStatus newStatus) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));
        
        reservation.setStatus(newStatus);
        reservation = reservationRepository.save(reservation);
        
        return convertToBookingResponse(reservation);
    }

    /**
     * Convert Reservation to BookingResponse DTO
     */
    private BookingResponse convertToBookingResponse(Reservation reservation) {
        BookingResponse response = new BookingResponse();
        response.setReservationId(reservation.getId());
        response.setStatus(reservation.getStatus().name());
        response.setConfirmationNumber(generateConfirmationNumber(reservation.getId()));
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setPaymentIntentId(reservation.getPaymentIntentId());
        response.setCreatedAt(reservation.getCreatedAt());
        
        // Room details
        Room room = reservation.getRoom();
        response.setRoomNumber(room.getRoomNumber());
        response.setRoomType(room.getRoomType().name());
        response.setPricePerNight(room.getPricePerNight());
        response.setHotelName(room.getHotel().getName());
        response.setHotelAddress(room.getHotel().getAddress());
        
        // Guest details
        User guest = reservation.getGuest();
        response.setGuestName(guest.getFirstName() + " " + guest.getLastName());
        response.setGuestEmail(guest.getEmail());
        
        // Payment status
        if (reservation.getPaymentIntentId() != null) {
            response.setPaymentStatus("PAID");
        } else {
            response.setPaymentStatus("PENDING");
        }
        
        return response;
    }

    /**
     * Generate confirmation number
     */
    private String generateConfirmationNumber(Long reservationId) {
        return String.format("BK%08d", reservationId);
    }
}
