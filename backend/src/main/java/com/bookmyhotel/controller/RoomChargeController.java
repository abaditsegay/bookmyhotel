package com.bookmyhotel.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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

import com.bookmyhotel.dto.RoomChargeCreateRequest;
import com.bookmyhotel.dto.RoomChargeResponse;
import com.bookmyhotel.service.RoomChargeService;

import jakarta.validation.Valid;

/**
 * REST controller for room charge management
 */
@RestController
@RequestMapping("/api/room-charges")
@PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
public class RoomChargeController {

    @Autowired
    private RoomChargeService roomChargeService;

    /**
     * Create a new room charge
     */
    @PostMapping
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoomChargeResponse> createRoomCharge(
            @Valid @RequestBody RoomChargeCreateRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        RoomChargeResponse response = roomChargeService.createRoomCharge(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get room charges for a hotel with pagination
     */
    @GetMapping("/hotel/{hotelId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Page<RoomChargeResponse>> getRoomChargesForHotel(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RoomChargeResponse> roomCharges = roomChargeService.getRoomChargesForHotel(hotelId, pageable);
        return ResponseEntity.ok(roomCharges);
    }

    /**
     * Get room charges for a specific reservation
     */
    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<RoomChargeResponse>> getRoomChargesForReservation(
            @PathVariable Long reservationId) {

        List<RoomChargeResponse> roomCharges = roomChargeService.getRoomChargesForReservation(reservationId);
        return ResponseEntity.ok(roomCharges);
    }

    /**
     * Get unpaid room charges for a reservation
     */
    @GetMapping("/reservation/{reservationId}/unpaid")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<RoomChargeResponse>> getUnpaidChargesForReservation(
            @PathVariable Long reservationId) {

        List<RoomChargeResponse> unpaidCharges = roomChargeService.getUnpaidChargesForReservation(reservationId);
        return ResponseEntity.ok(unpaidCharges);
    }

    /**
     * Get total unpaid amount for a reservation
     */
    @GetMapping("/reservation/{reservationId}/unpaid-total")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<BigDecimal> getTotalUnpaidAmount(@PathVariable Long reservationId) {
        BigDecimal totalUnpaid = roomChargeService.getTotalUnpaidAmount(reservationId);
        return ResponseEntity.ok(totalUnpaid);
    }

    /**
     * Mark a room charge as paid
     */
    @PutMapping("/{chargeId}/mark-paid")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoomChargeResponse> markChargeAsPaid(
            @PathVariable Long chargeId,
            @RequestParam(required = false) String paymentReference) {

        RoomChargeResponse response = roomChargeService.markChargeAsPaid(chargeId, paymentReference);
        return ResponseEntity.ok(response);
    }

    /**
     * Mark a room charge as unpaid
     */
    @PutMapping("/{chargeId}/mark-unpaid")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoomChargeResponse> markChargeAsUnpaid(@PathVariable Long chargeId) {
        RoomChargeResponse response = roomChargeService.markChargeAsUnpaid(chargeId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a room charge
     */
    @DeleteMapping("/{chargeId}")
    @PreAuthorize("hasRole('HOTEL_ADMIN')")
    public ResponseEntity<Void> deleteRoomCharge(@PathVariable Long chargeId) {
        roomChargeService.deleteRoomCharge(chargeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Search room charges
     */
    @GetMapping("/hotel/{hotelId}/search")
    @PreAuthorize("hasRole('HOTEL_ADMIN') or hasRole('FRONTDESK') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Page<RoomChargeResponse>> searchRoomCharges(
            @PathVariable Long hotelId,
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<RoomChargeResponse> roomCharges = roomChargeService.searchRoomCharges(hotelId, searchTerm, pageable);
        return ResponseEntity.ok(roomCharges);
    }
}
