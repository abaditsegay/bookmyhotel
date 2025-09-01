package com.bookmyhotel.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
import com.bookmyhotel.entity.ShopOrder;
import com.bookmyhotel.entity.ShopOrderItem;
import com.bookmyhotel.entity.User;
import com.bookmyhotel.repository.ReservationRepository;
import com.bookmyhotel.repository.ShopOrderRepository;
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
    private ShopOrderRepository shopOrderRepository;

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

            // Check if current user is system-wide (e.g., system admin)
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isSystemWideUser = false;
            String currentUserEmail = null;

            if (authentication != null) {
                currentUserEmail = authentication.getName();
                // System admin users have hotel_id = null and SYSTEM_ADMIN role
                if (currentUserEmail != null && (currentUserEmail.equals("admin@bookmyhotel.com") ||
                        currentUserEmail.contains("system"))) {
                    isSystemWideUser = true;
                    logger.info("System-wide user detected: {} - bypassing tenant validation", currentUserEmail);
                }
            }

            // Verify tenant access (skip for system-wide users)
            if (!isSystemWideUser && !tenantId.equals(reservation.getHotel().getTenantId())) {
                logger.warn("Tenant access denied for user {} - required: {}, current: {}",
                        currentUserEmail, reservation.getHotel().getTenantId(), tenantId);
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
            setAdditionalCharges(receipt, reservation);

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

    private void setAdditionalCharges(ConsolidatedReceiptResponse receipt, Reservation reservation) {
        List<RoomChargeResponse> roomCharges = roomChargeService.getRoomChargesForReservation(
                reservation.getHotel().getId(), reservation.getId());

        List<ReceiptChargeItem> additionalCharges = roomCharges.stream()
                .flatMap(this::convertToReceiptChargeItems)
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
        List<RoomChargeResponse> paidCharges = roomChargeService.getRoomChargesForReservation(
                reservation.getHotel().getId(), reservation.getId())
                .stream()
                .filter(charge -> charge.getIsPaid() != null && charge.getIsPaid())
                .collect(Collectors.toList());

        for (RoomChargeResponse charge : paidCharges) {
            ReceiptPaymentItem chargePayment = new ReceiptPaymentItem(
                    "Cash/Card", // Default payment method for additional charges
                    charge.getAmount(),
                    "Payment for " + charge.getDescription());
            chargePayment.setPaymentDate(charge.getPaidAt());
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

    /**
     * Convert room charge to one or more receipt charge items.
     * For shop orders with multiple items, each item becomes a separate line.
     */
    private Stream<ReceiptChargeItem> convertToReceiptChargeItems(RoomChargeResponse roomCharge) {
        // If this room charge is linked to a shop order with multiple items, break it
        // down
        if (roomCharge.getShopOrderId() != null) {
            try {
                ShopOrder shopOrder = shopOrderRepository.findByIdWithOrderItems(roomCharge.getShopOrderId())
                        .orElse(null);

                if (shopOrder != null && shopOrder.getOrderItems() != null && !shopOrder.getOrderItems().isEmpty()) {
                    logger.info("Shop order {} has {} items: {}",
                            shopOrder.getId(),
                            shopOrder.getOrderItems().size(),
                            shopOrder.getOrderItems().stream()
                                    .map(item -> item.getProductName())
                                    .collect(java.util.stream.Collectors.joining(", ")));

                    // If there's only one item, treat it normally
                    if (shopOrder.getOrderItems().size() == 1) {
                        logger.info("Single item detected, using normal processing");
                        return Stream.of(convertSingleItemToReceiptItem(roomCharge, shopOrder,
                                shopOrder.getOrderItems().get(0)));
                    }

                    // For multiple items, create separate line items
                    logger.info("Multiple items detected ({}), creating separate line items",
                            shopOrder.getOrderItems().size());
                    return shopOrder.getOrderItems().stream()
                            .map(orderItem -> convertSingleItemToReceiptItem(roomCharge, shopOrder, orderItem));
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch shop order details for room charge {}: {}",
                        roomCharge.getId(), e.getMessage());
            }
        }

        // For non-shop-order charges or when shop order details aren't available,
        // use the original single item approach
        return Stream.of(convertToReceiptChargeItem(roomCharge));
    }

    /**
     * Convert a single shop order item to a receipt charge item
     */
    private ReceiptChargeItem convertSingleItemToReceiptItem(RoomChargeResponse roomCharge, ShopOrder shopOrder,
            ShopOrderItem orderItem) {
        ReceiptChargeItem item = new ReceiptChargeItem();
        item.setChargeId(roomCharge.getId());

        // Create description for individual item
        String description = String.format("Shop Order #%s: %s",
                shopOrder.getOrderNumber(), orderItem.getProductName());
        item.setDescription(description);

        // Set the quantity from the order item
        item.setQuantity(orderItem.getQuantity());

        // Calculate proportional amount for this item
        BigDecimal itemTotal = orderItem.getUnitPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity()));
        item.setAmount(itemTotal);

        item.setChargeType(roomCharge.getChargeType().getDisplayName());
        item.setChargeDate(roomCharge.getChargeDate());
        item.setNotes(roomCharge.getNotes());

        return item;
    }

    private ReceiptChargeItem convertToReceiptChargeItem(RoomChargeResponse roomCharge) {
        ReceiptChargeItem item = new ReceiptChargeItem();
        item.setChargeId(roomCharge.getId());

        // Build enhanced description that includes shop order item names
        String description = buildEnhancedDescription(roomCharge);
        item.setDescription(description);

        // Set default quantity of 1 for non-itemized charges
        item.setQuantity(1);

        item.setAmount(roomCharge.getAmount());
        item.setChargeType(roomCharge.getChargeType().getDisplayName());
        item.setChargeDate(roomCharge.getChargeDate());
        item.setNotes(roomCharge.getNotes());
        return item;
    }

    /**
     * Build enhanced description that includes shop order item names when
     * applicable
     */
    private String buildEnhancedDescription(RoomChargeResponse roomCharge) {
        String baseDescription = roomCharge.getDescription();

        // If this room charge is linked to a shop order, add item details
        if (roomCharge.getShopOrderId() != null) {
            try {
                ShopOrder shopOrder = shopOrderRepository.findById(roomCharge.getShopOrderId())
                        .orElse(null);

                if (shopOrder != null && shopOrder.getOrderItems() != null && !shopOrder.getOrderItems().isEmpty()) {
                    StringBuilder itemNames = new StringBuilder();

                    // Collect all item names
                    for (int i = 0; i < shopOrder.getOrderItems().size(); i++) {
                        if (i > 0) {
                            itemNames.append(", ");
                        }
                        String productName = shopOrder.getOrderItems().get(i).getProductName();
                        int quantity = shopOrder.getOrderItems().get(i).getQuantity();

                        if (quantity > 1) {
                            itemNames.append(quantity).append("x ").append(productName);
                        } else {
                            itemNames.append(productName);
                        }
                    }

                    // Format: "Shop Order #ORD-1-076741: Ethiopian Coffee Beans (250g), 2x Mineral
                    // Water (1L)"
                    return String.format("Shop Order #%s: %s", shopOrder.getOrderNumber(), itemNames.toString());
                }
            } catch (Exception e) {
                // Log error but don't fail receipt generation
                logger.warn("Failed to fetch shop order details for room charge {}: {}",
                        roomCharge.getId(), e.getMessage());
            }
        }

        // Return original description if no shop order or error occurred
        return baseDescription;
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
