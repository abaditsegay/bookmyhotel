package com.bookmyhotel.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmyhotel.dto.BookingRequest;
import com.bookmyhotel.dto.BookingResponse;
import com.bookmyhotel.service.BookingService;

import jakarta.validation.Valid;

/**
 * Booking controller
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Create a new booking
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get booking details
     */
    @GetMapping("/{reservationId}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long reservationId) {
        BookingResponse response = bookingService.getBooking(reservationId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel a booking
     */
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long reservationId) {
        BookingResponse response = bookingService.cancelBooking(reservationId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user bookings
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getUserBookings(@PathVariable Long userId) {
        List<BookingResponse> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }
}
