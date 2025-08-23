package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.BookingCancellationRequest;
import com.bookmyhotel.dto.BookingModificationRequest;
import com.bookmyhotel.dto.BookingModificationResponse;
import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.dto.RoomTypeBookingRequest;
import com.bookmyhotel.entity.GuestInfo;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.RoomType;
import com.bookmyhotel.entity.User;
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
    
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookingNotificationService notificationService;
    
    // TODO: Temporarily commented out for compilation - will reintegrate after Phase 3.3
    // @Autowired
    // private BookingHistoryService historyService;
    
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
            User user = null;
            if (userEmail != null) {
                // Authenticated user - get existing user
                user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
            }
            // For anonymous guests, we no longer create User records

            // Calculate total amount
            BigDecimal totalAmount = calculateTotalAmount(room, request);

            // Create reservation with guest information
            Reservation reservation = createReservation(request, room, user, totalAmount);            // Process payment if payment method provided
            if (request.getPaymentMethodId() != null) {
                if ("pay_at_frontdesk".equals(request.getPaymentMethodId())) {
                    // For pay at front desk, mark reservation as confirmed with payment pending
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                    // No payment intent ID set, so payment status will be "PENDING"
                } else {
                    // Handle other payment methods (e.g., credit card via Stripe)
                    try {
                        String paymentIntentId = processPayment(totalAmount, request.getPaymentMethodId());
                        reservation.setPaymentIntentId(paymentIntentId);
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                    } catch (StripeException e) {
                        // Even if payment fails, confirm the booking but mark payment as failed
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                        logger.warn("Payment processing failed for reservation, but booking confirmed: {}", e.getMessage());
                        // Payment status will be determined by the absence of payment intent ID
                    }
                }
            } else {
                // No payment method provided - still confirm the booking
                reservation.setStatus(ReservationStatus.CONFIRMED);
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
            
            // Record booking creation in history
            // TODO: Complete history integration after Phase 3.3
            /*
            try {
                // Create a simple booking creation record
                Map<String, Object> creationData = new HashMap<>();
                creationData.put("totalAmount", reservation.getTotalAmount());
                creationData.put("roomType", reservation.getRoom().getRoomType().toString());
                creationData.put("checkInDate", reservation.getCheckInDate());
                creationData.put("checkOutDate", reservation.getCheckOutDate());
                
                historyService.recordBookingAction(reservation, BookingActionType.CREATED, 
                    reservation.getGuest().getEmail(), 
                    "New booking created for " + reservation.getRoom().getRoomNumber() + 
                    " from " + reservation.getCheckInDate() + " to " + reservation.getCheckOutDate(),
                    reservation.getTotalAmount(), null, creationData);
                
                // Record payment processing if payment was made
                if (reservation.getPaymentIntentId() != null) {
                    historyService.recordPayment(reservation, 
                        reservation.getGuest().getEmail(),
                        reservation.getTotalAmount(), 
                        "Initial payment for booking");
                }
            } catch (Exception e) {
                logger.warn("Failed to record booking creation in history: {}", e.getMessage());
            }
            */
            
            // Convert to response DTO first (before email)
            BookingResponse bookingResponse = convertToBookingResponse(reservation);
            
            // Generate management URL for anonymous guests
            if (userEmail == null) {
                String managementUrl = bookingTokenService.generateManagementUrl(
                    reservation.getId(), 
                    reservation.getGuestInfo().getEmail(), 
                    frontendUrl
                );
                bookingResponse.setManagementUrl(managementUrl);
            }
            
            // Send booking confirmation email automatically (separate transaction)
            try {
                String emailAddress = user != null ? user.getEmail() : reservation.getGuestInfo().getEmail();
                emailService.sendBookingConfirmationEmail(bookingResponse, emailAddress, true);
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
     * Create a new booking by room type using BookingRequest (new approach)
     */
    public BookingResponse createBookingByRoomType(BookingRequest request, String userEmail) {
        try {
            // Validate booking request for room type booking
            validateBookingRequestForRoomType(request, userEmail == null);
            
            // Find an available room of the requested type using public method (bypasses tenant filter)
            Room room = roomRepository.findFirstAvailableRoomOfTypePublic(
                request.getHotelId(),
                request.getRoomType(), // Use string directly for native query
                request.getCheckInDate(),
                request.getCheckOutDate()
            ).orElseThrow(() -> new BookingException("No available rooms of type " + 
                        request.getRoomType() + " for the selected dates"));
            
            // Get the hotel to determine the correct tenant context
            Hotel hotel = room.getHotel();
            String hotelTenantId = hotel.getTenantId();
            
            // Set the tenant context to the hotel's tenant for the rest of the booking process
            com.bookmyhotel.tenant.TenantContext.setTenantId(hotelTenantId);
            
            // Get or create user (authenticated or guest)
            User user = null;
            if (userEmail != null) {
                // Authenticated user - get existing user
                user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
            }
            // For anonymous guests, we no longer create User records

            // Calculate total amount
            BigDecimal totalAmount = calculateTotalAmount(room, request);

            // Create reservation with guest information
            Reservation reservation = createReservation(request, room, user, totalAmount);
            
            // Process payment if payment method provided
            if (request.getPaymentMethodId() != null) {
                if ("pay_at_frontdesk".equals(request.getPaymentMethodId())) {
                    // For pay at front desk, mark reservation as confirmed with payment pending
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                    // No payment intent ID set, so payment status will be "PENDING"
                } else {
                    // Handle other payment methods (e.g., credit card via Stripe)
                    try {
                        String paymentIntentId = processPayment(totalAmount, request.getPaymentMethodId());
                        reservation.setPaymentIntentId(paymentIntentId);
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                    } catch (StripeException e) {
                        // Even if payment fails, confirm the booking but mark payment as failed
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                        logger.warn("Payment processing failed for reservation, but booking confirmed: {}", e.getMessage());
                        // Payment status will be determined by the absence of payment intent ID
                    }
                }
            } else {
                // No payment method provided - still confirm the booking
                reservation.setStatus(ReservationStatus.CONFIRMED);
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
                    reservation.getGuestInfo().getEmail(), 
                    frontendUrl
                );
                bookingResponse.setManagementUrl(managementUrl);
            }
            
            // Send booking confirmation email automatically (separate transaction)
            try {
                String emailAddress = user != null ? user.getEmail() : reservation.getGuestInfo().getEmail();
                emailService.sendBookingConfirmationEmail(bookingResponse, emailAddress, true);
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
     * Create a new booking using room type (new approach)
     */
    public BookingResponse createRoomTypeBooking(RoomTypeBookingRequest request, String userEmail) {
        try {
            // Validate booking request
            validateRoomTypeBookingRequest(request, userEmail == null);
            
            // Find an available room of the requested type
            Room room = roomRepository.findFirstAvailableRoomOfType(
                request.getHotelId(),
                request.getRoomType(),
                request.getCheckInDate(),
                request.getCheckOutDate()
            ).orElseThrow(() -> new BookingException("No available rooms of type " + 
                        request.getRoomType() + " for the selected dates"));
            
            // Get or create user (authenticated or guest)
            User user = null;
            if (userEmail != null) {
                // Authenticated user - get existing user
                user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
            }
            // For anonymous guests, we no longer create User records

            // Calculate total amount
            BigDecimal totalAmount = calculateTotalAmountForRoomType(room, request);

            // Create reservation with guest information
            Reservation reservation = createReservationFromRoomType(request, room, user, totalAmount);
            
            // Process payment if payment method provided
            if (request.getPaymentMethodId() != null) {
                if ("pay_at_frontdesk".equals(request.getPaymentMethodId())) {
                    // For pay at front desk, mark reservation as confirmed with payment pending
                    reservation.setStatus(ReservationStatus.CONFIRMED);
                    // No payment intent ID set, so payment status will be "PENDING"
                } else {
                    // Handle other payment methods (e.g., credit card via Stripe)
                    try {
                        String paymentIntentId = processPayment(totalAmount, request.getPaymentMethodId());
                        reservation.setPaymentIntentId(paymentIntentId);
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                    } catch (StripeException e) {
                        // Even if payment fails, confirm the booking but mark payment as failed
                        reservation.setStatus(ReservationStatus.CONFIRMED);
                        logger.warn("Payment processing failed for reservation, but booking confirmed: {}", e.getMessage());
                        // Payment status will be determined by the absence of payment intent ID
                    }
                }
            } else {
                // No payment method provided - still confirm the booking
                reservation.setStatus(ReservationStatus.CONFIRMED);
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
                    reservation.getGuestInfo().getEmail(), 
                    frontendUrl
                );
                bookingResponse.setManagementUrl(managementUrl);
            }
            
            // Send booking confirmation email automatically (separate transaction)
            try {
                String emailAddress = user != null ? user.getEmail() : reservation.getGuestInfo().getEmail();
                emailService.sendBookingConfirmationEmail(bookingResponse, emailAddress, true);
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
        
        // Record booking cancellation in history
        // TODO: Complete history integration after Phase 3.3
        /*
        try {
            BigDecimal refundAmount = calculateCancellationRefund(reservation);
            historyService.recordCancellation(
                reservation,
                reservation.getGuest().getEmail(),
                "Booking cancelled by guest via admin interface",
                refundAmount
            );
        } catch (Exception e) {
            logger.warn("Failed to record booking cancellation in history: {}", e.getMessage());
        }
        */
        
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
     * Validate booking request for room type booking
     */
    private void validateBookingRequestForRoomType(BookingRequest request, boolean isAnonymousBooking) {
        if (request.getCheckInDate().isAfter(request.getCheckOutDate())) {
            throw new BookingException("Check-in date must be before check-out date");
        }
        
        if (request.getCheckInDate().isBefore(LocalDateTime.now().toLocalDate())) {
            throw new BookingException("Check-in date cannot be in the past");
        }
        
        if (request.getGuests() == null || request.getGuests() <= 0) {
            throw new BookingException("Number of guests must be greater than 0");
        }
        
        // For room type booking, hotelId and roomType are required
        if (request.getHotelId() == null) {
            throw new BookingException("Hotel ID is required for room type booking");
        }
        
        if (request.getRoomType() == null || request.getRoomType().trim().isEmpty()) {
            throw new BookingException("Room type is required for room type booking");
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
     * Calculate total amount for the booking
     */
    private BigDecimal calculateTotalAmount(Room room, BookingRequest request) {
        long numberOfNights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        return room.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights));
    }
    
    /**
     * Validate room type booking request
     */
    private void validateRoomTypeBookingRequest(RoomTypeBookingRequest request, boolean isAnonymousBooking) {
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
     * Calculate total amount for room type booking
     */
    private BigDecimal calculateTotalAmountForRoomType(Room room, RoomTypeBookingRequest request) {
        long numberOfNights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        return room.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights));
    }
    
    /**
     * Create reservation entity
     */
    private Reservation createReservation(BookingRequest request, Room room, User user, BigDecimal totalAmount) {
        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        
        // Set user only for authenticated users (will be null for anonymous guests)
        reservation.setGuest(user);
        
        // Set guest information - use authenticated user's info if guest info is not provided
        String guestName = request.getGuestName();
        String guestEmail = request.getGuestEmail();
        String guestPhone = request.getGuestPhone();
        
        // If guest info is not provided but user is authenticated, use user's info
        if (user != null) {
            if (guestName == null || guestName.trim().isEmpty()) {
                guestName = user.getFirstName() + " " + user.getLastName();
            }
            if (guestEmail == null || guestEmail.trim().isEmpty()) {
                guestEmail = user.getEmail();
            }
            if (guestPhone == null || guestPhone.trim().isEmpty()) {
                guestPhone = user.getPhone();
            }
        }
        
        GuestInfo guestInfo = new GuestInfo(guestName, guestEmail, guestPhone);
        reservation.setGuestInfo(guestInfo);
        
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setTotalAmount(totalAmount);
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setStatus(ReservationStatus.CONFIRMED); // Immediate confirmation
        reservation.setTenantId(room.getHotel().getTenantId()); // Set tenant_id from the hotel so hotel admins can see the booking
        reservation.setPaymentMethod(request.getPaymentMethodId()); // Store the payment method
        
        return reservation;
    }
    
    /**
     * Create reservation entity from room type booking
     */
    private Reservation createReservationFromRoomType(RoomTypeBookingRequest request, Room room, User user, BigDecimal totalAmount) {
        Reservation reservation = new Reservation();
        reservation.setRoom(room);
        
        // Set user only for authenticated users (will be null for anonymous guests)
        reservation.setGuest(user);
        
        // Set guest information - use authenticated user's info if guest info is not provided
        String guestName = request.getGuestName();
        String guestEmail = request.getGuestEmail();
        String guestPhone = request.getGuestPhone();
        
        // If guest info is not provided but user is authenticated, use user's info
        if (user != null) {
            if (guestName == null || guestName.trim().isEmpty()) {
                guestName = user.getFirstName() + " " + user.getLastName();
            }
            if (guestEmail == null || guestEmail.trim().isEmpty()) {
                guestEmail = user.getEmail();
            }
            if (guestPhone == null || guestPhone.trim().isEmpty()) {
                guestPhone = user.getPhone();
            }
        }
        
        GuestInfo guestInfo = new GuestInfo(guestName, guestEmail, guestPhone);
        reservation.setGuestInfo(guestInfo);
        
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setTotalAmount(totalAmount);
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setStatus(ReservationStatus.CONFIRMED); // Immediate confirmation
        reservation.setTenantId(room.getHotel().getTenantId()); // Set tenant_id from the hotel so hotel admins can see the booking
        reservation.setPaymentMethod(request.getPaymentMethodId()); // Store the payment method
        
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
        
        // Guest details - use guest info which works for both registered and anonymous guests
        response.setGuestName(reservation.getGuestInfo().getName());
        response.setGuestEmail(reservation.getGuestInfo().getEmail());
        
        // Special requests
        response.setSpecialRequests(reservation.getSpecialRequests());
        
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
     * Find booking by confirmation number (tenant-specific)
     */
    public BookingResponse findByConfirmationNumber(String confirmationNumber) {
        Reservation reservation = reservationRepository.findByConfirmationNumber(confirmationNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with confirmation number: " + confirmationNumber));
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Find booking by confirmation number across all tenants (for public booking search)
     */
    public BookingResponse findByConfirmationNumberPublic(String confirmationNumber) {
        Reservation reservation = reservationRepository.findByConfirmationNumberPublic(confirmationNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with confirmation number: " + confirmationNumber));
        
        return convertToBookingResponse(reservation);
    }
    
    /**
     * Find booking by email and last name (public search across all tenants)
     */
    public BookingResponse findByEmailAndLastNamePublic(String email, String lastName) {
        // Find user by email using public search
        User user = userRepository.findByEmailPublic(email)
            .orElseThrow(() -> new ResourceNotFoundException("No booking found for the provided email and last name"));
        
        // Find the most recent reservation for this user with matching last name using public search
        List<Reservation> userReservations = reservationRepository.findByGuestPublic(user.getId());
        
        Reservation matchingReservation = userReservations.stream()
            .filter(reservation -> {
                String reservationLastName = user.getLastName();
                return reservationLastName != null && reservationLastName.equalsIgnoreCase(lastName);
            })
            .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt())) // Sort by creation date descending
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("No booking found for the provided email and last name"));
            
        return convertToBookingResponse(matchingReservation);
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
     * Modify an existing booking (for guests)
     */
    public BookingModificationResponse modifyBooking(BookingModificationRequest request) {
        try {
            // Find booking using public search to work across tenants
            BookingResponse existingBooking = findByConfirmationNumberPublic(request.getConfirmationNumber());
            
            // Verify guest email matches
            if (!existingBooking.getGuestEmail().equalsIgnoreCase(request.getGuestEmail())) {
                return new BookingModificationResponse(false, "Invalid guest email for this booking");
            }
            
            // Get the reservation entity
            Reservation reservation = reservationRepository.findByConfirmationNumberPublic(request.getConfirmationNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            
            // Capture original data for history tracking
            // TODO: Store original data for audit tracking when history is re-enabled
            // Map<String, Object> originalData = convertReservationToMap(reservation);
            
            // Check if booking can be modified (not checked in, not cancelled)
            if (reservation.getStatus() == ReservationStatus.CHECKED_IN || 
                reservation.getStatus() == ReservationStatus.CHECKED_OUT ||
                reservation.getStatus() == ReservationStatus.CANCELLED) {
                return new BookingModificationResponse(false, "This booking cannot be modified in its current status");
            }
            
            // Check modification window (e.g., at least 24 hours before check-in)
            if (reservation.getCheckInDate().isBefore(LocalDate.now().plusDays(1))) {
                return new BookingModificationResponse(false, "Modifications must be made at least 24 hours before check-in");
            }
            
            BigDecimal additionalCharges = BigDecimal.ZERO;
            BigDecimal refundAmount = BigDecimal.ZERO;
            
            // Handle date modifications
            if (request.getNewCheckInDate() != null || request.getNewCheckOutDate() != null) {
                LocalDate newCheckIn = request.getNewCheckInDate() != null ? 
                    request.getNewCheckInDate() : reservation.getCheckInDate();
                LocalDate newCheckOut = request.getNewCheckOutDate() != null ? 
                    request.getNewCheckOutDate() : reservation.getCheckOutDate();
                
                // Validate new dates
                if (newCheckOut.isBefore(newCheckIn) || newCheckOut.equals(newCheckIn)) {
                    return new BookingModificationResponse(false, "Check-out date must be after check-in date");
                }
                
                if (newCheckIn.isBefore(LocalDate.now())) {
                    return new BookingModificationResponse(false, "Check-in date cannot be in the past");
                }
                
                // Check room availability for new dates
                if (!isRoomAvailableForModification(reservation.getRoom().getId(), newCheckIn, newCheckOut, reservation.getId())) {
                    return new BookingModificationResponse(false, "Room is not available for the new dates");
                }
                
                // Calculate price difference
                long oldNights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
                long newNights = ChronoUnit.DAYS.between(newCheckIn, newCheckOut);
                BigDecimal priceDifference = reservation.getRoom().getPricePerNight()
                    .multiply(BigDecimal.valueOf(newNights - oldNights));
                
                if (priceDifference.compareTo(BigDecimal.ZERO) > 0) {
                    additionalCharges = priceDifference;
                } else if (priceDifference.compareTo(BigDecimal.ZERO) < 0) {
                    refundAmount = priceDifference.abs();
                }
                
                // Update dates
                reservation.setCheckInDate(newCheckIn);
                reservation.setCheckOutDate(newCheckOut);
                reservation.setTotalAmount(reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(newNights)));
            }
            
            // Handle room changes
            if (request.getNewRoomId() != null && !request.getNewRoomId().equals(reservation.getRoom().getId())) {
                Room newRoom = roomRepository.findById(request.getNewRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("New room not found"));
                
                // Check if new room is available
                if (!isRoomAvailableForModification(request.getNewRoomId(), 
                    reservation.getCheckInDate(), reservation.getCheckOutDate(), reservation.getId())) {
                    return new BookingModificationResponse(false, "Selected room is not available for your dates");
                }
                
                // Calculate price difference for room upgrade/downgrade
                long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
                BigDecimal oldRoomTotal = reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
                BigDecimal newRoomTotal = newRoom.getPricePerNight().multiply(BigDecimal.valueOf(nights));
                BigDecimal roomPriceDifference = newRoomTotal.subtract(oldRoomTotal);
                
                if (roomPriceDifference.compareTo(BigDecimal.ZERO) > 0) {
                    additionalCharges = additionalCharges.add(roomPriceDifference);
                } else if (roomPriceDifference.compareTo(BigDecimal.ZERO) < 0) {
                    refundAmount = refundAmount.add(roomPriceDifference.abs());
                }
                
                // Update room and total amount
                reservation.setRoom(newRoom);
                reservation.setTotalAmount(newRoomTotal);
            }
            // Handle room changes by type name
            else if (request.getNewRoomType() != null && !request.getNewRoomType().trim().isEmpty()) {
                
                // Convert string to RoomType enum
                RoomType requestedRoomType;
                try {
                    requestedRoomType = RoomType.valueOf(request.getNewRoomType().trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    return new BookingModificationResponse(false, "Invalid room type: " + request.getNewRoomType());
                }
                
                // Check if it's actually a different room type
                if (!requestedRoomType.equals(reservation.getRoom().getRoomType())) {
                    
                    // Use the effective dates (new dates if they were modified, otherwise current dates)
                    LocalDate effectiveCheckIn = reservation.getCheckInDate();
                    LocalDate effectiveCheckOut = reservation.getCheckOutDate();
                    
                    // Find an available room of the requested type directly using the availability query
                    Room newRoom = findAvailableRoomOfType(
                        requestedRoomType.name(), 
                        effectiveCheckIn, 
                        effectiveCheckOut, 
                        reservation.getId()
                    );
                    
                    if (newRoom == null) {
                        return new BookingModificationResponse(false, "No available rooms of type '" + request.getNewRoomType() + "' for your dates");
                    }
                    
                    // Calculate price difference for room upgrade/downgrade using effective dates
                    long nights = ChronoUnit.DAYS.between(effectiveCheckIn, effectiveCheckOut);
                    BigDecimal oldRoomTotal = reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
                    BigDecimal newRoomTotal = newRoom.getPricePerNight().multiply(BigDecimal.valueOf(nights));
                    BigDecimal roomPriceDifference = newRoomTotal.subtract(oldRoomTotal);
                    
                    if (roomPriceDifference.compareTo(BigDecimal.ZERO) > 0) {
                        additionalCharges = additionalCharges.add(roomPriceDifference);
                    } else if (roomPriceDifference.compareTo(BigDecimal.ZERO) < 0) {
                        refundAmount = refundAmount.add(roomPriceDifference.abs());
                    }
                    
                    // Update room and total amount
                    reservation.setRoom(newRoom);
                    reservation.setTotalAmount(newRoomTotal);
                }
            }            // Update guest information if provided
            if (request.getGuestName() != null && !request.getGuestName().trim().isEmpty()) {
                // Update guest info in reservation for anonymous bookings
                GuestInfo currentGuestInfo = reservation.getGuestInfo();
                GuestInfo updatedGuestInfo = new GuestInfo(
                    request.getGuestName().trim(),
                    currentGuestInfo.getEmail(),
                    currentGuestInfo.getPhone()
                );
                reservation.setGuestInfo(updatedGuestInfo);
            }
            
            if (request.getGuestPhone() != null && !request.getGuestPhone().trim().isEmpty()) {
                // Update guest info in reservation for anonymous bookings
                GuestInfo currentGuestInfo = reservation.getGuestInfo();
                GuestInfo updatedGuestInfo = new GuestInfo(
                    currentGuestInfo.getName(),
                    currentGuestInfo.getEmail(),
                    request.getGuestPhone().trim()
                );
                reservation.setGuestInfo(updatedGuestInfo);
            }
            
            // Handle email changes
            if (request.getNewGuestEmail() != null && !request.getNewGuestEmail().trim().isEmpty()) {
                // Update guest info in reservation
                GuestInfo currentGuestInfo = reservation.getGuestInfo();
                GuestInfo updatedGuestInfo = new GuestInfo(
                    currentGuestInfo.getName(),
                    request.getNewGuestEmail().trim(),
                    currentGuestInfo.getPhone()
                );
                reservation.setGuestInfo(updatedGuestInfo);
            }
            
            // Update special requests
            if (request.getNewSpecialRequests() != null) {
                reservation.setSpecialRequests(request.getNewSpecialRequests());
            }
            
            // Update modification timestamp
            reservation.setUpdatedAt(LocalDateTime.now());
            
            // Save the updated reservation
            reservation = reservationRepository.save(reservation);
            
            // Create response
            BookingModificationResponse response = new BookingModificationResponse(true, "Booking successfully modified");
            response.setUpdatedBooking(convertToBookingResponse(reservation));
            response.setAdditionalCharges(additionalCharges);
            response.setRefundAmount(refundAmount);
            
            // Send email notification
            try {
                notificationService.sendModificationConfirmationEmail(
                    convertToBookingResponse(reservation), additionalCharges, refundAmount);
            } catch (Exception e) {
                logger.warn("Failed to send modification confirmation email: {}", e.getMessage());
            }
            
            // Record booking modification in history
            // TODO: Complete history integration after Phase 3.3
            /*
            /*
            try {
                Map<String, Object> changes = new HashMap<>();
                // Compare original and new data
                // String summary = getModificationSummary(originalData, reservation);
                changes.put("summary", "Booking modified");
                changes.put("additionalCharges", additionalCharges);
                changes.put("refundAmount", refundAmount);
                
                historyService.recordModification(
                    reservation,
                    reservation.getGuest().getEmail(),
                    "Booking modified: " + summary,
                    additionalCharges.subtract(refundAmount), // net financial impact
                    changes
                );
            } catch (Exception e) {
                logger.warn("Failed to record booking modification in history: {}", e.getMessage());
            }
            */
            
            // Handle payment processing if there are additional charges
            if (additionalCharges.compareTo(BigDecimal.ZERO) > 0) {
                // For now, we'll mark as pending payment - in a real system you'd process payment here
                response.setMessage("Booking modified. Additional payment of $" + additionalCharges + " is required.");
            } else if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                // Process refund - in a real system you'd process the refund here
                response.setMessage("Booking modified. Refund of $" + refundAmount + " will be processed.");
            }
            
            return response;
            
        } catch (Exception e) {
            return new BookingModificationResponse(false, "Failed to modify booking: " + e.getMessage());
        }
    }
    
    /**
     * Cancel a booking (for guests)
     */
    public BookingModificationResponse cancelBooking(BookingCancellationRequest request) {
        try {
            // Find booking using public search to work across tenants
            BookingResponse existingBooking = findByConfirmationNumberPublic(request.getConfirmationNumber());
            
            // Verify guest email matches
            if (!existingBooking.getGuestEmail().equalsIgnoreCase(request.getGuestEmail())) {
                return new BookingModificationResponse(false, "Invalid guest email for this booking");
            }
            
            // Get the reservation entity
            Reservation reservation = reservationRepository.findByConfirmationNumberPublic(request.getConfirmationNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            
            // Check if booking can be cancelled
            if (reservation.getStatus() == ReservationStatus.CHECKED_IN || 
                reservation.getStatus() == ReservationStatus.CHECKED_OUT ||
                reservation.getStatus() == ReservationStatus.CANCELLED) {
                return new BookingModificationResponse(false, "This booking cannot be cancelled in its current status");
            }
            
            // Calculate refund based on cancellation policy
            BigDecimal refundAmount = calculateCancellationRefund(reservation);
            
            // Update reservation status
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservation.setUpdatedAt(LocalDateTime.now());
            
            // Save cancellation reason if provided
            if (request.getCancellationReason() != null && !request.getCancellationReason().trim().isEmpty()) {
                reservation.setSpecialRequests(
                    (reservation.getSpecialRequests() != null ? reservation.getSpecialRequests() + "\n" : "") +
                    "Cancellation reason: " + request.getCancellationReason().trim()
                );
            }
            
            // Save the updated reservation
            reservation = reservationRepository.save(reservation);
            
            // Create response
            BookingModificationResponse response = new BookingModificationResponse(true, "Booking successfully cancelled");
            response.setUpdatedBooking(convertToBookingResponse(reservation));
            response.setRefundAmount(refundAmount);
            
            // Send email notification
            try {
                notificationService.sendCancellationConfirmationEmail(
                    convertToBookingResponse(reservation), refundAmount);
            } catch (Exception e) {
                logger.warn("Failed to send cancellation confirmation email: {}", e.getMessage());
            }
            
            // Record booking cancellation in history
            // TODO: Complete history integration after Phase 3.3
            /*
            try {
                String cancellationReason = request.getCancellationReason() != null && !request.getCancellationReason().trim().isEmpty() 
                    ? request.getCancellationReason().trim() : "No reason provided";
                historyService.recordCancellation(
                    reservation,
                    reservation.getGuest().getEmail(),
                    "Booking cancelled by guest. Reason: " + cancellationReason,
                    refundAmount
                );
            } catch (Exception e) {
                logger.warn("Failed to record booking cancellation in history: {}", e.getMessage());
            }
            */
            
            if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                response.setMessage("Booking cancelled. Refund of $" + refundAmount + " will be processed within 3-5 business days.");
            } else {
                response.setMessage("Booking cancelled. No refund applicable based on cancellation policy.");
            }
            
            return response;
            
        } catch (Exception e) {
            return new BookingModificationResponse(false, "Failed to cancel booking: " + e.getMessage());
        }
    }
    
    /**
     * Modify a booking for authenticated customers
     */
    public BookingModificationResponse modifyCustomerBooking(Long reservationId, BookingModificationRequest request, String userEmail) {
        try {
            // Find the reservation
            Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + reservationId));
            
            // Verify the reservation belongs to the authenticated user
            // Check both the guest User entity and the guest info email
            boolean belongsToUser = false;
            if (reservation.getGuest() != null && reservation.getGuest().getEmail().equals(userEmail)) {
                belongsToUser = true;
            } else if (reservation.getGuestInfo() != null && reservation.getGuestInfo().getEmail().equals(userEmail)) {
                belongsToUser = true;
            }
            
            if (!belongsToUser) {
                return new BookingModificationResponse(false, "This booking does not belong to your account");
            }
            
            // Check if booking can be modified
            if (reservation.getStatus() == ReservationStatus.CHECKED_IN || 
                reservation.getStatus() == ReservationStatus.CHECKED_OUT ||
                reservation.getStatus() == ReservationStatus.CANCELLED) {
                return new BookingModificationResponse(false, "This booking cannot be modified in its current status");
            }
            
            // Check modification window (e.g., at least 24 hours before check-in)
            if (reservation.getCheckInDate().isBefore(LocalDate.now().plusDays(1))) {
                return new BookingModificationResponse(false, "Modifications must be made at least 24 hours before check-in");
            }
            
            BigDecimal additionalCharges = BigDecimal.ZERO;
            BigDecimal refundAmount = BigDecimal.ZERO;
            
            // Handle date modifications
            if (request.getNewCheckInDate() != null || request.getNewCheckOutDate() != null) {
                LocalDate newCheckIn = request.getNewCheckInDate() != null ? 
                    request.getNewCheckInDate() : reservation.getCheckInDate();
                LocalDate newCheckOut = request.getNewCheckOutDate() != null ? 
                    request.getNewCheckOutDate() : reservation.getCheckOutDate();
                
                // Validate new dates
                if (newCheckOut.isBefore(newCheckIn) || newCheckOut.equals(newCheckIn)) {
                    return new BookingModificationResponse(false, "Check-out date must be after check-in date");
                }
                
                if (newCheckIn.isBefore(LocalDate.now())) {
                    return new BookingModificationResponse(false, "Check-in date cannot be in the past");
                }
                
                // Check room availability for new dates
                if (!isRoomAvailableForModification(reservation.getRoom().getId(), newCheckIn, newCheckOut, reservation.getId())) {
                    return new BookingModificationResponse(false, "Room is not available for the new dates");
                }
                
                // Calculate price difference
                long oldNights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
                long newNights = ChronoUnit.DAYS.between(newCheckIn, newCheckOut);
                BigDecimal priceDifference = reservation.getRoom().getPricePerNight()
                    .multiply(BigDecimal.valueOf(newNights - oldNights));
                
                if (priceDifference.compareTo(BigDecimal.ZERO) > 0) {
                    additionalCharges = priceDifference;
                } else if (priceDifference.compareTo(BigDecimal.ZERO) < 0) {
                    refundAmount = priceDifference.abs();
                }
                
                // Update dates
                reservation.setCheckInDate(newCheckIn);
                reservation.setCheckOutDate(newCheckOut);
                reservation.setTotalAmount(reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(newNights)));
            }
            
            // Handle room changes by ID
            if (request.getNewRoomId() != null && !request.getNewRoomId().equals(reservation.getRoom().getId())) {
                Room newRoom = roomRepository.findById(request.getNewRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("New room not found"));
                
                // Check if new room is available
                if (!isRoomAvailableForModification(request.getNewRoomId(), 
                    reservation.getCheckInDate(), reservation.getCheckOutDate(), reservation.getId())) {
                    return new BookingModificationResponse(false, "Selected room is not available for your dates");
                }
                
                // Calculate price difference for room upgrade/downgrade
                long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
                BigDecimal oldRoomTotal = reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
                BigDecimal newRoomTotal = newRoom.getPricePerNight().multiply(BigDecimal.valueOf(nights));
                BigDecimal roomPriceDifference = newRoomTotal.subtract(oldRoomTotal);
                
                if (roomPriceDifference.compareTo(BigDecimal.ZERO) > 0) {
                    additionalCharges = additionalCharges.add(roomPriceDifference);
                } else if (roomPriceDifference.compareTo(BigDecimal.ZERO) < 0) {
                    refundAmount = refundAmount.add(roomPriceDifference.abs());
                }
                
                // Update room and total amount
                reservation.setRoom(newRoom);
                reservation.setTotalAmount(newRoomTotal);
            }
            
            // Handle room changes by type name
            if (request.getNewRoomType() != null && !request.getNewRoomType().trim().isEmpty()) {
                // Convert string to RoomType enum
                RoomType requestedRoomType;
                try {
                    requestedRoomType = RoomType.valueOf(request.getNewRoomType().trim().toUpperCase());
                } catch (IllegalArgumentException e) {
                    return new BookingModificationResponse(false, "Invalid room type: " + request.getNewRoomType());
                }
                
                // Define effective check-in and check-out dates
                LocalDate effectiveCheckIn = request.getNewCheckInDate() != null ? 
                    request.getNewCheckInDate() : reservation.getCheckInDate();
                LocalDate effectiveCheckOut = request.getNewCheckOutDate() != null ? 
                    request.getNewCheckOutDate() : reservation.getCheckOutDate();
                
                // Find an available room of the requested type
                Room newRoom = roomRepository.findFirstAvailableRoomOfType(
                    reservation.getRoom().getHotel().getId(),
                    requestedRoomType,
                    effectiveCheckIn,
                    effectiveCheckOut
                ).orElse(null);
                
                if (newRoom == null) {
                    return new BookingModificationResponse(false, "No available rooms of type '" + request.getNewRoomType() + "' for your dates");
                }
                
                // Calculate price difference for room upgrade/downgrade using effective dates
                long nights = ChronoUnit.DAYS.between(effectiveCheckIn, effectiveCheckOut);
                BigDecimal oldRoomTotal = reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(nights));
                BigDecimal newRoomTotal = newRoom.getPricePerNight().multiply(BigDecimal.valueOf(nights));
                BigDecimal roomPriceDifference = newRoomTotal.subtract(oldRoomTotal);
                
                if (roomPriceDifference.compareTo(BigDecimal.ZERO) > 0) {
                    additionalCharges = additionalCharges.add(roomPriceDifference);
                } else if (roomPriceDifference.compareTo(BigDecimal.ZERO) < 0) {
                    refundAmount = refundAmount.add(roomPriceDifference.abs());
                }
                
                // Update room and total amount
                reservation.setRoom(newRoom);
                reservation.setTotalAmount(newRoomTotal);
            }
            
            // Update special requests
            if (request.getNewSpecialRequests() != null) {
                reservation.setSpecialRequests(request.getNewSpecialRequests());
            }
            
            // Update modification timestamp
            reservation.setUpdatedAt(LocalDateTime.now());
            
            // Save the updated reservation
            reservation = reservationRepository.save(reservation);
            
            // Create response
            BookingModificationResponse response = new BookingModificationResponse(true, "Booking successfully modified");
            response.setUpdatedBooking(convertToBookingResponse(reservation));
            response.setAdditionalCharges(additionalCharges);
            response.setRefundAmount(refundAmount);
            
            // Send email notification
            try {
                notificationService.sendModificationConfirmationEmail(
                    convertToBookingResponse(reservation), additionalCharges, refundAmount);
            } catch (Exception e) {
                logger.warn("Failed to send modification confirmation email: {}", e.getMessage());
            }
            
            // Handle payment processing if there are additional charges
            if (additionalCharges.compareTo(BigDecimal.ZERO) > 0) {
                response.setMessage("Booking modified. Additional payment of $" + additionalCharges + " is required.");
            } else if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                response.setMessage("Booking modified. Refund of $" + refundAmount + " will be processed.");
            }
            
            return response;
            
        } catch (Exception e) {
            return new BookingModificationResponse(false, "Failed to modify booking: " + e.getMessage());
        }
    }
    
    /**
     * Cancel a booking for authenticated customers
     */
    public BookingModificationResponse cancelCustomerBooking(Long reservationId, String cancellationReason, String userEmail) {
        try {
            // Find the reservation
            Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + reservationId));
            
            // Verify the reservation belongs to the authenticated user
            // Check both the guest User entity and the guest info email
            boolean belongsToUser = false;
            if (reservation.getGuest() != null && reservation.getGuest().getEmail().equals(userEmail)) {
                belongsToUser = true;
            } else if (reservation.getGuestInfo() != null && reservation.getGuestInfo().getEmail().equals(userEmail)) {
                belongsToUser = true;
            }
            
            if (!belongsToUser) {
                return new BookingModificationResponse(false, "This booking does not belong to your account");
            }
            
            // Check if booking can be cancelled
            if (reservation.getStatus() == ReservationStatus.CHECKED_IN || 
                reservation.getStatus() == ReservationStatus.CHECKED_OUT ||
                reservation.getStatus() == ReservationStatus.CANCELLED) {
                return new BookingModificationResponse(false, "This booking cannot be cancelled in its current status");
            }
            
            // Calculate refund based on cancellation policy
            BigDecimal refundAmount = calculateCancellationRefund(reservation);
            
            // Update reservation status
            reservation.setStatus(ReservationStatus.CANCELLED);
            reservation.setUpdatedAt(LocalDateTime.now());
            
            // Save cancellation reason if provided
            if (cancellationReason != null && !cancellationReason.trim().isEmpty()) {
                reservation.setSpecialRequests(
                    (reservation.getSpecialRequests() != null ? reservation.getSpecialRequests() + "\n" : "") +
                    "Cancellation reason: " + cancellationReason.trim()
                );
            }
            
            // Save the updated reservation
            reservation = reservationRepository.save(reservation);
            
            // Create response
            BookingModificationResponse response = new BookingModificationResponse(true, "Booking successfully cancelled");
            response.setUpdatedBooking(convertToBookingResponse(reservation));
            response.setRefundAmount(refundAmount);
            
            // Send email notification
            try {
                notificationService.sendCancellationConfirmationEmail(
                    convertToBookingResponse(reservation), refundAmount);
            } catch (Exception e) {
                logger.warn("Failed to send cancellation confirmation email: {}", e.getMessage());
            }
            
            if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                response.setMessage("Booking cancelled. Refund of $" + refundAmount + " will be processed within 3-5 business days.");
            } else {
                response.setMessage("Booking cancelled. No refund applicable based on cancellation policy.");
            }
            
            return response;
            
        } catch (Exception e) {
            return new BookingModificationResponse(false, "Failed to cancel booking: " + e.getMessage());
        }
    }
    

    
    /**
     * Validate booking modification request
     */
    private BookingModificationResponse validateModificationRequest(BookingModificationRequest request, Reservation reservation) {
        // Check if booking can be modified
        if (reservation.getStatus() == ReservationStatus.CHECKED_IN || 
            reservation.getStatus() == ReservationStatus.CHECKED_OUT ||
            reservation.getStatus() == ReservationStatus.CANCELLED) {
            return new BookingModificationResponse(false, "This booking cannot be modified in its current status");
        }
        
        // Check modification time limits (cannot modify within 24 hours of check-in)
        LocalDate now = LocalDate.now();
        LocalDate checkInDate = reservation.getCheckInDate();
        if (request.getNewCheckInDate() != null) {
            checkInDate = request.getNewCheckInDate();
        }
        
        long hoursUntilCheckIn = ChronoUnit.HOURS.between(LocalDateTime.now(), checkInDate.atStartOfDay());
        if (hoursUntilCheckIn < 24) {
            return new BookingModificationResponse(false, "Cannot modify booking within 24 hours of check-in");
        }
        
        // Validate date ranges
        if (request.getNewCheckInDate() != null && request.getNewCheckOutDate() != null) {
            if (!request.getNewCheckInDate().isBefore(request.getNewCheckOutDate())) {
                return new BookingModificationResponse(false, "Check-out date must be after check-in date");
            }
        }
        
        // Check room availability for new dates/room type
        LocalDate newCheckIn = request.getNewCheckInDate() != null ? request.getNewCheckInDate() : reservation.getCheckInDate();
        LocalDate newCheckOut = request.getNewCheckOutDate() != null ? request.getNewCheckOutDate() : reservation.getCheckOutDate();
        
        if (request.getNewRoomId() != null) {
            // Check if the new room is available for the dates
            if (!isRoomAvailableForModification(request.getNewRoomId(), newCheckIn, newCheckOut, reservation.getId())) {
                return new BookingModificationResponse(false, "Requested room is not available for the new dates");
            }
        } else {
            // Check if current room is available for new dates
            if (!isRoomAvailableForModification(reservation.getRoom().getId(), newCheckIn, newCheckOut, reservation.getId())) {
                return new BookingModificationResponse(false, "Current room is not available for the new dates");
            }
        }
        
        return new BookingModificationResponse(true, "Validation passed");
    }
    
    /**
     * Calculate modification costs
     */
    private BigDecimal calculateModificationCosts(BookingModificationRequest request, Reservation reservation) {
        BigDecimal currentTotal = reservation.getTotalAmount();
        BigDecimal newTotal = currentTotal;
        
        // Calculate new total based on changes
        LocalDate newCheckIn = request.getNewCheckInDate() != null ? request.getNewCheckInDate() : reservation.getCheckInDate();
        LocalDate newCheckOut = request.getNewCheckOutDate() != null ? request.getNewCheckOutDate() : reservation.getCheckOutDate();
        
        // Calculate base cost difference
        long originalNights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
        long newNights = ChronoUnit.DAYS.between(newCheckIn, newCheckOut);
        
        Room targetRoom = reservation.getRoom();
        if (request.getNewRoomId() != null) {
            targetRoom = roomRepository.findById(request.getNewRoomId()).orElse(reservation.getRoom());
        }
        
        if (targetRoom != null) {
            BigDecimal originalCost = reservation.getRoom().getPricePerNight().multiply(BigDecimal.valueOf(originalNights));
            BigDecimal newCost = targetRoom.getPricePerNight().multiply(BigDecimal.valueOf(newNights));
            newTotal = newCost;
        }
        
        // Add modification fee (flat $25 fee for any modification)
        BigDecimal modificationFee = BigDecimal.valueOf(25.00);
        newTotal = newTotal.add(modificationFee);
        
        return newTotal.subtract(currentTotal);
    }
    
    /**
     * Find available room of specific type
     */
    private Room findAvailableRoomOfType(String roomType, LocalDate checkIn, LocalDate checkOut, Long excludeReservationId) {
        // Get the reservation to know which hotel we're looking in
        Reservation reservation = reservationRepository.findById(excludeReservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // Use the proper hotel-filtered availability query
        RoomType roomTypeEnum = RoomType.valueOf(roomType);
        List<Room> availableRooms = roomRepository.findAvailableRooms(
            reservation.getRoom().getHotel().getId(),
            checkIn,
            checkOut,
            1, // minimum capacity
            roomTypeEnum
        );
        
        return availableRooms.isEmpty() ? null : availableRooms.get(0);
    }
    
    /**
     * Check if room is available for modification (excluding current reservation)
     */
    private boolean isRoomAvailableForModification(Long roomId, LocalDate checkIn, LocalDate checkOut, Long excludeReservationId) {
        List<Reservation> conflictingReservations = reservationRepository.findConflictingReservationsExcluding(
            roomId, checkIn, checkOut, excludeReservationId, 
            Set.of(ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN)
        );
        return conflictingReservations.isEmpty();
    }
    
    /**
     * Calculate refund amount based on cancellation policy
     */
    private BigDecimal calculateCancellationRefund(Reservation reservation) {
        LocalDate now = LocalDate.now();
        LocalDate checkInDate = reservation.getCheckInDate();
        long daysUntilCheckIn = ChronoUnit.DAYS.between(now, checkInDate);
        
        BigDecimal totalAmount = reservation.getTotalAmount();
        
        // Cancellation policy:
        // - More than 7 days: 100% refund
        // - 3-7 days: 50% refund  
        // - 1-2 days: 25% refund
        // - Same day or past: No refund
        
        if (daysUntilCheckIn > 7) {
            return totalAmount; // 100% refund
        } else if (daysUntilCheckIn >= 3) {
            return totalAmount.multiply(BigDecimal.valueOf(0.5)); // 50% refund
        } else if (daysUntilCheckIn >= 1) {
            return totalAmount.multiply(BigDecimal.valueOf(0.25)); // 25% refund
        } else {
            return BigDecimal.ZERO; // No refund
        }
    }
    
    /**
     * Generate booking confirmation PDF
     */
    public byte[] generateBookingConfirmationPdf(Long reservationId) {
        BookingResponse booking = getBooking(reservationId);
        return pdfService.generateBookingConfirmationPdf(booking);
    }
    
    /**
     * Create a summary of booking modifications for history tracking
     */
    private String getModificationSummary(Map<String, Object> originalData, Reservation updatedReservation) {
        StringBuilder summary = new StringBuilder();
        
        // Check date changes
        LocalDate originalCheckIn = (LocalDate) originalData.get("checkInDate");
        LocalDate originalCheckOut = (LocalDate) originalData.get("checkOutDate");
        
        if (!originalCheckIn.equals(updatedReservation.getCheckInDate())) {
            summary.append("Check-in changed from ").append(originalCheckIn)
                   .append(" to ").append(updatedReservation.getCheckInDate()).append("; ");
        }
        
        if (!originalCheckOut.equals(updatedReservation.getCheckOutDate())) {
            summary.append("Check-out changed from ").append(originalCheckOut)
                   .append(" to ").append(updatedReservation.getCheckOutDate()).append("; ");
        }
        
        // Check guest count changes
        // Note: Guest count is not stored in Reservation entity currently
        // This would need to be added to the entity if guest count tracking is needed
        
        // Check special requests changes
        String originalRequests = (String) originalData.get("specialRequests");
        String newRequests = updatedReservation.getSpecialRequests();
        if ((originalRequests == null && newRequests != null) ||
            (originalRequests != null && !originalRequests.equals(newRequests))) {
            summary.append("Special requests updated; ");
        }
        
        return summary.length() > 0 ? summary.toString() : "Minor booking details updated";
    }
    
    /**
     * Convert reservation entity to map for history tracking
     */
    private Map<String, Object> convertReservationToMap(Reservation reservation) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", reservation.getId());
        map.put("checkInDate", reservation.getCheckInDate());
        map.put("checkOutDate", reservation.getCheckOutDate());
        // Note: guestCount field doesn't exist in Reservation entity
        map.put("specialRequests", reservation.getSpecialRequests());
        map.put("totalAmount", reservation.getTotalAmount());
        map.put("status", reservation.getStatus().toString());
        map.put("roomId", reservation.getRoom().getId());
        map.put("roomNumber", reservation.getRoom().getRoomNumber());
        map.put("roomType", reservation.getRoom().getRoomType().toString());
        map.put("guestId", reservation.getGuest().getId());
        map.put("guestEmail", reservation.getGuest().getEmail());
        map.put("updatedAt", reservation.getUpdatedAt());
        return map;
    }
}
