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
import com.bookmyhotel.exception.BookingException;
import com.bookmyhotel.exception.ResourceNotFoundException;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomRepository;
import com.bookmyhotel.repository.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

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

    @Autowired
    private EmailService emailService;

    @Autowired
    private PdfService pdfService;
    
    @Autowired
    private BookingTokenService bookingTokenService;
    
    @Value("${stripe.api.key:}")
    private String stripeApiKey;
    
    @Value("${app.url:http://localhost:3000}")
    private String frontendUrl;
    
    /**
     * Create a new booking
     */
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        try {
            // Validate booking request
            validateBookingRequest(request, userEmail == null);
            
            // Get room details
            Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
            
            // Check room availability
            if (!roomRepository.isRoomAvailable(request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate())) {
                throw new BookingException("Room is not available for the selected dates");
            }
            
            // Get or create user (authenticated or guest)
            User user;
            if (userEmail != null) {
                // Authenticated user
                user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
            } else {
                // Anonymous guest - create or get guest user
                user = getOrCreateGuest(request);
            }
            
            // Calculate total amount
            BigDecimal totalAmount = calculateTotalAmount(room, request);
            
            // Create reservation
            Reservation reservation = createReservation(request, room, user, totalAmount);
            
            // Process payment if payment method provided
            if (request.getPaymentMethodId() != null) {
                if ("pay_at_frontdesk".equals(request.getPaymentMethodId())) {
                    // For pay at front desk, mark reservation as confirmed but payment as pending
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                    // No payment intent ID set, so payment status will be "PENDING"
                } else {
                    // Handle other payment methods (e.g., credit card via Stripe)
                    try {
                        String paymentIntentId = processPayment(totalAmount, request.getPaymentMethodId());
                        reservation.setPaymentIntentId(paymentIntentId);
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                    } catch (StripeException e) {
                        reservation.setStatus(ReservationStatus.PENDING);
                        throw new BookingException("Payment processing failed: " + e.getMessage(), e);
                    }
                }
            }
            
            // Generate a temporary confirmation number before first save
            // We'll update it with the actual ID-based number after save
            String tempConfirmationNumber = "TEMP" + String.format("%08d", (int)(System.currentTimeMillis() % 100000000));
            reservation.setConfirmationNumber(tempConfirmationNumber);
            
            // Save reservation
            reservation = reservationRepository.save(reservation);
            
            // Generate and set final confirmation number using the actual ID
            String confirmationNumber = generateConfirmationNumber(reservation.getId());
            reservation.setConfirmationNumber(confirmationNumber);
            reservation = reservationRepository.save(reservation);
            
            // Convert to response DTO first (before email)
            BookingResponse bookingResponse = convertToBookingResponse(reservation);
            
            // Generate management URL for anonymous guests
            if (userEmail == null) {
                String managementUrl = bookingTokenService.generateManagementUrl(
                    reservation.getId(), 
                    user.getEmail(), 
                    frontendUrl
                );
                bookingResponse.setManagementUrl(managementUrl);
            }
            
            // Send booking confirmation email automatically (separate transaction)
            try {
                emailService.sendBookingConfirmationEmail(bookingResponse, user.getEmail(), true);
            } catch (Exception e) {
                // Log email sending failure but don't fail the booking
                System.err.println("Failed to send booking confirmation email: " + e.getMessage());
                e.printStackTrace();
            }
            
            return bookingResponse;
        } catch (Exception e) {
            throw e;
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
        reservation.setCancelledAt(LocalDateTime.now());
        reservation.setCancellationReason("Cancelled by guest");
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
    private void validateBookingRequest(BookingRequest request, boolean isAnonymousBooking) {
        if (request.getCheckInDate().isAfter(request.getCheckOutDate())) {
            throw new BookingException("Check-in date must be before check-out date");
        }
        
        if (request.getCheckInDate().isBefore(LocalDateTime.now().toLocalDate())) {
            throw new BookingException("Check-in date cannot be in the past");
        }
        
        if (request.getGuests() == null || request.getGuests() <= 0) {
            throw new BookingException("Number of guests must be greater than 0");
        }
        
        // For anonymous bookings, guest information is required
        if (isAnonymousBooking) {
            if (request.getGuestName() == null || request.getGuestName().trim().isEmpty()) {
                throw new BookingException("Guest name is required for anonymous bookings");
            }
            if (request.getGuestEmail() == null || request.getGuestEmail().trim().isEmpty()) {
                throw new BookingException("Guest email is required for anonymous bookings");
            }
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
        reservation.setTenantId(guest.getTenantId()); // Set tenant_id from the guest user
        reservation.setPaymentMethod(request.getPaymentMethodId()); // Store the payment method
        
        // Set guest name from the booking request for this specific reservation
        reservation.setGuestName(request.getGuestName());
        
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
    public BookingResponse convertToBookingResponse(Reservation reservation) {
        BookingResponse response = new BookingResponse();
        response.setReservationId(reservation.getId());
        response.setStatus(reservation.getStatus().name());
        response.setConfirmationNumber(reservation.getConfirmationNumber());
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
        
        // Guest details - use the guest name from the reservation (specific to this booking)
        User guest = reservation.getGuest();
        response.setGuestName(reservation.getGuestName());
        response.setGuestEmail(guest.getEmail());
        
        // Payment status - now using the stored payment method for better accuracy
        if (reservation.getPaymentIntentId() != null) {
            response.setPaymentStatus("PAID");
        } else if ("pay_at_frontdesk".equals(reservation.getPaymentMethod())) {
            response.setPaymentStatus("PAY_AT_FRONTDESK");
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
    
    /**
     * Find booking by confirmation number
     */
    public BookingResponse findByConfirmationNumber(String confirmationNumber) {
        Reservation reservation = reservationRepository.findByConfirmationNumber(confirmationNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with confirmation number: " + confirmationNumber));
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Find booking by email and last name
     */
    public BookingResponse findByEmailAndLastName(String email, String lastName) {
        // Find user by email
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("No booking found for the provided email and last name"));
        
        // Find the most recent reservation for this user with matching last name
        List<Reservation> userReservations = reservationRepository.findByGuestOrderByCreatedAtDesc(user);
        
        Reservation matchingReservation = userReservations.stream()
            .filter(reservation -> {
                String reservationLastName = user.getLastName();
                return reservationLastName != null && reservationLastName.equalsIgnoreCase(lastName);
            })
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("No booking found for the provided email and last name"));
            
        return convertToBookingResponse(matchingReservation);
    }
    
    /**
     * Send booking confirmation email
     */
    public void sendBookingConfirmationEmail(Long reservationId, String emailAddress, boolean includeItinerary) {
        BookingResponse booking = getBooking(reservationId);
        emailService.sendBookingConfirmationEmail(booking, emailAddress, includeItinerary);
    }
    
    /**
     * Generate booking confirmation PDF
     */
    public byte[] generateBookingConfirmationPdf(Long reservationId) {
        BookingResponse booking = getBooking(reservationId);
        return pdfService.generateBookingConfirmationPdf(booking);
    }
}
