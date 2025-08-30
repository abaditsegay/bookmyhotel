package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookmyhotel.dto.ConsolidatedReceiptResponse;
import com.bookmyhotel.dto.ConsolidatedReceiptResponse.ReceiptChargeItem;
import com.bookmyhotel.dto.ConsolidatedReceiptResponse.ReceiptPaymentItem;
import com.bookmyhotel.dto.RoomChargeResponse;
import com.bookmyhotel.entity.Hotel;
import com.bookmyhotel.entity.Reservation;
import com.bookmyhotel.entity.ReservationStatus;
import com.bookmyhotel.entity.Room;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.UserRepository;
import com.bookmyhotel.tenant.TenantContext;

/**
 * Service for generating consolidated checkout receipts
 */
@Service
@Transactional
public class CheckoutReceiptService {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutReceiptService.class);

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomChargeService roomChargeService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate a consolidated receipt for checkout
     */
    @Transactional(readOnly = true)
    public ConsolidatedReceiptResponse generateCheckoutReceipt(Long reservationId, String generatedByEmail) {
        try {
            String tenantId = TenantContext.getTenantId();

            // Get the reservation
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            // Verify tenant access
            if (!tenantId.equals(reservation.getHotel().getTenantId())) {
                throw new RuntimeException("Access denied");
            }

            ConsolidatedReceiptResponse receipt = new ConsolidatedReceiptResponse();

            // Set receipt metadata
            receipt.setGeneratedAt(LocalDateTime.now());
            receipt.setReceiptNumber(generateReceiptNumber(reservationId));
            if (generatedByEmail != null) {
                receipt.setGeneratedBy(generatedByEmail);
            }

            // Set guest information
            setGuestInformation(receipt, reservation);

            // Set reservation details
            setReservationDetails(receipt, reservation);

            // Set hotel information
            setHotelInformation(receipt, reservation.getHotel());

            // Set room information
            setRoomInformation(receipt, reservation.getRoom());

            // Calculate room charges
            calculateRoomCharges(receipt, reservation);

            // Get additional charges from RoomChargeService
            setAdditionalCharges(receipt, reservationId);

            // Set taxes and fees (if applicable)
            setTaxesAndFees(receipt, reservation);

            // Set payment information
            setPaymentInformation(receipt, reservation);

            // Calculate totals
            calculateTotals(receipt);

            logger.info("Generated consolidated receipt {} for reservation {}",
                    receipt.getReceiptNumber(), reservationId);

            return receipt;

        } catch (Exception e) {
            logger.error("Failed to generate checkout receipt for reservation {}: {}",
                    reservationId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate checkout receipt: " + e.getMessage());
        }
    }

    /**
     * Generate receipt for completed checkout
     */
    public ConsolidatedReceiptResponse generateFinalReceipt(Long reservationId, String generatedByEmail) {
        // Update reservation status to CHECKED_OUT if not already
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (reservation.getStatus() != ReservationStatus.CHECKED_OUT) {
            reservation.setStatus(ReservationStatus.CHECKED_OUT);
            if (reservation.getActualCheckOutTime() == null) {
                reservation.setActualCheckOutTime(LocalDateTime.now());
            }
            reservationRepository.save(reservation);
        }

        return generateCheckoutReceipt(reservationId, generatedByEmail);
    }

    private void setGuestInformation(ConsolidatedReceiptResponse receipt, Reservation reservation) {
        if (reservation.getGuest() != null) {
            // Registered user
            User guest = reservation.getGuest();
            receipt.setGuestName(guest.getFirstName() + " " + guest.getLastName());
            receipt.setGuestEmail(guest.getEmail());
            receipt.setGuestPhone(guest.getPhone());
        } else if (reservation.getGuestInfo() != null) {
            // Anonymous guest
            receipt.setGuestName(reservation.getGuestInfo().getName());
            receipt.setGuestEmail(reservation.getGuestInfo().getEmail());
            receipt.setGuestPhone(reservation.getGuestInfo().getPhone());
        }
    }

    private void setReservationDetails(ConsolidatedReceiptResponse receipt, Reservation reservation) {
        receipt.setReservationId(reservation.getId());
        receipt.setConfirmationNumber(reservation.getConfirmationNumber());
        receipt.setCheckInDate(reservation.getCheckInDate());
        receipt.setCheckOutDate(reservation.getCheckOutDate());
        receipt.setActualCheckInTime(reservation.getActualCheckInTime());
        receipt.setActualCheckOutTime(reservation.getActualCheckOutTime());
        receipt.setStatus(reservation.getStatus());
        receipt.setNumberOfGuests(reservation.getNumberOfGuests());

        // Calculate number of nights
        long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
        receipt.setNumberOfNights((int) nights);
    }

    private void setHotelInformation(ConsolidatedReceiptResponse receipt, Hotel hotel) {
        receipt.setHotelName(hotel.getName());
        receipt.setHotelAddress(formatHotelAddress(hotel));
        receipt.setHotelPhone(hotel.getPhone());
        receipt.setHotelEmail(hotel.getEmail());
    }

    private void setRoomInformation(ConsolidatedReceiptResponse receipt, Room room) {
        if (room != null) {
            receipt.setRoomNumber(room.getRoomNumber());
            receipt.setRoomType(room.getRoomType().toString());
        }
    }

    private void calculateRoomCharges(ConsolidatedReceiptResponse receipt, Reservation reservation) {
        receipt.setRoomChargePerNight(reservation.getPricePerNight());

        // Calculate total room charges based on actual stay or reservation dates
        long nights = receipt.getNumberOfNights();
        BigDecimal totalRoomCharges = reservation.getPricePerNight().multiply(BigDecimal.valueOf(nights));
        receipt.setTotalRoomCharges(totalRoomCharges);
    }

    private void setAdditionalCharges(ConsolidatedReceiptResponse receipt, Long reservationId) {
        List<RoomChargeResponse> roomCharges = roomChargeService.getRoomChargesForReservation(reservationId);

        List<ReceiptChargeItem> additionalCharges = roomCharges.stream()
                .map(this::convertToReceiptChargeItem)
                .collect(Collectors.toList());

        receipt.setAdditionalCharges(additionalCharges);

        // Calculate total additional charges
        BigDecimal totalAdditional = additionalCharges.stream()
                .map(ReceiptChargeItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        receipt.setTotalAdditionalCharges(totalAdditional);
    }

    private void setTaxesAndFees(ConsolidatedReceiptResponse receipt, Reservation reservation) {
        List<ReceiptChargeItem> taxesAndFees = new ArrayList<>();

        // Example: Add city tax (you can customize this based on your requirements)
        BigDecimal cityTaxRate = BigDecimal.valueOf(0.05); // 5% city tax
        BigDecimal cityTax = receipt.getTotalRoomCharges().multiply(cityTaxRate);

        if (cityTax.compareTo(BigDecimal.ZERO) > 0) {
            ReceiptChargeItem cityTaxItem = new ReceiptChargeItem(
                    "City Tax (5%)", cityTax, "TAX");
            taxesAndFees.add(cityTaxItem);
        }

        receipt.setTaxesAndFees(taxesAndFees);

        // Calculate total taxes and fees
        BigDecimal totalTaxes = taxesAndFees.stream()
                .map(ReceiptChargeItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        receipt.setTotalTaxesAndFees(totalTaxes);
    }

    private void setPaymentInformation(ConsolidatedReceiptResponse receipt, Reservation reservation) {
        List<ReceiptPaymentItem> payments = new ArrayList<>();

        // Add the main reservation payment
        if (reservation.getTotalAmount() != null && reservation.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
            ReceiptPaymentItem mainPayment = new ReceiptPaymentItem(
                    reservation.getPaymentMethod() != null ? reservation.getPaymentMethod() : "Online Payment",
                    reservation.getTotalAmount(),
                    "Room Reservation Payment");
            mainPayment.setPaymentDate(reservation.getCreatedAt());
            mainPayment.setPaymentReference(reservation.getPaymentIntentId());
            payments.add(mainPayment);
        }

        // Add payments for room charges (if any are marked as paid)
        List<RoomChargeResponse> paidCharges = roomChargeService.getRoomChargesForReservation(reservation.getId())
                .stream()
                .filter(charge -> charge.getIsPaid() != null && charge.getIsPaid())
                .collect(Collectors.toList());

        for (RoomChargeResponse charge : paidCharges) {
            ReceiptPaymentItem chargePayment = new ReceiptPaymentItem(
                    "Cash/Card", // Default payment method for additional charges
                    charge.getAmount(),
                    "Payment for " + charge.getDescription());
            chargePayment.setPaymentDate(charge.getPaidAt());
            chargePayment.setPaymentReference(charge.getPaymentReference());
            payments.add(chargePayment);
        }

        receipt.setPayments(payments);

        // Calculate total payments
        BigDecimal totalPayments = payments.stream()
                .map(ReceiptPaymentItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        receipt.setTotalPayments(totalPayments);
    }

    private void calculateTotals(ConsolidatedReceiptResponse receipt) {
        // Calculate subtotal (room charges + additional charges)
        BigDecimal subtotal = receipt.getTotalRoomCharges()
                .add(receipt.getTotalAdditionalCharges());
        receipt.setSubtotal(subtotal);

        // Calculate grand total (subtotal + taxes and fees)
        BigDecimal grandTotal = subtotal.add(receipt.getTotalTaxesAndFees());
        receipt.setGrandTotal(grandTotal);

        // Calculate balance due
        BigDecimal balanceDue = grandTotal.subtract(receipt.getTotalPayments());
        receipt.setBalanceDue(balanceDue);
    }

    private ReceiptChargeItem convertToReceiptChargeItem(RoomChargeResponse roomCharge) {
        ReceiptChargeItem item = new ReceiptChargeItem();
        item.setChargeId(roomCharge.getId());
        item.setDescription(roomCharge.getDescription());
        item.setAmount(roomCharge.getAmount());
        item.setChargeType(roomCharge.getChargeType().getDisplayName());
        item.setChargeDate(roomCharge.getChargeDate());
        item.setNotes(roomCharge.getNotes());
        return item;
    }

    private String generateReceiptNumber(Long reservationId) {
        return "RCP-" + reservationId + "-" + System.currentTimeMillis();
    }

    private String formatHotelAddress(Hotel hotel) {
        StringBuilder address = new StringBuilder();
        if (hotel.getAddress() != null)
            address.append(hotel.getAddress());
        if (hotel.getCity() != null) {
            if (address.length() > 0)
                address.append(", ");
            address.append(hotel.getCity());
        }
        if (hotel.getCountry() != null) {
            if (address.length() > 0)
                address.append(", ");
            address.append(hotel.getCountry());
        }
        return address.toString();
    }
}
