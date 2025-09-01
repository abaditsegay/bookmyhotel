package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.RoomChargeCreateRequest;
import com.bookmyhotel.dto.RoomChargeResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.RoomCharge;
import com.bookmyhotel.entity.RoomChargeType;
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.exception.RoomChargeException;
import com.bookmyhotel.repository.HotelRepository;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.RoomChargeRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
import com.bookmyhotel.repository.UserRepository;

/**
 * Service for managing room charges
 */
@Service
@Transactional
public class RoomChargeService {

    private static final Logger logger = LoggerFactory.getLogger(RoomChargeService.class);

    @Autowired
    private RoomChargeRepository roomChargeRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ShopOrderRepository shopOrderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new room charge
     */
    public RoomChargeResponse createRoomCharge(RoomChargeCreateRequest request, String userEmail, Long hotelId) {
        try {
            // Find the reservation
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new RoomChargeException("Reservation not found"));

            // Verify reservation belongs to the specified hotel
            if (!hotelId.equals(reservation.getHotel().getId())) {
                throw new RoomChargeException("Reservation not found for this hotel");
            }

            // Get the hotel from the reservation
            Hotel hotel = reservation.getHotel();

            // Create the room charge
            RoomCharge roomCharge = new RoomCharge(hotel, reservation, request.getDescription(),
                    request.getAmount(), request.getChargeType());
            roomCharge.setNotes(request.getNotes());

            // Link to shop order if provided
            if (request.getShopOrderId() != null) {
                ShopOrder shopOrder = shopOrderRepository.findById(request.getShopOrderId())
                        .orElseThrow(() -> new RoomChargeException("Shop order not found"));

                // Verify shop order belongs to the same hotel
                if (!hotelId.equals(shopOrder.getHotel().getId())) {
                    throw new RoomChargeException("Shop order not found for this hotel");
                }
                roomCharge.setShopOrder(shopOrder);
            }

            // Set the creator if user email is provided
            if (userEmail != null) {
                userRepository.findByEmail(userEmail)
                        .ifPresent(roomCharge::setCreatedBy);
            }

            roomCharge = roomChargeRepository.save(roomCharge);

            logger.info("Created room charge {} for reservation {} by user {} in hotel {}",
                    roomCharge.getId(), reservation.getId(), userEmail, hotelId);

            return convertToResponse(roomCharge);

        } catch (Exception e) {
            logger.error("Failed to create room charge: {}", e.getMessage(), e);
            throw new RoomChargeException("Failed to create room charge: " + e.getMessage());
        }
    }

    /**
     * Get all room charges for a hotel
     */
    @Transactional(readOnly = true)
    public Page<RoomChargeResponse> getRoomChargesForHotel(Long hotelId, Pageable pageable) {
        // Verify hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RoomChargeException("Hotel not found"));

        Page<RoomCharge> roomCharges = roomChargeRepository.findByHotelWithReservationDetails(hotelId, pageable);

        return roomCharges.map(this::convertToResponse);
    }

    /**
     * Get room charges for a specific reservation
     */
    @Transactional(readOnly = true)
    public List<RoomChargeResponse> getRoomChargesForReservation(Long hotelId, Long reservationId) {
        // Verify reservation belongs to the specified hotel
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RoomChargeException("Reservation not found"));

        if (!hotelId.equals(reservation.getHotel().getId())) {
            throw new RoomChargeException("Reservation not found for this hotel");
        }

        List<RoomCharge> roomCharges = roomChargeRepository
                .findByReservationIdOrderByChargeDateDesc(reservationId);

        return roomCharges.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get unpaid room charges for a reservation
     */
    @Transactional(readOnly = true)
    public List<RoomChargeResponse> getUnpaidChargesForReservation(Long hotelId, Long reservationId) {
        // Verify reservation belongs to the specified hotel
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RoomChargeException("Reservation not found"));

        if (!hotelId.equals(reservation.getHotel().getId())) {
            throw new RoomChargeException("Reservation not found for this hotel");
        }

        List<RoomCharge> unpaidCharges = roomChargeRepository.findUnpaidChargesByReservation(reservationId);

        return unpaidCharges.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get total unpaid amount for a reservation
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalUnpaidAmount(Long hotelId, Long reservationId) {
        // Verify reservation belongs to the specified hotel
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RoomChargeException("Reservation not found"));

        if (!hotelId.equals(reservation.getHotel().getId())) {
            throw new RoomChargeException("Reservation not found for this hotel");
        }

        return roomChargeRepository.getTotalUnpaidChargesByReservation(reservationId);
    }

    /**
     * Mark a room charge as paid
     */
    public RoomChargeResponse markChargeAsPaid(Long hotelId, Long chargeId, String paymentReference) {
        try {
            RoomCharge roomCharge = roomChargeRepository.findById(chargeId)
                    .orElseThrow(() -> new RoomChargeException("Room charge not found"));

            // Verify room charge belongs to the specified hotel
            if (!hotelId.equals(roomCharge.getHotel().getId())) {
                throw new RoomChargeException("Room charge not found for this hotel");
            }

            roomCharge.markAsPaid(paymentReference);
            roomCharge = roomChargeRepository.save(roomCharge);

            logger.info("Marked room charge {} as paid with reference {} in hotel {}", chargeId, paymentReference,
                    hotelId);

            return convertToResponse(roomCharge);

        } catch (Exception e) {
            logger.error("Failed to mark room charge as paid: {}", e.getMessage(), e);
            throw new RoomChargeException("Failed to mark charge as paid: " + e.getMessage());
        }
    }

    /**
     * Mark a room charge as unpaid
     */
    public RoomChargeResponse markChargeAsUnpaid(Long hotelId, Long chargeId) {
        try {
            RoomCharge roomCharge = roomChargeRepository.findById(chargeId)
                    .orElseThrow(() -> new RoomChargeException("Room charge not found"));

            // Verify room charge belongs to the specified hotel
            if (!hotelId.equals(roomCharge.getHotel().getId())) {
                throw new RoomChargeException("Room charge not found for this hotel");
            }

            roomCharge.markAsUnpaid();
            roomCharge = roomChargeRepository.save(roomCharge);

            logger.info("Marked room charge {} as unpaid in hotel {}", chargeId, hotelId);

            return convertToResponse(roomCharge);

        } catch (Exception e) {
            logger.error("Failed to mark room charge as unpaid: {}", e.getMessage(), e);
            throw new RoomChargeException("Failed to mark charge as unpaid: " + e.getMessage());
        }
    }

    /**
     * Delete a room charge
     */
    public void deleteRoomCharge(Long hotelId, Long chargeId) {
        try {
            RoomCharge roomCharge = roomChargeRepository.findById(chargeId)
                    .orElseThrow(() -> new RoomChargeException("Room charge not found"));

            // Verify room charge belongs to the specified hotel
            if (!hotelId.equals(roomCharge.getHotel().getId())) {
                throw new RoomChargeException("Room charge not found for this hotel");
            }

            roomChargeRepository.delete(roomCharge);

            logger.info("Deleted room charge {} from hotel {}", chargeId, hotelId);

        } catch (Exception e) {
            logger.error("Failed to delete room charge: {}", e.getMessage(), e);
            throw new RoomChargeException("Failed to delete room charge: " + e.getMessage());
        }
    }

    /**
     * Search room charges
     */
    @Transactional(readOnly = true)
    public Page<RoomChargeResponse> searchRoomCharges(Long hotelId, String searchTerm, Pageable pageable) {
        // Verify hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RoomChargeException("Hotel not found"));

        Page<RoomCharge> roomCharges = roomChargeRepository.searchRoomCharges(hotelId, searchTerm, pageable);

        return roomCharges.map(this::convertToResponse);
    }

    /**
     * Create room charge from shop order
     */
    public RoomChargeResponse createChargeFromShopOrder(ShopOrder shopOrder, Long hotelId) {
        try {
            if (shopOrder.getReservation() == null) {
                throw new RoomChargeException("Cannot create room charge: Shop order is not linked to a reservation");
            }

            // Verify shop order belongs to the specified hotel
            if (!hotelId.equals(shopOrder.getHotel().getId())) {
                throw new RoomChargeException("Shop order not found for this hotel");
            }

            RoomChargeCreateRequest request = new RoomChargeCreateRequest();
            request.setReservationId(shopOrder.getReservation().getId());
            request.setShopOrderId(shopOrder.getId());
            request.setDescription("Shop Purchase - Order #" + shopOrder.getOrderNumber());
            request.setAmount(shopOrder.getTotalAmount());
            request.setChargeType(RoomChargeType.SHOP_PURCHASE);
            request.setNotes("Automatically created from shop order");

            return createRoomCharge(request, null, hotelId);

        } catch (Exception e) {
            logger.error("Failed to create room charge from shop order: {}", e.getMessage(), e);
            throw new RoomChargeException("Failed to create room charge from shop order: " + e.getMessage());
        }
    }

    /**
     * Convert RoomCharge entity to response DTO
     */
    private RoomChargeResponse convertToResponse(RoomCharge roomCharge) {
        RoomChargeResponse response = new RoomChargeResponse();

        response.setId(roomCharge.getId());
        response.setHotelId(roomCharge.getHotel().getId());
        response.setReservationId(roomCharge.getReservation().getId());
        response.setShopOrderId(roomCharge.getShopOrder() != null ? roomCharge.getShopOrder().getId() : null);
        response.setDescription(roomCharge.getDescription());
        response.setAmount(roomCharge.getAmount());
        response.setChargeType(roomCharge.getChargeType());
        response.setChargeDate(roomCharge.getChargeDate());
        response.setIsPaid(roomCharge.getIsPaid());
        response.setPaidAt(roomCharge.getPaidAt());
        response.setNotes(roomCharge.getNotes());
        response.setCreatedBy(roomCharge.getCreatedBy() != null ? roomCharge.getCreatedBy().getId() : null);
        response.setCreatedAt(roomCharge.getCreatedAt());

        // Add guest and room information for convenience
        Reservation reservation = roomCharge.getReservation();
        if (reservation != null) {
            if (reservation.getGuestInfo() != null) {
                response.setGuestName(reservation.getGuestInfo().getName());
            }
            if (reservation.getRoom() != null) {
                response.setRoomNumber(reservation.getRoom().getRoomNumber());
            }
            response.setReservationConfirmationNumber(reservation.getConfirmationNumber());
        }

        return response;
    }
}
