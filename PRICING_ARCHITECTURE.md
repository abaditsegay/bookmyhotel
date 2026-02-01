# Booking System Pricing Architecture

## Overview
This document explains how prices are calculated, stored, and displayed throughout the booking system.

## Key Principle
**The `totalAmount` field in the Reservation entity stores the SUBTOTAL ONLY (without taxes).**

Taxes are calculated and applied ONLY during checkout, not during booking creation or display.

---

## Backend Price Storage

### Reservation.totalAmount Field
```java
/**
 * Total booking amount (SUBTOTAL - taxes NOT included)
 * 
 * This represents: (base_price_per_night × seasonal_multiplier) × number_of_nights
 * Taxes are calculated separately at checkout based on hotel pricing configuration.
 * 
 * IMPORTANT: This field stores the subtotal amount. Taxes are added during checkout
 * and displayed on receipts, but are NOT stored in this field.
 */
@Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
private BigDecimal totalAmount;
```

### Price Calculation Methods

#### BookingService.calculateTotalAmountByRoomType()
**Location:** `backend/src/main/java/com/bookmyhotel/service/BookingService.java` lines 550-620

**Returns:** SUBTOTAL only (base price × nights × seasonal multiplier)

**Does NOT include:** Taxes

```java
// Calculate subtotal (base price * nights * seasonal multiplier)
// IMPORTANT: Taxes are NOT included here - they will be calculated at checkout
BigDecimal subtotal = adjustedPricePerNight.multiply(BigDecimal.valueOf(numberOfNights))
        .setScale(2, RoundingMode.HALF_UP);
```

#### FrontDeskService.recalculateBookingTotal()
**Location:** `backend/src/main/java/com/bookmyhotel/service/FrontDeskService.java` line 409

**Returns:** SUBTOTAL only (pricePerNight × nights)

```java
reservation.setTotalAmount(pricePerNight.multiply(BigDecimal.valueOf(nights)));
```

---

## Booking Creation Flows

### 1. Guest Booking (BookingPage.tsx)
**Location:** `frontend/src/pages/BookingPage.tsx` lines 390-430

**Price Sent to Backend:** NONE
- Frontend does NOT send totalAmount in booking request
- Backend calculates subtotal using `calculateTotalAmountByRoomType()`

**Frontend Display:** Shows price breakdown with taxes for user information only

### 2. Walk-in Booking (WalkInBookingModal.tsx)
**Location:** `frontend/src/components/booking/WalkInBookingModal.tsx` lines 511-530

**Price Sent to Backend:** NONE
- Frontend calculates `totalWithTaxes` (subtotal + VAT + Service Tax) for display only
- This calculated total is NOT sent to backend
- Backend calculates its own subtotal using `calculateTotalAmountByRoomType()`

**Frontend Display:** Shows total with taxes (17% VAT + 5% Service Tax)

---

## Check-in Flow

### CheckInDialog.tsx (FIXED)
**Location:** `frontend/src/components/booking/CheckInDialog.tsx` lines 220-480

**Previous Issue:**
- Was adding taxes (17% VAT + 5% Service Tax) to booking.totalAmount
- Since backend already stores subtotal, this created false "Price Increase" warnings
- Example: Subtotal = ETB 9,100 → Adding taxes = ETB 11,102 (increase of 2,002)

**Fix Implemented:**
```typescript
// IMPORTANT: Backend stores totalAmount as SUBTOTAL ONLY (without taxes)
// We should NOT add taxes when displaying the current booking price
// Taxes are only added at CHECKOUT, not during check-in

if (booking?.roomType && selectedRoom.roomType !== booking.roomType) {
  // Room type changed - recalculate as subtotal only
  const pricePerNight = selectedRoom.pricePerNight || 0;
  const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const newSubtotal = pricePerNight * nights;
  setCalculatedTotal(newSubtotal);
} else {
  // Room type unchanged - use stored subtotal
  setCalculatedTotal(booking.totalAmount);
}
```

---

## Checkout Flow

### CheckoutReceiptService.java
**Location:** `backend/src/main/java/com/bookmyhotel/service/CheckoutReceiptService.java`

**Responsibility:**
- Reads `reservation.totalAmount` (subtotal)
- Applies hotel tax rates (VAT + Service Tax)
- Generates final receipt with:
  - Subtotal (from totalAmount)
  - VAT Amount (subtotal × hotel VAT rate)
  - Service Tax Amount (subtotal × hotel service tax rate)
  - Total Amount Due (subtotal + VAT + service tax)

---

## Tax Configuration

### Hotel Pricing Config
- **VAT Rate:** Typically 17% (0.17)
- **Service Tax Rate:** Typically 5% (0.05)

### Tax Application Points
✅ **Calculated at Checkout:** CheckoutReceiptService adds taxes to final bill
❌ **NOT stored in totalAmount:** Reservation entity stores subtotal only
❌ **NOT added during display:** Frontend should NOT add taxes when showing booking prices

---

## Common Pitfalls

### ❌ WRONG: Adding taxes when displaying bookings
```typescript
// DON'T DO THIS
const displayTotal = booking.totalAmount + (booking.totalAmount * 0.17) + (booking.totalAmount * 0.05);
```

### ✅ CORRECT: Display totalAmount as-is
```typescript
// DO THIS
const displayTotal = booking.totalAmount; // This is the subtotal
```

### ❌ WRONG: Sending calculated total from frontend
```typescript
// DON'T DO THIS
const bookingRequest = {
  ...otherFields,
  totalAmount: calculateTotalWithTaxes() // Backend ignores this
};
```

### ✅ CORRECT: Let backend calculate
```typescript
// DO THIS
const bookingRequest = {
  ...otherFields
  // NO totalAmount field - backend calculates it
};
```

---

## Price Display Guidelines

### Booking Lists (Before Check-in)
**Show:** Subtotal only (booking.totalAmount)
**Label:** "Subtotal" or "Room Charges"
**Do NOT add taxes**

### Check-in Dialog
**Show:** Subtotal only (booking.totalAmount)
**Recalculate ONLY when:** Room type changes
**Calculation:** pricePerNight × nights (NO taxes)

### Checkout Receipt
**Show:** Full breakdown:
- Subtotal (booking.totalAmount)
- VAT (17%)
- Service Tax (5%)
- Total Amount Due

### Guest Booking Form
**Show:** Price preview with taxes for informational purposes
**Send to Backend:** Nothing - backend calculates subtotal

---

## Migration Notes

### Files Modified in Latest Fix

1. **frontend/src/components/booking/CheckInDialog.tsx**
   - Removed all tax calculations from price display
   - Only recalculates when room type changes
   - Uses booking.totalAmount directly for same room type

2. **Documentation (this file)**
   - Created comprehensive pricing architecture guide

### Potential Future Issues

Components that may need review:
- `frontend/src/components/booking/BookingManagementTable.tsx` - Check if it adds taxes to displayed prices
- `frontend/src/pages/admin/BookingViewEdit.tsx` - Verify price display logic
- `frontend/src/pages/GuestBookingManagementPage.tsx` - Check guest-facing price display

---

## Summary

1. **Backend stores:** Subtotal only (pricePerNight × nights)
2. **Frontend should display:** The stored subtotal as-is
3. **Taxes are added:** ONLY at checkout by CheckoutReceiptService
4. **Never add taxes:** When displaying existing booking prices
5. **Room type change:** Recalculate as NEW subtotal (no taxes)

This architecture ensures:
- ✅ Consistent pricing across all booking flows
- ✅ No false "price increase" warnings
- ✅ Clear separation between booking price and checkout total
- ✅ Single source of truth for tax calculations (checkout service)
