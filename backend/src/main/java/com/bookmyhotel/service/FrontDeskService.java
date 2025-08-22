package com.bookmyhotel.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.FrontDeskStats;
import com.bookmyhotel.dto.HotelDTO;
import com.bookmyhotel.dto.RoomResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomStatus;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Front desk service for managing bookings and guest services
 */
@Service
@Transactional
public class FrontDeskService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private BookingService bookingService;
    
    // TODO: Temporarily commented out for compilation - will reintegrate after Phase 3.3
    // @Autowired
    // private BookingHistoryService historyService;
    
    /**
     * Get all bookings with pagination and search
     */
    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(Pageable pageable, String search) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        // For now, get all reservations and do basic filtering
        // In the future, we can add more sophisticated search with tenant-aware queries
        List<Reservation> allReservations = reservationRepository.findAll();
        
        // Filter by tenant and search term
        List<Reservation> filteredReservations = allReservations.stream()
            .filter(reservation -> tenantId.equals(reservation.getTenantId()))
            .filter(reservation -> search == null || search.trim().isEmpty() || 
                    reservation.getGuest().getFirstName().toLowerCase().contains(search.toLowerCase()) ||
                    reservation.getGuest().getLastName().toLowerCase().contains(search.toLowerCase()) ||
                    reservation.getRoom().getRoomNumber().toLowerCase().contains(search.toLowerCase()) ||
                    reservation.getConfirmationNumber().toLowerCase().contains(search.toLowerCase()))
            .toList();
        
        // Apply manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredReservations.size());
        List<Reservation> pagedReservations = start < filteredReservations.size() ? 
            filteredReservations.subList(start, end) : List.of();
        
        List<BookingResponse> bookingResponses = pagedReservations.stream()
            .map(this::convertToBookingResponse)
            .toList();
        
        return new PageImpl<>(bookingResponses, pageable, filteredReservations.size());
    }

    /**
     * Get a single booking by reservation ID
     */
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        return convertToBookingResponse(reservation);
    }

    /**
     * Update booking status
     */
    public BookingResponse updateBookingStatus(Long reservationId, String status) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        try {
            ReservationStatus newStatus = ReservationStatus.valueOf(status.toUpperCase());
            reservation.setStatus(newStatus);
            
            // Update room status based on reservation status
            Room room = reservation.getRoom();
            switch (newStatus) {
                case CHECKED_IN:
                    room.setStatus(RoomStatus.OCCUPIED);
                    reservation.setActualCheckInTime(LocalDateTime.now());
                    break;
                case CHECKED_OUT:
                    room.setStatus(RoomStatus.MAINTENANCE);
                    reservation.setActualCheckOutTime(LocalDateTime.now());
                    break;
                case CANCELLED:
                case NO_SHOW:
                    room.setStatus(RoomStatus.AVAILABLE);
                    break;
                default:
                    // For other statuses, keep room status as is
                    break;
            }
            
            roomRepository.save(room);
            reservation = reservationRepository.save(reservation);
            
            return convertToBookingResponse(reservation);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid reservation status: " + status);
        }
    }

    /**
     * Delete booking
     */
    public void deleteBooking(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        // Only allow deletion if not checked in
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN) {
            throw new IllegalStateException("Cannot delete an active (checked-in) reservation");
        }
        
        // Make room available if it was reserved
        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            Room room = reservation.getRoom();
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
        
        reservationRepository.delete(reservation);
    }

    /**
     * Get today's arrivals
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getTodaysArrivals() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        LocalDate today = LocalDate.now();
        List<Reservation> arrivals = reservationRepository.findUpcomingCheckInsByTenantId(today, tenantId);
        
        return arrivals.stream()
            .map(this::convertToBookingResponse)
            .toList();
    }
    
    /**
     * Get today's departures
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getTodaysDepartures() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        LocalDate today = LocalDate.now();
        List<Reservation> departures = reservationRepository.findUpcomingCheckOutsByTenantId(today, tenantId);
        
        return departures.stream()
            .map(this::convertToBookingResponse)
            .toList();
    }
    
    /**
     * Get all current guests (checked in)
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getCurrentGuests() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        List<Reservation> currentGuests = reservationRepository.findByStatusAndTenantId(ReservationStatus.CHECKED_IN, tenantId);
        
        return currentGuests.stream()
            .map(this::convertToBookingResponse)
            .toList();
    }
    
    /**
     * Check in a guest
     */
    public BookingResponse checkInGuest(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        // Validate that check-in is allowed
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed reservations can be checked in");
        }
        
        if (reservation.getCheckInDate().isAfter(LocalDate.now().plusDays(1))) {
            throw new IllegalStateException("Cannot check in more than 1 day early");
        }
        
        // Update reservation status
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        reservation.setActualCheckInTime(LocalDateTime.now());
        
        // Update room status to occupied
        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);
        
        reservation = reservationRepository.save(reservation);
        
        // Record check-in in history
        // TODO: Complete history integration after Phase 3.3
        /*
        try {
            historyService.recordBookingAction(
                reservation,
                BookingActionType.CHECKED_IN,
                "Front Desk Staff", // TODO: Get actual staff member name
                "Guest checked in to room " + room.getRoomNumber(),
                null, null, null
            );
        } catch (Exception e) {
            // Log but don't fail the check-in process
            System.err.println("Failed to record check-in in history: " + e.getMessage());
        }
        */
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Check out a guest
     */
    public BookingResponse checkOutGuest(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        // Validate that check-out is allowed
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new IllegalStateException("Only checked-in guests can be checked out");
        }
        
        // Update reservation status
        reservation.setStatus(ReservationStatus.CHECKED_OUT);
        reservation.setActualCheckOutTime(LocalDateTime.now());
        
        // Update room status to need cleaning
        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.MAINTENANCE); // Assuming rooms need cleaning after checkout
        roomRepository.save(room);
        
        reservation = reservationRepository.save(reservation);
        
        // Record check-out in history
        // TODO: Complete history integration after Phase 3.3
        /*
        try {
            historyService.recordBookingAction(
                reservation,
                BookingActionType.CHECKED_OUT,
                "Front Desk Staff", // TODO: Get actual staff member name
                "Guest checked out from room " + room.getRoomNumber(),
                null, null, null
            );
        } catch (Exception e) {
            // Log but don't fail the check-out process
            System.err.println("Failed to record check-out in history: " + e.getMessage());
        }
        */
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Mark guest as no-show
     */
    public BookingResponse markNoShow(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        // Validate that no-show marking is allowed
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed reservations can be marked as no-show");
        }
        
        // Check if it's past the check-in date
        if (reservation.getCheckInDate().isAfter(LocalDate.now())) {
            throw new IllegalStateException("Cannot mark as no-show before check-in date");
        }
        
        // Update reservation status
        reservation.setStatus(ReservationStatus.NO_SHOW);
        
        // Make room available again
        Room room = reservation.getRoom();
        room.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room);
        
        reservation = reservationRepository.save(reservation);
        
        // Record no-show in history
        // TODO: Complete history integration after Phase 3.3
        /*
        try {
            historyService.recordBookingAction(
                reservation,
                BookingActionType.NO_SHOW,
                "Front Desk Staff", // TODO: Get actual staff member name
                "Guest marked as no-show for room " + room.getRoomNumber(),
                null, null, null
            );
        } catch (Exception e) {
            // Log but don't fail the no-show process
            System.err.println("Failed to record no-show in history: " + e.getMessage());
        }
        */
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Cancel booking
     */
    public BookingResponse cancelBooking(Long reservationId, String reason) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        // Validate that cancellation is allowed
        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT) {
            throw new IllegalStateException("Cannot cancel a completed reservation");
        }
        
        // Update reservation status
        reservation.setStatus(ReservationStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            reservation.setCancellationReason(reason.trim());
        }
        reservation.setCancelledAt(LocalDateTime.now());
        
        // Make room available again if not already checked in
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            Room room = reservation.getRoom();
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
        
        reservation = reservationRepository.save(reservation);
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Search bookings by various criteria
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> searchBookings(String guestName, String roomNumber, 
                                               String confirmationNumber, LocalDate checkInDate,
                                               ReservationStatus status) {
        
        // For now, implement basic search - this can be enhanced with custom queries
        List<Reservation> allReservations = reservationRepository.findAll();
        
        return allReservations.stream()
            .filter(reservation -> {
                if (guestName != null && !guestName.trim().isEmpty()) {
                    User guest = reservation.getGuest();
                    String fullName = (guest.getFirstName() + " " + guest.getLastName()).toLowerCase();
                    return fullName.contains(guestName.toLowerCase().trim());
                }
                return true;
            })
            .filter(reservation -> {
                if (roomNumber != null && !roomNumber.trim().isEmpty()) {
                    return reservation.getRoom().getRoomNumber()
                        .toLowerCase().contains(roomNumber.toLowerCase().trim());
                }
                return true;
            })
            .filter(reservation -> {
                if (confirmationNumber != null && !confirmationNumber.trim().isEmpty()) {
                    return reservation.getConfirmationNumber()
                        .toLowerCase().contains(confirmationNumber.toLowerCase().trim());
                }
                return true;
            })
            .filter(reservation -> {
                if (checkInDate != null) {
                    return reservation.getCheckInDate().equals(checkInDate);
                }
                return true;
            })
            .filter(reservation -> {
                if (status != null) {
                    return reservation.getStatus() == status;
                }
                return true;
            })
            .map(this::convertToBookingResponse)
            .toList();
    }
    
    /**
     * Get front desk statistics
     */
    @Transactional(readOnly = true)
    public FrontDeskStats getFrontDeskStats() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        LocalDate today = LocalDate.now();
        
        long todaysArrivals = reservationRepository.findUpcomingCheckInsByTenantId(today, tenantId).size();
        long todaysDepartures = reservationRepository.findUpcomingCheckOutsByTenantId(today, tenantId).size();
        long currentOccupancy = reservationRepository.findByStatusAndTenantId(ReservationStatus.CHECKED_IN, tenantId).size();
        
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.countByStatus(RoomStatus.AVAILABLE);
        long roomsOutOfOrder = roomRepository.countByStatus(RoomStatus.OUT_OF_ORDER);
        long roomsUnderMaintenance = roomRepository.countByStatus(RoomStatus.MAINTENANCE);
        
        return new FrontDeskStats(
            todaysArrivals,
            todaysDepartures,
            currentOccupancy,
            availableRooms,
            roomsOutOfOrder,
            roomsUnderMaintenance
        );
    }

    /**
     * Get hotel information for the current tenant
     */
    @Transactional(readOnly = true)
    public HotelDTO getHotelInfo() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        // For now, get the first hotel for the tenant
        // In a multi-hotel system, this would need to be more specific
        List<Hotel> hotels = hotelRepository.findByTenantId(tenantId);
        if (hotels.isEmpty()) {
            throw new ResourceNotFoundException("No hotel found for tenant: " + tenantId);
        }
        
        Hotel hotel = hotels.get(0); // Get the first hotel for this tenant
        return convertToHotelDTO(hotel);
    }

    /**
     * Get all rooms with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<RoomResponse> getAllRooms(Pageable pageable, String search, String roomType, String status) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new IllegalStateException("Tenant context is not set");
        }
        
        // Get the hotel for this tenant first
        List<Hotel> hotels = hotelRepository.findByTenantId(tenantId);
        if (hotels.isEmpty()) {
            throw new ResourceNotFoundException("No hotel found for tenant: " + tenantId);
        }
        
        Hotel hotel = hotels.get(0);
        
        // Get all rooms for the hotel and apply filtering
        List<Room> allRooms = roomRepository.findByHotelIdOrderByRoomNumber(hotel.getId());
        
        // Apply search and filters
        List<Room> filteredRooms = allRooms.stream()
            .filter(room -> search == null || search.trim().isEmpty() || 
                    room.getRoomNumber().toLowerCase().contains(search.toLowerCase()) ||
                    room.getDescription() != null && room.getDescription().toLowerCase().contains(search.toLowerCase()))
            .filter(room -> roomType == null || roomType.trim().isEmpty() || 
                    room.getRoomType().toString().equalsIgnoreCase(roomType))
            .filter(room -> status == null || status.trim().isEmpty() || 
                    room.getStatus().toString().equalsIgnoreCase(status))
            .toList();
        
        // Apply manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredRooms.size());
        List<Room> pagedRooms = start < filteredRooms.size() ? 
            filteredRooms.subList(start, end) : List.of();
        
        List<RoomResponse> roomResponses = pagedRooms.stream()
            .map(this::convertToRoomResponse)
            .toList();
        
        return new PageImpl<>(roomResponses, pageable, filteredRooms.size());
    }

    /**
     * Update room status
     */
    public RoomResponse updateRoomStatus(Long roomId, String status, String notes) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        
        try {
            // Convert status string to RoomStatus enum (consistent with Hotel Admin)
            String normalizedStatus = status.replace(" ", "_").toUpperCase();
            RoomStatus newStatus = RoomStatus.valueOf(normalizedStatus);
            
            // Business rule: Cannot change status if room has active bookings and new status would conflict
            LocalDate today = LocalDate.now();
            boolean hasActiveBookings = room.getReservations().stream()
                .anyMatch(reservation -> 
                    (reservation.getStatus() == ReservationStatus.CONFIRMED || 
                     reservation.getStatus() == ReservationStatus.CHECKED_IN) &&
                    !reservation.getCheckInDate().isAfter(today) &&
                    !reservation.getCheckOutDate().isBefore(today));
            
            if (hasActiveBookings && (newStatus == RoomStatus.OUT_OF_ORDER || 
                                     newStatus == RoomStatus.MAINTENANCE)) {
                throw new RuntimeException("Cannot set room to " + status + " - it has active bookings");
            }
            
            room.setStatus(newStatus);
            room.setUpdatedAt(LocalDateTime.now());
            
            // Note: Availability is controlled independently through toggleRoomAvailability
            // This allows hotel staff to control booking availability separately from room status
            
            room = roomRepository.save(room);
            
            return convertToRoomResponse(room);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid room status: " + status);
        }
    }

    /**
     * Toggle room availability
     */
    public RoomResponse toggleRoomAvailability(Long roomId, boolean available, String reason) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        
        // Business rule: Cannot make room unavailable if it has active bookings
        if (!available) {
            LocalDate today = LocalDate.now();
            boolean hasActiveBookings = room.getReservations().stream()
                .anyMatch(reservation -> 
                    (reservation.getStatus() == ReservationStatus.CONFIRMED || 
                     reservation.getStatus() == ReservationStatus.CHECKED_IN) &&
                    !reservation.getCheckInDate().isAfter(today) &&
                    !reservation.getCheckOutDate().isBefore(today));
            
            if (hasActiveBookings) {
                throw new RuntimeException("Cannot make room unavailable - it has active bookings");
            }
        }
        
        room.setIsAvailable(available);
        room.setUpdatedAt(LocalDateTime.now());
        
        // Note: Status and availability are controlled independently
        // This allows hotel staff to control booking availability without changing room status
        
        room = roomRepository.save(room);
        
        return convertToRoomResponse(room);
    }

    /**
     * Toggle room availability (overloaded method for actual toggling)
     */
    public RoomResponse toggleRoomAvailability(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        
        // Toggle the availability
        boolean newAvailability = !room.getIsAvailable();
        
        return toggleRoomAvailability(roomId, newAvailability, null);
    }

    /**
     * Get room details by ID
     */
    public RoomResponse getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + roomId));
        
        return convertToRoomResponse(room);
    }
    
    /**
     * Convert Hotel entity to HotelDTO
     */
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
        dto.setTenantId(hotel.getTenantId());
        dto.setIsActive(hotel.getIsActive());
        dto.setCreatedAt(hotel.getCreatedAt());
        dto.setUpdatedAt(hotel.getUpdatedAt());
        
        // Add room count
        if (hotel.getRooms() != null) {
            dto.setRoomCount(hotel.getRooms().size());
        } else {
            long roomCount = roomRepository.countByHotelId(hotel.getId());
            dto.setRoomCount((int) roomCount);
        }
        
        return dto;
    }
    
    /**
     * Convert reservation to booking response
     */
    private BookingResponse convertToBookingResponse(Reservation reservation) {
        // Delegate to BookingService for consistent conversion
        return bookingService.convertToBookingResponse(reservation);
    }

    /**
     * Convert room to room response with consistent business logic
     */
    private RoomResponse convertToRoomResponse(Room room) {
        RoomResponse response = new RoomResponse();
        response.setId(room.getId());
        response.setRoomNumber(room.getRoomNumber());
        response.setRoomType(room.getRoomType());
        response.setPricePerNight(room.getPricePerNight());
        response.setCapacity(room.getCapacity());
        response.setDescription(room.getDescription());
        
        // Check if room is currently booked
        boolean isCurrentlyBooked = roomRepository.isRoomCurrentlyBooked(room.getId());
        
        // Update room status to OCCUPIED if currently booked and status is AVAILABLE
        // This ensures consistent status display across Hotel Admin and Front Desk
        if (isCurrentlyBooked && room.getStatus() == RoomStatus.AVAILABLE) {
            response.setStatus(RoomStatus.OCCUPIED);
        } else {
            response.setStatus(room.getStatus());
        }
        
        // Availability toggle shows the admin's manual setting (independent of booking status)
        // This allows hotel admin to control booking availability separately from operational status
        response.setIsAvailable(room.getIsAvailable());
        
        // Set hotel name
        if (room.getHotel() != null) {
            response.setHotelName(room.getHotel().getName());
        }
        
        // Check if room has current guest (checked-in reservation)
        if (room.getReservations() != null) {
            room.getReservations().stream()
                .filter(reservation -> reservation.getStatus() == ReservationStatus.CHECKED_IN)
                .findFirst()
                .ifPresent(reservation -> {
                    String guestName = reservation.getGuest().getFirstName() + " " + 
                                     reservation.getGuest().getLastName();
                    response.setCurrentGuest(guestName);
                });
        }
        
        return response;
    }
}
