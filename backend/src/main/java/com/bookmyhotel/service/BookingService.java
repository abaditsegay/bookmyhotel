package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.entity.UserRole;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.bookmyhotel.tenant.TenantContext;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.exception.BookingException;

/**
 * Booking service
 */
@Service
@Transactional
public class BookingService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Value("${stripe.api.key:}")
    private String stripeApiKey;
    
    /**
     * Create a new booking
     */
    public BookingResponse createBooking(BookingRequest request) {
        try {
            // Set tenant context for guest bookings
            TenantContext.setTenantId("guest");
            
            // Validate booking request
            validateBookingRequest(request);
            
            // Get room details
            Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
            
            // Check room availability
            if (!roomRepository.isRoomAvailable(request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate())) {
                throw new BookingException("Room is not available for the selected dates");
            }
            
            // Get or create guest user
            User guest = getOrCreateGuest(request);
            
            // Calculate total amount
            BigDecimal totalAmount = calculateTotalAmount(room, request);
            
            // Create reservation
            Reservation reservation = createReservation(request, room, guest, totalAmount);
            
            // Process payment if payment method provided
            if (request.getPaymentMethodId() != null) {
                try {
                    String paymentIntentId = processPayment(totalAmount, request.getPaymentMethodId());
                    reservation.setPaymentIntentId(paymentIntentId);
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                } catch (StripeException e) {
                    reservation.setStatus(ReservationStatus.PENDING);
                    throw new BookingException("Payment processing failed: " + e.getMessage(), e);
                }
            }
            
            // Save reservation
            reservation = reservationRepository.save(reservation);
            
            // Convert to response DTO
            return convertToBookingResponse(reservation);
        } finally {
            // Clear tenant context
            TenantContext.clear();
        }
    }
    
    /**
     * Get booking details
     */
    @Transactional(readOnly = true)
    public BookingResponse getBooking(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Cancel a booking
     */
    public BookingResponse cancelBooking(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        
        // Check if cancellation is allowed
        if (reservation.getCheckInDate().isBefore(LocalDateTime.now().toLocalDate().plusDays(1))) {
            throw new BookingException("Cannot cancel reservation less than 24 hours before check-in");
        }
        
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation = reservationRepository.save(reservation);
        
        // Process refund if needed
        if (reservation.getPaymentIntentId() != null) {
            // TODO: Implement refund logic
        }
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Get user bookings
     */
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        List<Reservation> reservations = reservationRepository.findByGuestIdOrderByCreatedAtDesc(userId);
        return reservations.stream()
            .map(this::convertToBookingResponse)
            .toList();
    }
    
    /**
     * Validate booking request
     */
    private void validateBookingRequest(BookingRequest request) {
        if (request.getCheckInDate().isAfter(request.getCheckOutDate())) {
            throw new BookingException("Check-in date must be before check-out date");
        }
        
        if (request.getCheckInDate().isBefore(LocalDateTime.now().toLocalDate())) {
            throw new BookingException("Check-in date cannot be in the past");
        }
        
        if (request.getGuests() == null || request.getGuests() <= 0) {
            throw new BookingException("Number of guests must be greater than 0");
        }
    }
    
    /**
     * Get or create guest user
     */
    private User getOrCreateGuest(BookingRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getGuestEmail());
        
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        // Create new guest user
        User guest = new User();
        guest.setEmail(request.getGuestEmail());
        guest.setFirstName(extractFirstName(request.getGuestName()));
        guest.setLastName(extractLastName(request.getGuestName()));
        guest.setPhone(request.getGuestPhone());
        guest.setRoles(Set.of(UserRole.GUEST));
        guest.setTenantId("guest");
        
        // Set a temporary password for guest users
        String tempPassword = "guestpassword123";
        guest.setPassword(passwordEncoder.encode(tempPassword));
        
        return userRepository.save(guest);
    }
    
    /**
     * Calculate total amount for the booking
     */
    private BigDecimal calculateTotalAmount(Room room, BookingRequest request) {
        long numberOfNights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        return room.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights));
    }
    
    /**
     * Create reservation entity
     */
    private Reservation createReservation(BookingRequest request, Room room, User guest, BigDecimal totalAmount) {
        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        reservation.setGuest(guest);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setTotalAmount(totalAmount);
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setStatus(ReservationStatus.PENDING);
        
        return reservation;
    }
    
    /**
     * Process payment using Stripe
     */
    private String processPayment(BigDecimal amount, String paymentMethodId) throws StripeException {
        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            throw new BookingException("Payment processing is not configured");
        }
        
        Stripe.apiKey = stripeApiKey;
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue()) // Convert to cents
            .setCurrency("usd")
            .setPaymentMethod(paymentMethodId)
            .setConfirm(true)
            .setReturnUrl("https://your-website.com/return")
            .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        return paymentIntent.getId();
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
        return "BK" + String.format("%08d", reservationId);
    }
    
    /**
     * Extract first name from full name
     */
    private String extractFirstName(String fullName) {
        if (fullName == null) return "";
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 0 ? parts[0] : "";
    }
    
    /**
     * Extract last name from full name
     */
    private String extractLastName(String fullName) {
        if (fullName == null) return "";
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 1 ? String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)) : "";
    }
}
